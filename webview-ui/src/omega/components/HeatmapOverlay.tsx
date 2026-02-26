// HeatmapOverlay — activity intensity visualization on the office canvas
import { useRef, useEffect } from 'react'
import type { HierarchicalAgent } from '../types.js'
import { TILE_SIZE } from '../../office/types.js'

interface HeatmapOverlayProps {
  agents: HierarchicalAgent[]
  cols: number
  rows: number
  offsetX: number
  offsetY: number
  zoom: number
  agentPositions: Map<number, { x: number; y: number }>
}

export function HeatmapOverlay({ agents, cols, rows, offsetX, offsetY, zoom, agentPositions }: HeatmapOverlayProps) {
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

    const s = TILE_SIZE * zoom * dpr
    const ox = offsetX * dpr
    const oy = offsetY * dpr
    const heatRadius = s * 4

    // Compute heat grid
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const tileX = ox + (c + 0.5) * s
        const tileY = oy + (r + 0.5) * s

        let heat = 0
        for (const agent of agents) {
          const pos = agentPositions.get(agent.id)
          if (!pos) continue
          const ax = ox + pos.x * zoom * dpr
          const ay = oy + pos.y * zoom * dpr
          const dist = Math.sqrt((tileX - ax) ** 2 + (tileY - ay) ** 2)
          if (dist < heatRadius) {
            heat += agent.activityLevel * (1 - dist / heatRadius)
          }
        }

        if (heat > 0) {
          heat = Math.min(1, heat)
          // Blue → Yellow → Red gradient
          const hue = (1 - heat) * 240
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${heat * 0.35})`
          ctx.fillRect(ox + c * s, oy + r * s, s, s)
        }
      }
    }

    // Legend
    const legendX = canvas.width - 120 * dpr
    const legendY = 20 * dpr
    const legendW = 100 * dpr
    const legendH = 12 * dpr

    ctx.fillStyle = 'rgba(6,9,13,0.85)'
    ctx.fillRect(legendX - 4 * dpr, legendY - 16 * dpr, legendW + 8 * dpr, legendH + 30 * dpr)

    ctx.font = `${9 * dpr}px monospace`
    ctx.fillStyle = '#2a4060'
    ctx.textAlign = 'center'
    ctx.fillText('ACTIVITY', legendX + legendW / 2, legendY - 4 * dpr)

    for (let i = 0; i < legendW; i++) {
      const t = i / legendW
      const hue = (1 - t) * 240
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.fillRect(legendX + i, legendY, 1, legendH)
    }

    ctx.fillStyle = '#2a4060'
    ctx.textAlign = 'left'
    ctx.fillText('LOW', legendX, legendY + legendH + 10 * dpr)
    ctx.textAlign = 'right'
    ctx.fillText('HIGH', legendX + legendW, legendY + legendH + 10 * dpr)
  }, [agents, cols, rows, offsetX, offsetY, zoom, agentPositions])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 44,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  )
}
