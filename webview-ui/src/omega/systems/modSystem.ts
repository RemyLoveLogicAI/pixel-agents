// Omega Mod System — runtime mods and cheat code detection
import type { GameMod } from '../types.js'
import { DEFAULT_MODS, CHEAT_CODES } from '../constants.js'

export class ModSystem {
  private mods: GameMod[]
  private cheatBuffer = ''
  private activatedModIds: Set<string> = new Set()

  onModActivated: ((mod: GameMod) => void) | null = null
  onModDeactivated: ((mod: GameMod) => void) | null = null
  onCheatCodeEntered: ((code: string, modId: string) => void) | null = null
  onSpecialEvent: ((event: string) => void) | null = null

  constructor() {
    this.mods = DEFAULT_MODS.map(m => ({ ...m }))
  }

  /** Process a keypress for cheat code detection */
  processKey(key: string): void {
    this.cheatBuffer += key.toLowerCase()
    // Keep buffer trimmed
    if (this.cheatBuffer.length > 40) {
      this.cheatBuffer = this.cheatBuffer.slice(-40)
    }
    // Check against all cheat codes
    for (const [code, modId] of Object.entries(CHEAT_CODES)) {
      if (this.cheatBuffer.endsWith(code)) {
        this.cheatBuffer = ''
        this.handleCheatCode(code, modId)
        return
      }
    }
  }

  /** Process a CLI command for cheat code detection */
  processCommand(command: string): void {
    const trimmed = command.trim().toLowerCase()
    for (const [code, modId] of Object.entries(CHEAT_CODES)) {
      if (trimmed === code || trimmed.startsWith(code)) {
        this.handleCheatCode(code, modId)
        return
      }
    }
  }

  private handleCheatCode(code: string, modId: string): void {
    // Special events (non-mod)
    if (modId === 'confetti_event' || modId === 'coffee_heal' || modId === 'hire_intern') {
      this.onSpecialEvent?.(modId)
      this.onCheatCodeEntered?.(code, modId)
      return
    }
    // Toggle mod
    const mod = this.mods.find(m => m.id === modId)
    if (mod) {
      this.toggleMod(modId)
      this.onCheatCodeEntered?.(code, modId)
    }
  }

  toggleMod(modId: string): boolean {
    const mod = this.mods.find(m => m.id === modId)
    if (!mod) return false

    mod.active = !mod.active
    if (mod.active) {
      // Set expiration for timed mods
      const durations: Record<string, number> = {
        turbo: 5 * 60 * 1000,
        swarm: 3 * 60 * 1000,
        timewarp: 4 * 60 * 1000,
        godmode: 10 * 60 * 1000,
        firedrill: 2 * 60 * 1000,
      }
      const dur = durations[modId]
      mod.expiresAt = dur ? Date.now() + dur : null
      this.activatedModIds.add(modId)
      this.onModActivated?.(mod)
    } else {
      mod.expiresAt = null
      this.onModDeactivated?.(mod)
    }
    return mod.active
  }

  /** Tick expired mods */
  update(): void {
    const now = Date.now()
    for (const mod of this.mods) {
      if (mod.active && mod.expiresAt && now >= mod.expiresAt) {
        mod.active = false
        mod.expiresAt = null
        this.onModDeactivated?.(mod)
      }
    }
  }

  getMods(): GameMod[] { return this.mods }
  getActiveMods(): GameMod[] { return this.mods.filter(m => m.active) }
  isModActive(modId: string): boolean { return this.mods.find(m => m.id === modId)?.active ?? false }
  getUniqueModsActivated(): number { return this.activatedModIds.size }

  /** Get combined speed multiplier from active mods */
  getSpeedMultiplier(): number {
    let mult = 1.0
    if (this.isModActive('turbo')) mult *= 2.0
    if (this.isModActive('timewarp')) mult *= 4.0
    if (this.isModActive('godmode')) mult *= 3.0
    return mult
  }
}
