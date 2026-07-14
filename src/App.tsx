import { FormEvent, lazy, ReactNode, Suspense, useDeferredValue, useEffect, useLayoutEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Article,
  Bell,
  BookOpen,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ChartLineUp,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  Copy,
  Database,
  DotsThree,
  Eye,
  EyeSlash,
  Funnel,
  GearSix,
  House,
  List,
  LockKey,
  MagnifyingGlass,
  Newspaper,
  Plus,
  ShieldCheck,
  SignOut,
  Sparkle,
  Star,
  TrendDown,
  TrendUp,
  UsersThree,
  Warning,
  X,
} from '@phosphor-icons/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  HashRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  courses,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  discussions,
  events,
  marketPulse,
  notifications,
  type Opportunity,
  type RiskLevel,
} from './data'
import { LiveIntelligenceProvider, useLiveIntelligence } from './live-intelligence'

const GroundedAssistant = lazy(() => import('./components/GroundedAssistant').then((module) => ({ default: module.GroundedAssistant })))

const STORAGE_KEY = 'etherion-demo-session'

type IconComponent = typeof House

const navItems: Array<{ to: string; label: string; icon: IconComponent }> = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/watchlist', label: 'AI watchlist', icon: Sparkle },
  { to: '/news', label: 'News intelligence', icon: Newspaper },
  { to: '/calendar', label: 'Economic calendar', icon: CalendarBlank },
  { to: '/learn', label: 'Learning', icon: BookOpen },
  { to: '/community', label: 'Community', icon: UsersThree },
]

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Etherion">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      {!compact && <span className="brand-word">ETHERION</span>}
    </div>
  )
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem(STORAGE_KEY, 'active')
        onLogin()
      } else {
        setError('Those credentials do not match the public demo account.')
        setLoading(false)
      }
    }, 450)
  }

  async function copyCredentials() {
    await navigator.clipboard?.writeText(`${DEMO_EMAIL}\n${DEMO_PASSWORD}`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Product introduction">
        <div className="login-story-inner">
          <Logo />
          <div className="login-thesis">
            <p className="eyebrow lime">RESEARCH BEFORE REACTION</p>
            <h1>See the signal.<br /><span>Inspect the evidence.</span></h1>
            <p className="login-copy">An AI-assisted market research workspace where every opportunity comes with sources, risks, version history, and human review.</p>
          </div>
          <div className="login-proof">
            <div><span>LIVE</span><p>Crypto market quotes</p></div>
            <div><span>3</span><p>Server-side providers</p></div>
            <div><span>v3.0</span><p>Auditable score engine</p></div>
          </div>
          <p className="legal-copy">Research and education only. Not investment advice. Live provider coverage and freshness are shown after login.</p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-login-brand"><Logo /></div>
          <p className="eyebrow">MEMBER ACCESS</p>
          <h2>Welcome to the research desk</h2>
          <p className="muted">Use the shared account below to explore the full product demo.</p>

          <button className="demo-credential" onClick={copyCredentials} type="button">
            <span><strong>Public demo account</strong><small>{DEMO_EMAIL} · {DEMO_PASSWORD}</small></span>
            {copied ? <Check size={18} weight="bold" /> : <Copy size={18} />}
          </button>

          <form onSubmit={submit} className="login-form">
            <label>
              <span>Email address</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <label>
              <span>Password</span>
              <span className="password-field">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeSlash size={19} /> : <Eye size={19} />}
                </button>
              </span>
            </label>
            {error && <div className="form-error" role="alert"><Warning size={17} weight="fill" />{error}</div>}
            <button className="primary-button login-submit" type="submit" disabled={loading}>
              {loading ? 'Opening workspace…' : <>Enter demo <ArrowRight size={18} weight="bold" /></>}
            </button>
          </form>
          <div className="secure-note"><LockKey size={16} /> This public demo stores no financial or personal data.</div>
        </div>
      </section>
    </main>
  )
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { payload, loading, sourceMode, refresh } = useLiveIntelligence()
  const liveTime = payload ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(payload.asOf)) : null

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
        <div className="sidebar-head">
          <Logo />
          <button className="icon-button sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="main-nav" aria-label="Primary">
          <p className="nav-label">WORKSPACE</p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <Icon size={19} weight="duotone" /><span>{label}</span>{to === '/watchlist' && <small>4</small>}
            </NavLink>
          ))}
          <p className="nav-label second">ACCOUNT</p>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Bell size={19} weight="duotone" /><span>Notifications</span><small>3</small>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <GearSix size={19} weight="duotone" /><span>Preferences</span>
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          <div className="plan-panel">
            <div><Sparkle size={17} weight="fill" /><span>PRO DEMO</span></div>
            <p>All research modules unlocked</p>
          </div>
          <button className="profile-chip" type="button">
            <span className="avatar">AR</span><span><strong>Alex Rivera</strong><small>Active trader</small></span><CaretDown size={15} />
          </button>
          <button className="logout-button" onClick={onLogout}><SignOut size={17} /> Sign out</button>
        </div>
      </aside>
      {menuOpen && <button className="sidebar-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu overlay" />}
      <div className="app-stage">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open menu"><List size={22} /></button>
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><MagnifyingGlass size={17} /><span>Search assets, news, research</span><kbd>⌘ K</kbd></button>
          <div className="topbar-actions">
            <button className={`data-status ${sourceMode}`} onClick={refresh} title="Refresh live intelligence"><span /> {loading ? 'CONNECTING LIVE DATA' : sourceMode === 'live' ? `LIVE · ${liveTime} WIB` : sourceMode === 'partial' ? `PARTIAL LIVE · ${liveTime} WIB` : 'REFERENCE DATA · RETRY'}</button>
            <Link to="/notifications" className="icon-button notification-button" aria-label="Notifications"><Bell size={20} /><span /></Link>
          </div>
        </header>
        <main id="main-content" className="app-main"><Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes></main>
      </div>
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const navigate = useNavigate()
  const { opportunities } = useLiveIntelligence()
  const results = opportunities.filter((item) => `${item.name} ${item.symbol}`.toLowerCase().includes(deferred.toLowerCase()))

  useEffect(() => {
    const listener = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [onClose])

  function open(item: Opportunity) {
    navigate(`/opportunity/${item.id}`)
    onClose()
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="search-modal" role="dialog" aria-modal="true" aria-label="Search Etherion" onMouseDown={(event) => event.stopPropagation()}>
      <div className="search-input-wrap"><MagnifyingGlass size={20} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by company, coin, or ticker…" /><button onClick={onClose}>ESC</button></div>
      <div className="search-results">
        <p className="modal-label">{query ? 'RESULTS' : 'QUICK ACCESS'}</p>
        {results.map((item) => <button key={item.id} onClick={() => open(item)} className="search-result">
          <AssetMark symbol={item.symbol} /><span><strong>{item.name}</strong><small>{item.market} · {item.venue}</small></span><span className="search-score">{item.score}<small>/100</small></span><ArrowRight size={17} />
        </button>)}
        {!results.length && <EmptyState icon={MagnifyingGlass} title="No matching assets" copy="Try another company, coin, or ticker." />}
      </div>
    </section>
  </div>
}

function PageHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p>{copy}</p>}</div>{action && <div className="page-actions">{action}</div>}</div>
}

