// Unit tests for HierarchyEngine
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HierarchyEngine } from '../hierarchyEngine.js'
import { TierLevel, OctoCodeSkill, DelegationStatus } from '../../types.js'

describe('HierarchyEngine', () => {
  let engine: HierarchyEngine

  beforeEach(() => {
    engine = new HierarchyEngine()
  })

  // ── registerAgent ──────────────────────────────────────────────
  describe('registerAgent', () => {
    it('creates agent with correct initial state', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'TestBoss')
      const agent = engine.getAgent(1)

      expect(agent).toBeDefined()
      expect(agent?.id).toBe(1)
      expect(agent?.name).toBe('TestBoss')
      expect(agent?.tier).toBe(TierLevel.BOSS)
      expect(agent?.xp).toBe(0)
      expect(agent?.level).toBe(1)
      expect(agent?.isActive).toBe(true)
      expect(agent?.skillQueue).toEqual([])
      expect(agent?.childIds).toEqual([])
      expect(agent?.parentId).toBeNull()
    })

    it('links child to parent correctly', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker', 1)

      const boss = engine.getAgent(1)
      const worker = engine.getAgent(2)

      expect(worker?.parentId).toBe(1)
      expect(boss?.childIds).toContain(2)
    })

    it('rejects duplicate agent registration', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(1, TierLevel.EMPLOYEE, 'Duplicate')

      const agent = engine.getAgent(1)
      expect(agent?.tier).toBe(TierLevel.BOSS) // Original unchanged
      expect(agent?.name).toBe('Boss')
    })

    it('fires onAgentChanged callback', () => {
      const callback = vi.fn()
      engine.onAgentChanged = callback

      engine.registerAgent(1, TierLevel.BOSS, 'Boss')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    })
  })

  // ── unregisterAgent ────────────────────────────────────────────
  describe('unregisterAgent', () => {
    it('removes agent from registry', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.unregisterAgent(1)

      expect(engine.getAgent(1)).toBeUndefined()
      expect(engine.getAllAgents()).toHaveLength(0)
    })

    it('removes agent from parent childIds', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker', 1)
      engine.unregisterAgent(2)

      const boss = engine.getAgent(1)
      expect(boss?.childIds).not.toContain(2)
    })

    it('orphans children when parent is removed', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker', 1)
      engine.unregisterAgent(1)

      const worker = engine.getAgent(2)
      expect(worker?.parentId).toBeNull()
    })

    it('handles non-existent agent gracefully', () => {
      expect(() => engine.unregisterAgent(999)).not.toThrow()
    })
  })

  // ── delegateSkill ──────────────────────────────────────────────
  describe('delegateSkill', () => {
    it('boss executes boss-tier skill on self', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      const chain = engine.delegateSkill(1, OctoCodeSkill.PLAN)

      expect(chain).not.toBeNull()
      expect(chain?.fromId).toBe(1)
      expect(chain?.toId).toBe(1)
      expect(chain?.skill).toBe(OctoCodeSkill.PLAN)
      expect(chain?.status).toBe(DelegationStatus.ACTIVE)
    })

    it('boss delegates employee-tier skill to child', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker', 1)

      const chain = engine.delegateSkill(1, OctoCodeSkill.GENERATE)

      expect(chain).not.toBeNull()
      expect(chain?.fromId).toBe(1)
      expect(chain?.toId).toBe(2)
    })

    it('intern delegates up to parent for higher-tier skill', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.INTERN, 'Intern', 1)

      const chain = engine.delegateSkill(2, OctoCodeSkill.PLAN)

      // Should delegate to boss (the parent)
      expect(chain).not.toBeNull()
    })

    it('returns null for non-existent source agent', () => {
      const chain = engine.delegateSkill(999, OctoCodeSkill.PLAN)
      expect(chain).toBeNull()
    })

    it('returns null for non-existent target agent', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      const chain = engine.delegateSkill(1, OctoCodeSkill.PLAN, 999)
      expect(chain).toBeNull()
    })

    it('increments delegation count', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      
      expect(engine.getDelegationCount()).toBe(0)
      engine.delegateSkill(1, OctoCodeSkill.PLAN)
      expect(engine.getDelegationCount()).toBe(1)
    })

    it('fires onDelegation callback', () => {
      const callback = vi.fn()
      engine.onDelegation = callback
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')

      engine.delegateSkill(1, OctoCodeSkill.PLAN)

      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  // ── promoteAgent ───────────────────────────────────────────────
  describe('promoteAgent', () => {
    it('promotes employee to supervisor', () => {
      engine.registerAgent(1, TierLevel.EMPLOYEE, 'Worker')
      const success = engine.promoteAgent(1)

      expect(success).toBe(true)
      expect(engine.getAgent(1)?.tier).toBe(TierLevel.SUPERVISOR)
    })

    it('does not promote boss (already at top)', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      const success = engine.promoteAgent(1)

      expect(success).toBe(false)
      expect(engine.getAgent(1)?.tier).toBe(TierLevel.BOSS)
    })

    it('respects max count limits', () => {
      // Register a boss first
      engine.registerAgent(1, TierLevel.BOSS, 'Boss1')
      engine.registerAgent(2, TierLevel.SUPERVISOR, 'Worker')

      const success = engine.promoteAgent(2)
      expect(success).toBe(false) // Can't promote to boss, limit is 1
    })

    it('grants XP on promotion', () => {
      const callback = vi.fn()
      engine.onXPGained = callback
      engine.registerAgent(1, TierLevel.EMPLOYEE, 'Worker')
      engine.promoteAgent(1)

      // XP may be consumed by level-up, but callback should fire with XP_PER_PROMOTION (100)
      expect(callback).toHaveBeenCalledWith(1, 100)
    })
  })

  // ── addXP ──────────────────────────────────────────────────────
  describe('addXP', () => {
    it('accumulates XP correctly', () => {
      engine.registerAgent(1, TierLevel.EMPLOYEE, 'Worker')
      engine.addXP(1, 50)
      engine.addXP(1, 30)

      expect(engine.getAgent(1)?.xp).toBe(80)
    })

    it('triggers level-up when XP threshold reached', () => {
      engine.registerAgent(1, TierLevel.EMPLOYEE, 'Worker')
      engine.addXP(1, 150) // 100 XP needed for level 2

      const agent = engine.getAgent(1)
      expect(agent?.level).toBeGreaterThan(1)
    })

    it('fires onXPGained callback', () => {
      const callback = vi.fn()
      engine.onXPGained = callback
      engine.registerAgent(1, TierLevel.EMPLOYEE, 'Worker')

      engine.addXP(1, 50)

      expect(callback).toHaveBeenCalledWith(1, 50)
    })
  })

  // ── update ─────────────────────────────────────────────────────
  describe('update', () => {
    it('decays activity levels over time', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      const agent = engine.getAgent(1)!
      agent.activityLevel = 1.0

      engine.update(1) // 1 second

      expect(agent.activityLevel).toBeLessThan(1.0)
    })

    it('does not decay below zero', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      const agent = engine.getAgent(1)!
      agent.activityLevel = 0.01

      engine.update(100)

      expect(agent.activityLevel).toBe(0)
    })

    it('trims old delegations to 100 max', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      
      // Create 110 delegations
      for (let i = 0; i < 110; i++) {
        engine.delegateSkill(1, OctoCodeSkill.PLAN)
      }

      engine.update(0)

      expect(engine.getDelegations().length).toBeLessThanOrEqual(100)
    })
  })

  // ── getTeamStats ───────────────────────────────────────────────
  describe('getTeamStats', () => {
    it('returns correct stats for empty team', () => {
      const stats = engine.getTeamStats()

      expect(stats.agentCount).toBe(0)
      expect(stats.teamLevel).toBe(1)
      expect(stats.totalXP).toBe(0)
    })

    it('calculates average team level', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker')
      engine.addXP(1, 500) // Will level up agent 1

      const stats = engine.getTeamStats()

      expect(stats.agentCount).toBe(2)
      expect(stats.teamLevel).toBeGreaterThanOrEqual(1)
    })
  })

  // ── getters ────────────────────────────────────────────────────
  describe('getters', () => {
    it('getAgentsByTier filters correctly', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker1')
      engine.registerAgent(3, TierLevel.EMPLOYEE, 'Worker2')
      engine.registerAgent(4, TierLevel.INTERN, 'Intern')

      expect(engine.getAgentsByTier(TierLevel.EMPLOYEE)).toHaveLength(2)
      expect(engine.getAgentsByTier(TierLevel.BOSS)).toHaveLength(1)
      expect(engine.getAgentsByTier(TierLevel.SUPERVISOR)).toHaveLength(0)
    })

    it('getChildren returns correct children', () => {
      engine.registerAgent(1, TierLevel.BOSS, 'Boss')
      engine.registerAgent(2, TierLevel.EMPLOYEE, 'Worker', 1)
      engine.registerAgent(3, TierLevel.INTERN, 'Intern', 1)

      const children = engine.getChildren(1)
      expect(children).toHaveLength(2)
      expect(children.map(c => c.id)).toContain(2)
      expect(children.map(c => c.id)).toContain(3)
    })
  })
})
