// Omega v2 ULTRA: Gamification System
// XP, Quests, Achievements tied to real development outcomes

import { HierarchicalAgent, AgentTier, OctoCodeSkill, TIER_CONFIGS } from './types.js';
import { HierarchyEngine } from './HierarchyEngine.js';

export interface PlayerProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  totalXP: number;
  streakDays: number;
  lastActive: number;
  achievements: string[];
  questProgress: Record<string, number>;
  stats: PlayerStats;
}

export interface PlayerStats {
  agentsSpawned: number;
  agentsPromoted: number;
  skillsDelegated: number;
  tasksCompleted: number;
  modsActivated: number;
  cheatCodesUsed: number;
  timeInZenMode: number; // seconds
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  condition: (profile: PlayerProfile, stats: PlayerStats) => boolean;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  target: number;
  metric: QuestMetric;
  tier?: AgentTier; // Optional: specific tier required
}

export enum QuestMetric {
  SPAWN_AGENTS = 'spawnAgents',
  PROMOTE_AGENTS = 'promoteAgents',
  DELEGATE_SKILLS = 'delegateSkills',
  COMPLETE_TASKS = 'completeTasks',
  ACTIVATE_MODS = 'activateMods',
  USE_CHEAT_CODES = 'useCheatCodes',
  MAINTAIN_STREAK = 'maintainStreak',
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_spawn',
    name: 'First Hire',
    description: 'Spawn your first agent',
    emoji: '🎯',
    xpReward: 100,
    condition: (p, s) => s.agentsSpawned >= 1,
  },
  {
    id: 'team_builder',
    name: 'Team Builder',
    description: 'Spawn 10 agents',
    emoji: '👥',
    xpReward: 500,
    condition: (p, s) => s.agentsSpawned >= 10,
  },
  {
    id: 'army_commander',
    name: 'Army Commander',
    description: 'Spawn 50 agents',
    emoji: '🎖️',
    xpReward: 2000,
    condition: (p, s) => s.agentsSpawned >= 50,
  },
  {
    id: 'first_promotion',
    name: 'Career Ladder',
    description: 'Promote your first agent',
    emoji: '📈',
    xpReward: 200,
    condition: (p, s) => s.agentsPromoted >= 1,
  },
  {
    id: 'talent_scout',
    name: 'Talent Scout',
    description: 'Promote 10 agents',
    emoji: '⭐',
    xpReward: 1000,
    condition: (p, s) => s.agentsPromoted >= 10,
  },
  {
    id: 'delegator',
    name: 'Delegator',
    description: 'Delegate 25 skills',
    emoji: '📋',
    xpReward: 300,
    condition: (p, s) => s.skillsDelegated >= 25,
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    description: 'Delegate 100 skills',
    emoji: '🎼',
    xpReward: 1500,
    condition: (p, s) => s.skillsDelegated >= 100,
  },
  {
    id: 'mod_explorer',
    name: 'Mod Explorer',
    description: 'Activate all 6 mods',
    emoji: '🎮',
    xpReward: 1000,
    condition: (p, s) => s.modsActivated >= 6,
  },
  {
    id: 'cheater',
    name: 'Cheat Codes',
    description: 'Use 5 cheat codes',
    emoji: '🔓',
    xpReward: 500,
    condition: (p, s) => s.cheatCodesUsed >= 5,
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Spend 1 hour in Zen mode',
    emoji: '🧘',
    xpReward: 2000,
    condition: (p, s) => s.timeInZenMode >= 3600,
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: '3-day active streak',
    emoji: '🔥',
    xpReward: 300,
    condition: (p) => p.streakDays >= 3,
  },
  {
    id: 'streak_7',
    name: 'Dedicated',
    description: '7-day active streak',
    emoji: '🔥🔥',
    xpReward: 1000,
    condition: (p) => p.streakDays >= 7,
  },
  {
    id: 'streak_30',
    name: 'Legendary',
    description: '30-day active streak',
    emoji: '🔥🔥🔥',
    xpReward: 5000,
    condition: (p) => p.streakDays >= 30,
  },
  {
    id: 'boss_tier',
    name: 'Executive',
    description: 'Spawn a Boss-tier agent',
    emoji: '👔',
    xpReward: 500,
    condition: (p) => p.stats.agentsSpawned > 0, // Simplified - would check tier
  },
  {
    id: 'max_level',
    name: 'Max Level',
    description: 'Reach level 50',
    emoji: '🏆',
    xpReward: 10000,
    condition: (p) => p.level >= 50,
  },
];