function DataModeNotice() {
  const { payload, loading, error, sourceMode, refresh } = useLiveIntelligence()
  if (loading) return <div className="data-mode-banner loading"><Clock size={17} /><p><strong>Connecting live providers.</strong> Coinbase, news evidence, and the scoring pipeline are refreshing now.</p></div>
  if (sourceMode === 'live') return <div className="data-mode-banner live"><CheckCircle size={17} weight="fill" /><p><strong>Live intelligence active.</strong> Market, evidence, and {payload?.aiStatus === 'live' ? 'AI feature extraction' : 'fallback feature extraction'} refreshed from the server.</p><button onClick={refresh}>Refresh</button></div>
  if (sourceMode === 'partial') return <div className="data-mode-banner partial"><Warning size={17} weight="fill" /><p><strong>Partial live coverage.</strong> Crypto and news are live; US equity quotes remain reference values until FINNHUB_API_KEY is configured.</p><button onClick={refresh}>Retry</button></div>
  return <div className="data-mode-banner reference"><Database size={17} /><p><strong>Reference data visible.</strong> {error ?? 'The live API is unavailable on this host.'}</p><button onClick={refresh}>Retry live</button></div>
}

function Dashboard() {
  const { opportunities, news, payload, sourceMode } = useLiveIntelligence()
  const averageScore = Math.round(opportunities.reduce((sum, item) => sum + item.score, 0) / opportunities.length)
  const liveAssets = opportunities.filter((item) => item.dataState === 'live').length
  const liveProviders = payload ? Object.values(payload.providerStatus).filter((status) => status === 'live').length : 0
  const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date()).toUpperCase()
  return <div className="page dashboard-page">
    <PageHeader eyebrow={today} title="Good morning, Alex." copy={sourceMode === 'reference' ? 'Reference research is visible while the live pipeline reconnects.' : `${liveAssets} assets have verified live market coverage right now.`} action={<button className="secondary-button"><ClipboardText size={17} /> Daily briefing</button>} />
    <DataModeNotice />

    <section className="signal-strip" aria-label="Market summary">
      <div><span className="metric-icon"><ChartLineUp size={19} /></span><p>Research regime<small>Deterministic score average</small></p><strong className={averageScore >= 60 ? 'positive' : ''}>{averageScore}</strong></div>
      <div><span className="metric-icon"><Eye size={19} /></span><p>Live market coverage<small>{liveAssets} of {opportunities.length} assets</small></p><strong>{liveAssets}/{opportunities.length}</strong></div>
      <div><span className="metric-icon"><CalendarBlank size={19} /></span><p>Next impact event<small>US CPI · 22h</small></p><strong>HIGH</strong></div>
      <div><span className="metric-icon"><ShieldCheck size={19} /></span><p>Provider health<small>{liveProviders} of 3 providers live</small></p><strong className={liveProviders >= 2 ? 'positive' : ''}>{liveProviders}/3</strong></div>
    </section>

    <div className="dashboard-grid">
      <section className="panel opportunity-panel">
        <SectionHeading title="AI watchlist" copy="Live features · deterministic final score" link="/watchlist" />
        <div className="opportunity-list">
          {opportunities.slice(0, 3).map((item, index) => <OpportunityRow key={item.id} item={item} rank={index + 1} />)}
        </div>
        <div className="method-note"><ShieldCheck size={18} weight="duotone" /><p><strong>Scores are not return probabilities.</strong> They summarize versioned evidence, signal quality, and risk gates.</p><Link to="/watchlist">View methodology <CaretRight size={14} /></Link></div>
      </section>

      <section className="panel pulse-panel">
        <div className="panel-top"><div><p className="eyebrow">CROSS-ASSET RESEARCH</p><h2>Score pulse</h2></div><span className="live-label"><span /> {sourceMode === 'reference' ? 'REFERENCE' : 'REFRESHED'}</span></div>
        <div className="pulse-score"><strong>{averageScore}</strong><span><b>{averageScore >= 70 ? 'Constructive' : averageScore >= 55 ? 'Measured' : 'Cautious'}</b><small>{payload?.scoreVersion ?? 'reference model'}</small></span></div>
        <div className="chart-wrap" aria-label="Market pulse chart">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={marketPulse} margin={{ top: 10, right: 4, left: -28, bottom: 0 }}>
              <defs><linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c8f135" stopOpacity={0.28} /><stop offset="100%" stopColor="#c8f135" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#232824" vertical={false} />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#737b75', fontSize: 10 }} interval={2} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737b75', fontSize: 10 }} domain={[20, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#c8f135" strokeWidth={2} fill="url(#pulseFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="pulse-drivers"><span>MAIN DRIVERS</span><p><TrendUp size={15} /> Spot demand</p><p><TrendUp size={15} /> Semiconductors</p><p className="negative"><TrendDown size={15} /> USD strength</p></div>
      </section>

      <section className="panel event-panel">
        <SectionHeading title="Impact calendar" copy="Events mapped to your assets" link="/calendar" />
        <div className="event-list">
          {events.slice(0, 3).map((event) => <div className="event-row" key={event.id}><div className="event-date"><strong>{event.date.split(' ')[1]}</strong><span>{event.date.split(' ')[0]}</span></div><div><strong>{event.name}</strong><small>{event.time} · {event.country}</small><div className="asset-tags">{event.affected.slice(0, 3).map((asset) => <span key={asset}>{asset}</span>)}</div></div><Importance value={event.importance} /></div>)}
        </div>
      </section>

      <section className="panel intelligence-panel">
        <SectionHeading title="Intelligence feed" copy="Deduplicated and source-weighted" link="/news" />
        <div className="news-compact">
          {news.slice(0, 3).map((item) => <article key={item.id}><Sentiment value={item.sentiment} /><h3>{item.headline}</h3><p>{item.publisher} · {item.time}</p></article>)}
        </div>
      </section>

      <section className="panel course-panel">
        <div className="course-visual"><span>05</span><p>LESSON IN PROGRESS</p></div>
        <div className="course-body"><p className="eyebrow">CONTINUE LEARNING</p><h2>{courses[0].next}</h2><p>{courses[0].title} · 12 min remaining</p><Progress value={courses[0].progress} /><Link className="primary-button" to="/learn">Resume lesson <ArrowRight size={17} /></Link></div>
      </section>

      <section className="panel analyst-panel">
        <SectionHeading title="From the desk" copy="Latest verified analyst note" link="/community" />
        <div className="analyst-feature"><div className="avatar large">AM</div><div><p className="eyebrow">ARJUN MEHTA · 3H AGO</p><h3>Semiconductor preview: demand is not the only variable</h3><p>Separating end demand, packaging constraints, and valuation sensitivity across NVDA and TSM.</p><div className="asset-tags"><span>NVDA</span><span>TSM</span><span>8 min read</span></div></div></div>
      </section>
    </div>
  </div>
}

