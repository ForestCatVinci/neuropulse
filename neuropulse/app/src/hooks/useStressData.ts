import { useEffect, useRef } from 'react'
import { useStressStore } from '../store/stressStore'
import type { StressData } from '../types/stress'

const WS_URL = 'ws://localhost:8000/ws'
const RECONNECT_DELAY_MS = 3000

export function useStressData(): void {
  const pushReading = useStressStore((s) => s.pushReading)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const data: StressData = JSON.parse(event.data)
          pushReading(data)
        } catch {
          // игнорируем невалидные сообщения
        }
      }

      ws.onclose = () => {
        // переподключение через 3 секунды
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [pushReading])
}
