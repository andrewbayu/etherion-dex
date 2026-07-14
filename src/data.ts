export type Market = 'Crypto' | 'Equity'
export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface ScoreComponent {
  label: string
  score: number
  weight: number
  reason: string
}

export interface Opportunity {
  id: string
  symbol: string
  name: string
  market: Market
  venue: string
  price: string
  move: number
  score: number
  confidence: number
  risk: RiskLevel
  horizon: string
  updated: string
  reviewedBy: string
  version: string
  thesis: string
  catalysts: string[]
  risks: string[]
  invalidation: string
  components: ScoreComponent[]
  scenarios: Array<{ name: 'Bull' | 'Base' | 'Bear'; range: string; description: string }>
  evidence: Array<{ publisher: string; title: string; time: string; type: string; url?: string; publishedAt?: string }>
  history: Array<{ version: string; date: string; note: string }>
  spark: number[]
  dataState?: 'live' | 'partial' | 'unavailable'
  marketProvider?: string
  marketProviderUrl?: string
  marketMessage?: string
  aiStatus?: 'live' | 'fallback' | 'unavailable'
}

export interface NewsItem {
  id: number | string
  sentiment: 'Bullish' | 'Mixed' | 'Bearish' | 'Neutral'
  score: number
  confidence: number
  headline: string
  publisher: string
  time: string
  assets: string[]
  summary: string
  horizon: string
  url?: string
  publishedAt?: string
  sourceCountry?: string
  analysisMode?: 'live' | 'fallback' | 'unavailable'
}

