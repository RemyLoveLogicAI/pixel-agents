<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/hooks/useOmegaSystems.ts",
  "source_hash": "371af51cac31b882b271f70ca8f1b054b414d3cae828b79358abfb1736d6008d",
  "last_updated": "2026-02-26T19:11:12.253715+00:00",
  "tokens_used": 9226,
  "complexity_score": 5,
  "estimated_review_time_minutes": 15,
  "external_dependencies": [
    "react"
  ]
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [omega](../README.md) > [hooks](./README.md) > **useOmegaSystems**

---

# useOmegaSystems.ts

> **File:** `webview-ui/src/omega/hooks/useOmegaSystems.ts`

![Complexity: Medium](https://img.shields.io/badge/Complexity-Medium-yellow) ![Review Time: 15min](https://img.shields.io/badge/Review_Time-15min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Usage Examples](#usage-examples)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This file defines a custom React hook useOmegaSystems(getOfficeState: () => OfficeState). The hook creates and keeps single instances (via useRef) of HierarchyEngine, ModSystem, GamificationSystem, and OmegaParticleSystem. It exposes a state object (OmegaSystemsState) backed by useState that contains the UI-relevant snapshot: agents, delegations, achievements, quests, mods, activeMods, viewMode, teamLevel, teamXP, xpForNext, delegationCount and a small toast queue. The hook also returns imperative methods (registerAgent, unregisterAgent, dispatchSkill, promoteAgent, toggleMod, processCheatKey, setViewMode, updateSystems, refresh) that call into those systems and then call refresh() to update React state.

The hook integrates systems using an event-driven approach: it assigns callbacks on the HierarchyEngine, ModSystem and GamificationSystem inside a useEffect to respond to events (agent changes, delegations, XP gains, mod activations, achievements, quests, level-ups). Those callbacks call into the particle system (for visual trails and promotion bursts), gamification (to add XP or check achievement/quest conditions), and add toasts to the OmegaSystemsState. The hook uses useCallback to memoize API functions and a toastIdRef + setTimeout to auto-expire toasts after 3 seconds. It expects a getOfficeState function (provided by the caller) so it can look up character coordinates for particle emission when delegations and promotions happen. The useEffect also cleans up by nulling event handlers on unmount.

## Dependencies

### External Dependencies

| Module | Usage |
| --- | --- |
| `react` | Imports useState, useEffect, useRef, useCallback from 'react' to manage component-local state (OmegaSystemsState), lifecycle (wiring/cleanup of system event handlers in useEffect), persistent system instances (useRef), and memoized callbacks for the hook's API (useCallback). |

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../types.js](../../types.js.md) | Type-only import: imports HierarchicalAgent, DelegationChain, Achievement, Quest, GameMod types to describe OmegaSystemsState shape and to type hook returns and state fields. |
| [../types.js](../../types.js.md) | Runtime import: imports ViewMode, OctoCodeSkill, TierLevel, ParticleType enumerations/constants used by the hook implementation (viewMode values, skill dispatching enum, tier levels for registerAgent, particle emission types). |
| [../constants.js](../../constants.js.md) | Imports SKILL_META (used to build toast text and color for dispatched skills), PARTICLE_DELEGATION_COLOR and PARTICLE_PROMOTION_COLOR (colors passed to particle system), XP_PER_TOOL_USE and XP_PER_SKILL_COMPLETE (XP increments applied to GamificationSystem when agents are registered or delegations occur). |
| [../systems/hierarchyEngine.js](../../systems/hierarchyEngine.js.md) | Imports HierarchyEngine class. The hook constructs one instance (new HierarchyEngine()) stored in a ref and calls methods: registerAgent, unregisterAgent, delegateSkill, promoteAgent, getAllAgents, getDelegations, getDelegationCount, update. Also assigns event handlers: onAgentChanged, onDelegation, onXPGained on the HierarchyEngine instance. |
| [../systems/modSystem.js](../../systems/modSystem.js.md) | Imports ModSystem class. The hook constructs one instance (new ModSystem()) stored in a ref and calls methods: getMods, getActiveMods, toggleMod, processKey, update, getUniqueModsActivated. It also assigns event handlers: onModActivated, onModDeactivated, onCheatCodeEntered, onSpecialEvent on the ModSystem instance. |
| [../systems/gamification.js](../../systems/gamification.js.md) | Imports GamificationSystem class. The hook constructs one instance (new GamificationSystem()) stored in a ref and invokes methods: getAchievements, getQuests, addTeamXP, checkConditions, updateQuest, unlockAchievement, getTeamLevel, getTeamXP, getXPForNextLevel. It wires GamificationSystem callbacks: onAchievementUnlocked, onQuestCompleted, onLevelUp. |
| [../systems/particleSystem.js](../../systems/particleSystem.js.md) | Imports OmegaParticleSystem class. The hook constructs one instance (new OmegaParticleSystem()) stored in a ref and calls addTrail, emit, and update to produce delegation trails and promotion particle bursts triggered by events from hierarchy and gamification flows. |
| [../../office/engine/officeState.js](../../../office/engine/officeState.js.md) | Type-only import for OfficeState used to type the getOfficeState parameter passed into the hook. getOfficeState() is invoked by the hook (not imported directly) to look up Office characters (positions) for particles when delegations or promotions occur. |

