// DevToolsPanel — Git status, CI/CD dashboard, GitHub mock, event log
import { useState } from 'react'
import type { GitStatus, CIStatus, DevEvent } from '../types.js'

// Simulated dev tool state
const MOCK_GIT: GitStatus = { branch: 'feat/omega-v2', uncommitted: 3, ahead: 2, behind: 0 }
const MOCK_CI: CIStatus = { passed: 42, failed: 0, skipped: 2, coverage: 87.3, running: false }
const MOCK_EVENTS: DevEvent[] = [
  { timestamp: Date.now() - 120000, source: 'Git', message: 'Committed: fix tier rendering', type: 'success' },
  { timestamp: Date.now() - 90000, source: 'CI', message: 'Pipeline passed (42/44)', type: 'success' },
  { timestamp: Date.now() - 60000, source: 'GitHub', message: 'PR #47 ready for review', type: 'info' },
  { timestamp: Date.now() - 30000, source: 'Agent', message: 'Boss delegated /research to Supervisor', type: 'info' },
]

const panelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 80,
  right: 8,
  zIndex: 50,
  width: 240,
  fontFamily: 'inherit',
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(6, 9, 13, 0.92)',
  border: '2px solid #162030',
  borderRadius: 0,
  padding: '4px 8px',
  boxShadow: '2px 2px 0px #0a0a14',
  marginBottom: 4,
}

export function DevToolsPanel() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div style={{ ...panelStyle, width: 'auto' }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'rgba(6,9,13,0.85)',
            border: '2px solid #162030',
            borderRadius: 0,
            color: '#2a4060',
            fontSize: 18,
            padding: '2px 8px',
            cursor: 'pointer',
            boxShadow: '2px 2px 0px #0a0a14',
            fontFamily: 'inherit',
          }}
        >
          DEV TOOLS
        </button>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ color: '#44aaff', fontSize: 18 }}>DEV TOOLS</span>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: '#2a4060', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit' }}
        >
          X
        </button>
      </div>

      {/* Git Status */}
      <div style={cardStyle}>
        <span style={{ color: '#00ff88', fontSize: 17 }}>GIT</span>
        <div style={{ color: '#d8eaf4', fontSize: 16 }}>
          <span style={{ color: '#9b4dff' }}>{MOCK_GIT.branch}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 15 }}>
          <span style={{ color: '#ffaa00' }}>{MOCK_GIT.uncommitted} uncommitted</span>
          <span style={{ color: '#00ff88' }}>+{MOCK_GIT.ahead}</span>
          {MOCK_GIT.behind > 0 && <span style={{ color: '#ff2244' }}>-{MOCK_GIT.behind}</span>}
        </div>
      </div>

      {/* CI/CD */}
      <div style={cardStyle}>
        <span style={{ color: '#44aaff', fontSize: 17 }}>CI/CD</span>
        <div style={{ display: 'flex', gap: 6, fontSize: 16 }}>
          <span style={{ color: '#00ff88' }}>{MOCK_CI.passed} pass</span>
          <span style={{ color: MOCK_CI.failed > 0 ? '#ff2244' : '#2a4060' }}>{MOCK_CI.failed} fail</span>
          <span style={{ color: '#2a4060' }}>{MOCK_CI.skipped} skip</span>
        </div>
        <div style={{ width: '100%', height: 4, background: '#0b0f15', border: '1px solid #162030', marginTop: 2 }}>
          <div style={{ width: `${MOCK_CI.coverage}%`, height: '100%', background: MOCK_CI.coverage > 80 ? '#00ff88' : '#ffaa00' }} />
        </div>
        <span style={{ color: '#2a4060', fontSize: 14 }}>{MOCK_CI.coverage}% coverage</span>
      </div>

      {/* Event Log */}
      <div style={cardStyle}>
        <span style={{ color: '#ffd700', fontSize: 17 }}>EVENTS</span>
        <div style={{ maxHeight: 100, overflow: 'auto' }}>
          {MOCK_EVENTS.map((ev, i) => {
            const typeColor = { info: '#44aaff', success: '#00ff88', warning: '#ffaa00', error: '#ff2244' }[ev.type]
            return (
              <div key={i} style={{ fontSize: 15, marginTop: 2 }}>
                <span style={{ color: typeColor }}>[{ev.source}]</span>{' '}
                <span style={{ color: '#d8eaf4' }}>{ev.message}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
