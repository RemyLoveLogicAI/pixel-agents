// Omega Particle System — delegation trails, promotion bursts, spawn effects
import type { Particle, ParticleTrail, ParticleType } from '../types.js'
import { PARTICLE_MAX_COUNT } from '../constants.js'

export class OmegaParticleSystem {
  private particles: Particle[] = []
  private trails: ParticleTrail[] = []
  private nextTrailId = 0

  /** Emit burst particles at a position */
  emit(x: number, y: number, color: string, count: number, type: ParticleType): void {
    for (let i = 0; i < count && this.particles.length < PARTICLE_MAX_COUNT; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2.5 - 0.5,
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        color,
        size: 1 + Math.random() * 2,
        type,
      })
    }
  }

  /** Create a line trail between two points */
  addTrail(fromX: number, fromY: number, toX: number, toY: number, color: string, type: ParticleType): string {
    const id = `trail-${this.nextTrailId++}`
    this.trails.push({ id, fromX, fromY, toX, toY, color, progress: 0, type })
    return id
  }

  /** Emit particles along a line */
  emitLine(x1: number, y1: number, x2: number, y2: number, color: string, count: number, type: ParticleType): void {
    for (let i = 0; i < count && this.particles.length < PARTICLE_MAX_COUNT; i++) {
      const t = Math.random()
      this.emit(
        x1 + (x2 - x1) * t,
        y1 + (y2 - y1) * t,
        color,
        1,
        type,
      )
    }
  }

  /** Update all particles and trails */
  update(dt: number): void {
    // Update particles
    this.particles = this.particles.filter(p => {
      p.x += p.vx * dt * 60
      p.y += p.vy * dt * 60
      p.vy += 0.05 * dt * 60 // gravity
      p.life -= p.decay * dt * 60
      return p.life > 0
    })

    // Update trails
    this.trails = this.trails.filter(t => {
      t.progress += dt * 2 // 0.5s per trail
      return t.progress < 1
    })
  }

  /** Render all particles to a canvas context */
  render(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, zoom: number): void {
    ctx.save()

    // Draw trails
    for (const t of this.trails) {
      const x1 = offsetX + t.fromX * zoom
      const y1 = offsetY + t.fromY * zoom
      const x2 = offsetX + t.toX * zoom
      const y2 = offsetY + t.toY * zoom

      // Animated dashed line
      const headX = x1 + (x2 - x1) * t.progress
      const headY = y1 + (y2 - y1) * t.progress

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(headX, headY)
      ctx.strokeStyle = t.color
      ctx.globalAlpha = 0.6 * (1 - t.progress)
      ctx.lineWidth = Math.max(1, zoom * 0.5)
      ctx.setLineDash([zoom * 2, zoom])
      ctx.stroke()
      ctx.setLineDash([])

      // Glow dot at head
      ctx.beginPath()
      ctx.arc(headX, headY, zoom * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = t.color
      ctx.globalAlpha = 0.8 * (1 - t.progress)
      ctx.fill()
    }

    // Draw particles
    for (const p of this.particles) {
      const px = offsetX + p.x * zoom
      const py = offsetY + p.y * zoom
      const sz = p.size * zoom * 0.5
      ctx.globalAlpha = p.life * 0.8
      ctx.fillStyle = p.color
      ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz)
    }

    ctx.restore()
  }

  getParticleCount(): number { return this.particles.length }
  getTrailCount(): number { return this.trails.length }
  clear(): void { this.particles = []; this.trails = [] }
}
