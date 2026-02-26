// ViewModeSwitch — toggle between Office, Org Chart, Heatmap views
import { ViewMode } from '../types.js'

interface ViewModeSwitchProps {
  viewMode: ViewMode
  onChangeViewMode: (mode: ViewMode) => void
}

const modes: Array<{ mode: ViewMode; label: string }> = [
  { mode: ViewMode.OFFICE, label: 'OFFICE' },
  { mode: ViewMode.ORG_CHART, label: 'ORG CHART' },
  { mode: ViewMode.HEATMAP, label: 'HEATMAP' },
]

export function ViewModeSwitch({ viewMode, onChangeViewMode }: ViewModeSwitchProps) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 44,
      right: 8,
      zIndex: 50,
      display: 'flex',
      gap: 0,
      fontFamily: 'inherit',
    }}>
      {modes.map(({ mode, label }) => (
        <button
          key={mode}
          onClick={() => onChangeViewMode(mode)}
          style={{
            background: viewMode === mode ? '#162030' : 'rgba(6,9,13,0.85)',
            border: '2px solid #162030',
            borderRadius: 0,
            color: viewMode === mode ? '#d8eaf4' : '#2a4060',
            fontSize: 17,
            padding: '2px 8px',
            cursor: 'pointer',
            boxShadow: viewMode === mode ? 'inset 0 0 4px rgba(0,255,136,0.15)' : '2px 2px 0px #0a0a14',
            fontFamily: 'inherit',
            marginLeft: -2,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
