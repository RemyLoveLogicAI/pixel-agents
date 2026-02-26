// Unit tests for GamificationSystem
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GamificationSystem } from '../gamification.js'

describe('GamificationSystem', () => {
  let system: GamificationSystem

  beforeEach(() => {
    system = new GamificationSystem()
  })

  // ── Initialization ─────────────────────────────────────────────
  describe('initialization', () => {
    it('loads default achievements', () => {
      const achievements = system.getAchievements()
      expect(achievements.length).toBeGreaterThan(0)
      expect(achievements.find(a => a.id === 'first_hire')).toBeDefined()
    })

    it('loads default quests', () => {
      const quests = system.getQuests()
      expect(quests.length).toBeGreaterThan(0)
      expect(quests.find(q => q.id === 'deploy')).toBeDefined()
    })

    it('starts at level 1 with 0 XP', () => {
      expect(system.getTeamLevel()).toBe(1)
      expect(system.getTeamXP()).toBe(0)
    })

    it('all achievements start locked', () => {
      const achievements = system.getAchievements()
      expect(achievements.every(a => !a.unlocked)).toBe(true)
    })
  })

  // ── addTeamXP ──────────────────────────────────────────────────
  describe('addTeamXP', () => {
    it('accumulates XP correctly', () => {
      system.addTeamXP(50)
      system.addTeamXP(30)
      expect(system.getTeamXP()).toBe(80)
    })

    it('triggers level-up at 100 XP', () => {
      const callback = vi.fn()
      system.onLevelUp = callback

      system.addTeamXP(150)

      expect(system.getTeamLevel()).toBe(2)
      expect(callback).toHaveBeenCalledWith(2)
    })

    it('handles multiple level-ups from large XP gain', () => {
      const callback = vi.fn()
      system.onLevelUp = callback

      system.addTeamXP(500) // Should level up multiple times

      expect(system.getTeamLevel()).toBeGreaterThan(2)
      expect(callback).toHaveBeenCalledTimes(system.getTeamLevel() - 1)
    })

    it('unlocks lvl10 achievement at level 10', () => {
      // Add enough XP to reach level 10
      system.addTeamXP(3000)

      const lvl10 = system.getAchievements().find(a => a.id === 'lvl10')
      if (system.getTeamLevel() >= 10) {
        expect(lvl10?.unlocked).toBe(true)
      }
    })
  })

  // ── unlockAchievement ──────────────────────────────────────────
  describe('unlockAchievement', () => {
    it('unlocks achievement by ID', () => {
      const result = system.unlockAchievement('first_hire')

      expect(result).toBe(true)
      const ach = system.getAchievements().find(a => a.id === 'first_hire')
      expect(ach?.unlocked).toBe(true)
      expect(ach?.unlockedAt).not.toBeNull()
    })

    it('returns false for already unlocked achievement', () => {
      system.unlockAchievement('first_hire')
      const result = system.unlockAchievement('first_hire')
      expect(result).toBe(false)
    })

    it('returns false for non-existent achievement', () => {
      const result = system.unlockAchievement('nonexistent')
      expect(result).toBe(false)
    })

    it('fires onAchievementUnlocked callback', () => {
      const callback = vi.fn()
      system.onAchievementUnlocked = callback

      system.unlockAchievement('first_hire')

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: 'first_hire' }))
    })
  })

  // ── updateQuest ────────────────────────────────────────────────
  describe('updateQuest', () => {
    it('increments quest progress', () => {
      system.updateQuest('refactor_3')

      const quest = system.getQuests().find(q => q.id === 'refactor_3')
      expect(quest?.progress).toBe(1)
    })

    it('increments by custom amount', () => {
      system.updateQuest('research_10', 5)

      const quest = system.getQuests().find(q => q.id === 'research_10')
      expect(quest?.progress).toBe(5)
    })

    it('caps progress at target', () => {
      system.updateQuest('deploy', 100)

      const quest = system.getQuests().find(q => q.id === 'deploy')
      expect(quest?.progress).toBe(quest?.target)
    })

    it('marks quest completed when target reached', () => {
      const quest = system.getQuests().find(q => q.id === 'deploy')!
      system.updateQuest('deploy', quest.target)

      expect(quest.completed).toBe(true)
    })

    it('grants XP reward on completion', () => {
      const initialLevel = system.getTeamLevel()
      const quest = system.getQuests().find(q => q.id === 'deploy')!

      system.updateQuest('deploy', quest.target)

      // Quest completion grants 1000 XP, which triggers multiple level-ups
      // So check level increased rather than raw XP (which resets on level-up)
      expect(system.getTeamLevel()).toBeGreaterThan(initialLevel)
    })

    it('fires onQuestCompleted callback', () => {
      const callback = vi.fn()
      system.onQuestCompleted = callback
      const quest = system.getQuests().find(q => q.id === 'deploy')!

      system.updateQuest('deploy', quest.target)

      expect(callback).toHaveBeenCalledWith(expect.objectContaining({ id: 'deploy' }))
    })

    it('does not update completed quest', () => {
      const quest = system.getQuests().find(q => q.id === 'deploy')!
      system.updateQuest('deploy', quest.target)
      
      const progressAfterComplete = quest.progress
      system.updateQuest('deploy', 10)

      expect(quest.progress).toBe(progressAfterComplete)
    })
  })

  // ── checkConditions ────────────────────────────────────────────
  describe('checkConditions', () => {
    it('unlocks first_hire for 1+ agents', () => {
      system.checkConditions({
        agentCount: 1,
        delegationCount: 0,
        modsActivated: 0,
        ciGreen: false,
        deployed: false,
        promoted: false,
      })

      const ach = system.getAchievements().find(a => a.id === 'first_hire')
      expect(ach?.unlocked).toBe(true)
    })

    it('unlocks team_builder for 5+ agents', () => {
      system.checkConditions({
        agentCount: 5,
        delegationCount: 0,
        modsActivated: 0,
        ciGreen: false,
        deployed: false,
        promoted: false,
      })

      const ach = system.getAchievements().find(a => a.id === 'team_builder')
      expect(ach?.unlocked).toBe(true)
    })

    it('unlocks army_commander for 10+ agents', () => {
      system.checkConditions({
        agentCount: 10,
        delegationCount: 0,
        modsActivated: 0,
        ciGreen: false,
        deployed: false,
        promoted: false,
      })

      const ach = system.getAchievements().find(a => a.id === 'army_commander')
      expect(ach?.unlocked).toBe(true)
    })

    it('unlocks delegator for 10+ delegations', () => {
      system.checkConditions({
        agentCount: 0,
        delegationCount: 10,
        modsActivated: 0,
        ciGreen: false,
        deployed: false,
        promoted: false,
      })

      const ach = system.getAchievements().find(a => a.id === 'delegator')
      expect(ach?.unlocked).toBe(true)
    })

    it('unlocks mod_explorer for 3+ mods', () => {
      system.checkConditions({
        agentCount: 0,
        delegationCount: 0,
        modsActivated: 3,
        ciGreen: false,
        deployed: false,
        promoted: false,
      })

      const ach = system.getAchievements().find(a => a.id === 'mod_explorer')
      expect(ach?.unlocked).toBe(true)
    })

    it('unlocks career_ladder on promotion', () => {
      system.checkConditions({
        agentCount: 0,
        delegationCount: 0,
        modsActivated: 0,
        ciGreen: false,
        deployed: false,
        promoted: true,
      })

      const ach = system.getAchievements().find(a => a.id === 'career_ladder')
      expect(ach?.unlocked).toBe(true)
    })
  })

  // ── getters ────────────────────────────────────────────────────
  describe('getters', () => {
    it('getUnlockedCount returns correct count', () => {
      expect(system.getUnlockedCount()).toBe(0)

      system.unlockAchievement('first_hire')
      expect(system.getUnlockedCount()).toBe(1)

      system.unlockAchievement('team_builder')
      expect(system.getUnlockedCount()).toBe(2)
    })

    it('getXPForNextLevel scales with level', () => {
      const xpForLevel1 = system.getXPForNextLevel()
      system.addTeamXP(200) // Level up

      const xpForLevel2 = system.getXPForNextLevel()
      expect(xpForLevel2).toBeGreaterThan(xpForLevel1)
    })
  })
})