function Watchlist() {
  const [market, setMarket] = useState<'All' | 'Crypto' | 'Equity'>('All')
  const [risk, setRisk] = useState<'All' | RiskLevel>('All')
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const { opportunities } = useLiveIntelligence()
  const filtered = opportunities.filter((item) => (market === 'All' || item.market === market) && (risk === 'All' || item.risk === risk) && `${item.name} ${item.symbol}`.toLowerCase().includes(deferred.toLowerCase()))

  return <div className="page">
    <PageHeader eyebrow="LIVE EVIDENCE · DETERMINISTIC SCORE" title="AI watchlist" copy="AI extracts structured features from current evidence; a versioned formula calculates the final score." action={<button className="primary-button"><Plus size={17} weight="bold" /> Create alert</button>} />
    <DataModeNotice />
    <div className="filter-bar">
      <label className="table-search"><MagnifyingGlass size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets" aria-label="Search assets" /></label>
      <div className="segmented" aria-label="Filter by market">{(['All', 'Crypto', 'Equity'] as const).map((value) => <button className={market === value ? 'active' : ''} onClick={() => setMarket(value)} key={value}>{value}</button>)}</div>
      <label className="select-control"><Funnel size={16} /><select value={risk} onChange={(event) => setRisk(event.target.value as 'All' | RiskLevel)} aria-label="Filter by risk"><option>All</option><option>Low</option><option>Medium</option><option>High</option></select></label>
      <span className="result-count">{filtered.length} candidates</span>
    </div>
    <section className="panel data-table-panel">
      <div className="watchlist-table table-head"><span>ASSET</span><span>AI SCORE</span><span>PRICE / 24H</span><span>RISK</span><span>HORIZON</span><span>UPDATED</span><span /></div>
      {filtered.map((item) => <Link to={`/opportunity/${item.id}`} className="watchlist-table table-row" key={item.id}>
        <span className="asset-cell"><AssetMark symbol={item.symbol} /><span><strong>{item.name}</strong><small>{item.symbol} · {item.venue}</small></span></span>
        <span className="score-cell"><ScoreRing score={item.score} size="small" /><span><strong>{item.score}</strong><small>{item.confidence}% confidence</small></span></span>
        <span><strong>{item.price}</strong><small className={item.move >= 0 ? 'positive' : 'negative'}>{item.move >= 0 ? '+' : ''}{item.move.toFixed(2)}%</small></span>
        <Risk value={item.risk} />
        <span><strong>{item.horizon}</strong><small>Research window</small></span>
        <span><strong>{item.updated}</strong><small>{item.marketProvider ?? 'Reference dataset'}</small></span>
        <ArrowRight size={17} />
      </Link>)}
      {!filtered.length && <EmptyState icon={Funnel} title="No candidates match" copy="Clear a filter or search a different asset." />}
    </section>
    <div className="disclosure"><ShieldCheck size={19} /><p><strong>What this list means.</strong> Etherion scores research quality and signal alignment. It does not predict returns or instruct you to trade.</p><button>Read full methodology <ArrowRight size={15} /></button></div>
  </div>
}

