import { useEffect, useRef, useState } from 'react'
import { useStressStore } from '../store/stressStore'
import type { StressData } from '../types/stress'
import { WS_URL } from '../config'

const MAX_RETRIES = 10

export function useStressData(): { isConnected: boolean; reconnectCount: number } {
  const setStressData = useStressStore((s) => s.setStressData)
  const [isConnected, setIsConnected] = useState(false)
  const [reconnectCount, setReconnectCount] = useState(0)

  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    function connect() {
      if (!mountedRef.current || retriesRef.current >= MAX_RETRIES) {
        if (retriesRef.current >= MAX_RETRIES) console.warn('WebSocket: max retries reached')
        return
      }

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return }
        retriesRef.current = 0
        setIsConnected(true)
        setReconnectCount(0)
      }

      ws.onmessage = (e) => {
        try {
          const data: StressData = JSON.parse(e.data)
          setStressData(data)
        } catch { /* ignore */ }
      }

      ws.onclose = () => {
        if (!mountedRef.current) return
        setIsConnected(false)
        retriesRef.current += 1
        setReconnectCount(retriesRef.current)
        const delay = Math.min(30_000, 1000 * Math.pow(2, retriesRef.current - 1))
        timerRef.current = setTimeout(connect, delay)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      wsRef.current?.close()
    }
  }, [setStressData])

  return { isConnected, reconnectCount }
}
