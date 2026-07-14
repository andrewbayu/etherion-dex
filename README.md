# Etherion DEX

Etherion is an evidence-first market research workspace for crypto and US equities. The current release combines live provider data, auditable AI feature extraction, deterministic scoring, linked evidence, and a source-bounded streaming assistant.

## Public demo account

- Static fallback: [andrewbayu.github.io/etherion-dex](https://andrewbayu.github.io/etherion-dex/)
- Email: `demo@etherion.app`
- Password: `demo123`

The credentials are intentionally public. Authentication is client-side and exists only to demonstrate the gated member experience. Do not reuse this pattern for production authentication.

## What is live

- BTC and SOL quotes, daily range, change, and volume from Coinbase Exchange
- Current mapped headlines and source URLs from the GDELT DOC API
- Optional NVDA and TSM quotes from Finnhub when `FINNHUB_API_KEY` is configured
- Structured sentiment, catalyst, and risk extraction through Vercel AI Gateway
- Versioned `ETH-SCORE 3.0.0` scoring with deterministic weights and explicit coverage penalties
- A streaming assistant that rebuilds its evidence context on the server and cites `[S1]`, `[S2]`, and so on

AI does not set the final opportunity score. It extracts constrained features from the retrieved evidence; the versioned scoring function calculates the final result. If AI is unavailable, the API exposes a rules-based fallback state rather than hiding the failure.

## Provider states

The UI always shows whether it is using live, partial, or reference data. With no extra market-data key, Coinbase and GDELT can be live while equity prices remain reference values. Add this server-side environment variable to enable equity quotes:

```text
FINNHUB_API_KEY=your_finnhub_key
```

Never prefix provider keys with `VITE_`; that would expose them to the browser bundle.

## Run locally

```bash
npm install
npm run dev
```

Vite serves the client locally. The `/api` directory is designed for Vercel Functions, so use Vercel's local runtime when testing the complete live stack.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

The suite includes the public-login flow and a backend contract test that verifies deterministic scoring and partial-provider degradation.

## Deployment

GitHub Pages continues to publish the static client as a resilient reference-data fallback. The live API and AI stream require a server runtime and should be deployed as a Vercel project from this repository. On Vercel, AI Gateway can use the deployment's automatically provisioned OIDC token; a static AI key is not committed to this repository.

## Important boundaries

- Research and education only; no investment advice or trade execution
- Live news analysis uses retrieved headlines and metadata, not unverified claims about full article contents
- Automated live synthesis is labelled unreviewed
- Scenario ranges in the original product demo remain reference research, not live targets
- A production release still needs real identity, durable storage, distributed rate limiting, licensed redistribution terms, admin review queues, and immutable audit records
