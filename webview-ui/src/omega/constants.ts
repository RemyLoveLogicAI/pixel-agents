// Omega v2 constants — all magic numbers centralized here
import type { TierConfig, SkillMeta, GameMod, Achievement, Quest } from './types.js'
import { TierLevel, OctoCodeSkill } from './types.js'

// ── Palette ──────────────────────────────────────────────────
export const OP = {
  bg: '#06090d',
  panel: '#0b0f15',
  panelBorder: '#162030',
  panelHover: '#14142a',
  accent: '#00ff88',
  accentDim: '#00994d',
  warning: '#ffaa00',
  danger: '#ff2244',
  info: '#44aaff',
  purple: '#9b4dff',
  gold: '#ffd700',
  cyan: '#00d4ff',
  text: '#d8eaf4',
  textDim: '#2a4060',
  textMuted: '#1a2a40',
  boss: '#ffd700',
  supervisor: '#ff6633',
  employee: '#44aaff',
  intern: '#88cc88',
} as const

// ── Tier Configs ─────────────────────────────────────────────
export const TIER_CONFIGS: Record<TierLevel, TierConfig> = {
  [TierLevel.BOSS]: {
    tier: TierLevel.BOSS,
    label: 'BOSS',
    emoji: '\u{1F454}',
    scale: 1.4,
    maxCount: 1,
    canDelegateTo: [TierLevel.SUPERVISOR, TierLevel.EMPLOYEE],
    canSpawn: [TierLevel.SUPERVISOR],
    skills: [OctoCodeSkill.PLAN, OctoCodeSkill.ORCHESTRATE],
    color: OP.boss,
    ringColor: OP.gold,
    size: 28,
    crownSprite: true,
  },
  [TierLevel.SUPERVISOR]: {
    tier: TierLevel.SUPERVISOR,
    label: 'SUPERVISOR',
    emoji: '\u{1F4CB}',
    scale: 1.15,
    maxCount: 3,
    canDelegateTo: [TierLevel.EMPLOYEE, TierLevel.INTERN],
    canSpawn: [TierLevel.EMPLOYEE, TierLevel.INTERN],
    skills: [OctoCodeSkill.RESEARCH, OctoCodeSkill.REVIEW, OctoCodeSkill.ANALYZE],
    color: OP.supervisor,
    ringColor: OP.purple,
    size: 22,
    crownSprite: false,
  },
  [TierLevel.EMPLOYEE]: {
    tier: TierLevel.EMPLOYEE,
    label: 'EMPLOYEE',
    emoji: '\u{1F4BB}',
    scale: 1.0,
    maxCount: 8,
    canDelegateTo: [TierLevel.INTERN],
    canSpawn: [TierLevel.INTERN],
    skills: [OctoCodeSkill.GENERATE, OctoCodeSkill.TEST, OctoCodeSkill.BUILD],
    color: OP.employee,
    ringColor: OP.cyan,
    size: 18,
    crownSprite: false,
  },
  [TierLevel.INTERN]: {
    tier: TierLevel.INTERN,
    label: 'INTERN',
    emoji: '\u{1F4CE}',
    scale: 0.85,
    maxCount: 12,
    canDelegateTo: [],
    canSpawn: [],
    skills: [OctoCodeSkill.LINT, OctoCodeSkill.DOCS, OctoCodeSkill.FORMAT],
    color: OP.intern,
    ringColor: OP.textDim,
    size: 13,
    crownSprite: false,
  },
}

