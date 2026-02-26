// Omega Gamification — XP, achievements, quests
import type { Achievement, Quest } from '../types.js'
import { DEFAULT_ACHIEVEMENTS, DEFAULT_QUESTS } from '../constants.js'

export class GamificationSystem {
  private achievements: Achievement[]
  private quests: Quest[]
  private teamXP = 0
  private teamLevel = 1

  onAchievementUnlocked: ((ach: Achievement) => void) | null = null
  onQuestCompleted: ((quest: Quest) => void) | null = null
  onLevelUp: ((level: number) => void) | null = null

  constructor() {
    this.achievements = DEFAULT_ACHIEVEMENTS.map(a => ({ ...a }))
    this.quests = DEFAULT_QUESTS.map(q => ({ ...q }))
  }

  /** Add XP to team pool and check level-up */
  addTeamXP(amount: number): void {
    this.teamXP += amount
    const xpForLevel = () => Math.floor(100 * Math.pow(1.2, this.teamLevel - 1))
    while (this.teamXP >= xpForLevel()) {
      this.teamXP -= xpForLevel()
      this.teamLevel++
      this.onLevelUp?.(this.teamLevel)
      // Check level achievement
      if (this.teamLevel >= 10) this.unlockAchievement('lvl10')
    }
  }

  /** Check and unlock an achievement by ID */
  unlockAchievement(id: string): boolean {
    const ach = this.achievements.find(a => a.id === id)
    if (!ach || ach.unlocked) return false
    ach.unlocked = true
    ach.unlockedAt = Date.now()
    this.onAchievementUnlocked?.(ach)
    return true
  }

  /** Update quest progress */
  updateQuest(id: string, increment = 1): void {
    const quest = this.quests.find(q => q.id === id)
    if (!quest || quest.completed) return
    quest.progress = Math.min(quest.target, quest.progress + increment)
    if (quest.progress >= quest.target) {
      quest.completed = true
      this.addTeamXP(quest.xpReward)
      this.onQuestCompleted?.(quest)
    }
  }

  /** Check conditions based on current state */
  checkConditions(state: {
    agentCount: number
    delegationCount: number
    modsActivated: number
    ciGreen: boolean
    deployed: boolean
    promoted: boolean
  }): void {
    if (state.agentCount >= 1) this.unlockAchievement('first_hire')
    if (state.agentCount >= 5) this.unlockAchievement('team_builder')
    if (state.agentCount >= 10) this.unlockAchievement('army_commander')
    if (state.promoted) this.unlockAchievement('career_ladder')
    if (state.delegationCount >= 10) this.unlockAchievement('delegator')
    if (state.ciGreen) this.unlockAchievement('green_suite')
    if (state.deployed) this.unlockAchievement('ship_it')
    if (state.modsActivated >= 3) this.unlockAchievement('mod_explorer')
  }

  getAchievements(): Achievement[] { return this.achievements }
  getUnlockedCount(): number { return this.achievements.filter(a => a.unlocked).length }
  getQuests(): Quest[] { return this.quests }
  getTeamXP(): number { return this.teamXP }
  getTeamLevel(): number { return this.teamLevel }
  getXPForNextLevel(): number { return Math.floor(100 * Math.pow(1.2, this.teamLevel - 1)) }
}
