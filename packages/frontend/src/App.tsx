import { useEffect, useState } from 'react'
import { OfficeCanvas } from './office/OfficeCanvas'
import { useWebSocket } from './hooks/useWebSocket'
import { useAgents } from './hooks/useAgents'

export default function App() {
  const [workspace, setWorkspace] = useState<string>('default')
  const { agents, loading, error, refetch } = useAgents(workspace)
  const { connected, events } = useWebSocket(workspace)

  useEffect(() => {
    if (events.length > 0) {
      refetch()
    }
  }, [events, refetch])

  return (
    <div className="app">
      <header className="header">
        <h1>🎮 Pixel Agents</h1>
        <div className="status">
          <span className={connected ? 'connected' : 'disconnected'}>
            {connected ? '🟢 Live' : '🔴 Offline'}
          </span>
          <span>{agents.length} agents</span>
        </div>
      </header>

      <main className="office-container">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && (
          <OfficeCanvas agents={agents} events={events} />
        )}
      </main>

      <footer className="toolbar">
        <button onClick={() => refetch()}>🔄 Refresh</button>
        <select 
          value={workspace} 
          onChange={(e) => setWorkspace(e.target.value)}
        >
          <option value="default">Default Workspace</option>
        </select>
      </footer>
    </div>
  )
}