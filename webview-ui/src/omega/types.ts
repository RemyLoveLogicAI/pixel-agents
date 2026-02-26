// Omega v2 type definitions — using `as const` (no enum per project constraints)

// FloorColor reserved for future particle color customization

// ── Tier System ──────────────────────────────────────────────
export const TierLevel = {
  BOSS: 'boss',
  SUPERVISOR: 'supervisor',
  EMPLOYEE: 'employee',
  INTERN: 'intern',
} as const
export type TierLevel = (typeof TierLevel)[keyof typeof TierLevel]

export const TIER_ORDER: TierLevel[] = ['boss', 'supervisor', 'employee', 'intern']

export interface TierConfig {
  tier: TierLevel
  label: string
  emoji: string
  scale: number
  maxCount: number
  canDelegateTo: TierLevel[]
  canSpawn: TierLevel[]
  skills: OctoCodeSkill[]
  color: string
  ringColor: string
  size: number
  crownSprite: boolean
}

// ── OctoCode Slash-Skills ────────────────────────────────────
export const OctoCodeSkill = {
  PLAN: '/plan',
  ORCHESTRATE: '/orchestrate',
  RESEARCH: '/research',
  REVIEW: '/review',
  ANALYZE: '/analyze',
  GENERATE: '/generate',
  TEST: '/test',
  BUILD: '/build',
  LINT: '/lint',
  DOCS: '/docs',
  FORMAT: '/format',
} as const
export type OctoCodeSkill = (typeof OctoCodeSkill)[keyof typeof OctoCodeSkill]

export interface SkillMeta {
  skill: OctoCodeSkill
  tier: TierLevel
  tool: string
  label: string
  color: string
  icon: string
}

// ── Agent Source ──────────────────────────────────────────────
export const AgentSource = {
  CLAUDE: 'claude',
  CURSOR: 'cursor',
  CODEX: 'codex',
  OCTOCODE: 'octocode',
  CUSTOM: 'custom',
} as const
export type AgentSource = (typeof AgentSource)[keyof typeof AgentSource]

// ── Hierarchical Agent ───────────────────────────────────────
export interface HierarchicalAgent {
  id: number
  name: string
  tier: TierLevel
  source: AgentSource
  parentId: number | null
  childIds: number[]
  skillQueue: OctoCodeSkill[]
  activityLevel: number
  isActive: boolean
  xp: number
  level: number
  tokens: number
  tasks: number
}

// ── Delegation Chain ─────────────────────────────────────────
export const DelegationStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const
export type DelegationStatus = (typeof DelegationStatus)[keyof typeof DelegationStatus]

export interface DelegationChain {
  fromId: number
  toId: number
  skill: OctoCodeSkill
  timestamp: number
  status: DelegationStatus
}

// ── Particle Trail ───────────────────────────────────────────
export const ParticleType = {
  DELEGATION: 'delegation',
  PROMOTION: 'promotion',
  SPAWN: 'spawn',
  SKILL: 'skill',
  LEVEL_UP: 'levelup',
  ACHIEVEMENT: 'achievement',
  MOD: 'mod',
} as const
export type ParticleType = (typeof ParticleType)[keyof typeof ParticleType]

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  decay: number
  color: string
  size: number
  type: ParticleType
}

export interface ParticleTrail {
  id: string
  fromX: number
  fromY: number
  toX: number
  toY: number
  color: string
  progress: number
  type: ParticleType
}

// ── View Mode ────────────────────────────────────────────────
export const ViewMode = {
  OFFICE: 'office',
  ORG_CHART: 'orgchart',
  HEATMAP: 'heatmap',
} as const
export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode]

// ── Game Mod ─────────────────────────────────────────────────
export interface GameMod {
  id: string
  name: string
  desc: string
  cost: number
  color: string
  active: boolean
  expiresAt: number | null
}

// ── Achievement ──────────────────────────────────────────────
export interface Achievement {
  id: string
  name: string
  desc: string
  icon: string
  unlocked: boolean
  unlockedAt: number | null
}

// ── Quest ────────────────────────────────────────────────────
export interface Quest {
  id: string
  name: string
  desc: string
  target: number
  progress: number
  completed: boolean
  xpReward: number
}

// ── Dev Tools ────────────────────────────────────────────────
export interface GitStatus {
  branch: string
  uncommitted: number
  ahead: number
  behind: number
}

export interface CIStatus {
  passed: number
  failed: number
  skipped: number
  coverage: number
  running: boolean
}

export interface DevEvent {
  timestamp: number
  source: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}
