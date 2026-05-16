import { useEffect, useRef } from 'react'
import { useStressStore } from '../store/stressStore'
import type { StressData } from '../types/stress'
import { WS_BASE } from '../config'

const WS_URL = `${WS_BASE}/ws`
const MAX_RETRIES = 5

export function useStressData(): void {
  const pushReading = useStressStore((s) => s.pushReading)
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function connect() {
      if (retriesRef.current >= MAX_RETRIES) {
        console.warn('WebSocket: max retries reached, giving up')
        return
      }

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        retriesRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const data: StressData = JSON.parse(event.data)
          pushReading(data)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        retriesRef.current += 1
        const delay = 2000 * retriesRef.current  // exponential backoff
        timerRef.current = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [pushReading])
}
