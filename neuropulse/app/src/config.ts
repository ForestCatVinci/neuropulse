const RAILWAY_URL = 'neuropulse-production.up.railway.app'

// In production (Vercel build) use Railway; in dev use Vite proxy / localhost
export const HTTP_BASE = import.meta.env.PROD
  ? `https://${RAILWAY_URL}`
  : ''

export const WS_BASE = import.meta.env.PROD
  ? `wss://${RAILWAY_URL}`
  : 'ws://localhost:8000'