export const opportunities: Opportunity[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    market: 'Crypto',
    venue: 'Composite',
    price: '$118,420',
    move: 2.84,
    score: 87,
    confidence: 84,
    risk: 'Medium',
    horizon: '2–6 weeks',
    updated: '14 Jul · 10:42 WIB',
    reviewedBy: 'Maya Chen, CFA',
    version: 'ETH-SCORE 2.4',
    thesis:
      'Institutional spot demand remains constructive while exchange balances continue to compress. Momentum is strong, but the thesis needs a clean hold above the prior breakout zone to avoid late-cycle chasing.',
    catalysts: [
      'Seven-day spot ETF flow turned net positive',
      'Exchange balances at a 30-month low',
      'Weekly structure reclaimed the prior range high',
    ],
    risks: [
      'Elevated funding could accelerate a leverage flush',
      'US CPI surprise may strengthen the dollar',
      'Large options expiry increases short-term volatility',
    ],
    invalidation: 'Daily close below $108,800 with deteriorating spot volume.',
    components: [
      { label: 'Market structure', score: 92, weight: 25, reason: 'Higher highs across daily and weekly timeframes.' },
      { label: 'Flow & liquidity', score: 88, weight: 20, reason: 'Positive ETF flows with deep composite liquidity.' },
      { label: 'Fundamentals', score: 82, weight: 15, reason: 'Network security and holder behavior remain supportive.' },
      { label: 'News quality', score: 79, weight: 15, reason: 'Constructive coverage from diverse primary sources.' },
      { label: 'Risk regime', score: 73, weight: 25, reason: 'Volatility and crowded leverage reduce the raw score.' },
    ],
    scenarios: [
      { name: 'Bull', range: '$128k–$134k', description: 'Spot demand persists and the breakout retest holds.' },
      { name: 'Base', range: '$112k–$126k', description: 'Price consolidates while leverage normalizes.' },
      { name: 'Bear', range: '$101k–$108k', description: 'Macro surprise forces a risk-off liquidity event.' },
    ],
    evidence: [
      { publisher: 'Farside Investors', title: 'US Bitcoin ETF daily flow table', time: '2h ago', type: 'Primary data' },
      { publisher: 'Glassnode', title: 'Exchange balance and long-term holder update', time: '5h ago', type: 'On-chain' },
      { publisher: 'CME Group', title: 'Bitcoin futures open interest report', time: '8h ago', type: 'Derivatives' },
    ],
    history: [
      { version: 'v2.4', date: '14 Jul', note: 'Confidence raised after flow confirmation.' },
      { version: 'v2.3', date: '12 Jul', note: 'Risk penalty added for elevated funding.' },
      { version: 'v2.2', date: '09 Jul', note: 'Initial analyst-approved publication.' },
    ],
    spark: [72, 75, 74, 78, 77, 81, 80, 83, 84, 82, 86, 87],
  },
  {
    id: 'nvda',
    symbol: 'NVDA',
    name: 'NVIDIA',
    market: 'Equity',
    venue: 'NASDAQ',
    price: '$192.18',
    move: 1.46,
    score: 82,
    confidence: 79,
    risk: 'Medium',
    horizon: '1–3 months',
    updated: '14 Jul · 09:58 WIB',
    reviewedBy: 'Arjun Mehta',
    version: 'ETH-SCORE 2.4',
    thesis:
      'Data-center demand and upward estimate revisions support the medium-term case. Valuation and event concentration cap confidence ahead of the next earnings cycle.',
    catalysts: ['Hyperscaler capex revisions remain positive', 'Next-generation accelerator ramp', 'Consensus EPS revisions trending higher'],
    risks: ['Premium valuation versus sector', 'Export restrictions', 'Customer concentration'],
    invalidation: 'Weekly close below $169 alongside negative estimate revisions.',
    components: [
      { label: 'Market structure', score: 86, weight: 25, reason: 'Relative strength remains above sector peers.' },
      { label: 'Flow & liquidity', score: 84, weight: 20, reason: 'Institutional volume and options depth are healthy.' },
      { label: 'Fundamentals', score: 91, weight: 20, reason: 'Revenue quality and estimate revisions lead the universe.' },
      { label: 'News quality', score: 78, weight: 15, reason: 'Primary corporate and supply-chain sources align.' },
      { label: 'Risk regime', score: 62, weight: 20, reason: 'Valuation compresses the risk-adjusted result.' },
    ],
    scenarios: [
      { name: 'Bull', range: '$215–$228', description: 'Estimate upgrades continue into earnings.' },
      { name: 'Base', range: '$178–$210', description: 'Growth persists while valuation consolidates.' },
      { name: 'Bear', range: '$155–$170', description: 'Guidance or export news resets expectations.' },
    ],
    evidence: [
      { publisher: 'NVIDIA IR', title: 'Latest investor presentation and filings', time: '1d ago', type: 'Company filing' },
      { publisher: 'SEC EDGAR', title: 'Institutional ownership disclosures', time: '2d ago', type: 'Regulatory' },
      { publisher: 'NASDAQ', title: 'Consolidated volume and options activity', time: '4h ago', type: 'Market data' },
    ],
    history: [
      { version: 'v1.3', date: '14 Jul', note: 'Fundamental component raised after revisions.' },
      { version: 'v1.2', date: '10 Jul', note: 'Scenario ranges updated.' },
      { version: 'v1.0', date: '04 Jul', note: 'Initial analyst-approved publication.' },
    ],
    spark: [68, 67, 70, 72, 71, 75, 78, 76, 79, 80, 81, 82],
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    market: 'Crypto',
    venue: 'Composite',
    price: '$186.42',
    move: 4.12,
    score: 78,
    confidence: 72,
    risk: 'High',
    horizon: '1–4 weeks',
    updated: '14 Jul · 10:31 WIB',
    reviewedBy: 'Maya Chen, CFA',
    version: 'ETH-SCORE 2.4',
    thesis:
      'Network activity and spot volume are improving, but memecoin-driven demand and unlock sensitivity make this a higher-volatility research candidate.',
    catalysts: ['DEX volume recovery', 'Stablecoin supply expansion', 'Validator client upgrades'],
    risks: ['Activity mix remains speculative', 'Token unlock overhang', 'High beta to Bitcoin'],
    invalidation: 'Close below $164 with active-address growth rolling over.',
    components: [
      { label: 'Market structure', score: 84, weight: 25, reason: 'Momentum recovered above the 50-day range.' },
      { label: 'Flow & liquidity', score: 80, weight: 20, reason: 'Spot depth improved, derivatives remain crowded.' },
      { label: 'Fundamentals', score: 79, weight: 15, reason: 'Usage expansion is real but quality is mixed.' },
      { label: 'News quality', score: 71, weight: 15, reason: 'Positive source mix with some promotional noise.' },
      { label: 'Risk regime', score: 58, weight: 25, reason: 'High beta and unlock exposure trigger penalties.' },
    ],
    scenarios: [
      { name: 'Bull', range: '$214–$228', description: 'Spot-led participation expands beyond speculative activity.' },
      { name: 'Base', range: '$170–$205', description: 'Growth continues with sharp but contained pullbacks.' },
      { name: 'Bear', range: '$142–$160', description: 'Risk-off rotation and unlock supply coincide.' },
    ],
    evidence: [
      { publisher: 'Solana Foundation', title: 'Network health dashboard', time: '3h ago', type: 'Primary data' },
      { publisher: 'DefiLlama', title: 'Chain liquidity and volume data', time: '1h ago', type: 'Protocol data' },
      { publisher: 'Token Unlocks', title: 'Supply schedule monitor', time: '7h ago', type: 'Supply data' },
    ],
    history: [
      { version: 'v1.6', date: '14 Jul', note: 'High-risk flag retained after review.' },
      { version: 'v1.5', date: '11 Jul', note: 'Liquidity score raised.' },
      { version: 'v1.0', date: '01 Jul', note: 'Initial analyst-approved publication.' },
    ],
    spark: [61, 63, 60, 65, 67, 66, 70, 69, 73, 75, 74, 78],
  },
  {
    id: 'tsm',
    symbol: 'TSM',
    name: 'Taiwan Semiconductor',
    market: 'Equity',
    venue: 'NYSE',
    price: '$248.06',
    move: -0.38,
    score: 76,
    confidence: 81,
    risk: 'Medium',
    horizon: '2–4 months',
    updated: '14 Jul · 08:44 WIB',
    reviewedBy: 'Arjun Mehta',
    version: 'ETH-SCORE 2.4',
    thesis: 'Leading-edge demand remains durable, balanced against geopolitical concentration and a less favorable near-term price structure.',
    catalysts: ['Advanced-node utilization', 'AI accelerator demand', 'Margin guidance'],
    risks: ['Geopolitical concentration', 'Currency translation', 'Capex execution'],
    invalidation: 'Two consecutive weekly closes below $221 with cuts to utilization guidance.',
    components: [
      { label: 'Market structure', score: 70, weight: 25, reason: 'Trend intact but momentum has cooled.' },
      { label: 'Flow & liquidity', score: 76, weight: 20, reason: 'Deep ADR liquidity with neutral recent flow.' },
      { label: 'Fundamentals', score: 92, weight: 20, reason: 'Process leadership supports earnings visibility.' },
      { label: 'News quality', score: 82, weight: 15, reason: 'Strong filing and company-source coverage.' },
      { label: 'Risk regime', score: 60, weight: 20, reason: 'Concentration risk creates a persistent penalty.' },
    ],
    scenarios: [
      { name: 'Bull', range: '$278–$292', description: 'Utilization and margin guidance surprise higher.' },
      { name: 'Base', range: '$230–$274', description: 'Strong demand meets valuation consolidation.' },
      { name: 'Bear', range: '$202–$220', description: 'Geopolitical premium rises or demand is deferred.' },
    ],
    evidence: [
      { publisher: 'TSMC IR', title: 'Monthly revenue and investor materials', time: '1d ago', type: 'Company filing' },
      { publisher: 'SEC EDGAR', title: 'Latest 6-K disclosures', time: '3d ago', type: 'Regulatory' },
      { publisher: 'Taiwan Stock Exchange', title: 'Underlying share statistics', time: '5h ago', type: 'Market data' },
    ],
    history: [{ version: 'v1.1', date: '13 Jul', note: 'Geopolitical risk penalty reviewed.' }],
    spark: [73, 74, 72, 75, 77, 79, 78, 80, 79, 77, 76, 76],
  },
]

