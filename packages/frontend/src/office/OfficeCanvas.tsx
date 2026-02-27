import { useRef, useEffect } from 'react'
import type { Agent } from '../hooks/useAgents'

const TILE_SIZE = 16
const ZOOM = 3

interface Props {
  agents: Agent[]
  events: unknown[]
}

export function OfficeCanvas({ agents }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false
    const cols = 20, rows = 11
    canvas.width = cols * TILE_SIZE * ZOOM
    canvas.height = rows * TILE_SIZE * ZOOM

    const draw = () => {
      ctx.fillStyle = '#2d2d3d'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * TILE_SIZE * ZOOM
          const y = r * TILE_SIZE * ZOOM
          ctx.fillStyle = (r + c) % 2 === 0 ? '#3d3d4d' : '#353545'
          ctx.fillRect(x, y, TILE_SIZE * ZOOM, TILE_SIZE * ZOOM)
        }
      }

      agents.forEach((agent, i) => {
        const x = (agent.position?.x ?? (i * 3 + 2)) * TILE_SIZE * ZOOM
        const y = (agent.position?.y ?? 5) * TILE_SIZE * ZOOM
        ctx.fillStyle = getColor(agent.status)
        ctx.fillRect(x + 2 * ZOOM, y + 2 * ZOOM, 12 * ZOOM, 12 * ZOOM)
        ctx.fillStyle = '#fff'
        ctx.font = `${8 * ZOOM}px monospace`
        ctx.fillText(agent.name.slice(0, 1), x + 5 * ZOOM, y + 11 * ZOOM)
      })
    }

    draw()
    const interval = setInterval(draw, 100)
    return () => clearInterval(interval)
  }, [agents])

  return <canvas ref={canvasRef} className="office-canvas" />
}

function getColor(s: string): string {
  return s === 'working' ? '#89b4fa' : s === 'waiting' ? '#a6e3a1' : s === 'error' ? '#f38ba8' : '#6c7086'
}