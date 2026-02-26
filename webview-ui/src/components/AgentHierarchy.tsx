import { OfficeState } from '../office/engine/officeState.js'
import type { Character } from '../office/types.js'
import { HIERARCHY, P } from '../constants.js'
import { extractToolName } from '../office/toolUtils.js'

interface Props {
    officeState: OfficeState
    selectedAgent: number | null
    onSelectAgent: (id: number) => void
    tick: number // used to force re-renders periodically
}

export function AgentHierarchy({ officeState, selectedAgent, onSelectAgent, tick: _tick }: Props) {
    const characters = Array.from(officeState.characters.values())

    const tiers = ['boss', 'supervisor', 'employee', 'intern'] as const

    return (
        <div style={{
            width: 170,
            flexShrink: 0,
            borderRight: `1px solid ${P.border}`,
            background: 'var(--pixel-bg)',
            overflow: 'auto',
            padding: '8px 6px',
            fontFamily: "'FS Pixel Sans', sans-serif",
            pointerEvents: 'auto',
        }}>
            <div style={{ fontSize: '10px', color: P.dmt, letterSpacing: 1, marginBottom: 8, paddingLeft: 2 }}>
                AGENT HIERARCHY
            </div>
            {tiers.map(tier => {
                const tierInfo = HIERARCHY[tier]
                const tierAgents = characters.filter((a: Character) => a.tier === tier)

                if (tierAgents.length === 0 && tier !== 'intern') return null

                return (
                    <div key={tier} style={{ marginBottom: 12 }}>
                        <div style={{
                            fontSize: '10px', color: tierInfo.ring, letterSpacing: 1, marginBottom: 4, paddingLeft: 2,
                            textShadow: `0 0 4px ${tierInfo.ring}`, borderBottom: `1px solid ${tierInfo.ring}33`, paddingBottom: 2
                        }}>
                            {tierInfo.label} ({tierAgents.length})
                        </div>
                        {tierAgents.map((a: Character) => {
                            const active = a.isActive
                            const displayName = a.isSubagent ? `INT-${Math.abs(a.id)}` : `AGENT-${a.id}`
                            const isSelected = selectedAgent === a.id
                            const toolIcon = a.currentTool ? (extractToolName(a.currentTool) ?? '◈').substring(0, 1) : '◈'
                            const toolLabel = a.currentTool ? (extractToolName(a.currentTool) ?? 'tool') : (active ? 'thinking' : 'idle')

                            return (
                                <div key={a.id} onClick={() => onSelectAgent(a.id)} style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    padding: '4px 5px', marginBottom: 2,
                                    background: isSelected ? `${a.palette ? P.cyan : P.green}18` : P.bgc,
                                    border: `1px solid ${isSelected ? (a.palette ? P.cyan : P.green) : P.border}`,
                                    borderRadius: 2, cursor: 'pointer',
                                    transition: 'all 0.12s',
                                }}>
                                    <div style={{
                                        width: Math.max(12, tierInfo.size * 0.7), height: Math.max(12, tierInfo.size * 0.7),
                                        background: `${P.cyan}22`, border: `1px solid ${P.cyan}`,
                                        borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: Math.max(8, tierInfo.size * 0.38), color: P.cyan, flexShrink: 0,
                                    }}>
                                        {toolIcon}
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{
                                            fontSize: '12px', color: P.cyan, fontWeight: 'bold',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                        }}>
                                            {displayName}
                                        </div>
                                        <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginTop: 1 }}>
                                            <span style={{
                                                fontSize: '10px', color: active ? P.green : P.dmt,
                                                animation: active ? 'pixel-agents-pulse 2s infinite' : 'none',
                                            }}>●</span>
                                            <span style={{ fontSize: '10px', color: P.dmt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80 }}>
                                                {toolLabel}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: 2, height: 4, background: `${P.cyan}22`, border: `1px solid ${P.cyan}33`, borderRadius: 1, overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(100, (a.xp / a.maxXp) * 100)}%`, height: '100%', background: P.cyan }} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: P.cyan, flexShrink: 0, marginLeft: 'auto' }}>
                                        LV.{a.level}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}
