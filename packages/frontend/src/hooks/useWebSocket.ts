import { useEffect, useState, useRef, useCallback } from 'react'

interface WebSocketEvent {
  type: string
  agent?: { id: string }
  data?: Record<string, unknown>
  timestamp: string
}

export function useWebSocket(workspace: string) {
  const [connected, setConnected] = useState(false)
  const [events, setEvents] = useState<WebSocketEvent[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number>()

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const ws = new WebSocket(`${protocol}//${host}`)

    ws.onopen = () => {
      setConnected(true)
      ws.send(JSON.stringify({ type: 'subscribe', workspace }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setEvents(prev => [...prev.slice(-99), data])
      } catch (e) {
        console.error('WebSocket parse error:', e)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
    wsRef.current = ws
  }, [workspace])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectTimeoutRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, events, clearEvents: () => setEvents([]) }
}