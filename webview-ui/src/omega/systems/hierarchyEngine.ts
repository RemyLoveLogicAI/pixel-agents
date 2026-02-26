// Omega Hierarchy Engine — manages 4-tier agent delegation and skill routing
import type { HierarchicalAgent, DelegationChain, OctoCodeSkill, TierLevel } from '../types.js'
import { DelegationStatus } from '../types.js'
import { TIER_CONFIGS, SKILL_TIER_MAP, XP_PER_DELEGATION, XP_PER_PROMOTION } from '../constants.js'

export class HierarchyEngine {
  private agents: Map<number, HierarchicalAgent> = new Map()
  private delegations: DelegationChain[] = []
  private delegationCount = 0

  onAgentChanged: ((agent: HierarchicalAgent) => void) | null = null
  onDelegation: ((chain: DelegationChain) => void) | null = null
  onXPGained: ((agentId: number, xp: number) => void) | null = null

  /** Register an agent with a given tier (called when OfficeState creates a character) */
  registerAgent(id: number, tier: TierLevel, name: string, parentId: number | null = null): void {
    if (this.agents.has(id)) return
    const agent: HierarchicalAgent = {
      id,
      name,
      tier,
      source: 'claude',
      parentId,
      childIds: [],
      skillQueue: [],
      activityLevel: 0,
      isActive: true,
      xp: 0,
      level: 1,
      tokens: 0,
      tasks: 0,
    }
    this.agents.set(id, agent)
    if (parentId !== null) {
      const parent = this.agents.get(parentId)
      if (parent && !parent.childIds.includes(id)) {
        parent.childIds.push(id)
      }
    }
    this.onAgentChanged?.(agent)
  }

  unregisterAgent(id: number): void {
    const agent = this.agents.get(id)
    if (!agent) return
    // Remove from parent's children
    if (agent.parentId !== null) {
      const parent = this.agents.get(agent.parentId)
      if (parent) {
        parent.childIds = parent.childIds.filter(cid => cid !== id)
      }
    }
    // Orphan children
    for (const childId of agent.childIds) {
      const child = this.agents.get(childId)
      if (child) child.parentId = null
    }
    this.agents.delete(id)
  }

  /** Dispatch a slash-skill, auto-routing to the correct tier */
  delegateSkill(fromId: number, skill: OctoCodeSkill, toId?: number): DelegationChain | null {
    const from = this.agents.get(fromId)
    if (!from) return null

    const requiredTier = SKILL_TIER_MAP[skill]
    const tierOrder = ['boss', 'supervisor', 'employee', 'intern'] as const
    const fromIdx = tierOrder.indexOf(from.tier)
    const reqIdx = tierOrder.indexOf(requiredTier)

    // If specific target, validate
    if (toId !== undefined) {
      const to = this.agents.get(toId)
      if (!to) return null
      return this.createDelegation(fromId, toId, skill)
    }

    // If agent is at correct tier or higher, execute directly
    if (fromIdx <= reqIdx) {
      // Find appropriate child at correct tier
      if (fromIdx < reqIdx) {
        const child = this.findChildAtTier(fromId, requiredTier)
        if (child) return this.createDelegation(fromId, child.id, skill)
      }
      // Execute on self
      from.skillQueue.push(skill)
      from.activityLevel = Math.min(1, from.activityLevel + 0.2)
      from.tasks++
      return this.createDelegation(fromId, fromId, skill, DelegationStatus.ACTIVE)
    }

    // Agent below required tier — delegate up to parent
    if (from.parentId !== null) {
      return this.delegateSkill(from.parentId, skill)
    }
    return null
  }

  private findChildAtTier(parentId: number, tier: TierLevel): HierarchicalAgent | null {
    const parent = this.agents.get(parentId)
    if (!parent) return null
    for (const childId of parent.childIds) {
      const child = this.agents.get(childId)
      if (child && child.tier === tier) return child
      // Recurse
      if (child) {
        const found = this.findChildAtTier(childId, tier)
        if (found) return found
      }
    }
    return null
  }

  private createDelegation(fromId: number, toId: number, skill: OctoCodeSkill, status: DelegationStatus = DelegationStatus.PENDING): DelegationChain {
    const chain: DelegationChain = { fromId, toId, skill, timestamp: Date.now(), status }
    this.delegations.push(chain)
    this.delegationCount++

    const to = this.agents.get(toId)
    if (to && status === DelegationStatus.PENDING) {
      to.skillQueue.push(skill)
      to.activityLevel = Math.min(1, to.activityLevel + 0.15)
    }

    // XP for delegation
    this.addXP(fromId, XP_PER_DELEGATION)
    this.onDelegation?.(chain)
    return chain
  }

  /** Promote an agent up one tier */
  promoteAgent(agentId: number): boolean {
    const agent = this.agents.get(agentId)
    if (!agent) return false
    const tierOrder = ['boss', 'supervisor', 'employee', 'intern'] as const
    const idx = tierOrder.indexOf(agent.tier)
    if (idx <= 0) return false // Already boss

    const newTier = tierOrder[idx - 1]
    const config = TIER_CONFIGS[newTier]
    const existing = this.getAgentsByTier(newTier).length
    if (existing >= config.maxCount) return false

    agent.tier = newTier
    this.addXP(agentId, XP_PER_PROMOTION)
    this.onAgentChanged?.(agent)
    return true
  }

  addXP(agentId: number, amount: number): void {
    const agent = this.agents.get(agentId)
    if (!agent) return
    agent.xp += amount
    // Level up check
    const xpNeeded = 100 * Math.pow(1.2, agent.level - 1)
    while (agent.xp >= xpNeeded) {
      agent.xp -= Math.floor(xpNeeded)
      agent.level++
    }
    this.onXPGained?.(agentId, amount)
  }

  addTokens(agentId: number, input: number, output: number): void {
    const agent = this.agents.get(agentId)
    if (agent) agent.tokens += input + output
  }

  /** Decay activity levels and clean up old delegations */
  update(dt: number): void {
    for (const agent of this.agents.values()) {
      if (agent.activityLevel > 0) {
        agent.activityLevel = Math.max(0, agent.activityLevel - dt * 0.05)
      }
    }
    // Expire old delegations (keep last 100)
    if (this.delegations.length > 100) {
      this.delegations = this.delegations.slice(-100)
    }
  }

  // ── Getters ──────────────────────────────────────────────
  getAgent(id: number): HierarchicalAgent | undefined { return this.agents.get(id) }
  getAllAgents(): HierarchicalAgent[] { return Array.from(this.agents.values()) }
  getAgentsByTier(tier: TierLevel): HierarchicalAgent[] { return this.getAllAgents().filter(a => a.tier === tier) }
  getDelegations(): DelegationChain[] { return this.delegations }
  getDelegationCount(): number { return this.delegationCount }
  getChildren(parentId: number): HierarchicalAgent[] {
    const parent = this.agents.get(parentId)
    if (!parent) return []
    return parent.childIds.map(id => this.agents.get(id)).filter((a): a is HierarchicalAgent => !!a)
  }

  /** Get total team XP and level */
  getTeamStats(): { totalXP: number; teamLevel: number; agentCount: number } {
    let totalXP = 0
    let totalLevel = 0
    for (const a of this.agents.values()) {
      totalXP += a.xp
      totalLevel += a.level
    }
    return {
      totalXP,
      teamLevel: this.agents.size > 0 ? Math.floor(totalLevel / this.agents.size) : 1,
      agentCount: this.agents.size,
    }
  }
}
