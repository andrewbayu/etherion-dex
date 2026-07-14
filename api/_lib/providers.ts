export type AssetId = 'btc' | 'sol' | 'nvda' | 'tsm'

export interface MarketQuote {
  id: AssetId
  symbol: string
  price: number | null
  previousClose: number | null
  changePercent: number | null
  high: number | null
  low: number | null
  volumeUsd: number | null
  asOf: string | null
  status: 'live' | 'unavailable'
  provider: 'Coinbase Exchange' | 'Finnhub'
  providerUrl: string
  message?: string
}

export interface RawStory {
  id: string
  title: string
  url: string
  domain: string
  publishedAt: string
  sourceCountry: string
  assets: AssetId[]
}

const ASSET_TERMS: Record<AssetId, RegExp> = {
  btc: /\b(bitcoin|btc|crypto(?:currency)?)\b/i,
  sol: /\b(solana|sol)\b/i,
  nvda: /\b(nvidia|nvda|blackwell|gpu)\b/i,
  tsm: /\b(tsmc|taiwan semiconductor|tsm)\b/i,
}

async function fetchJson<T>(url: string, timeoutMs = 8_000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'Etherion-Research-Demo/1.0' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Provider returned ${response.status}`)
    return await response.json() as T
  } finally {
    clearTimeout(timeout)
  }
}

function number(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : null
}

async function getCoinbaseQuote(id: 'btc' | 'sol', product: 'BTC-USD' | 'SOL-USD'): Promise<MarketQuote> {
  const base = `https://api.exchange.coinbase.com/products/${product}`
  const [ticker, stats] = await Promise.all([
    fetchJson<{ price?: string; time?: string; volume?: string }>(`${base}/ticker`),
    fetchJson<{ open?: string; high?: string; low?: string; last?: string; volume?: string }>(`${base}/stats`),
  ])
  const price = number(ticker.price ?? stats.last)
  const previousClose = number(stats.open)
  const baseVolume = number(stats.volume ?? ticker.volume)
  const changePercent = price !== null && previousClose
    ? ((price - previousClose) / previousClose) * 100
    : null

  return {
    id,
    symbol: product.slice(0, 3),
    price,
    previousClose,
    changePercent,
    high: number(stats.high),
    low: number(stats.low),
    volumeUsd: price !== null && baseVolume !== null ? price * baseVolume : null,
    asOf: ticker.time ?? new Date().toISOString(),
    status: price === null ? 'unavailable' : 'live',
    provider: 'Coinbase Exchange',
    providerUrl: `https://exchange.coinbase.com/trade/${product}`,
  }
}

async function getFinnhubQuote(id: 'nvda' | 'tsm', symbol: 'NVDA' | 'TSM', apiKey?: string): Promise<MarketQuote> {
  const providerUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}`
  if (!apiKey) {
    return {
      id,
      symbol,
      price: null,
      previousClose: null,
      changePercent: null,
      high: null,
      low: null,
      volumeUsd: null,
      asOf: null,
      status: 'unavailable',
      provider: 'Finnhub',
      providerUrl: 'https://finnhub.io/',
      message: 'FINNHUB_API_KEY is not configured.',
    }
  }

  const quote = await fetchJson<{ c?: number; pc?: number; d?: number; dp?: number; h?: number; l?: number; t?: number }>(
    `${providerUrl}&token=${encodeURIComponent(apiKey)}`,
  )
  const price = number(quote.c)
  return {
    id,
    symbol,
    price,
    previousClose: number(quote.pc),
    changePercent: number(quote.dp),
    high: number(quote.h),
    low: number(quote.l),
    volumeUsd: null,
    asOf: quote.t ? new Date(quote.t * 1000).toISOString() : new Date().toISOString(),
    status: price && price > 0 ? 'live' : 'unavailable',
    provider: 'Finnhub',
    providerUrl: 'https://finnhub.io/',
    message: price && price > 0 ? undefined : 'Finnhub returned no current quote.',
  }
}

function unavailableQuote(id: AssetId, reason: unknown): MarketQuote {
  const crypto = id === 'btc' || id === 'sol'
  return {
    id,
    symbol: id.toUpperCase(),
    price: null,
    previousClose: null,
    changePercent: null,
    high: null,
    low: null,
    volumeUsd: null,
    asOf: null,
    status: 'unavailable',
    provider: crypto ? 'Coinbase Exchange' : 'Finnhub',
    providerUrl: crypto ? 'https://exchange.coinbase.com/' : 'https://finnhub.io/',
    message: reason instanceof Error ? reason.message : 'Provider unavailable.',
  }
}

export async function getMarketQuotes(): Promise<MarketQuote[]> {
  const requests = [
    ['btc', () => getCoinbaseQuote('btc', 'BTC-USD')],
    ['sol', () => getCoinbaseQuote('sol', 'SOL-USD')],
    ['nvda', () => getFinnhubQuote('nvda', 'NVDA', process.env.FINNHUB_API_KEY)],
    ['tsm', () => getFinnhubQuote('tsm', 'TSM', process.env.FINNHUB_API_KEY)],
  ] as const

  return Promise.all(requests.map(async ([id, request]) => {
    try {
      return await request()
    } catch (error) {
      return unavailableQuote(id, error)
    }
  }))
}

interface GdeltResponse {
  articles?: Array<{
    url?: string
    title?: string
    seendate?: string
    domain?: string
    sourcecountry?: string
    language?: string
  }>
}

export async function getNewsStories(): Promise<RawStory[]> {
  const params = new URLSearchParams({
    query: '(Bitcoin OR Solana OR Nvidia OR "Taiwan Semiconductor" OR TSMC) sourcelang:english',
    mode: 'artlist',
    maxrecords: '40',
    format: 'json',
    sort: 'datedesc',
  })
  const payload = await fetchJson<GdeltResponse>(`https://api.gdeltproject.org/api/v2/doc/doc?${params}`, 12_000)
  const seen = new Set<string>()

  return (payload.articles ?? []).flatMap((article, index) => {
    const title = article.title?.trim()
    const url = article.url?.trim()
    if (!title || !url || seen.has(url)) return []
    seen.add(url)
    const assets = (Object.entries(ASSET_TERMS) as Array<[AssetId, RegExp]>)
      .filter(([, pattern]) => pattern.test(title))
      .map(([id]) => id)
    if (!assets.length) return []

    const parsedDate = article.seendate
      ? new Date(article.seendate.replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, '$1-$2-$3T$4:$5:$6Z'))
      : new Date()

    return [{
      id: `gdelt-${index}-${Math.abs(hash(url))}`,
      title,
      url,
      domain: article.domain ?? new URL(url).hostname.replace(/^www\./, ''),
      publishedAt: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
      sourceCountry: article.sourcecountry ?? 'Unknown',
      assets,
    }]
  }).slice(0, 18)
}

function hash(value: string) {
  let result = 0
  for (let index = 0; index < value.length; index += 1) result = ((result << 5) - result + value.charCodeAt(index)) | 0
  return result
}
