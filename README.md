# Etherion DEX

Etherion is an evidence-first AI market research community demo for crypto and US equities. The product is built around a simple principle: every opportunity should expose its score composition, confidence, risks, sources, human reviewer, and version history.

This repository is an interactive first-release prototype based on the supplied MarketSignal PRD. It intentionally demonstrates the member experience with seeded data; it does not claim to provide live market data, autonomous picks, brokerage execution, or financial advice.

## Public demo account

- Email: `demo@etherion.app`
- Password: `demo123`

The credentials are intentionally public. Authentication is client-side and exists only to demonstrate the gated product experience. Do not reuse this pattern for production authentication.

## Included product journeys

- Personalized member dashboard and daily market pulse
- Ranked AI Watchlist with market, risk, and search filters
- Full opportunity briefs with weighted score components
- Bull/base/bear scenarios, invalidation, risks, and evidence room
- Immutable-looking review and version history
- Curated news clusters with sentiment confidence
- Watchlist-mapped economic calendar
- Course progress and grounded tutor entry point
- Moderated community and verified analyst states
- Notification center and alert preferences
- Responsive layout and installable PWA shell

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite and sign in with the public demo account.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the static app whenever `main` changes. In GitHub repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** if it is not selected automatically.

The app uses hash routing and a relative Vite base, so deep links and assets remain compatible with a project Pages URL.

## Production architecture boundary

The supplied PRD recommends a modular monolith with asynchronous workers. A production implementation should replace the demo layer with:

- An identity provider with verified email, secure sessions, MFA for administrators, and RBAC
- PostgreSQL for transactional and versioned research data
- Redis and a durable queue for ingestion, scoring, notification, and evaluation jobs
- Licensed market, news, economic-calendar, and notification providers
- A versioned AI gateway with schemas, citations, freshness gates, evaluation logs, and kill switches
- Immutable audit records and automated outcome measurement
- Legal review of terminology, disclosures, supported jurisdictions, and reference-zone language

No secrets or provider credentials are required by this demo.

## Disclaimer

All prices, events, scores, names, outcomes, and research claims shown in the demo are illustrative seeded content. Etherion provides research and education interfaces, not investment advice or trade execution.