export const QUESTS: Quest[] = [
  {
    id: 'daily_spawn',
    name: 'Daily Hiring',
    description: 'Spawn 5 agents today',
    emoji: '📅',
    xpReward: 200,
    target: 5,
    metric: QuestMetric.SPAWN_AGENTS,
  },
  {
    id: 'daily_delegate',
    name: 'Task Master',
    description: 'Delegate 10 skills today',
    emoji: '📋',
    xpReward: 300,
    target: 10,
    metric: QuestMetric.DELEGATE_SKILLS,
  },
  {
    id: 'promote_interns',
    name: 'Intern Development',
    description: 'Promote 3 interns to employees',
    emoji: '📎➡️💻',
    xpReward: 500,
    target: 3,
    metric: QuestMetric.PROMOTE_AGENTS,
    tier: AgentTier.INTERN,
  },
  {
    id: 'boss_planning',
    name: 'Strategic Planning',
    description: 'Execute /plan skill 5 times',
    emoji: '👔📊',
    xpReward: 400,
    target: 5,
    metric: QuestMetric.DELEGATE_SKILLS,
    tier: AgentTier.BOSS,
  },
  {
    id: 'swarm_mode',
    name: 'Swarm Challenge',
    description: 'Activate SWARM mode and spawn 20 agents',
    emoji: '🐝',
    xpReward: 800,
    target: 20,
    metric: QuestMetric.SPAWN_AGENTS,
  },
];

// XP required for each level (exponential curve)
export function xpForLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.2, level - 1));
}

export function levelFromXP(xp: number): number {
  let level = 1;
  let required = xpForLevel(level);
  while (xp >= required) {
    xp -= required;
    level++;
    required = xpForLevel(level);
  }
  return level;
}

export class GamificationSystem {
  private profile: PlayerProfile;
  private engine: HierarchyEngine;

  onAchievementUnlocked: ((achievement: Achievement) => void) | null = null;
  onQuestCompleted: ((quest: Quest) => void) | null = null;
  onLevelUp: ((newLevel: number) => void) | null = null;
  onXPGained: ((amount: number, total: number) => void) | null = null;

  constructor(engine: HierarchyEngine, playerId: string, playerName: string) {
    this.engine = engine;
    this.profile = {
      id: playerId,
      name: playerName,
      level: 1,
      xp: 0,
      totalXP: 0,
      streakDays: 0,
      lastActive: Date.now(),
      achievements: [],
      questProgress: {},
      stats: {
        agentsSpawned: 0,
        agentsPromoted: 0,
        skillsDelegated: 0,
        tasksCompleted: 0,
        modsActivated: 0,
        cheatCodesUsed: 0,
        timeInZenMode: 0,
      },
    };

    this.updateStreak();
  }

  // XP Management
  gainXP(amount: number, source: string): void {
    const oldLevel = this.profile.level;
    this.profile.xp += amount;
    this.profile.totalXP += amount;

    // Check for level up
    const newLevel = levelFromXP(this.profile.totalXP);
    if (newLevel > oldLevel) {
      this.profile.level = newLevel;
      this.onLevelUp?.(newLevel);
    }

    this.onXPGained?.(amount, this.profile.totalXP);
  }

  // Event Handlers
  onAgentSpawned(tier: AgentTier): void {
    this.profile.stats.agentsSpawned++;
    this.gainXP(10 * (4 - tier), 'spawn'); // Higher tier = more XP
    this.checkAchievements();
    this.updateQuestProgress(QuestMetric.SPAWN_AGENTS);
  }

  onAgentPromoted(fromTier: AgentTier): void {
    this.profile.stats.agentsPromoted++;
    this.gainXP(50 * (4 - fromTier), 'promote');
    this.checkAchievements();
    this.updateQuestProgress(QuestMetric.PROMOTE_AGENTS);
  }

  onSkillDelegated(skill: OctoCodeSkill): void {
    this.profile.stats.skillsDelegated++;
    this.gainXP(5, 'delegate');
    this.checkAchievements();
    this.updateQuestProgress(QuestMetric.DELEGATE_SKILLS);
  }