function OpportunityDetail() {
  const { id } = useParams()
  const { opportunities, payload } = useLiveIntelligence()
  const item = opportunities.find((entry) => entry.id === id)
  const [saved, setSaved] = useState(true)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const navigate = useNavigate()
  if (!item) return <Navigate to="/watchlist" replace />
  const componentChart = item.components.map((component) => ({ name: component.label.split(' ')[0], score: component.score }))

  return <div className="page detail-page">
    <button className="back-button" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Back to watchlist</button>
    <DataModeNotice />
    <section className="detail-hero">
      <div className="detail-identity"><AssetMark symbol={item.symbol} large /><div><div className="detail-title-line"><h1>{item.name}</h1><span>{item.symbol}</span><span>{item.market}</span></div><p>{item.marketProvider ?? item.venue} · {item.dataState ?? 'reference'} coverage · Updated {item.updated}</p></div></div>
      <div className="detail-price"><strong>{item.price}</strong><span className={item.move >= 0 ? 'positive' : 'negative'}>{item.move >= 0 ? '+' : ''}{item.move.toFixed(2)}% today</span></div>
      <div className="detail-actions"><button className="secondary-button" onClick={() => setSaved((value) => !value)}>{saved ? <Star size={17} weight="fill" /> : <Star size={17} />} {saved ? 'Watching' : 'Add to watchlist'}</button><button className="icon-button"><DotsThree size={22} /></button></div>
    </section>

    <section className="detail-scoreboard">
      <div className="hero-score"><ScoreRing score={item.score} size="large" /><div><p>{item.dataState ? 'ETHERION LIVE SCORE' : 'ETHERION SCORE'}</p><h2>{item.score}<span>/100</span></h2><small>{item.confidence}% evidence confidence</small></div></div>
      <div className="score-meta"><span><small>RESEARCH HORIZON</small><strong>{item.horizon}</strong></span><span><small>RISK LEVEL</small><Risk value={item.risk} /></span><span><small>REVIEW STATUS</small><strong className={item.dataState ? 'pending-review' : 'verified'}>{item.dataState ? <><Clock size={17} /> Automated · unreviewed</> : <><CheckCircle size={17} weight="fill" /> Analyst approved</>}</strong></span><span><small>SCORE VERSION</small><strong>{item.version}</strong></span></div>
      <div className="reviewer"><div className="avatar">AI</div><span><small>PIPELINE</small><strong>{item.reviewedBy}</strong><em>{item.aiStatus === 'live' ? `Feature model ${payload?.featureModel}` : 'Rules fallback active'}</em></span></div>
    </section>

    <div className="detail-grid">
      <div className="detail-main">
        <section className="panel thesis-panel"><p className="eyebrow">{item.dataState ? 'AUTOMATED LIVE SYNTHESIS · UNREVIEWED' : 'ANALYST-APPROVED THESIS'}</p><h2>The evidence, in plain language.</h2><p className="thesis-copy">{item.thesis}</p><div className="invalidation"><Warning size={19} weight="fill" /><div><strong>Thesis invalidation</strong><p>{item.invalidation}</p></div></div></section>

        <section className="panel score-breakdown"><SectionHeading title="Why it scored this way" copy="Weighted components before risk gates" />
          <div className="component-layout"><div className="component-chart"><ResponsiveContainer width="100%" height={230}><BarChart data={componentChart} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid stroke="#222723" horizontal={false} /><XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#737b75', fontSize: 10 }} /><YAxis dataKey="name" type="category" width={70} axisLine={false} tickLine={false} tick={{ fill: '#aab2ac', fontSize: 11 }} /><Tooltip content={<ChartTooltip />} /><Bar dataKey="score" radius={[0, 3, 3, 0]}>{componentChart.map((entry, index) => <Cell fill={index === 4 ? '#e2a547' : '#c8f135'} key={entry.name} />)}</Bar></BarChart></ResponsiveContainer></div>
          <div className="component-list">{item.components.map((component) => <div key={component.label}><span><strong>{component.label}</strong><small>{component.weight}% weight</small></span><b>{component.score}</b><p>{component.reason}</p></div>)}</div></div>
        </section>

        <section className="panel scenarios-panel"><SectionHeading title="Scenario map" copy="Reference zones, not targets or guarantees" />
          <div className="scenario-grid">{item.scenarios.map((scenario) => <article className={`scenario ${scenario.name.toLowerCase()}`} key={scenario.name}><span>{scenario.name === 'Bull' ? <TrendUp size={18} /> : scenario.name === 'Bear' ? <TrendDown size={18} /> : <ArrowRight size={18} />}{scenario.name} case</span><strong>{scenario.range}</strong><p>{scenario.description}</p></article>)}</div>
        </section>

        <section className="panel evidence-panel"><SectionHeading title="Evidence room" copy={`${item.evidence.length} linked sources in the current score`} />
          {item.evidence.map((source, index) => source.url
            ? <a className="evidence-row" key={source.title} href={source.url} target="_blank" rel="noreferrer"><span className="evidence-index">0{index + 1}</span><span><strong>{source.title}</strong><small>{source.publisher} · {source.time}</small></span><em>{source.type}</em><ArrowRight size={17} /></a>
            : <button className="evidence-row" key={source.title}><span className="evidence-index">0{index + 1}</span><span><strong>{source.title}</strong><small>{source.publisher} · {source.time}</small></span><em>{source.type}</em><ArrowRight size={17} /></button>)}
        </section>
      </div>
      <aside className="detail-aside">
        <section className="panel catalyst-panel"><h3>Supporting catalysts</h3>{item.catalysts.map((catalyst) => <p key={catalyst}><CheckCircle size={18} weight="fill" />{catalyst}</p>)}</section>
        <section className="panel risk-panel"><h3>Risks & contrary evidence</h3>{item.risks.map((risk) => <p key={risk}><Warning size={18} weight="fill" />{risk}</p>)}</section>
        <section className="panel history-panel"><h3>Version history</h3>{item.history.map((entry) => <div key={`${entry.version}-${entry.date}`}><span /><p><strong>{entry.version} · {entry.date}</strong><small>{entry.note}</small></p></div>)}</section>
        <section className="ask-panel"><Sparkle size={23} weight="duotone" /><h3>Ask the research</h3><p>Answers are rebuilt from the latest server-side evidence and cite their source IDs.</p><button onClick={() => setAssistantOpen(true)}>Open grounded assistant <ArrowRight size={16} /></button></section>
      </aside>
    </div>
    {assistantOpen && <Suspense fallback={<div className="assistant-backdrop"><div className="assistant-loading">Opening grounded evidence…</div></div>}><GroundedAssistant item={item} onClose={() => setAssistantOpen(false)} /></Suspense>}
  </div>
}

