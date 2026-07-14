/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { news as referenceNews, opportunities as referenceOpportunities, type NewsItem, type Opportunity, type RiskLevel } from './data'

interface LiveOpportunityPatch {
  id: string
  price: string | null
  move: number | null
  score: number
  confidence: number
  risk: RiskLevel
  updated: string
  version: string
  dataState: 'live' | 'partial' | 'unavailable'
  marketProvider: string
  marketProviderUrl: string
  marketMessage?: string
  aiStatus: 'live' | 'fallback' | 'unavailable'
  thesis: string
  invalidation: string
  catalysts: string[]
  risks: string[]
  components: Opportunity['components']
  evidence: Opportunity['evidence']
}

export interface IntelligencePayload {
  asOf: string
  scoreVersion: string
  featureModel: string
  aiStatus: 'live' | 'fallback' | 'unavailable'
  providerStatus: {
    coinbase: 'live' | 'degraded'
    finnhub: 'live' | 'not_configured'
    gdelt: 'live' | 'degraded'
  }
  opportunities: LiveOpportunityPatch[]
  news: NewsItem[]
}

interface IntelligenceContextValue {
  payload: IntelligencePayload | null
  opportunities: Opportunity[]
  news: NewsItem[]
  loading: boolean
  error: string | null
  refresh: () => void
  sourceMode: 'live' | 'partial' | 'reference'
}

const IntelligenceContext = createContext<IntelligenceContextValue | null>(null)

function formatWib(iso: string) {
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
  return `LIVE · ${time} WIB`
}

function mergeOpportunity(reference: Opportunity, live?: LiveOpportunityPatch): Opportunity {
  if (!live) return reference
  return {
    ...reference,
    price: live.price ?? reference.price,
    move: live.move ?? reference.move,
    score: live.score,
    confidence: live.confidence,
    risk: live.risk,
    updated: formatWib(live.updated),
    version: live.version,
    thesis: live.thesis,
    invalidation: live.invalidation,
    catalysts: live.catalysts,
    risks: live.risks,
    components: live.components,
    evidence: live.evidence.length ? live.evidence : reference.evidence,
    dataState: live.dataState,
    marketProvider: live.marketProvider,
    marketProviderUrl: live.marketProviderUrl,
    marketMessage: live.marketMessage,
    aiStatus: live.aiStatus,
    reviewedBy: 'Automated evidence pipeline',
    history: [
      { version: live.version, date: 'Live', note: `Recomputed from ${live.marketProvider} and current evidence.` },
      ...reference.history.slice(0, 2),
    ],
    spark: [...reference.spark.slice(1), live.score],
  }
}

export function LiveIntelligenceProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<IntelligencePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch('/api/intelligence', { signal: controller.signal, headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Live API returned ${response.status}`)
        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.includes('application/json')) throw new Error('Live API is not available on this host')
        return response.json() as Promise<IntelligencePayload>
      })
      .then((nextPayload) => {
        setPayload(nextPayload)
        setError(null)
      })
      .catch((nextError: unknown) => {
        if (controller.signal.aborted) return
        setError(nextError instanceof Error ? nextError.message : 'Live data unavailable')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [revision])

  const opportunities = useMemo(() => referenceOpportunities.map((reference) => (
    mergeOpportunity(reference, payload?.opportunities.find((live) => live.id === reference.id))
  )), [payload])
  const liveCoverage = payload?.opportunities.filter((item) => item.dataState === 'live').length ?? 0
  const sourceMode = !payload ? 'reference' : liveCoverage === payload.opportunities.length ? 'live' : 'partial'
  const refresh = useCallback(() => setRevision((value) => value + 1), [])
  const value = useMemo<IntelligenceContextValue>(() => ({
    payload,
    opportunities,
    news: payload?.news.length ? payload.news : referenceNews,
    loading,
    error,
    refresh,
    sourceMode,
  }), [payload, opportunities, loading, error, refresh, sourceMode])

  return <IntelligenceContext.Provider value={value}>{children}</IntelligenceContext.Provider>
}

export function useLiveIntelligence() {
  const context = useContext(IntelligenceContext)
  if (!context) throw new Error('useLiveIntelligence must be used within LiveIntelligenceProvider')
  return context
}
