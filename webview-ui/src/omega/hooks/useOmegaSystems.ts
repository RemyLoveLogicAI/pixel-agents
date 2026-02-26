// useOmegaSystems — Initialize and manage all omega v2 systems
import { useState, useEffect, useRef, useCallback } from 'react'
import type { HierarchicalAgent, DelegationChain, Achievement, Quest, GameMod } from '../types.js'
import { ViewMode, OctoCodeSkill, TierLevel, ParticleType } from '../types.js'
import { SKILL_META, PARTICLE_DELEGATION_COLOR, PARTICLE_PROMOTION_COLOR, XP_PER_TOOL_USE, XP_PER_SKILL_COMPLETE } from '../constants.js'
import { HierarchyEngine } from '../systems/hierarchyEngine.js'
import { ModSystem } from '../systems/modSystem.js'
import { GamificationSystem } from '../systems/gamification.js'
import { OmegaParticleSystem } from '../systems/particleSystem.js'
import type { OfficeState } from '../../office/engine/officeState.js'

export interface OmegaSystemsState {
  agents: HierarchicalAgent[]
  delegations: DelegationChain[]
  achievements: Achievement[]
  quests: Quest[]
  mods: GameMod[]
  activeMods: GameMod[]
  viewMode: ViewMode
  teamLevel: number
  teamXP: number
  xpForNext: number
  delegationCount: number
  toasts: ToastMessage[]
}

export interface ToastMessage {
  id: number
  text: string
  color: string
  timestamp: number
}

