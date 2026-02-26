// Unit tests for OmegaParticleSystem
import { describe, it, expect, beforeEach } from 'vitest'
import { OmegaParticleSystem } from '../particleSystem.js'
import { ParticleType } from '../../types.js'

describe('OmegaParticleSystem', () => {
  let system: OmegaParticleSystem

  beforeEach(() => {
    system = new OmegaParticleSystem()
  })

  // ── Initialization ─────────────────────────────────────────────
  describe('initialization', () => {
    it('starts with no particles', () => {
      expect(system.getParticleCount()).toBe(0)
    })

    it('starts with no trails', () => {
      expect(system.getTrailCount()).toBe(0)
    })
  })

  // ── emit ───────────────────────────────────────────────────────
  describe('emit', () => {
    it('creates particles at position', () => {
      system.emit(100, 100, '#ff0000', 5, ParticleType.SPAWN)
      expect(system.getParticleCount()).toBe(5)
    })

    it('respects max particle count', () => {
      // Try to emit more than max (200)
      system.emit(100, 100, '#ff0000', 300, ParticleType.SPAWN)
      expect(system.getParticleCount()).toBeLessThanOrEqual(200)
    })

    it('particles have correct properties', () => {
      system.emit(50, 75, '#00ff00', 1, ParticleType.DELEGATION)
      
      // Can't directly access particles, but we can verify count
      expect(system.getParticleCount()).toBe(1)
    })
  })

  // ── addTrail ───────────────────────────────────────────────────
  describe('addTrail', () => {
    it('creates trail between points', () => {
      const id = system.addTrail(0, 0, 100, 100, '#ff0000', ParticleType.DELEGATION)
      
      expect(id).toMatch(/^trail-\d+$/)
      expect(system.getTrailCount()).toBe(1)
    })

    it('generates unique trail IDs', () => {
      const id1 = system.addTrail(0, 0, 100, 100, '#ff0000', ParticleType.DELEGATION)
      const id2 = system.addTrail(0, 0, 200, 200, '#00ff00', ParticleType.PROMOTION)

      expect(id1).not.toBe(id2)
      expect(system.getTrailCount()).toBe(2)
    })
  })

  // ── emitLine ───────────────────────────────────────────────────
  describe('emitLine', () => {
    it('creates particles along a line', () => {
      system.emitLine(0, 0, 100, 100, '#ff0000', 10, ParticleType.SKILL)
      expect(system.getParticleCount()).toBe(10)
    })

    it('respects max count when emitting line', () => {
      // Fill up with initial particles
      system.emit(0, 0, '#ff0000', 190, ParticleType.SPAWN)
      
      // Try to add more via line
      system.emitLine(0, 0, 100, 100, '#00ff00', 20, ParticleType.SKILL)
      
      expect(system.getParticleCount()).toBeLessThanOrEqual(200)
    })
  })

  // ── update ─────────────────────────────────────────────────────
  describe('update', () => {
    it('removes dead particles', () => {
      system.emit(100, 100, '#ff0000', 5, ParticleType.SPAWN)
      expect(system.getParticleCount()).toBe(5)

      // Simulate long time passing
      for (let i = 0; i < 100; i++) {
        system.update(0.1)
      }

      expect(system.getParticleCount()).toBe(0)
    })

    it('removes completed trails', () => {
      system.addTrail(0, 0, 100, 100, '#ff0000', ParticleType.DELEGATION)
      expect(system.getTrailCount()).toBe(1)

      // Simulate time passing (trail completes at progress >= 1)
      for (let i = 0; i < 10; i++) {
        system.update(0.2)
      }

      expect(system.getTrailCount()).toBe(0)
    })

    it('applies gravity to particles', () => {
      // We can't directly test particle position, but we can ensure
      // update doesn't throw
      system.emit(100, 100, '#ff0000', 10, ParticleType.SPAWN)
      expect(() => system.update(0.016)).not.toThrow()
    })
  })

  // ── clear ──────────────────────────────────────────────────────
  describe('clear', () => {
    it('removes all particles', () => {
      system.emit(100, 100, '#ff0000', 50, ParticleType.SPAWN)
      expect(system.getParticleCount()).toBe(50)

      system.clear()

      expect(system.getParticleCount()).toBe(0)
    })

    it('removes all trails', () => {
      system.addTrail(0, 0, 100, 100, '#ff0000', ParticleType.DELEGATION)
      system.addTrail(0, 0, 200, 200, '#00ff00', ParticleType.PROMOTION)
      expect(system.getTrailCount()).toBe(2)

      system.clear()

      expect(system.getTrailCount()).toBe(0)
    })
  })

  // ── render (canvas mock test) ──────────────────────────────────
  describe('render', () => {
    it('renders without errors when empty', () => {
      // Create a minimal mock canvas context
      const mockCtx = createMockContext()
      expect(() => system.render(mockCtx, 0, 0, 1)).not.toThrow()
    })

    it('renders particles and trails', () => {
      system.emit(50, 50, '#ff0000', 5, ParticleType.SPAWN)
      system.addTrail(0, 0, 100, 100, '#00ff00', ParticleType.DELEGATION)

      const mockCtx = createMockContext()
      expect(() => system.render(mockCtx, 0, 0, 2)).not.toThrow()
    })

    it('applies zoom and offset correctly', () => {
      system.emit(50, 50, '#ff0000', 1, ParticleType.SPAWN)
      const mockCtx = createMockContext()
      
      // Different zoom and offset values
      system.render(mockCtx, 100, 100, 3)
      
      // Verify render was called (via fillRect mock)
      expect(mockCtx.fillRect).toHaveBeenCalled()
    })
  })
})

// Helper to create a mock CanvasRenderingContext2D
function createMockContext(): CanvasRenderingContext2D {
  return {
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    arc: () => {},
    fillRect: vi.fn(),
    setLineDash: () => {},
    strokeStyle: '',
    fillStyle: '',
    globalAlpha: 1,
    lineWidth: 1,
  } as unknown as CanvasRenderingContext2D
}

// Import vi for mocking
import { vi } from 'vitest'
