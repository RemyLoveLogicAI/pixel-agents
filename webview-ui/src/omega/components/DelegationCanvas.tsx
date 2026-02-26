// DelegationCanvas — particle trail overlay rendered above the office
import { useRef, useEffect } from 'react'
import type { OmegaParticleSystem } from '../systems/particleSystem.js'

interface DelegationCanvasProps {
  particles: OmegaParticleSystem
  offsetX: number
  offsetY: number
  zoom: number
}

export function DelegationCanvas({ particles, offsetX, offsetY, zoom }: DelegationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    const animate = () => {
      if (!running) return

      const parent = canvas.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        const w = Math.round(rect.width * dpr)
        const h = Math.round(rect.height * dpr)
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w
          canvas.height = h
          canvas.style.width = `${rect.width}px`
          canvas.style.height = `${rect.height}px`
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const dpr = window.devicePixelRatio || 1
      const ox = offsetX * dpr
      const oy = offsetY * dpr
      const z = zoom * dpr

      // Only render if there are active particles or trails
      if (particles.getParticleCount() > 0 || particles.getTrailCount() > 0) {
        particles.render(ctx, ox, oy, z)
      }

      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      running = false
      cancelAnimationFrame(frameRef.current)
    }
  }, [particles, offsetX, offsetY, zoom])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 35,
        pointerEvents: 'none',
        imageRendering: 'pixelated',
      }}
    />
  )
}