export function useOmegaSystems(getOfficeState: () => OfficeState) {
  const hierarchyRef = useRef(new HierarchyEngine())
  const modRef = useRef(new ModSystem())
  const gamifRef = useRef(new GamificationSystem())
  const particleRef = useRef(new OmegaParticleSystem())
  const toastIdRef = useRef(0)

  const [state, setState] = useState<OmegaSystemsState>({
    agents: [],
    delegations: [],
    achievements: gamifRef.current.getAchievements(),
    quests: gamifRef.current.getQuests(),
    mods: modRef.current.getMods(),
    activeMods: [],
    viewMode: ViewMode.OFFICE,
    teamLevel: 1,
    teamXP: 0,
    xpForNext: 100,
    delegationCount: 0,
    toasts: [],
  })

  const refresh = useCallback(() => {
    const h = hierarchyRef.current
    const g = gamifRef.current
    const m = modRef.current
    setState(prev => ({
      ...prev,
      agents: h.getAllAgents(),
      delegations: h.getDelegations(),
      achievements: g.getAchievements(),
      quests: g.getQuests(),
      mods: m.getMods(),
      activeMods: m.getActiveMods(),
      teamLevel: g.getTeamLevel(),
      teamXP: g.getTeamXP(),
      xpForNext: g.getXPForNextLevel(),
      delegationCount: h.getDelegationCount(),
    }))
  }, [])

  const addToast = useCallback((text: string, color: string) => {
    const id = toastIdRef.current++
    setState(prev => ({
      ...prev,
      toasts: [...prev.toasts.slice(-4), { id, text, color, timestamp: Date.now() }],
    }))
    // Auto-remove after 3s
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        toasts: prev.toasts.filter(t => t.id !== id),
      }))
    }, 3000)
  }, [])

  // Wire up event callbacks
  useEffect(() => {
    const h = hierarchyRef.current
    const m = modRef.current
    const g = gamifRef.current

    h.onAgentChanged = () => refresh()
    h.onDelegation = (chain) => {
      // Create particle trail
      const os = getOfficeState()
      const fromCh = os.characters.get(chain.fromId)
      const toCh = os.characters.get(chain.toId)
      if (fromCh && toCh && chain.fromId !== chain.toId) {
        particleRef.current.addTrail(fromCh.x, fromCh.y, toCh.x, toCh.y, PARTICLE_DELEGATION_COLOR, ParticleType.DELEGATION)
      }
      g.addTeamXP(XP_PER_SKILL_COMPLETE)
      g.checkConditions({
        agentCount: h.getAllAgents().length,
        delegationCount: h.getDelegationCount(),
        modsActivated: m.getUniqueModsActivated(),
        ciGreen: false,
        deployed: false,
        promoted: false,
      })
      refresh()
    }
    h.onXPGained = () => refresh()

    m.onModActivated = (mod) => {
      addToast(`MOD ACTIVATED: ${mod.name}`, mod.color)
      g.checkConditions({
        agentCount: h.getAllAgents().length,
        delegationCount: h.getDelegationCount(),
        modsActivated: m.getUniqueModsActivated(),
        ciGreen: false,
        deployed: false,
        promoted: false,
      })
      refresh()
    }
    m.onModDeactivated = (mod) => {
      addToast(`MOD EXPIRED: ${mod.name}`, '#666')
      refresh()
    }
    m.onCheatCodeEntered = (code) => {
      g.unlockAchievement('cheater')
      addToast(`CHEAT: ${code}`, '#ff00cc')
      refresh()
    }
    m.onSpecialEvent = (event) => {
      addToast(`EVENT: ${event.toUpperCase()}`, '#00ff88')
    }

    g.onAchievementUnlocked = (ach) => {
      addToast(`ACHIEVEMENT: ${ach.icon} ${ach.name}`, '#ffd700')
      refresh()
    }
    g.onQuestCompleted = (quest) => {
      addToast(`QUEST COMPLETE: ${quest.name} (+${quest.xpReward}XP)`, '#00ff88')
      refresh()
    }
    g.onLevelUp = (level) => {
      addToast(`LEVEL UP! Team LV.${level}`, '#ffd700')
      refresh()
    }

    return () => {
      h.onAgentChanged = null
      h.onDelegation = null
      h.onXPGained = null
      m.onModActivated = null
      m.onModDeactivated = null
      m.onCheatCodeEntered = null
      m.onSpecialEvent = null
      g.onAchievementUnlocked = null
      g.onQuestCompleted = null
      g.onLevelUp = null
    }
  }, [getOfficeState, refresh, addToast])

  // Register agent in hierarchy when created in OfficeState
  const registerAgent = useCallback((id: number, tier: TierLevel, name: string, parentId?: number) => {
    hierarchyRef.current.registerAgent(id, tier, name, parentId ?? null)
    gamifRef.current.addTeamXP(XP_PER_TOOL_USE)
    gamifRef.current.checkConditions({
      agentCount: hierarchyRef.current.getAllAgents().length,
      delegationCount: hierarchyRef.current.getDelegationCount(),
      modsActivated: modRef.current.getUniqueModsActivated(),
      ciGreen: false,
      deployed: false,
      promoted: false,
    })
    refresh()
  }, [refresh])

  const unregisterAgent = useCallback((id: number) => {
    hierarchyRef.current.unregisterAgent(id)
    refresh()
  }, [refresh])

  const dispatchSkill = useCallback((agentId: number, skill: OctoCodeSkill) => {
    const chain = hierarchyRef.current.delegateSkill(agentId, skill)
    if (chain) {
      const meta = SKILL_META[skill]
      addToast(`${meta.icon} ${meta.label} dispatched`, meta.color)
      // Update quest
      if (skill === OctoCodeSkill.RESEARCH) {
        gamifRef.current.updateQuest('research_10')
      }
    }
    refresh()
    return chain
  }, [refresh, addToast])

  const promoteAgent = useCallback((agentId: number) => {
    const os = getOfficeState()
    const ch = os.characters.get(agentId)
    const success = hierarchyRef.current.promoteAgent(agentId)
    if (success && ch) {
      particleRef.current.emit(ch.x, ch.y, PARTICLE_PROMOTION_COLOR, 20, ParticleType.PROMOTION)
      addToast('PROMOTED!', '#ffd700')
      gamifRef.current.checkConditions({
        agentCount: hierarchyRef.current.getAllAgents().length,
        delegationCount: hierarchyRef.current.getDelegationCount(),
        modsActivated: modRef.current.getUniqueModsActivated(),
        ciGreen: false,
        deployed: false,
        promoted: true,
      })
    }
    refresh()
    return success
  }, [getOfficeState, refresh, addToast])

  const toggleMod = useCallback((modId: string) => {
    modRef.current.toggleMod(modId)
    refresh()
  }, [refresh])

  const processCheatKey = useCallback((key: string) => {
    modRef.current.processKey(key)
  }, [])

  const setViewMode = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }))
  }, [])

  // Update systems on tick (called from game loop)
  const updateSystems = useCallback((dt: number) => {
    hierarchyRef.current.update(dt)
    modRef.current.update()
    particleRef.current.update(dt)
  }, [])

  return {
    state,
    hierarchy: hierarchyRef.current,
    particles: particleRef.current,
    modSystem: modRef.current,
    gamification: gamifRef.current,
    registerAgent,
    unregisterAgent,
    dispatchSkill,
    promoteAgent,
    toggleMod,
    processCheatKey,
    setViewMode,
    updateSystems,
    refresh,
  }
}
