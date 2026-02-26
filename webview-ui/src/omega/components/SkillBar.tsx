// SkillBar — OctoCode slash-skill dispatch buttons
import { OctoCodeSkill } from '../types.js'
import { SKILL_META, TIER_CONFIGS } from '../constants.js'

const barStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 44,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 50,
  display: 'flex',
  gap: 2,
  background: 'rgba(6, 9, 13, 0.92)',
  border: '2px solid #162030',
  borderRadius: 0,
  padding: '3px 6px',
  boxShadow: '2px 2px 0px #0a0a14',
  fontFamily: 'inherit',
}

interface SkillBarProps {
  selectedAgentId: number | null
  onDispatchSkill: (agentId: number, skill: OctoCodeSkill) => void
}

export function SkillBar({ selectedAgentId, onDispatchSkill }: SkillBarProps) {
  const allSkills = Object.values(OctoCodeSkill) as OctoCodeSkill[]
  const disabled = selectedAgentId === null

  return (
    <div style={barStyle}>
      {allSkills.map(skill => {
        const meta = SKILL_META[skill]
        const tierCfg = TIER_CONFIGS[meta.tier]
        return (
          <button
            key={skill}
            onClick={() => {
              if (!disabled && selectedAgentId !== null) {
                onDispatchSkill(selectedAgentId, skill)
              }
            }}
            disabled={disabled}
            title={`${meta.label} (${tierCfg.label} tier)`}
            style={{
              background: disabled ? '#0b0f15' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${disabled ? '#0b0f15' : meta.color}`,
              borderRadius: 0,
              color: disabled ? '#1a2a40' : meta.color,
              fontSize: 16,
              padding: '2px 6px',
              cursor: disabled ? 'default' : 'pointer',
              opacity: disabled ? 0.4 : 1,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {meta.icon} {skill}
          </button>
        )
      })}
    </div>
  )
}