function NewsPage() {
  const [filter, setFilter] = useState('All')
  const { news, payload } = useLiveIntelligence()
  const filtered = news.filter((item) => filter === 'All' || item.sentiment === filter)
  return <div className="page">
    <PageHeader eyebrow="LIVE SOURCE-WEIGHTED INTELLIGENCE" title="News & sentiment" copy="Headlines are fetched live, mapped to assets, and classified conservatively. Open the source to inspect the original." action={<button className="secondary-button"><GearSix size={17} /> Feed settings</button>} />
    <DataModeNotice />
    <div className="filter-bar"><div className="segmented">{['All', 'Bullish', 'Mixed', 'Bearish', 'Neutral'].map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div><span className="result-count">{filtered.length} story clusters</span></div>
    <div className="news-layout"><section className="panel news-feed">{filtered.map((item) => <article className="news-card" key={item.id}><div className="news-meta"><Sentiment value={item.sentiment} /><span>{item.publisher} · {item.time}</span></div><h2>{item.headline}</h2><p>{item.summary}</p><div className="news-bottom"><div className="asset-tags">{item.assets.map((asset) => <span key={asset}>{asset}</span>)}</div><div className="confidence"><span>CONFIDENCE</span><strong>{Math.round(item.confidence)}%</strong><small>{item.analysisMode === 'live' ? 'AI extracted' : 'Rules fallback'}</small></div>{item.url ? <a className="text-button" href={item.url} target="_blank" rel="noreferrer">Open source <ArrowRight size={15} /></a> : <button className="text-button">Reference item <ArrowRight size={15} /></button>}</div></article>)}</section>
      <aside><section className="panel source-health"><div className="panel-top"><div><p className="eyebrow">DATA QUALITY</p><h2>Source health</h2></div><Database size={21} /></div><strong>{Object.values(payload?.providerStatus ?? {}).filter((status) => status === 'live').length} / 3</strong><p>providers operating live</p>{[['Coinbase market', payload?.providerStatus.coinbase], ['Finnhub equities', payload?.providerStatus.finnhub], [payload?.providerNotes.newsNetwork ?? 'Live news feed', payload?.providerStatus.news], ['AI feature model', payload?.aiStatus]].map(([label, status]) => <div className="health-row" key={label}><span>{label}</span><b className={status === 'live' ? '' : 'degraded'}><span />{status?.replace('_', ' ') ?? 'offline'}</b></div>)}</section><div className="disclosure compact"><ShieldCheck size={19} /><p>Sentiment is context, not a standalone signal. The final score is deterministic and includes coverage and risk gates.</p></div></aside>
    </div>
  </div>
}

function CalendarPage() {
  return <div className="page">
    <PageHeader eyebrow="YOUR TIMEZONE · ASIA/JAKARTA" title="Economic calendar" copy="Macro and asset events mapped to your watchlist with pre- and post-release context." action={<button className="primary-button"><Bell size={17} /> Alert preferences</button>} />
    <section className="calendar-summary"><div><CalendarBlank size={21} /><span><strong>4</strong><small>mapped events</small></span></div><div><Warning size={21} /><span><strong>3</strong><small>high impact</small></span></div><div><Clock size={21} /><span><strong>22h</strong><small>until US CPI</small></span></div></section>
    <section className="panel calendar-panel"><div className="calendar-head"><span>DATE / TIME</span><span>EVENT</span><span>IMPACT</span><span>FORECAST</span><span>PREVIOUS</span><span>MAPPED ASSETS</span></div>{events.map((event) => <div className="calendar-row" key={event.id}><div><strong>{event.date}</strong><small>{event.time}</small></div><div><strong>{event.name}</strong><small>{event.country} · {event.status}</small></div><Importance value={event.importance} /><div><strong>{event.forecast}</strong><small>consensus</small></div><div><strong>{event.previous}</strong><small>previous</small></div><div className="asset-tags">{event.affected.map((asset) => <span key={asset}>{asset}</span>)}</div><button className="icon-button"><Bell size={17} /></button></div>)}</section>
    <div className="post-event-placeholder"><div><ChartLineUp size={24} /></div><span><strong>Post-release intelligence</strong><p>When actual data arrives, Etherion will preserve the forecast, show the surprise, and clearly separate reported facts from AI interpretation.</p></span></div>
  </div>
}

function LearnPage() {
  const [active, setActive] = useState(1)
  return <div className="page">
    <PageHeader eyebrow="STRUCTURED LEARNING PATH" title="Build your research edge" copy="Grounded lessons, short checks, and current-market examples without trade instructions." />
    <section className="learning-hero"><div><p className="eyebrow lime">YOUR WEEKLY MOMENTUM</p><h2>2 lessons completed.<br />Keep the process moving.</h2><p>Consistency score is based on learning activity, not trading frequency.</p><div className="streak"><span>M</span><span className="done">T</span><span className="done">W</span><span>T</span><span>F</span><span>S</span><span>S</span></div></div><div className="learning-stat"><strong>38%</strong><span>PATH COMPLETE</span><Progress value={38} /><p>7 of 18 core lessons</p></div></section>
    <div className="course-grid">{courses.map((course) => <article className={`panel course-card ${active === course.id ? 'selected' : ''}`} key={course.id}><div className="course-card-top"><span>{course.level}</span><small>{course.lessons} lessons · {course.duration}</small></div><div className="course-number">0{course.id}</div><h2>{course.title}</h2><p>{course.next}</p><Progress value={course.progress} /><div className="course-card-foot"><span>{course.progress}% complete</span><button onClick={() => setActive(course.id)}>{course.progress ? 'Continue' : 'Start course'} <ArrowRight size={15} /></button></div></article>)}</div>
    <section className="panel tutor-panel"><div><Sparkle size={27} weight="duotone" /><span><p className="eyebrow">COURSE-GROUNDED TUTOR</p><h2>Stuck on a concept?</h2><p>The tutor can only answer from approved lessons and shows where each explanation came from.</p></span></div><button className="secondary-button">Ask the tutor <ArrowRight size={16} /></button></section>
  </div>
}

function CommunityPage() {
  const [reacted, setReacted] = useState<number[]>([])
  return <div className="page">
    <PageHeader eyebrow="MODERATED RESEARCH COMMUNITY" title="The desk" copy="Discuss the evidence with verified analysts and serious market participants." action={<button className="primary-button"><Plus size={17} /> Start discussion</button>} />
    <div className="community-layout"><section className="discussion-feed">{discussions.map((post) => <article className="panel discussion-card" key={post.id}><div className="discussion-author"><div className="avatar large">{post.initials}</div><span><strong>{post.author}</strong><small className={post.role.includes('Verified') ? 'verified' : ''}>{post.role.includes('Verified') && <CheckCircle size={14} weight="fill" />}{post.role} · {post.time}</small></span><button className="icon-button"><DotsThree size={20} /></button></div><h2>{post.title}</h2><p>{post.body}</p><div className="discussion-foot"><div className="asset-tags">{post.assets.map((asset) => <span key={asset}>{asset}</span>)}</div><button onClick={() => setReacted((items) => items.includes(post.id) ? items.filter((id) => id !== post.id) : [...items, post.id])} className={reacted.includes(post.id) ? 'reacted' : ''}><TrendUp size={16} weight={reacted.includes(post.id) ? 'fill' : 'regular'} /> {post.reactions + (reacted.includes(post.id) ? 1 : 0)}</button><button><Article size={16} /> {post.replies} replies</button></div></article>)}</section>
      <aside><section className="panel community-rules"><ShieldCheck size={23} weight="duotone" /><h3>Evidence over hype</h3><p>Promotional claims, undisclosed conflicts, harassment, and manipulation attempts are removed and retained for audit.</p><button>Community standards <ArrowRight size={15} /></button></section><section className="panel analyst-list"><h3>Verified analysts</h3>{[['MC', 'Maya Chen', 'Digital assets'], ['AM', 'Arjun Mehta', 'Equities'], ['SK', 'Sofia Klein', 'Global macro']].map(([initials, name, focus]) => <div key={name}><span className="avatar">{initials}</span><span><strong>{name}<CheckCircle size={13} weight="fill" /></strong><small>{focus}</small></span><button>Follow</button></div>)}</section></aside>
    </div>
  </div>
}

function NotificationsPage() {
  const [read, setRead] = useState<number[]>(notifications.filter((item) => !item.unread).map((item) => item.id))
  return <div className="page narrow-page">
    <PageHeader eyebrow="IN-APP ALERT CENTER" title="Notifications" copy="Only the material changes mapped to your preferences." action={<button className="secondary-button" onClick={() => setRead(notifications.map((item) => item.id))}><Check size={16} /> Mark all read</button>} />
    <section className="panel notification-list">{notifications.map((item) => <button key={item.id} onClick={() => setRead((items) => [...new Set([...items, item.id])])} className={`notification-row ${read.includes(item.id) ? '' : 'unread'}`}><span className="notification-icon">{item.type === 'Economic event' ? <CalendarBlank size={19} /> : item.type === 'Learning' ? <BookOpen size={19} /> : item.type === 'Research' ? <Article size={19} /> : <Sparkle size={19} />}</span><span><small>{item.type} · {item.time}</small><strong>{item.title}</strong><p>{item.detail}</p></span><CaretRight size={17} /></button>)}</section>
  </div>
}

function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(false)
  const [quietHours, setQuietHours] = useState(true)
  return <div className="page narrow-page">
    <PageHeader eyebrow="MEMBER PREFERENCES" title="Your research setup" copy="Control watchlist relevance and alert noise without changing historical data." />
    <section className="panel settings-section"><h2>Profile</h2><div className="profile-settings"><span className="avatar xlarge">AR</span><div><strong>Alex Rivera</strong><p>{DEMO_EMAIL}</p><span>Pro demo member</span></div><button className="secondary-button">Edit profile</button></div></section>
    <section className="panel settings-section"><h2>Alert channels</h2><SettingToggle label="Email alerts" copy="Material events and research updates" checked={emailAlerts} onChange={setEmailAlerts} /><SettingToggle label="Browser push" copy="Immediate high-impact alerts" checked={pushAlerts} onChange={setPushAlerts} /><SettingToggle label="Quiet hours" copy="22:00–07:00 Asia/Jakarta" checked={quietHours} onChange={setQuietHours} /></section>
    <section className="panel settings-section"><h2>Research preferences</h2><div className="settings-fields"><label><span>Primary markets</span><select defaultValue="Both"><option>Both</option><option>Crypto</option><option>Equities</option></select></label><label><span>Research horizon</span><select defaultValue="Swing + position"><option>Swing + position</option><option>Intraday</option><option>Long term</option></select></label><label><span>Timezone</span><select defaultValue="Asia/Jakarta"><option>Asia/Jakarta</option><option>UTC</option><option>America/New_York</option></select></label></div></section>
    <button className="primary-button save-settings"><Check size={17} /> Save preferences</button>
  </div>
}

