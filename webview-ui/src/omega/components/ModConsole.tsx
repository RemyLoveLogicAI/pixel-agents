// ModConsole — cheat code input + active mod toggles
import { useState, useCallback, useRef, useEffect } from 'react'
import type { GameMod } from '../types.js'

const consoleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 8,
  right: 60,
  zIndex: 50,
  fontFamily: 'inherit',
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(6, 9, 13, 0.92)',
  border: '2px solid #162030',
  borderRadius: 0,
  padding: '6px 8px',
  boxShadow: '2px 2px 0px #0a0a14',
  width: 220,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0b0f15',
  border: '1px solid #162030',
  borderRadius: 0,
  color: '#00ff88',
  fontFamily: 'inherit',
  fontSize: 17,
  padding: '3px 6px',
  outline: 'none',
}

interface ModConsoleProps {
  mods: GameMod[]
  onToggleMod: (modId: string) => void
  onCheatInput: (command: string) => void
}

export function ModConsole({ mods, onToggleMod, onCheatInput }: ModConsoleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const activeMods = mods.filter(m => m.active)

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      onCheatInput(input.trim())
      setInput('')
    }
  }, [input, onCheatInput])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div style={consoleStyle}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          background: isOpen ? '#162030' : 'rgba(6, 9, 13, 0.85)',
          border: '2px solid #162030',
          borderRadius: 0,
          color: activeMods.length > 0 ? '#ff00cc' : '#2a4060',
          fontSize: 20,
          padding: '2px 8px',
          cursor: 'pointer',
          boxShadow: '2px 2px 0px #0a0a14',
          fontFamily: 'inherit',
        }}
        title="Mod Console"
      >
        MODS{activeMods.length > 0 ? ` (${activeMods.length})` : ''}
      </button>

      {isOpen && (
        <div style={{ ...panelStyle, marginTop: 4 }}>
          {/* Cheat input */}
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              style={inputStyle}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="//pixelhq:..."
              spellCheck={false}
            />
          </form>

          {/* Mod list */}
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mods.map(mod => (
              <button
                key={mod.id}
                onClick={() => onToggleMod(mod.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: mod.active ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border: `1px solid ${mod.active ? mod.color : '#162030'}`,
                  borderRadius: 0,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ color: mod.active ? mod.color : '#2a4060', fontSize: 16 }}>{mod.name}</span>
                <span style={{ color: '#1a2a40', fontSize: 15 }}>{mod.active ? 'ON' : 'OFF'}</span>
              </button>
            ))}
          </div>

          <div style={{ color: '#1a2a40', fontSize: 14, marginTop: 4 }}>
            Try: //pixelhq:turbo
          </div>
        </div>
      )}
    </div>
  )
}
