import { getIntelligence } from './_lib/intelligence'

export const maxDuration = 60

export default {
  async fetch(request: Request) {
    if (request.method !== 'GET') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405, headers: { Allow: 'GET' } })
    }

    try {
      const intelligence = await getIntelligence({ includeAi: true })
      return Response.json(intelligence, {
        headers: {
          'Cache-Control': 'public, max-age=0, must-revalidate',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (error) {
      return Response.json({
        error: 'Live intelligence is temporarily unavailable.',
        detail: error instanceof Error ? error.message : 'Unknown provider error.',
      }, { status: 503 })
    }
  },
}