export const marketPulse = [
  { time: '04:00', value: 42 },
  { time: '06:00', value: 48 },
  { time: '08:00', value: 45 },
  { time: '10:00', value: 58 },
  { time: '12:00', value: 61 },
  { time: '14:00', value: 67 },
  { time: '16:00', value: 64 },
  { time: '18:00', value: 72 },
  { time: '20:00', value: 69 },
  { time: '22:00', value: 74 },
]

export const news: NewsItem[] = [
  {
    id: 1,
    sentiment: 'Bullish',
    score: 0.72,
    confidence: 88,
    headline: 'US spot Bitcoin funds extend net inflow streak as basis normalizes',
    publisher: 'Reuters',
    time: '18 min ago',
    assets: ['BTC', 'COIN'],
    summary: 'Institutional demand remained positive while derivatives positioning became less stretched.',
    horizon: '1–7 days',
  },
  {
    id: 2,
    sentiment: 'Mixed',
    score: 0.08,
    confidence: 76,
    headline: 'Chip supply expands, but advanced packaging remains the bottleneck',
    publisher: 'Nikkei Asia',
    time: '42 min ago',
    assets: ['NVDA', 'TSM'],
    summary: 'Capacity additions support volume growth, though packaging constraints may limit near-term upside.',
    horizon: '1–3 months',
  },
  {
    id: 3,
    sentiment: 'Bearish',
    score: -0.48,
    confidence: 81,
    headline: 'Dollar firms before inflation print as traders trim rate-cut bets',
    publisher: 'Financial Times',
    time: '1h ago',
    assets: ['BTC', 'SOL', 'QQQ'],
    summary: 'A stronger dollar and higher front-end yields create a near-term headwind for duration-sensitive assets.',
    horizon: '1–3 days',
  },
  {
    id: 4,
    sentiment: 'Neutral',
    score: 0.02,
    confidence: 93,
    headline: 'Solana client upgrade enters final validator testing window',
    publisher: 'Solana Foundation',
    time: '2h ago',
    assets: ['SOL'],
    summary: 'The release remains on schedule; no immediate change to network parameters was announced.',
    horizon: '1–4 weeks',
  },
]

