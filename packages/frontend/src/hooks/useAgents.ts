import { useState, useEffect, useCallback } from 'react'

export interface Agent {
  id: string
  name: string
  terminalId: string
  workspace: string
  status: 'idle' | 'working' | 'waiting' | 'error'
  currentTool?: string
  sprite: { palette: number; hueShift: number }
  position?: { x: number; y: number }
}

export function useAgents(workspace: string) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents?workspace=${workspace}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setAgents(data.agents || [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [workspace])

  useEffect(() => {
    setLoading(true)
    fetchAgents()
  }, [fetchAgents])

  return { agents, loading, error, refetch: fetchAgents }
}