<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/hooks/useExtensionMessages.ts",
  "source_hash": "72aed00362e3af8a01fc051d5a485554e3f0dcfec198ecf9e42ab596054b480e",
  "last_updated": "2026-02-26T19:07:33.715796+00:00",
  "tokens_used": 17248,
  "complexity_score": 5,
  "estimated_review_time_minutes": 20,
  "external_dependencies": [
    "react"
  ]
}
```

</details>

[Documentation Home](../../../README.md) > [webview-ui](../../README.md) > [src](../README.md) > [hooks](./README.md) > **useExtensionMessages**

---

# useExtensionMessages.ts

> **File:** `webview-ui/src/hooks/useExtensionMessages.ts`

![Complexity: Medium](https://img.shields.io/badge/Complexity-Medium-yellow) ![Review Time: 20min](https://img.shields.io/badge/Review_Time-20min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Usage Examples](#usage-examples)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This file provides a single React hook, useExtensionMessages, plus two small helper functions (pickTier and saveAgentSeats) and several TypeScript interfaces describing payload shapes. The hook wires a window 'message' event listener that decodes a set of well-known message types (layoutLoaded, agentCreated, agentClosed, agentToolStart, subagentToolStart, furnitureAssetsLoaded, characterSpritesLoaded, floorTilesLoaded, wallTilesLoaded, settingsLoaded, etc.). Based on those messages it updates React state (agents, selectedAgent, agentTools, agentStatuses, subagentTools, subagentCharacters, layoutReady, loadedAssets) and calls methods on the OfficeState instance (provided by the getOfficeState callback) to mutate the in-memory office model (addAgent/removeAgent/addSubagent/removeSubagent/setAgentTool/setAgentActive/rebuildFromLayout/clearPermissionBubble/removeAllSubagents). The hook also posts a single 'webviewReady' message to the extension host when initialized and uses vscode.postMessage to send agent seat snapshots back to the host via saveAgentSeats.

Key design decisions: the code buffers incoming agent IDs (pendingAgents) until the layout is loaded to ensure seat assignments are applied after seats are built by layout processing; layoutLoaded handling migrates v1 layouts using migrateLayoutColors before calling OfficeState.rebuildFromLayout; furniture asset payloads are immediately fed into buildDynamicCatalog so catalog lookups work even before layout arrives. The module treats OmegaCallbacks (omega) as an optional callback set used to register/unregister agents in an external hierarchy; pickTier implements a simple distribution heuristic that favors one BOSS then balances SUPERVISOR/EMPLOYEE/INTERN counts. Error handling is minimal and localized (a try/catch around furniture asset processing), and cleanup removes the window message listener on unmount.

## Dependencies

### External Dependencies

| Module | Usage |
| --- | --- |
| `react` | Imports useState, useEffect, useRef from 'react' to implement the custom hook useExtensionMessages: useState holds agents/selectedAgent/agentTools/agentStatuses/subagentTools/subagentCharacters/layoutReady/loadedAssets; useEffect registers and cleans up the window 'message' event handler and posts 'webviewReady'; useRef is used for layoutReadyRef to avoid re-renders when tracking whether the initial layout was applied. |

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../office/engine/officeState.js](../../office/engine/officeState.js.md) | Type import: OfficeState is used as the type of the getOfficeState callback return value and is referenced in helper functions (pickTier, saveAgentSeats) and throughout the message handler to call runtime methods such as rebuildFromLayout, addAgent, removeAgent, addSubagent, removeSubagent, removeAllSubagents, setAgentTool, setAgentActive, showPermissionBubble, clearPermissionBubble, getSubagentId, getLayout, and access characters and subagentMeta maps. |
| [../office/types.js](../../office/types.js.md) | Type import: OfficeLayout and ToolActivity are used to type the onLayoutLoaded parameter and tool activity lists stored in hook state (agentTools and subagentTools). |
| [../office/toolUtils.js](../../office/toolUtils.js.md) | Imports extractToolName which is called when a tool status string arrives (agentToolStart/subagentToolStart) to derive a tool name for OfficeState.setAgentTool. |
| [../office/layout/layoutSerializer.js](../../office/layout/layoutSerializer.js.md) | Imports migrateLayoutColors and is used when receiving a layoutLoaded message. If the incoming layout has version === 1, migrateLayoutColors(layout) is called to convert colors before rebuilding the OfficeState from the layout. |
| [../office/layout/furnitureCatalog.js](../../office/layout/furnitureCatalog.js.md) | Imports buildDynamicCatalog and calls it inside the furnitureAssetsLoaded message handler with the received catalog and sprites so getCatalogEntry()/catalog lookups can work before layoutLoaded arrives. |
| [../office/floorTiles.js](../../office/floorTiles.js.md) | Imports setFloorSprites which is invoked when a floorTilesLoaded message arrives to populate floor tile sprite patterns into the Office module. |
| [../office/wallTiles.js](../../office/wallTiles.js.md) | Imports setWallSprites which is invoked when a wallTilesLoaded message arrives to populate wall tile sprite data into the Office module. |
| [../office/sprites/spriteData.js](../../office/sprites/spriteData.js.md) | Imports setCharacterTemplates which is called in the characterSpritesLoaded handler to register pre-colored character sprites with the Office sprite system. |
| [../vscodeApi.js](../../vscodeApi.js.md) | Imports vscode and uses vscode.postMessage in saveAgentSeats and once on hook initialization to notify the extension host of 'webviewReady' and to post saved agent seat metadata back to the extension under type 'saveAgentSeats'. |
| [../notificationSound.js](../../notificationSound.js.md) | Imports playDoneSound and setSoundEnabled. setSoundEnabled is used in the settingsLoaded handler to turn notification sounds on/off; playDoneSound is invoked when an agentStatus message value equals 'waiting' to play a completion/notification sound. |
| [../omega/types.js](../../omega/types.js.md) | Imports TierLevel which pickTier uses to choose TierLevel enums (BOSS, SUPERVISOR, EMPLOYEE, INTERN) for new agent registration and which is passed to omega.registerAgent when registering agents or subagents. |

## 📁 Directory

This file is part of the **hooks** directory. View the [directory index](_docs/webview-ui/src/hooks/README.md) to see all files in this module.

## Architecture Notes

- Implements an event-driven observer pattern: a single window 'message' handler switches on msg.type to translate extension messages into OfficeState mutations and React state updates. The hook registers the listener in a useEffect and returns a cleanup function to remove it on unmount.
- State management: local UI state is managed with React useState for agent lists, selections, tools, statuses, subagent metadata, layout readiness, and loaded assets. layoutReadyRef (useRef) tracks the initial layout application without forcing re-renders. getOfficeState is a callback that yields the authoritative OfficeState instance for all in-memory model changes.
- Message processing flow: messages are handled synchronously in the handler; some handlers mutate OfficeState (rebuildFromLayout, add/remove agents/subagents, set tools/active flags) and then update React state. Furniture assets are processed with buildDynamicCatalog inside a try/catch so failures don't break the message loop.
- Agent lifecycle integration: optional OmegaCallbacks (omega) allows external registration/unregistration of agents. pickTier uses the OfficeState.characters map to compute a tier distribution and choose a TierLevel for new agents. Agent seat metadata is collected and sent back to the extension host with vscode.postMessage.
- Error handling approach is minimal: only furnitureAssetsLoaded is wrapped in a try/catch. Other message handlers assume well-formed messages; defensive checks exist (e.g., guard clauses when expected tool lists are absent).

## Usage Examples

### Webview initialization and initial layout load

When the hook mounts it posts a 'webviewReady' message to the host. The extension typically responds with 'layoutLoaded' and possibly 'existingAgents' and asset messages. On 'layoutLoaded' the handler optionally migrates the layout via migrateLayoutColors (for v1 layouts), calls os.rebuildFromLayout(layout) and invokes onLayoutLoaded(layout). Any agents buffered in pendingAgents (received earlier via 'existingAgents') are then added to the OfficeState via os.addAgent; layoutReadyRef is set to true and layoutReady state toggled to true. If OfficeState.characters is non-empty the hook sends seat metadata to the host via vscode.postMessage { type: 'saveAgentSeats', seats }.

### Agent tool lifecycle with subagent creation

On 'agentToolStart' the handler adds an entry to agentTools state for that agent (unless duplicate), extracts a tool name via extractToolName and calls os.setAgentTool and os.setAgentActive(true). If the status string begins with 'Subtask:' a sub-agent character is created using os.addSubagent(agentId, toolId), added to subagentCharacters state, and the subagent is registered with OmegaCallbacks (omega.registerAgent) as an INTERN tier with parentId set to the main agent. When the corresponding 'agentToolDone' arrives the hook marks the tool done flag in agentTools. Permission-related messages set permissionWait flags on ToolActivity objects and show/clear permission bubbles via OfficeState methods.

## Maintenance Notes

- Concurrency and stale closures: pickTier is called inside the message handler and uses the agents array from the hook closure. The effect's dependency array includes agents to keep pickTier in sync; ensure tests include scenarios with rapidly arriving agentCreated events to validate the distribution logic.
- Message volume and performance: a single message handler performs many OfficeState mutations synchronously. If message frequency is high (many tool updates), consider batching state updates or debouncing UI updates to avoid re-render thrashing.
- Edge cases and robustness: many handlers assume msg payload fields are present. Add explicit validation for message shapes (e.g., guard for missing toolId, parentToolId) to avoid silent no-ops. The only try/catch present covers furniture asset processing; consider adding logging and error propagation for other critical handlers.
- Testing guidance: unit tests should simulate window.postMessage events with representative msg.type payloads and assert state updates and OfficeState method calls. Mock getOfficeState to a deterministic OfficeState fixture to verify addSubagent/removeSubagent flows and permission bubble behavior.
- Future improvements: add stricter TypeScript typings for incoming message payloads, centralize message-to-action mapping to improve testability, and expose hooks/callbacks for unit testing without relying on window event mocking.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/hooks/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*


---

## Functions and Classes


#### function pickTier

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function pickTier(existingAgents: number[], os: OfficeState): TierLevel
```