export const events = [
  { id: 1, date: 'JUL 15', time: '19:30 WIB', country: 'US', name: 'CPI (YoY)', importance: 'High', forecast: '2.7%', previous: '2.8%', affected: ['BTC', 'QQQ', 'USD'], status: 'Upcoming' },
  { id: 2, date: 'JUL 16', time: '20:15 WIB', country: 'US', name: 'Industrial Production', importance: 'Medium', forecast: '0.2%', previous: '-0.1%', affected: ['SPY', 'DXY'], status: 'Upcoming' },
  { id: 3, date: 'JUL 17', time: '18:00 WIB', country: 'EU', name: 'ECB Rate Decision', importance: 'High', forecast: '2.00%', previous: '2.00%', affected: ['EUR', 'BTC'], status: 'Upcoming' },
  { id: 4, date: 'JUL 18', time: '03:00 WIB', country: 'US', name: 'NVIDIA earnings call', importance: 'High', forecast: '$0.93 EPS', previous: '$0.81 EPS', affected: ['NVDA', 'TSM', 'QQQ'], status: 'Watchlist' },
]

export const courses = [
  { id: 1, title: 'Reading Market Structure', level: 'Foundation', lessons: 8, progress: 62, duration: '2h 10m', next: 'Liquidity sweeps vs. breakouts' },
  { id: 2, title: 'Risk Before Reward', level: 'Core', lessons: 6, progress: 28, duration: '1h 35m', next: 'Position sizing under uncertainty' },
  { id: 3, title: 'Evidence-Led Crypto Research', level: 'Advanced', lessons: 10, progress: 0, duration: '3h 20m', next: 'Start course' },
]

export const discussions = [
  { id: 1, author: 'Maya Chen', role: 'Verified analyst', initials: 'MC', time: '24 min ago', title: 'What I need to see before raising BTC confidence above 85%', body: 'The score is already strong, but breadth still trails price. I am watching spot volume across three venues and whether funding normalizes into the CPI release.', assets: ['BTC'], replies: 18, reactions: 42 },
  { id: 2, author: 'Dimas Pranoto', role: 'Pro member', initials: 'DP', time: '1h ago', title: 'A cleaner way to compare SOL activity quality', body: 'Raw transaction count is misleading. I split activity by fee-paying cohorts and recurring wallets; the divergence is material.', assets: ['SOL'], replies: 11, reactions: 29 },
  { id: 3, author: 'Arjun Mehta', role: 'Verified analyst', initials: 'AM', time: '3h ago', title: 'Semiconductor preview: demand is not the only variable', body: 'This week’s note separates end demand, packaging constraints, and valuation sensitivity across NVDA and TSM.', assets: ['NVDA', 'TSM'], replies: 23, reactions: 61 },
]

export const notifications = [
  { id: 1, type: 'Opportunity update', title: 'BTC confidence raised to 84%', detail: 'ETF flow confirmation improved the flow component.', time: '12 min ago', unread: true },
  { id: 2, type: 'Economic event', title: 'US CPI in 22 hours', detail: '3 assets in your watchlist have high mapped sensitivity.', time: '38 min ago', unread: true },
  { id: 3, type: 'Research', title: 'Semiconductor weekly outlook', detail: 'Arjun Mehta published a new analyst note.', time: '2h ago', unread: true },
  { id: 4, type: 'Learning', title: 'Continue: Reading Market Structure', detail: 'You are 5 minutes from completing lesson 5.', time: '1d ago', unread: false },
]

export const DEMO_EMAIL = 'demo@etherion.app'
export const DEMO_PASSWORD = 'demo123'
