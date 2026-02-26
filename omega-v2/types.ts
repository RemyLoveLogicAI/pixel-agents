// Omega v2: Hierarchical Agent System Types
// 4-Tier Organizational Hierarchy with OctoCode Skill Integration

export enum AgentTier {
  BOSS = 0,        // 👔 Crown, 1.4x scale
  SUPERVISOR = 1,  // 📋 Clipboard, 1.15x
  EMPLOYEE = 2,    // 💻 Standard, 1.0x
  INTERN = 3,      // 📎 Cap, 0.85x
}

export enum AgentSource {
  CLAUDE = 'claude',
  CURSOR = 'cursor',
  CODEX = 'codex',
  OCTOCODE = 'octocode',
  CUSTOM = 'custom',
}

export enum OctoCodeSkill {
  // Boss Tier
  PLAN = '/plan',
  ORCHESTRATE = '/orchestrate',
  
  // Supervisor Tier
  RESEARCH = '/research',
  REVIEW = '/review',
  ANALYZE = '/analyze',
  
  // Employee Tier
  GENERATE = '/generate',
  TEST = '/test',
  BUILD = '/build',
  
  // Intern Tier
  LINT = '/lint',
  DOCS = '/docs',
  FORMAT = '/format',
}

export interface TierConfig {
  tier: AgentTier;
  emoji: string;
  label: string;
  scale: number;
  maxDelegates: number;
  canDelegateTo: AgentTier[];
  canSpawn: AgentTier[];
  skills: OctoCodeSkill[];
  color: string;
}

export const TIER_CONFIGS: Record<AgentTier, TierConfig> = {
  [AgentTier.BOSS]: {
    tier: AgentTier.BOSS,
    emoji: '👔',
    label: 'Boss',
    scale: 1.4,
    maxDelegates: 1,
    canDelegateTo: [AgentTier.SUPERVISOR, AgentTier.EMPLOYEE],
    canSpawn: [AgentTier.SUPERVISOR],
    skills: [OctoCodeSkill.PLAN, OctoCodeSkill.ORCHESTRATE],
    color: '#FFD700', // Gold
  },
  [AgentTier.SUPERVISOR]: {
    tier: AgentTier.SUPERVISOR,
    emoji: '📋',
    label: 'Supervisor',
    scale: 1.15,
    maxDelegates: 3,
    canDelegateTo: [AgentTier.EMPLOYEE, AgentTier.INTERN],
    canSpawn: [AgentTier.EMPLOYEE, AgentTier.INTERN],
    skills: [OctoCodeSkill.RESEARCH, OctoCodeSkill.REVIEW, OctoCodeSkill.ANALYZE],
    color: '#4169E1', // Royal Blue
  },
  [AgentTier.EMPLOYEE]: {
    tier: AgentTier.EMPLOYEE,
    emoji: '💻',
    label: 'Employee',
    scale: 1.0,
    maxDelegates: 8,
    canDelegateTo: [AgentTier.INTERN],
    canSpawn: [AgentTier.INTERN],
    skills: [OctoCodeSkill.GENERATE, OctoCodeSkill.TEST, OctoCodeSkill.BUILD],
    color: '#32CD32', // Lime Green
  },
  [AgentTier.INTERN]: {
    tier: AgentTier.INTERN,
    emoji: '📎',
    label: 'Intern',
    scale: 0.85,
    maxDelegates: 12,
    canDelegateTo: [],
    canSpawn: [],
    skills: [OctoCodeSkill.LINT, OctoCodeSkill.DOCS, OctoCodeSkill.FORMAT],
    color: '#FF69B4', // Hot Pink
  },
};

export const SKILL_TIER_MAP: Record<OctoCodeSkill, AgentTier> = {
  [OctoCodeSkill.PLAN]: AgentTier.BOSS,
  [OctoCodeSkill.ORCHESTRATE]: AgentTier.BOSS,
  [OctoCodeSkill.RESEARCH]: AgentTier.SUPERVISOR,
  [OctoCodeSkill.REVIEW]: AgentTier.SUPERVISOR,
  [OctoCodeSkill.ANALYZE]: AgentTier.SUPERVISOR,
  [OctoCodeSkill.GENERATE]: AgentTier.EMPLOYEE,
  [OctoCodeSkill.TEST]: AgentTier.EMPLOYEE,
  [OctoCodeSkill.BUILD]: AgentTier.EMPLOYEE,
  [OctoCodeSkill.LINT]: AgentTier.INTERN,
  [OctoCodeSkill.DOCS]: AgentTier.INTERN,
  [OctoCodeSkill.FORMAT]: AgentTier.INTERN,
};

export interface HierarchicalAgent {
  id: string;
  name: string;
  tier: AgentTier;
  source: AgentSource;
  parentId: string | null;
  childIds: string[];
  skillQueue: OctoCodeSkill[];
  position: { x: number; y: number };
  activityLevel: number; // 0-1 for heatmap
  isActive: boolean;
  spawnTime: number;
  promotedFrom: AgentTier | null;
}

export interface DelegationChain {
  fromId: string;
  toId: string;
  skill: OctoCodeSkill;
  timestamp: number;
  status: 'pending' | 'active' | 'completed';
}

export interface ParticleTrail {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  progress: number;
  type: 'delegation' | 'promotion' | 'spawn';
}

export enum ViewMode {
  OFFICE = 'office',
  ORG_CHART = 'orgchart',
  HEATMAP = 'heatmap',
}

export interface OfficeZone {
  id: string;
  name: string;
  tier: AgentTier;
  bounds: { x: number; y: number; width: number; height: number };
  deskPositions: { x: number; y: number }[];
}