### Description

Selects and returns a TierLevel for a new agent based on the tiers of existing agents and a target distribution.


Examines the provided list of existing agent IDs and the OfficeState's characters map to count how many non-subagent characters currently occupy each TierLevel. It uses a fallback of TierLevel.EMPLOYEE when a character has no tier assigned. The selection policy is: if there are no existing agents pick BOSS; ensure at least one BOSS overall; prefer SUPERVISOR until there are at least two; otherwise choose between EMPLOYEE and INTERN by picking EMPLOYEE when EMPLOYEE count is less than or equal to INTERN count, and INTERN otherwise. The function treats the first agent specially by always returning BOSS when existingAgents is empty.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `existingAgents` | `number[]` | ✅ | Array of character IDs representing currently-existing agents to consider when deciding the new agent's tier.
<br>**Constraints:** Elements are numeric IDs that can be used to look up characters in os.characters, May be empty (length === 0) which causes the function to return TierLevel.BOSS |
| `os` | `OfficeState` | ✅ | An OfficeState object that must expose a characters map (or similar) with a get(id) method to retrieve character objects by ID.
<br>**Constraints:** os.characters.get(id) must return an object or undefined for a given id, Character objects, when present, may have properties isSubagent (boolean) and optionally tier (TierLevel) |

### Returns

