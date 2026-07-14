import { convertToModelMessages, streamText, type UIMessage } from 'ai'
import { getIntelligence } from './_lib/intelligence.js'
import type { AssetId } from './_lib/providers.js'

export const maxDuration = 60

const ALLOWED_ASSETS = new Set<AssetId>(['btc', 'sol', 'nvda', 'tsm'])
const requestWindows = new Map<string, { count: number; resetAt: number }>()

function allowRequest(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const now = Date.now()
  const current = requestWindows.get(key)
  if (!current || current.resetAt < now) {
    requestWindows.set(key, { count: 1, resetAt: now + 60_000 })
    return true
  }
  current.count += 1
  return current.count <= 8
}

function isUiMessage(value: unknown): value is UIMessage {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<UIMessage>
  return typeof candidate.id === 'string' && ['user', 'assistant', 'system'].includes(String(candidate.role)) && Array.isArray(candidate.parts)
}

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: { Allow: 'POST' } })
    }
    if (!allowRequest(request)) return Response.json({ error: 'Demo limit reached. Try again in one minute.' }, { status: 429 })

    try {
      const body = await request.json() as { messages?: unknown[]; assetId?: string }
      const assetId = ALLOWED_ASSETS.has(body.assetId as AssetId) ? body.assetId as AssetId : 'btc'
      const messages = (body.messages ?? []).filter(isUiMessage).slice(-8)
      if (!messages.length) return Response.json({ error: 'A question is required.' }, { status: 400 })

      const intelligence = await getIntelligence({ includeAi: false })
      const opportunity = intelligence.opportunities.find((item) => item.id === assetId)
      if (!opportunity) return Response.json({ error: 'Unknown asset.' }, { status: 400 })

      const sources = opportunity.evidence.map((source, index) => (
        `[S${index + 1}] ${source.title} — ${source.publisher}, ${source.publishedAt}. ${source.url}`
      ))
      const marketLine = opportunity.price
        ? `Market snapshot: ${opportunity.price}, session move ${opportunity.move?.toFixed(2)}%, provider ${opportunity.marketProvider}, as of ${opportunity.updated}.`
        : `Market snapshot: unavailable. Provider status: ${opportunity.marketMessage ?? 'not configured'}.`
      const system = [
        'You are Etherion Grounded Assistant, a research and education tool, not a financial adviser.',
        `The selected asset is ${assetId.toUpperCase()}. ${marketLine}`,
        `Deterministic score: ${opportunity.score}/100, confidence ${opportunity.confidence}%, risk ${opportunity.risk}, version ${intelligence.scoreVersion}.`,
        'Answer only from the market snapshot and source list below. Never claim to have read full articles; only headlines and metadata were retrieved.',
        'Cite every material news claim with [S1], [S2], etc. If the evidence is insufficient, say exactly that.',
        'Do not give personalized advice, price targets, certainty, buy/sell instructions, or fabricate missing evidence.',
        'Keep the answer concise and explicitly separate observed facts from interpretation.',
        sources.length ? `SOURCES\n${sources.join('\n')}` : 'SOURCES\nNo mapped live news sources were available.',
      ].join('\n\n')

      const result = streamText({
        model: 'openai/gpt-5.4-nano',
        system,
        messages: await convertToModelMessages(messages),
        maxOutputTokens: 650,
      })
      return result.toUIMessageStreamResponse({
        headers: {
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (error) {
      return Response.json({
        error: 'The grounded assistant could not answer right now.',
        detail: error instanceof Error ? error.message : 'Unknown assistant error.',
      }, { status: 503 })
    }
  },
}
