// Omega v2 ULTRA: Runtime Mod System
// Game-like mods that modify orchestration behavior at runtime

import { HierarchicalAgent, AgentTier, OctoCodeSkill, TIER_CONFIGS } from './types.js';
import { HierarchyEngine } from './HierarchyEngine.js';

export enum ModType {
  TURBO = 'turbo',           // 2x execution speed, reduced safety
  SWARM = 'swarm',           // Max parallel agents, chaos mode
  TIME_WARP = 'timewarp',    // Accelerated simulation, predictive delegation
  GOD_MODE = 'godmode',      // Unlimited resources, direct control
  STEALTH = 'stealth',       // Privacy-first mode, no telemetry
  ZEN = 'zen',               // Single-threaded, focused mode
}

export interface ModConfig {
  type: ModType;
  name: string;
  description: string;
  emoji: string;
  color: string;
  cheatCode: string;          // Konami-style sequence
  duration: number;           // 0 = infinite
  effects: ModEffects;
}

export interface ModEffects {
  speedMultiplier?: number;
  spawnRateMultiplier?: number;
  maxDelegatesMultiplier?: number;
  bypassTierLimits?: boolean;
  autoPromote?: boolean;
  particleIntensity?: number;
  soundEnabled?: boolean;
  telemetryEnabled?: boolean;
  skillCooldownReduction?: number;
}

export const MOD_CONFIGS: Record<ModType, ModConfig> = {
  [ModType.TURBO]: {
    type: ModType.TURBO,
    name: 'TURBO',
    description: '2x execution speed, reduced safety checks',
    emoji: '⚡',
    color: '#FFD700',
    cheatCode: '↑↑↓↓←→←→BA',
    duration: 300, // 5 minutes
    effects: {
      speedMultiplier: 2.0,
      spawnRateMultiplier: 1.5,
      skillCooldownReduction: 0.5,
      particleIntensity: 1.5,
    },
  },
  [ModType.SWARM]: {
    type: ModType.SWARM,
    name: 'SWARM MODE',
    description: 'Maximum parallelization, chaos orchestration',
    emoji: '🐝',
    color: '#FFA500',
    cheatCode: '↓↓↓↓↓↓↓↓↓↓',
    duration: 180, // 3 minutes
    effects: {
      spawnRateMultiplier: 3.0,
      maxDelegatesMultiplier: 2.0,
      bypassTierLimits: true,
      particleIntensity: 2.0,
    },
  },
  [ModType.TIME_WARP]: {
    type: ModType.TIME_WARP,
    name: 'TIME WARP',
    description: 'Predictive delegation, future-state simulation',
    emoji: '⏰',
    color: '#00CED1',
    cheatCode: '←←→→↑↓↑↓',
    duration: 240, // 4 minutes
    effects: {
      speedMultiplier: 1.5,
      spawnRateMultiplier: 0.5,
      skillCooldownReduction: 0.3,
    },
  },
  [ModType.GOD_MODE]: {
    type: ModType.GOD_MODE,
    name: 'GOD MODE',
    description: 'Unlimited resources, direct agent control',
    emoji: '👑',
    color: '#FF1493',
    cheatCode: 'IDDQD',
    duration: 0, // infinite
    effects: {
      speedMultiplier: 3.0,
      spawnRateMultiplier: 5.0,
      maxDelegatesMultiplier: 10.0,
      bypassTierLimits: true,
      autoPromote: true,
      particleIntensity: 3.0,
    },
  },
  [ModType.STEALTH]: {
    type: ModType.STEALTH,
    name: 'STEALTH',
    description: 'Privacy-first, no telemetry, local-only',
    emoji: '🥷',
    color: '#2F4F4F',
    cheatCode: '↑↓↑↓←→AB',
    duration: 0,
    effects: {
      telemetryEnabled: false,
      soundEnabled: false,
      particleIntensity: 0.3,
      spawnRateMultiplier: 0.5,
    },
  },
  [ModType.ZEN]: {
    type: ModType.ZEN,
    name: 'ZEN MODE',
    description: 'Single-threaded, focused, distraction-free',
    emoji: '🧘',
    color: '#9370DB',
    cheatCode: '↑↑↓↓↓↓↑↑',
    duration: 0,
    effects: {
      speedMultiplier: 0.5,
      spawnRateMultiplier: 0.0,
      maxDelegatesMultiplier: 0.5,
      particleIntensity: 0.2,
      skillCooldownReduction: 0.0,
    },
  },
};

export interface ActiveMod {
  config: ModConfig;
  activatedAt: number;
  expiresAt: number | null;
}

export class ModSystem {
  private activeMods: Map<ModType, ActiveMod> = new Map();
  private cheatBuffer: string[] = [];
  private maxBufferLength = 20;
  private engine: HierarchyEngine;

  onModActivated: ((mod: ModConfig) => void) | null = null;
  onModDeactivated: ((mod: ModConfig) => void) | null = null;
  onCheatCodeEntered: ((code: string) => void) | null = null;

  constructor(engine: HierarchyEngine) {
    this.engine = engine;
  }