**Type:** `TierLevel`

Returns the chosen TierLevel enum value for the new agent according to the counted distribution and selection rules.


**Possible Values:**

- TierLevel.BOSS
- TierLevel.SUPERVISOR
- TierLevel.EMPLOYEE
- TierLevel.INTERN

### Usage Examples

#### Picking the first agent in an empty office

```typescript
const tier = pickTier([], officeState) // returns TierLevel.BOSS
```

When existingAgents is empty the function immediately returns BOSS.

#### Picking a tier when there are existing agents

```typescript
const tier = pickTier([1,2,3], officeState) // returns one of TierLevel.SUPERVISOR|EMPLOYEE|INTERN depending on counts
```

Counts non-subagent characters' tiers from officeState.characters and applies the selection policy to return an appropriate tier.

### Complexity

Time complexity: O(n) where n is existingAgents.length due to a single loop over the list. Space complexity: O(1) extra space (fixed-size tierCounts for four tiers).

### Related Functions

- `OfficeState.characters.get` - Called by this function to retrieve character objects by ID

### Notes

- Characters with isSubagent === true are ignored when counting tiers.
- If a character exists but has no tier property, the code treats that character as TierLevel.EMPLOYEE.
- The tierCounts structure is initialized for all four TierLevel members so missing tiers are counted as zero.
- The selection policy enforces at least one BOSS and aims for 2 SUPERVISORs before populating EMPLOYEE/INTERN.

---



#### function saveAgentSeats

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function saveAgentSeats(os: OfficeState): void
```

### Description

Builds a mapping of non-subagent character IDs to seat descriptors (palette, hueShift, seatId) and posts it to the extension host using vscode.postMessage with type 'saveAgentSeats'.


The function iterates over os.characters.values(), skips any character where ch.isSubagent is truthy, and for every other character adds an entry to a local 'seats' object keyed by ch.id. Each entry contains the character's palette (number), hueShift (number), and seatId (string | null). After building the map, it calls vscode.postMessage with a payload { type: 'saveAgentSeats', seats } to send this data out of the webview to the extension host. The function does not return a value.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `os` | `OfficeState` | ✅ | The office state containing a characters collection; the function iterates over os.characters.values() to read character properties.
<br>**Constraints:** os.characters must be an iterable collection with a values() method that yields character objects, Each yielded character object is expected to have fields: id (number), palette (number), hueShift (number), seatId (string | null), and isSubagent (boolean or truthy/falsey) |

### Returns

**Type:** `void`

This function does not return a value (returns undefined).


**Possible Values:**

- undefined

### Side Effects

> ❗ **IMPORTANT**
> This function has side effects that modify state or perform I/O operations.

- Calls vscode.postMessage to send a message to the extension host with payload { type: 'saveAgentSeats', seats }
- Allocates a new plain object 'seats' in memory (heap allocation) to hold the seat descriptors

### Usage Examples

#### From a webview context when you want to persist or synchronize agent seat info with the extension host

```typescript
saveAgentSeats(currentOfficeState)
```

Builds the seats mapping from currentOfficeState.characters and posts it to the extension host so the host can persist or act on the agent seat configuration.

### Complexity

O(n) time where n is the number of characters yielded by os.characters.values(), because it visits each character once; O(m) additional space where m is the number of non-subagent characters (for the 'seats' object).

### Related Functions

- `vscode.postMessage` - Called by — used to send the constructed message to the extension host

### Notes

- The function reads character properties but does not mutate the provided OfficeState or character objects.
- It skips characters with isSubagent truthy; only non-subagents are included in the sent payload.
- The function depends on a global or imported 'vscode' object with a postMessage method available in the environment.

---


