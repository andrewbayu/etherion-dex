import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getMarketQuotes, getNewsStories, type AssetId, type MarketQuote, type RawStory } from './providers'

const SCORE_VERSION = 'ETH-SCORE 3.0.0'
const FEATURE_MODEL = 'openai/gpt-5.4-nano'

const storyAnalysisSchema = z.object({
  stories: z.array(z.object({
    id: z.string(),
    sentiment: z.enum(['Bullish', 'Mixed', 'Bearish', 'Neutral']),
    impactScore: z.number().min(-1).max(1),
    confidence: z.number().min(0).max(100),
    summary: z.string().max(260),
    catalyst: z.string().max(180),
    risk: z.string().max(180),
  })).max(18),
})

type StoryAnalysis = z.infer<typeof storyAnalysisSchema>['stories'][number]

const POSITIVE = /\b(surge|gain|growth|rise|rally|record|approval|upgrade|beat|expand|inflow|launch|strong)\b/i
const NEGATIVE = /\b(fall|drop|decline|risk|lawsuit|ban|delay|miss|weak|outflow|hack|cut|concern)\b/i

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value))
}

function fallbackAnalysis(story: RawStory): StoryAnalysis {
  const positive = POSITIVE.test(story.title)
  const negative = NEGATIVE.test(story.title)
  const impactScore = positive === negative ? 0 : positive ? 0.35 : -0.35
  return {
    id: story.id,
    sentiment: positive === negative ? 'Neutral' : positive ? 'Bullish' : 'Bearish',
    impactScore,
    confidence: 52,
    summary: story.title,
    catalyst: positive ? story.title : 'No positive catalyst verified from the headline alone.',
    risk: negative ? story.title : 'Headline-only evidence; inspect the original source before drawing a conclusion.',
  }
}

async function analyzeStories(stories: RawStory[]) {
  if (!stories.length) return { analyses: [] as StoryAnalysis[], status: 'unavailable' as const }
  try {
    const { output } = await generateText({
      model: FEATURE_MODEL,
      output: Output.object({ schema: storyAnalysisSchema }),
      system: [
        'You are an evidence extraction service for market research.',
        'Use only the supplied headline, publisher domain, timestamp, and mapped assets.',
        'Never invent figures, article contents, causes, or investment recommendations.',
        'A summary must be a conservative paraphrase of the headline. If evidence is ambiguous, use Neutral or Mixed and lower confidence.',
      ].join(' '),
      prompt: JSON.stringify(stories.map(({ id, title, domain, publishedAt, assets }) => ({ id, title, domain, publishedAt, assets }))),
    })
    const byId = new Map(output.stories.map((analysis) => [analysis.id, analysis]))
    return {
      analyses: stories.map((story) => byId.get(story.id) ?? fallbackAnalysis(story)),
      status: 'live' as const,
    }
  } catch {
    return { analyses: stories.map(fallbackAnalysis), status: 'fallback' as const }
  }
}

function marketStructure(quote: MarketQuote) {
  if (quote.changePercent === null) return 35
  const rangePosition = quote.price !== null && quote.high !== null && quote.low !== null && quote.high > quote.low
    ? ((quote.price - quote.low) / (quote.high - quote.low)) * 100
    : 50
  return Math.round(clamp(50 + quote.changePercent * 4 + (rangePosition - 50) * 0.22))
}

function liquidity(quote: MarketQuote) {
  if (quote.provider === 'Finnhub' && quote.status === 'live') return 78
  if (!quote.volumeUsd || quote.volumeUsd <= 0) return 35
  return Math.round(clamp(12 + Math.log10(quote.volumeUsd) * 7.2))
}

function relativeTime(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))
  if (minutes < 60) return `${minutes || 1}m ago`
  if (minutes < 1_440) return `${Math.round(minutes / 60)}h ago`
  return `${Math.round(minutes / 1_440)}d ago`
}

function formatPrice(quote: MarketQuote) {
  if (quote.price === null) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: quote.price >= 1_000 ? 0 : 2,
    maximumFractionDigits: quote.price >= 1_000 ? 0 : 2,
  }).format(quote.price)
}