  // Process keyboard input for cheat codes
  processKeyInput(key: string): void {
    this.cheatBuffer.push(key);
    if (this.cheatBuffer.length > this.maxBufferLength) {
      this.cheatBuffer.shift();
    }

    const bufferString = this.cheatBuffer.join('');

    for (const config of Object.values(MOD_CONFIGS)) {
      if (bufferString.endsWith(config.cheatCode)) {
        this.activateMod(config.type);
        this.onCheatCodeEntered?.(config.cheatCode);
        this.cheatBuffer = []; // Clear buffer after successful entry
        break;
      }
    }
  }

  activateMod(type: ModType): boolean {
    if (this.activeMods.has(type)) {
      // Extend duration if already active
      const active = this.activeMods.get(type)!;
      if (active.expiresAt) {
        active.expiresAt += MOD_CONFIGS[type].duration * 1000;
      }
      return true;
    }

    const config = MOD_CONFIGS[type];
    const now = Date.now();
    const activeMod: ActiveMod = {
      config,
      activatedAt: now,
      expiresAt: config.duration > 0 ? now + config.duration * 1000 : null,
    };

    this.activeMods.set(type, activeMod);
    this.applyModEffects(config);
    this.onModActivated?.(config);

    return true;
  }

  deactivateMod(type: ModType): void {
    const mod = this.activeMods.get(type);
    if (!mod) return;

    this.activeMods.delete(type);
    this.recomputeEffects();
    this.onModDeactivated?.(mod.config);
  }

  private applyModEffects(config: ModConfig): void {
    const effects = config.effects;

    if (effects.spawnRateMultiplier !== undefined) {
      // Modification happens via getEffectiveSpawnRate
    }

    if (effects.speedMultiplier !== undefined) {
      // Speed modifications applied in update loop
    }
  }

  private recomputeEffects(): void {
    // Re-apply all active mod effects
    for (const mod of this.activeMods.values()) {
      this.applyModEffects(mod.config);
    }
  }

  // Get effective values with all active mods applied
  getEffectiveSpawnRate(baseRate: number): number {
    let rate = baseRate;
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.spawnRateMultiplier !== undefined) {
        rate *= mod.config.effects.spawnRateMultiplier;
      }
    }
    return Math.min(1, rate);
  }

  getEffectiveSpeedMultiplier(): number {
    let multiplier = 1.0;
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.speedMultiplier !== undefined) {
        multiplier *= mod.config.effects.speedMultiplier;
      }
    }
    return multiplier;
  }

  getEffectiveMaxDelegates(tier: AgentTier, baseMax: number): number {
    let max = baseMax;
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.bypassTierLimits) {
        return Infinity;
      }
      if (mod.config.effects.maxDelegatesMultiplier !== undefined) {
        max = Math.floor(max * mod.config.effects.maxDelegatesMultiplier);
      }
    }
    return max;
  }

  canBypassTierLimits(): boolean {
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.bypassTierLimits) {
        return true;
      }
    }
    return false;
  }

  isAutoPromoteEnabled(): boolean {
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.autoPromote) {
        return true;
      }
    }
    return false;
  }

  getParticleIntensity(): number {
    let intensity = 1.0;
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.particleIntensity !== undefined) {
        intensity *= mod.config.effects.particleIntensity;
      }
    }
    return intensity;
  }

  isTelemetryEnabled(): boolean {
    for (const mod of this.activeMods.values()) {
      if (mod.config.effects.telemetryEnabled === false) {
        return false;
      }
    }
    return true;
  }

  // Update loop - check for expired mods
  update(): void {
    const now = Date.now();
    for (const [type, mod] of this.activeMods) {
      if (mod.expiresAt && now >= mod.expiresAt) {
        this.deactivateMod(type);
      }
    }
  }

  // Getters
  getActiveMods(): ActiveMod[] {
    return Array.from(this.activeMods.values());
  }

  isModActive(type: ModType): boolean {
    return this.activeMods.has(type);
  }

  getModTimeRemaining(type: ModType): number | null {
    const mod = this.activeMods.get(type);
    if (!mod || !mod.expiresAt) return null;
    return Math.max(0, mod.expiresAt - Date.now());
  }

  // Get combined mod status for UI
  getModStatus(): { type: ModType; name: string; emoji: string; color: string; timeRemaining: number | null }[] {
    return this.getActiveMods().map(mod => ({
      type: mod.config.type,
      name: mod.config.name,
      emoji: mod.config.emoji,
      color: mod.config.color,
      timeRemaining: mod.expiresAt ? Math.ceil((mod.expiresAt - Date.now()) / 1000) : null,
    }));
  }

  // Reset all mods
  reset(): void {
    for (const type of this.activeMods.keys()) {
      this.deactivateMod(type);
    }
    this.cheatBuffer = [];
  }
}

// Mod API for external plugins
export interface ModAPI {
  activateMod: (type: ModType) => boolean;
  deactivateMod: (type: ModType) => void;
  getActiveMods: () => ActiveMod[];
  isModActive: (type: ModType) => boolean;
}

export function createModAPI(system: ModSystem): ModAPI {
  return {
    activateMod: (type: ModType) => system.activateMod(type),
    deactivateMod: (type: ModType) => system.deactivateMod(type),
    getActiveMods: () => system.getActiveMods(),
    isModActive: (type: ModType) => system.isModActive(type),
  };
}