function SettingToggle({ label, copy, checked, onChange }: { label: string; copy: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="setting-toggle"><span><strong>{label}</strong><small>{copy}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>
}

function SectionHeading({ title, copy, link }: { title: string; copy: string; link?: string }) {
  return <div className="section-heading"><div><h2>{title}</h2><p>{copy}</p></div>{link && <Link to={link}>View all <ArrowRight size={15} /></Link>}</div>
}

function AssetMark({ symbol, large = false }: { symbol: string; large?: boolean }) {
  return <span className={`asset-mark asset-${symbol.toLowerCase()} ${large ? 'large' : ''}`}>{symbol.slice(0, 1)}</span>
}

function ScoreRing({ score, size = 'normal' }: { score: number; size?: 'small' | 'normal' | 'large' }) {
  return <span className={`score-ring ${size}`} style={{ '--score': `${score * 3.6}deg` } as React.CSSProperties}><span>{size !== 'small' && score}</span></span>
}

function OpportunityRow({ item, rank }: { item: Opportunity; rank: number }) {
  return <Link to={`/opportunity/${item.id}`} className="opportunity-row"><span className="rank">0{rank}</span><AssetMark symbol={item.symbol} /><span className="opportunity-name"><strong>{item.name}</strong><small>{item.symbol} · {item.market}</small></span><MiniChart item={item} /><span className="opportunity-price"><strong>{item.price}</strong><small className={item.move >= 0 ? 'positive' : 'negative'}>{item.move >= 0 ? '+' : ''}{item.move.toFixed(2)}%</small></span><Risk value={item.risk} /><span className="opportunity-score"><strong>{item.score}</strong><small>SCORE</small></span><ArrowRight size={17} /></Link>
}

function MiniChart({ item }: { item: Opportunity }) {
  const data = item.spark.map((value, index) => ({ index, value }))
  return <span className="mini-chart" aria-label={`${item.symbol} score trend`}><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><Line dataKey="value" type="monotone" stroke={item.move >= 0 ? '#c8f135' : '#f0786c'} strokeWidth={1.7} dot={false} /></LineChart></ResponsiveContainer></span>
}

function Risk({ value }: { value: RiskLevel }) {
  return <span className={`risk risk-${value.toLowerCase()}`}><span />{value}</span>
}

function Sentiment({ value }: { value: string }) {
  return <span className={`sentiment sentiment-${value.toLowerCase()}`}>{value === 'Bullish' ? <TrendUp size={13} /> : value === 'Bearish' ? <TrendDown size={13} /> : <ArrowRight size={13} />}{value}</span>
}

function Importance({ value }: { value: string }) {
  return <span className={`importance ${value.toLowerCase()}`}><span />{value}</span>
}

function Progress({ value }: { value: number }) {
  return <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>
}

function EmptyState({ icon: Icon, title, copy }: { icon: IconComponent; title: string; copy: string }) {
  return <div className="empty-state"><Icon size={28} /><strong>{title}</strong><p>{copy}</p></div>
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><small>{label}</small><strong>{payload[0].value}</strong></div>
}

function AppRoot() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem(STORAGE_KEY) === 'active')
  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />
  return <LiveIntelligenceProvider><Shell onLogout={() => { localStorage.removeItem(STORAGE_KEY); setLoggedIn(false) }} /></LiveIntelligenceProvider>
}

export default function App() {
  return <HashRouter><AppRoot /></HashRouter>
}