function buildOpportunity(
  id: AssetId,
  quote: MarketQuote,
  stories: RawStory[],
  analyses: Map<string, StoryAnalysis>,
  aiStatus: 'live' | 'fallback' | 'unavailable',
) {
  const assetStories = stories.filter((story) => story.assets.includes(id)).slice(0, 6)
  const assetAnalysis = assetStories.map((story) => analyses.get(story.id) ?? fallbackAnalysis(story))
  const averageImpact = assetAnalysis.length
    ? assetAnalysis.reduce((sum, analysis) => sum + analysis.impactScore, 0) / assetAnalysis.length
    : 0
  const uniqueDomains = new Set(assetStories.map((story) => story.domain)).size
  const structureScore = marketStructure(quote)
  const liquidityScore = liquidity(quote)
  const evidenceScore = Math.round(clamp(28 + assetStories.length * 8 + uniqueDomains * 5))
  const newsScore = Math.round(clamp(50 + averageImpact * 38))
  const riskRegimeScore = Math.round(clamp(78 - Math.abs(quote.changePercent ?? 0) * 3.5 - (id === 'sol' ? 9 : 0)))
  const components = [
    { label: 'Market structure', score: structureScore, weight: 30, reason: quote.status === 'live' ? 'Computed from current session change and daily range position.' : 'Live quote unavailable; coverage penalty applied.' },
    { label: 'Flow & liquidity', score: liquidityScore, weight: 20, reason: quote.volumeUsd ? 'Computed from provider-reported 24-hour notional volume.' : 'Provider volume is unavailable; conservative baseline used.' },
    { label: 'Evidence quality', score: evidenceScore, weight: 25, reason: `${assetStories.length} current stories across ${uniqueDomains} independent domains.` },
    { label: 'News context', score: newsScore, weight: 15, reason: `${aiStatus === 'live' ? 'AI-extracted' : 'Rules-based fallback'} headline context; never used as a standalone signal.` },
    { label: 'Risk regime', score: riskRegimeScore, weight: 10, reason: 'Deterministic volatility and data-coverage gate.' },
  ]
  const weighted = components.reduce((sum, component) => sum + component.score * component.weight, 0) / 100
  const coveragePenalty = quote.status === 'live' ? 0 : 16
  const evidencePenalty = assetStories.length >= 2 ? 0 : 6
  const score = Math.round(clamp(weighted - coveragePenalty - evidencePenalty))
  const confidence = Math.round(clamp(42 + assetStories.length * 4 + uniqueDomains * 3 + (quote.status === 'live' ? 18 : 0) + (aiStatus === 'live' ? 8 : 0), 30, 92))
  const positive = assetAnalysis.filter((analysis) => analysis.impactScore > 0.12)
  const negative = assetAnalysis.filter((analysis) => analysis.impactScore < -0.12)
  const dataState = quote.status === 'live' && assetStories.length ? 'live' : quote.status === 'live' || assetStories.length ? 'partial' : 'unavailable'
  const absoluteMove = Math.abs(quote.changePercent ?? 0)
  const risk = absoluteMove > 6 || id === 'sol' ? 'High' : id === 'btc' || absoluteMove > 3 ? 'Medium' : 'Low'

  return {
    id,
    price: formatPrice(quote),
    move: quote.changePercent,
    score,
    confidence,
    risk,
    updated: quote.asOf ?? new Date().toISOString(),
    version: SCORE_VERSION,
    dataState,
    marketProvider: quote.provider,
    marketProviderUrl: quote.providerUrl,
    marketMessage: quote.message,
    aiStatus,
    thesis: `${quote.status === 'live' ? `${quote.symbol} is ${quote.changePercent !== null && quote.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(quote.changePercent ?? 0).toFixed(2)}% in the provider session.` : `${quote.symbol} live pricing is not configured.`} The current evidence set contains ${assetStories.length} mapped stories. The final ${score}/100 score is calculated by ${SCORE_VERSION}, not chosen by the language model.`,
    invalidation: 'Recompute when the market quote is older than 15 minutes, source coverage changes materially, or contradictory primary evidence appears.',
    catalysts: positive.slice(0, 3).map((analysis) => analysis.catalyst).filter(Boolean).concat(positive.length ? [] : ['No positive catalyst has cleared the current evidence threshold.']).slice(0, 3),
    risks: negative.slice(0, 3).map((analysis) => analysis.risk).filter(Boolean).concat([
      quote.status === 'live' ? 'Intraday price action can reverse before the next provider refresh.' : 'Live equity pricing requires FINNHUB_API_KEY.',
    ]).slice(0, 3),
    components,
    evidence: assetStories.map((story) => ({
      publisher: story.domain,
      title: story.title,
      time: relativeTime(story.publishedAt),
      type: 'Live news',
      url: story.url,
      publishedAt: story.publishedAt,
    })),
  }
}

export async function getIntelligence(options: { includeAi?: boolean } = {}) {
  const [quotes, newsResult] = await Promise.all([
    getMarketQuotes(),
    getNewsStories().catch(() => [] as RawStory[]),
  ])
  const stories = newsResult
  const analysisResult = options.includeAi === false
    ? { analyses: stories.map(fallbackAnalysis), status: 'fallback' as const }
    : await analyzeStories(stories)
  const analyses = new Map(analysisResult.analyses.map((analysis) => [analysis.id, analysis]))
  const opportunities = quotes.map((quote) => buildOpportunity(quote.id, quote, stories, analyses, analysisResult.status))

  return {
    asOf: new Date().toISOString(),
    scoreVersion: SCORE_VERSION,
    featureModel: FEATURE_MODEL,
    aiStatus: analysisResult.status,
    providerStatus: {
      coinbase: quotes.filter((quote) => quote.provider === 'Coinbase Exchange').every((quote) => quote.status === 'live') ? 'live' : 'degraded',
      finnhub: quotes.filter((quote) => quote.provider === 'Finnhub').every((quote) => quote.status === 'live') ? 'live' : 'not_configured',
      gdelt: stories.length ? 'live' : 'degraded',
    },
    opportunities,
    news: stories.map((story) => {
      const analysis = analyses.get(story.id) ?? fallbackAnalysis(story)
      return {
        id: story.id,
        sentiment: analysis.sentiment,
        score: analysis.impactScore,
        confidence: analysis.confidence,
        headline: story.title,
        publisher: story.domain,
        time: relativeTime(story.publishedAt),
        publishedAt: story.publishedAt,
        assets: story.assets.map((asset) => asset.toUpperCase()),
        summary: analysis.summary,
        horizon: 'Live context',
        url: story.url,
        sourceCountry: story.sourceCountry,
        analysisMode: analysisResult.status,
      }
    }),
  }
}