// ── Skill Metadata ───────────────────────────────────────────
export const SKILL_META: Record<OctoCodeSkill, SkillMeta> = {
  [OctoCodeSkill.PLAN]: { skill: OctoCodeSkill.PLAN, tier: TierLevel.BOSS, tool: 'plan', label: 'Plan', color: OP.gold, icon: '\u{1F9E0}' },
  [OctoCodeSkill.ORCHESTRATE]: { skill: OctoCodeSkill.ORCHESTRATE, tier: TierLevel.BOSS, tool: 'orchestrate', label: 'Orchestrate', color: OP.gold, icon: '\u{1F3AF}' },
  [OctoCodeSkill.RESEARCH]: { skill: OctoCodeSkill.RESEARCH, tier: TierLevel.SUPERVISOR, tool: 'search', label: 'Research', color: OP.info, icon: '\u{1F50D}' },
  [OctoCodeSkill.REVIEW]: { skill: OctoCodeSkill.REVIEW, tier: TierLevel.SUPERVISOR, tool: 'file_read', label: 'Review', color: OP.purple, icon: '\u{1F440}' },
  [OctoCodeSkill.ANALYZE]: { skill: OctoCodeSkill.ANALYZE, tier: TierLevel.SUPERVISOR, tool: 'search', label: 'Analyze', color: OP.info, icon: '\u{1F4CA}' },
  [OctoCodeSkill.GENERATE]: { skill: OctoCodeSkill.GENERATE, tier: TierLevel.EMPLOYEE, tool: 'file_write', label: 'Generate', color: OP.accent, icon: '\u{26A1}' },
  [OctoCodeSkill.TEST]: { skill: OctoCodeSkill.TEST, tier: TierLevel.EMPLOYEE, tool: 'terminal', label: 'Test', color: OP.warning, icon: '\u{1F9EA}' },
  [OctoCodeSkill.BUILD]: { skill: OctoCodeSkill.BUILD, tier: TierLevel.EMPLOYEE, tool: 'terminal', label: 'Build', color: OP.accent, icon: '\u{1F528}' },
  [OctoCodeSkill.LINT]: { skill: OctoCodeSkill.LINT, tier: TierLevel.INTERN, tool: 'terminal', label: 'Lint', color: OP.intern, icon: '\u{2728}' },
  [OctoCodeSkill.DOCS]: { skill: OctoCodeSkill.DOCS, tier: TierLevel.INTERN, tool: 'file_write', label: 'Docs', color: OP.cyan, icon: '\u{1F4DD}' },
  [OctoCodeSkill.FORMAT]: { skill: OctoCodeSkill.FORMAT, tier: TierLevel.INTERN, tool: 'terminal', label: 'Format', color: OP.intern, icon: '\u{1F9F9}' },
}

export const SKILL_TIER_MAP: Record<OctoCodeSkill, TierLevel> = {
  [OctoCodeSkill.PLAN]: TierLevel.BOSS,
  [OctoCodeSkill.ORCHESTRATE]: TierLevel.BOSS,
  [OctoCodeSkill.RESEARCH]: TierLevel.SUPERVISOR,
  [OctoCodeSkill.REVIEW]: TierLevel.SUPERVISOR,
  [OctoCodeSkill.ANALYZE]: TierLevel.SUPERVISOR,
  [OctoCodeSkill.GENERATE]: TierLevel.EMPLOYEE,
  [OctoCodeSkill.TEST]: TierLevel.EMPLOYEE,
  [OctoCodeSkill.BUILD]: TierLevel.EMPLOYEE,
  [OctoCodeSkill.LINT]: TierLevel.INTERN,
  [OctoCodeSkill.DOCS]: TierLevel.INTERN,
  [OctoCodeSkill.FORMAT]: TierLevel.INTERN,
}

// ── Game Mods ────────────────────────────────────────────────
export const DEFAULT_MODS: GameMod[] = [
  { id: 'turbo', name: 'TURBO MODE', desc: '2x agent tick speed', cost: 500, color: OP.gold, active: false, expiresAt: null },
  { id: 'godmode', name: 'GOD MODE', desc: 'Infinite tokens, no limits', cost: 2000, color: OP.purple, active: false, expiresAt: null },
  { id: 'swarm', name: 'SWARM PROTOCOL', desc: 'Auto-spawn intern on task', cost: 1000, color: '#ff00cc', active: false, expiresAt: null },
  { id: 'timewarp', name: 'TIME WARP', desc: 'Replay last session 4x', cost: 3000, color: '#ff6b00', active: false, expiresAt: null },
  { id: 'stealth', name: 'STEALTH OPS', desc: 'Zero-trace private mode', cost: 750, color: OP.accent, active: false, expiresAt: null },
  { id: 'debug', name: 'DEBUG OVERLAY', desc: 'Show all token counts', cost: 0, color: OP.cyan, active: false, expiresAt: null },
  { id: 'nightmode', name: 'NIGHT MODE', desc: 'Office goes dark + lamps', cost: 0, color: OP.textDim, active: false, expiresAt: null },
  { id: 'firedrill', name: 'FIRE DRILL', desc: 'Chaos test: random errors', cost: 100, color: OP.danger, active: false, expiresAt: null },
]

