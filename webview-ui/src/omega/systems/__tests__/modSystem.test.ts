// Unit tests for ModSystem
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ModSystem } from '../modSystem.js'

describe('ModSystem', () => {
  let system: ModSystem

  beforeEach(() => {
    system = new ModSystem()
  })

  // ── Initialization ─────────────────────────────────────────────
  describe('initialization', () => {
    it('loads default mods', () => {
      const mods = system.getMods()
      expect(mods.length).toBeGreaterThan(0)
      expect(mods.find(m => m.id === 'turbo')).toBeDefined()
      expect(mods.find(m => m.id === 'godmode')).toBeDefined()
    })

    it('all mods start inactive', () => {
      const mods = system.getMods()
      expect(mods.every(m => !m.active)).toBe(true)
    })
  })

  // ── toggleMod ──────────────────────────────────────────────────
  describe('toggleMod', () => {
    it('activates inactive mod', () => {
      const result = system.toggleMod('turbo')
      expect(result).toBe(true)
      expect(system.isModActive('turbo')).toBe(true)
    })

    it('deactivates active mod', () => {
      system.toggleMod('turbo')
      const result = system.toggleMod('turbo')
      expect(result).toBe(false)
      expect(system.isModActive('turbo')).toBe(false)
    })

    it('returns false for non-existent mod', () => {
      const result = system.toggleMod('nonexistent')
      expect(result).toBe(false)
    })

    it('sets expiration for timed mods', () => {
      system.toggleMod('turbo')
      const turbo = system.getMods().find(m => m.id === 'turbo')
      expect(turbo?.expiresAt).not.toBeNull()
    })

    it('does not set expiration for permanent mods', () => {
      system.toggleMod('debug')
      const debug = system.getMods().find(m => m.id === 'debug')
      expect(debug?.expiresAt).toBeNull()
    })

    it('fires onModActivated callback', () => {
      const callback = vi.fn()
      system.onModActivated = callback

      system.toggleMod('turbo')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: 'turbo' }))
    })

    it('fires onModDeactivated callback', () => {
      const callback = vi.fn()
      system.onModDeactivated = callback
      system.toggleMod('turbo')

      system.toggleMod('turbo')

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  // ── processKey ─────────────────────────────────────────────────
  describe('processKey', () => {
    it('detects cheat code from key sequence', () => {
      const callback = vi.fn()
      system.onCheatCodeEntered = callback

      // Type "iddqd" (classic cheat code)
      'iddqd'.split('').forEach(k => system.processKey(k))

      expect(callback).toHaveBeenCalledWith('iddqd', 'godmode')
    })

    it('detects cheat code with prefix typing', () => {
      const callback = vi.fn()
      system.onCheatCodeEntered = callback

      // Type something before the cheat code
      'abciddqd'.split('').forEach(k => system.processKey(k))

      expect(callback).toHaveBeenCalled()
    })

    it('trims buffer to prevent memory growth', () => {
      // Type 50 characters
      for (let i = 0; i < 50; i++) {
        system.processKey('x')
      }
      // Should not throw or cause issues
      expect(() => system.processKey('a')).not.toThrow()
    })

    it('handles special events (confetti)', () => {
      const callback = vi.fn()
      system.onSpecialEvent = callback

      '//pixelhq:confetti'.split('').forEach(k => system.processKey(k))

      expect(callback).toHaveBeenCalledWith('confetti_event')
    })
  })

  // ── processCommand ─────────────────────────────────────────────
  describe('processCommand', () => {
    it('detects cheat code from CLI command', () => {
      const callback = vi.fn()
      system.onCheatCodeEntered = callback

      system.processCommand('//pixelhq:turbo')

      expect(callback).toHaveBeenCalledWith('//pixelhq:turbo', 'turbo')
    })

    it('handles command with extra text', () => {
      const callback = vi.fn()
      system.onCheatCodeEntered = callback

      system.processCommand('//pixelhq:turbo extra stuff')

      expect(callback).toHaveBeenCalled()
    })

    it('ignores non-cheat commands', () => {
      const callback = vi.fn()
      system.onCheatCodeEntered = callback

      system.processCommand('npm install')

      expect(callback).not.toHaveBeenCalled()
    })
  })

  // ── update ─────────────────────────────────────────────────────
  describe('update', () => {
    it('expires timed mods', () => {
      system.toggleMod('turbo')
      const turbo = system.getMods().find(m => m.id === 'turbo')!
      
      // Manually set expiration to past
      turbo.expiresAt = Date.now() - 1000

      system.update()

      expect(turbo.active).toBe(false)
      expect(turbo.expiresAt).toBeNull()
    })

    it('fires onModDeactivated for expired mods', () => {
      const callback = vi.fn()
      system.onModDeactivated = callback
      system.toggleMod('turbo')
      const turbo = system.getMods().find(m => m.id === 'turbo')!
      turbo.expiresAt = Date.now() - 1000

      system.update()

      expect(callback).toHaveBeenCalled()
    })

    it('does not expire non-timed mods', () => {
      system.toggleMod('debug')
      
      system.update()

      expect(system.isModActive('debug')).toBe(true)
    })
  })

  // ── getSpeedMultiplier ─────────────────────────────────────────
  describe('getSpeedMultiplier', () => {
    it('returns 1.0 with no mods active', () => {
      expect(system.getSpeedMultiplier()).toBe(1.0)
    })

    it('returns 2.0 with turbo active', () => {
      system.toggleMod('turbo')
      expect(system.getSpeedMultiplier()).toBe(2.0)
    })

    it('stacks multiple speed mods', () => {
      system.toggleMod('turbo')    // 2x
      system.toggleMod('godmode')  // 3x

      expect(system.getSpeedMultiplier()).toBe(6.0) // 2 * 3
    })
  })

  // ── getActiveMods ──────────────────────────────────────────────
  describe('getActiveMods', () => {
    it('returns empty array when no mods active', () => {
      expect(system.getActiveMods()).toHaveLength(0)
    })

    it('returns only active mods', () => {
      system.toggleMod('turbo')
      system.toggleMod('debug')

      const active = system.getActiveMods()
      expect(active).toHaveLength(2)
      expect(active.map(m => m.id)).toContain('turbo')
      expect(active.map(m => m.id)).toContain('debug')
    })
  })

  // ── getUniqueModsActivated ─────────────────────────────────────
  describe('getUniqueModsActivated', () => {
    it('tracks unique mods activated over lifetime', () => {
      expect(system.getUniqueModsActivated()).toBe(0)

      system.toggleMod('turbo')
      expect(system.getUniqueModsActivated()).toBe(1)

      system.toggleMod('turbo') // deactivate
      system.toggleMod('turbo') // reactivate
      expect(system.getUniqueModsActivated()).toBe(1) // Still 1

      system.toggleMod('debug')
      expect(system.getUniqueModsActivated()).toBe(2)
    })
  })
})
