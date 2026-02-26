// OrgChartView — hierarchical tree visualization rendered on canvas overlay
import { useRef, useEffect } from 'react'
import type { HierarchicalAgent } from '../types.js'
import { TIER_CONFIGS } from '../constants.js'
import type { TierLevel } from '../types.js'

interface OrgChartViewProps {
  agents: HierarchicalAgent[]
  selectedAgentId: number | null
  onSelectAgent: (id: number) => void
}


export function OrgChartView({ agents, selectedAgentId, onSelectAgent }: OrgChartViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    if (!parent) return
    const rect = parent.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Build tree structure
    const tiers: TierLevel[] = ['boss', 'supervisor', 'employee', 'intern']
    const tierRows: Map<TierLevel, HierarchicalAgent[]> = new Map()
    for (const tier of tiers) tierRows.set(tier, [])
    for (const agent of agents) {
      tierRows.get(agent.tier)?.push(agent)
    }

    // Layout: each tier gets a horizontal row
    const rowH = canvas.height / 5
    const cardW = 100 * dpr
    const cardH = 60 * dpr
    const nodePositions = new Map<number, { x: number; y: number }>()

    for (let t = 0; t < tiers.length; t++) {
      const row = tierRows.get(tiers[t]) ?? []
      const y = rowH * (t + 0.5) + cardH / 2
      const spacing = canvas.width / (row.length + 1)
      for (let i = 0; i < row.length; i++) {
        const x = spacing * (i + 1)
        nodePositions.set(row[i].id, { x, y })
      }
    }

    // Draw delegation lines
    ctx.lineWidth = 1.5 * dpr
    ctx.setLineDash([4 * dpr, 3 * dpr])
    for (const agent of agents) {
      if (agent.parentId === null) continue
      const from = nodePositions.get(agent.parentId)
      const to = nodePositions.get(agent.id)
      if (!from || !to) continue
      ctx.beginPath()
      ctx.moveTo(from.x, from.y + cardH / 2)
      ctx.lineTo(to.x, to.y - cardH / 2)
      ctx.strokeStyle = 'rgba(255,215,0,0.3)'
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Draw agent cards
    for (const agent of agents) {
      const pos = nodePositions.get(agent.id)
      if (!pos) continue
      const cfg = TIER_CONFIGS[agent.tier]
      const isSelected = agent.id === selectedAgentId

      // Card background
      ctx.fillStyle = isSelected ? 'rgba(255,215,0,0.15)' : 'rgba(11,15,21,0.9)'
      ctx.strokeStyle = isSelected ? '#ffd700' : cfg.color
      ctx.lineWidth = (isSelected ? 2 : 1) * dpr
      ctx.fillRect(pos.x - cardW / 2, pos.y - cardH / 2, cardW, cardH)
      ctx.strokeRect(pos.x - cardW / 2, pos.y - cardH / 2, cardW, cardH)

      // Emoji
      ctx.font = `${16 * dpr}px sans-serif`
      ctx.textAlign = 'center'
      ctx.fillStyle = cfg.color
      ctx.fillText(cfg.emoji, pos.x, pos.y - 4 * dpr)

      // Name
      ctx.font = `${10 * dpr}px monospace`
      ctx.fillStyle = '#d8eaf4'
      ctx.fillText(agent.name, pos.x, pos.y + 12 * dpr)

      // Level
      ctx.font = `${8 * dpr}px monospace`
      ctx.fillStyle = '#2a4060'
      ctx.fillText(`LV.${agent.level}`, pos.x, pos.y + 22 * dpr)
    }

    // Tier labels
    for (let t = 0; t < tiers.length; t++) {
      const cfg = TIER_CONFIGS[tiers[t]]
      const y = rowH * (t + 0.5)
      ctx.font = `bold ${11 * dpr}px monospace`
      ctx.textAlign = 'left'
      ctx.fillStyle = cfg.color
      ctx.globalAlpha = 0.4
      ctx.fillText(cfg.label, 8 * dpr, y)
      ctx.globalAlpha = 1
    }
  }, [agents, selectedAgentId])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const mx = (e.clientX - rect.left) * dpr
    const my = (e.clientY - rect.top) * dpr

    const cardW = 100 * dpr
    const cardH = 60 * dpr
    const tiers: TierLevel[] = ['boss', 'supervisor', 'employee', 'intern']
    const rowH = canvas.height / 5

    for (let t = 0; t < tiers.length; t++) {
      const row = agents.filter(a => a.tier === tiers[t])
      const spacing = canvas.width / (row.length + 1)
      for (let i = 0; i < row.length; i++) {
        const x = spacing * (i + 1)
        const y = rowH * (t + 0.5) + cardH / 2
        if (mx >= x - cardW / 2 && mx <= x + cardW / 2 && my >= y - cardH / 2 && my <= y + cardH / 2) {
          onSelectAgent(row[i].id)
          return
        }
      }
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        cursor: 'pointer',
        imageRendering: 'pixelated',
      }}
    />
  )
}
