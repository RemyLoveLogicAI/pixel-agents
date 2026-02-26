// GameHUD — XP bar, team level, active quests, achievement toasts
import type { OmegaSystemsState, ToastMessage } from '../hooks/useOmegaSystems.js'
import { TIER_CONFIGS } from '../constants.js'
import type { TierLevel } from '../types.js'

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  pointerEvents: 'none',
  fontFamily: 'inherit',
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(6, 9, 13, 0.9)',
  border: '2px solid #162030',
  borderRadius: 0,
  padding: '4px 8px',
  boxShadow: '2px 2px 0px #0a0a14',
  pointerEvents: 'auto',
}

const xpBarOuter: React.CSSProperties = {
  width: 120,
  height: 6,
  background: '#0b0f15',
  border: '1px solid #162030',
  marginTop: 2,
}

interface GameHUDProps {
  state: OmegaSystemsState
}

export function GameHUD({ state }: GameHUDProps) {
  const xpPct = state.xpForNext > 0 ? (state.teamXP / state.xpForNext) * 100 : 0
  const activeQuests = state.quests.filter(q => !q.completed)
  const tierCounts = new Map<TierLevel, number>()
  for (const a of state.agents) {
    tierCounts.set(a.tier, (tierCounts.get(a.tier) ?? 0) + 1)
  }

  return (
    <div style={hudStyle}>
      {/* Team Level + XP Bar */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#ffd700', fontSize: 20, fontWeight: 'bold' }}>LV.{state.teamLevel}</span>
          <span style={{ color: '#d8eaf4', fontSize: 18 }}>TEAM HQ</span>
        </div>
        <div style={xpBarOuter}>
          <div style={{ width: `${Math.min(100, xpPct)}%`, height: '100%', background: '#00ff88', transition: 'width 0.3s' }} />
        </div>
        <span style={{ color: '#2a4060', fontSize: 16 }}>{state.teamXP}/{state.xpForNext} XP</span>
      </div>

      {/* Tier Summary */}
      <div style={{ ...panelStyle, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(['boss', 'supervisor', 'employee', 'intern'] as TierLevel[]).map(tier => {
          const cfg = TIER_CONFIGS[tier]
          const count = tierCounts.get(tier) ?? 0
          return (
            <span key={tier} style={{ color: cfg.color, fontSize: 18 }}>
              {cfg.emoji}{count}
            </span>
          )
        })}
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div style={panelStyle}>
          <span style={{ color: '#ffd700', fontSize: 17 }}>QUESTS</span>
          {activeQuests.slice(0, 3).map(q => (
            <div key={q.id} style={{ marginTop: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: '#d8eaf4', fontSize: 16 }}>{q.name}</span>
                <span style={{ color: '#2a4060', fontSize: 16 }}>{q.progress}/{q.target}</span>
              </div>
              <div style={{ width: '100%', height: 3, background: '#0b0f15', border: '1px solid #162030' }}>
                <div style={{
                  width: `${(q.progress / q.target) * 100}%`,
                  height: '100%',
                  background: q.completed ? '#00ff88' : '#44aaff',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Mods */}
      {state.activeMods.length > 0 && (
        <div style={panelStyle}>
          {state.activeMods.map(mod => {
            const remaining = mod.expiresAt ? Math.max(0, Math.ceil((mod.expiresAt - Date.now()) / 1000)) : null
            return (
              <div key={mod.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ color: mod.color, fontSize: 16 }}>{mod.name}</span>
                {remaining !== null && (
                  <span style={{ color: '#2a4060', fontSize: 15 }}>{remaining}s</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Toast Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
        {state.toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </div>
  )
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const age = Date.now() - toast.timestamp
  const opacity = age > 2000 ? Math.max(0, 1 - (age - 2000) / 1000) : 1
  return (
    <div style={{
      ...panelStyle,
      borderColor: toast.color,
      opacity,
      transition: 'opacity 0.3s',
    }}>
      <span style={{ color: toast.color, fontSize: 17 }}>{toast.text}</span>
    </div>
  )
}