  onTaskCompleted(): void {
    this.profile.stats.tasksCompleted++;
    this.gainXP(20, 'task');
    this.checkAchievements();
    this.updateQuestProgress(QuestMetric.COMPLETE_TASKS);
  }

  onModActivated(): void {
    this.profile.stats.modsActivated++;
    this.gainXP(100, 'mod');
    this.checkAchievements();
    this.updateQuestProgress(QuestMetric.ACTIVATE_MODS);
  }

  onCheatCodeUsed(): void {
    this.profile.stats.cheatCodesUsed++;
    this.gainXP(50, 'cheat');
    this.checkAchievements();
    this.updateQuestProgress(QuestMetric.USE_CHEAT_CODES);
  }

  // Achievement System
  private checkAchievements(): void {
    for (const achievement of ACHIEVEMENTS) {
      if (this.profile.achievements.includes(achievement.id)) continue;
      
      if (achievement.condition(this.profile, this.profile.stats)) {
        this.unlockAchievement(achievement);
      }
    }
  }

  private unlockAchievement(achievement: Achievement): void {
    this.profile.achievements.push(achievement.id);
    this.gainXP(achievement.xpReward, `achievement:${achievement.id}`);
    this.onAchievementUnlocked?.(achievement);
  }

  // Quest System
  private updateQuestProgress(metric: QuestMetric, amount: number = 1): void {
    for (const quest of QUESTS) {
      if (quest.metric !== metric) continue;
      
      const current = this.profile.questProgress[quest.id] || 0;
      const updated = Math.min(quest.target, current + amount);
      this.profile.questProgress[quest.id] = updated;

      if (updated >= quest.target && current < quest.target) {
        this.completeQuest(quest);
      }
    }
  }

  private completeQuest(quest: Quest): void {
    this.gainXP(quest.xpReward, `quest:${quest.id}`);
    this.onQuestCompleted?.(quest);
  }

  // Streak Management
  private updateStreak(): void {
    const now = Date.now();
    const lastActive = this.profile.lastActive;
    const dayInMs = 24 * 60 * 60 * 1000;

    const daysSinceLastActive = Math.floor((now - lastActive) / dayInMs);

    if (daysSinceLastActive === 1) {
      // Consecutive day
      this.profile.streakDays++;
      this.gainXP(50 * this.profile.streakDays, 'streak');
    } else if (daysSinceLastActive > 1) {
      // Streak broken
      this.profile.streakDays = 1;
    }

    this.profile.lastActive = now;
    this.checkAchievements();
  }

  // Daily Quest Reset
  resetDailyQuests(): void {
    const dailyQuests = QUESTS.filter(q => q.id.startsWith('daily_'));
    for (const quest of dailyQuests) {
      delete this.profile.questProgress[quest.id];
    }
  }

  // Getters
  getProfile(): PlayerProfile {
    return { ...this.profile };
  }

  getLevel(): number {
    return this.profile.level;
  }

  getXP(): number {
    return this.profile.xp;
  }

  getTotalXP(): number {
    return this.profile.totalXP;
  }

  getXPTONextLevel(): number {
    const currentLevelXP = xpForLevel(this.profile.level);
    return currentLevelXP - this.profile.xp;
  }

  getXPProgress(): number {
    const currentLevelXP = xpForLevel(this.profile.level);
    const prevLevelXP = xpForLevel(this.profile.level - 1);
    const levelProgress = this.profile.totalXP - prevLevelXP;
    const levelRange = currentLevelXP - prevLevelXP;
    return levelProgress / levelRange;
  }

  getAchievements(): string[] {
    return [...this.profile.achievements];
  }

  getQuestProgress(): Record<string, number> {
    return { ...this.profile.questProgress };
  }

  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => this.profile.achievements.includes(a.id));
  }

  getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a => !this.profile.achievements.includes(a.id));
  }

  getActiveQuests(): { quest: Quest; progress: number; completed: boolean }[] {
    return QUESTS.map(quest => {
      const progress = this.profile.questProgress[quest.id] || 0;
      return {
        quest,
        progress,
        completed: progress >= quest.target,
      };
    });
  }

  // Persistence
  serialize(): string {
    return JSON.stringify(this.profile);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.profile = { ...this.profile, ...parsed };
  }
}