## 📁 Directory

This file is part of the **hooks** directory. View the [directory index](_docs/webview-ui/src/omega/hooks/README.md) to see all files in this module.

## Architecture Notes

- Implements an event-driven/observer integration: the hook assigns callbacks on HierarchyEngine, ModSystem and GamificationSystem instances so those systems push changes (delegations, mod activations, XP, achievements) back into the React state via refresh().
- Uses React refs to hold long-lived non-reactive system instances (HierarchyEngine, ModSystem, GamificationSystem, OmegaParticleSystem). This avoids re-creating systems on each render and keeps imperative APIs reachable for external callers.
- State is stored in a single object (OmegaSystemsState) managed by useState and updated via a refresh() callback which reads snapshot data from each system instance. The hook exposes both state (for rendering) and imperative methods (for user actions).
- Toast lifecycle is implemented with a numeric id ref (toastIdRef) and setTimeout to auto-remove toasts after 3 seconds. Note: timeouts are not tracked per-toast and are not cleared on unmount in the current implementation.
- updateSystems(dt) is designed to be called from the game loop / tick handler to advance the HierarchyEngine (update), ModSystem (update), and particle system (update) with a delta-time parameter where applicable.

## Usage Examples

### Register an agent when OfficeState creates a character

Call registerAgent(id: number, tier: TierLevel, name: string, parentId?: number). The function calls hierarchyRef.current.registerAgent(id, tier, name, parentId ?? null), grants XP via gamifRef.current.addTeamXP(XP_PER_TOOL_USE), triggers gamifRef.current.checkConditions(...) to evaluate achievements/quests, and then calls refresh() to update the React state snapshot (agents, delegationCount, team level/xp etc.). Expected side effects: HierarchyEngine will hold the new agent, gamification may unlock achievements/quests, and UI state will reflect the new agent list.

### Dispatch a skill from an agent and handle delegation

Call dispatchSkill(agentId: number, skill: OctoCodeSkill). The hook asks hierarchyRef.current.delegateSkill(agentId, skill); if a DelegationChain is returned it creates a toast using SKILL_META[skill] (icon, label, color), and if skill === OctoCodeSkill.RESEARCH it calls gamifRef.current.updateQuest('research_10'). After that it calls refresh(). If delegation occurred, the HierarchyEngine's onDelegation handler (wired in useEffect) will add a particle trail using coordinates from getOfficeState(), add team XP (XP_PER_SKILL_COMPLETE), and call gamifRef.current.checkConditions(...) before refresh() — resulting in UI updates, particle effects, and possible gamification state changes.

## Maintenance Notes

- Performance: particleRef.current.update(dt) and hierarchyRef.current.update(dt) are intended to be called each tick. If updateSystems is called at a very high frequency, particle processing could be a CPU hotspot; consider throttling or culling off-screen particle activity.
- Toasts: setTimeout is used to auto-remove toasts but timeouts are not tracked/cancelled on unmount. On component unmount, pending timeouts may run and call setState on an unmounted component; consider clearing timeouts on cleanup or using a mounted flag before calling setState in the timeout callback.
- Event cleanup: the effect cleans up by assigning null to each system's callbacks on unmount. This prevents leaks from system events but relies on those systems honoring a null handler. If system implementations change, ensure they still support nulling handlers.
- Testing: unit tests should stub the underlying systems (HierarchyEngine, ModSystem, GamificationSystem, OmegaParticleSystem) to verify that registerAgent/dispatchSkill/promoteAgent produce the expected calls (registerAgent, delegateSkill, promoteAgent) and that refresh updates OmegaSystemsState. Also test the toasts queue (max size logic via slice(-4)) and auto-expiry.
- Enhancements: expose a way to cancel pending toast timeouts, debounce refresh to avoid excessive state updates when many events fire rapidly, and add stronger null/undefined guards around getOfficeState() usage for robustness.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/hooks/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
