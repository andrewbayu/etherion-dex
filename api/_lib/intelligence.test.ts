import { afterEach, describe, expect, it, vi } from 'vitest'
import { getIntelligence } from './intelligence.js'

vi.mock('ai', () => ({
  generateText: vi.fn().mockRejectedValue(new Error('Gateway unavailable in contract test')),
  Output: { object: (value: unknown) => value },
}))

function json(value: unknown) {
  return new Response(JSON.stringify(value), { headers: { 'Content-Type': 'application/json' } })
}

describe('live intelligence contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.FINNHUB_API_KEY
  })

  it('keeps the score deterministic and exposes partial provider coverage when AI and equities are unavailable', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.includes('BTC-USD/ticker')) return json({ price: '120000', time: '2026-07-14T12:00:00Z' })
      if (url.includes('BTC-USD/stats')) return json({ open: '117000', high: '121000', low: '116000', last: '120000', volume: '10000' })
      if (url.includes('SOL-USD/ticker')) return json({ price: '180', time: '2026-07-14T12:00:00Z' })
      if (url.includes('SOL-USD/stats')) return json({ open: '175', high: '182', low: '170', last: '180', volume: '2000000' })
      if (url.includes('api.gdeltproject.org')) return json({ articles: [
        { url: 'https://example.com/bitcoin-inflow', title: 'Bitcoin rises as fund inflow expands', seendate: '20260714T115500Z', domain: 'example.com', sourcecountry: 'United States' },
        { url: 'https://example.org/nvidia-risk', title: 'Nvidia faces export risk', seendate: '20260714T114500Z', domain: 'example.org', sourcecountry: 'United States' },
      ] })
      throw new Error(`Unexpected URL ${url}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getIntelligence({ includeAi: true })
    const bitcoin = result.opportunities.find((item) => item.id === 'btc')
    const nvidia = result.opportunities.find((item) => item.id === 'nvda')

    expect(result.aiStatus).toBe('fallback')
    expect(result.providerStatus).toEqual({ coinbase: 'live', finnhub: 'not_configured', news: 'live' })
    expect(result.providerNotes.newsNetwork).toBe('GDELT')
    expect(bitcoin).toMatchObject({ price: '$120,000', dataState: 'live', marketProvider: 'Coinbase Exchange' })
    expect(bitcoin?.score).toBeGreaterThan(0)
    expect(bitcoin?.score).toBeLessThanOrEqual(100)
    expect(bitcoin?.thesis).toContain('not chosen by the language model')
    expect(bitcoin?.evidence[0].url).toBe('https://example.com/bitcoin-inflow')
    expect(nvidia).toMatchObject({ price: null, dataState: 'partial', marketProvider: 'Finnhub' })
  })
})
