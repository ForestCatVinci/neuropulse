const backendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined

// HTTP base: empty string = relative (Vite proxy in dev), full URL in prod
export const HTTP_BASE = backendUrl ? `https://${backendUrl}` : ''

// WebSocket base
export const WS_BASE = backendUrl
  ? `wss://${backendUrl}`
  : 'ws://localhost:8000'