// ── Cheat Codes (key sequences → mod IDs) ────────────────────
export const CHEAT_CODES: Record<string, string> = {
  '//pixelhq:turbo': 'turbo',
  '//pixelhq:god': 'godmode',
  '//pixelhq:swarm': 'swarm',
  '//pixelhq:confetti': 'confetti_event',
  '//pixelhq:chaos': 'firedrill',
  '//pixelhq:coffee': 'coffee_heal',
  '//pixelhq:hire-intern': 'hire_intern',
  'iddqd': 'godmode',
}

// ── Achievements ─────────────────────────────────────────────
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_hire', name: 'FIRST HIRE', desc: 'Spawn your first agent', icon: '\u{1F389}', unlocked: false, unlockedAt: null },
  { id: 'team_builder', name: 'TEAM BUILDER', desc: 'Have 5+ active agents', icon: '\u{1F465}', unlocked: false, unlockedAt: null },
  { id: 'army_commander', name: 'ARMY COMMANDER', desc: 'Have 10+ active agents', icon: '\u{2694}\u{FE0F}', unlocked: false, unlockedAt: null },
  { id: 'career_ladder', name: 'CAREER LADDER', desc: 'Promote an agent', icon: '\u{1F4C8}', unlocked: false, unlockedAt: null },
  { id: 'delegator', name: 'DELEGATOR', desc: 'Delegate 10 skills', icon: '\u{1F4E8}', unlocked: false, unlockedAt: null },
  { id: 'green_suite', name: 'GREEN SUITE', desc: 'CI pipeline all green', icon: '\u{2705}', unlocked: false, unlockedAt: null },
  { id: 'ship_it', name: 'SHIP IT', desc: 'Deploy to production', icon: '\u{1F680}', unlocked: false, unlockedAt: null },
  { id: 'mod_explorer', name: 'MOD EXPLORER', desc: 'Activate 3 different mods', icon: '\u{1F3AE}', unlocked: false, unlockedAt: null },
  { id: 'cheater', name: 'CHEATER', desc: 'Enter a cheat code', icon: '\u{1F47E}', unlocked: false, unlockedAt: null },
  { id: 'lvl10', name: 'LEVEL 10', desc: 'Reach team level 10', icon: '\u{2B50}', unlocked: false, unlockedAt: null },
]

// ── Quests ────────────────────────────────────────────────────
export const DEFAULT_QUESTS: Quest[] = [
  { id: 'refactor_3', name: 'REFACTOR MASTER', desc: 'Refactor 3 modules', target: 3, progress: 0, completed: false, xpReward: 500 },
  { id: 'deploy', name: 'SHIP TO PROD', desc: 'Deploy to production', target: 1, progress: 0, completed: false, xpReward: 1000 },
  { id: 'research_10', name: 'DEEP RESEARCHER', desc: 'Run /research 10 times', target: 10, progress: 0, completed: false, xpReward: 300 },
  { id: 'all_lvl10', name: 'ELITE SQUAD', desc: 'All agents reach LV.10+', target: 1, progress: 0, completed: false, xpReward: 2000 },
]

// ── Particle Config ──────────────────────────────────────────
export const PARTICLE_MAX_COUNT = 200
export const PARTICLE_DELEGATION_COLOR = OP.gold
export const PARTICLE_PROMOTION_COLOR = '#ffd700'
export const PARTICLE_SPAWN_COLOR = OP.accent
export const PARTICLE_TRAIL_DURATION_MS = 800

// ── View Mode ────────────────────────────────────────────────
export const VIEW_MODE_TRANSITION_MS = 300

// ── XP System ────────────────────────────────────────────────
export const XP_PER_TOOL_USE = 10
export const XP_PER_DELEGATION = 25
export const XP_PER_PROMOTION = 100
export const XP_PER_SKILL_COMPLETE = 50
export const XP_PER_MOD_ACTIVATE = 15
export const XP_LEVEL_BASE = 100
export const XP_LEVEL_MULTIPLIER = 1.2

// ── UI Layout ────────────────────────────────────────────────
export const HUD_PADDING = 8
export const HUD_BAR_HEIGHT = 6
export const HUD_BAR_WIDTH = 140
export const MOD_CONSOLE_WIDTH = 260
export const SKILL_BAR_HEIGHT = 36
export const DEV_TOOLS_HEIGHT = 180
