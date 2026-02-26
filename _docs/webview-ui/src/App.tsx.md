<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/App.tsx",
  "source_hash": "5a52fd31c2574496bee03a0972fc6aad7560873f1baaac2a6e76add49065d991",
  "last_updated": "2026-02-26T19:08:18.478731+00:00",
  "tokens_used": 21057,
  "complexity_score": 6,
  "estimated_review_time_minutes": 20,
  "external_dependencies": [
    "react"
  ]
}
```

</details>

[Documentation Home](../../README.md) > [webview-ui](../README.md) > [src](./README.md) > **App.mdx**

---

# App.tsx

> **File:** `webview-ui/src/App.tsx`

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

This file implements the main webview UI for an editor/game hybrid. It exports a default React component App() that composes a rendered canvas (OfficeCanvas), editor-specific controls (EditorToolbar, EditorActionBar, ToolOverlay, ZoomControls, BottomToolbar), and Omega v2 gameplay/visual systems (DelegationCanvas, HeatmapOverlay, OrgChartView, GameHUD, SkillBar, ViewModeSwitch). The file also contains a small helper getOfficeState() which lazily initializes a single OfficeState instance stored in a module-level officeStateRef and a module-level editorState instance of EditorState. UI pieces are conditionally rendered based on flags such as layoutReady, editor.isEditMode, omega.state.viewMode and selectedAgent.

The file integrates several custom hooks and systems: useExtensionMessages (to receive messages from the extension host and to populate agents, assets and layout readiness), useEditorActions (to provide editor command handlers and derived editor state such as zoom and pan refs), useEditorKeyboard (to wire keyboard shortcuts to editor handlers), and useOmegaSystems (to manage the Omega v2 systems, including particles and agents). A requestAnimationFrame-based game loop is created in a useEffect to call omega.updateSystems(dt) with a measured delta time each frame. The file also posts messages back to the host using vscode.postMessage for actions such as focusing or closing an agent. Visual details include a CSS keyframe that uses PULSE_ANIMATION_DURATION_SEC, a Scanlines overlay, and inline styling for an EditActionBar and rotate hint. The component uses a guard (layoutReady) to show a loading placeholder until extension-supplied layout data is available.

## Dependencies

### External Dependencies

| Module | Usage |
| --- | --- |
| `react` | Imports React hooks: useState, useCallback, useRef, useEffect. These are used throughout App() and EditActionBar() to manage local UI state (isDebugMode, showResetConfirm), memoized callbacks (handleSelectAgent, handleCloseAgent), and side-effects (keyboard listener, RAF loop). |

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [./office/engine/officeState.js](.././office/engine/officeState.js.md) | Imports OfficeState class used to create and type the singleton office state instance. getOfficeState() lazily instantiates OfficeState and officeStateRef.current holds that instance. officeState is passed to OfficeCanvas and used to query layout and character positions (e.g. for the HeatmapOverlay). |
| [./office/components/OfficeCanvas.js](.././office/components/OfficeCanvas.js.md) | Imports OfficeCanvas React component which is rendered by App() to display the main grid/canvas. OfficeCanvas receives props including officeState, editorState, editor-related handlers (onEditorTileAction, onEditorEraseAction, onEditorSelectionChange, onDeleteSelected, onRotateSelected, onDragMove), editorTick, zoom and panRef. |
| [./office/components/ToolOverlay.js](.././office/components/ToolOverlay.js.md) | Imports ToolOverlay React component that overlays UI elements related to agents/tools. App() passes agents, agentTools, subagentCharacters, containerRef, zoom, panRef, and onCloseAgent handler to it. |
| [./office/editor/EditorToolbar.js](.././office/editor/EditorToolbar.js.md) | Imports EditorToolbar React component used when editor.isEditMode is true. Props passed include activeTool, selectedTileType, selectedFurnitureType, selectedFurnitureUid, selectedFurnitureColor, floorColor, wallColor and a set of handler functions from the editor actions (onToolChange, onTileTypeChange, etc.). |
| [./office/editor/editorState.js](.././office/editor/editorState.js.md) | Imports the EditorState class which is instantiated at module-level (const editorState = new EditorState()). The EditorState instance is used to track editor UI selection, tools, undo/redo stacks (accessed to determine whether undo/redo buttons are disabled) and other editor-specific data. EditorState is also typed in the EditActionBar props. |
| [./office/types.js](.././office/types.js.md) | Imports EditTool (enum/type) used to check the currently active editor tool (e.g., EditTool.FURNITURE_PLACE) when computing the rotate hint visibility. |
| [./office/layout/furnitureCatalog.js](.././office/layout/furnitureCatalog.js.md) | Imports isRotatable helper used to determine whether a furniture type supports rotation. This is used to show the 'Press R to rotate' hint while in edit mode or while placing a rotatable furniture item. |
| [./vscodeApi.js](.././vscodeApi.js.md) | Imports the vscode object used for sending messages back to the extension host via vscode.postMessage. App() uses it in handlers like handleSelectAgent, handleCloseAgent, and handleClick to request the host focus or close an agent. |
| [./hooks/useExtensionMessages.js](.././hooks/useExtensionMessages.js.md) | Imports a custom hook that registers extension-host message handlers and returns reactive data used by the UI (agents, selectedAgent, agentTools, agentStatuses, subagentTools, subagentCharacters, layoutReady, loadedAssets). App() consumes those returned values to drive conditional rendering and pass data into overlays and components. |
| [./constants.js](.././constants.js.md) | Imports PULSE_ANIMATION_DURATION_SEC constant. Used in an inline <style> block to define the duration of the pixel-agents-pulse CSS animation. |
| [./hooks/useEditorActions.js](.././hooks/useEditorActions.js.md) | Imports useEditorActions hook which produces the editor action handlers and state values consumed by App(). App() calls useEditorActions(getOfficeState, editorState) to get methods like handleUndo, handleRedo, handleSave, handleReset, handleToggleEditMode, handleDeleteSelected, handleRotateSelected, handleEditorTileAction, handleEditorEraseAction, handleEditorSelectionChange, handleDragMove, handleZoomChange and derived state (isEditMode, isDirty, zoom, panRef, editorTick, etc.). |
| [./hooks/useEditorKeyboard.js](.././hooks/useEditorKeyboard.js.md) | Imports useEditorKeyboard hook to wire up editor keyboard shortcuts. App() calls it with a set of handlers (delete, rotate, toggle, undo/redo) plus a callback to increment editorTickForKeyboard to force re-renders triggered by keyboard actions. |
| [./components/ZoomControls.js](.././components/ZoomControls.js.md) | Imports ZoomControls component used to render zoom UI. App() passes current zoom and onZoomChange handler from useEditorActions. |
| [./components/BottomToolbar.js](.././components/BottomToolbar.js.md) | Imports BottomToolbar component rendered near the bottom of the UI. Props include isEditMode, onOpenClaude, onToggleEditMode, isDebugMode and onToggleDebugMode coming from editor actions and local state. |
| [./components/DebugView.js](.././components/DebugView.js.md) | Imports DebugView component. App() conditionally renders it when isDebugMode is true and passes debugging related data (agents, selectedAgent, agentTools, agentStatuses, subagentTools) and onSelectAgent handler. |
| [./components/Scanlines.js](.././components/Scanlines.js.md) | Imports Scanlines component for a visual overlay (rendered at top). |
| [./omega/hooks/useOmegaSystems.js](.././omega/hooks/useOmegaSystems.js.md) | Imports useOmegaSystems custom hook that returns an omega controller object used by App(). The returned omega carries state (omega.state), effects (registerAgent, unregisterAgent), particles, updateSystems(dt), setViewMode, dispatchSkill, and processCheatKey. App() runs omega.updateSystems in a RAF loop and feeds omega state into multiple components (GameHUD, DelegationCanvas, HeatmapOverlay, OrgChartView, SkillBar, ViewModeSwitch). |
| [./omega/types.js](.././omega/types.js.md) | Imports ViewMode enum (or type) used to determine which omega overlays to render (HEATMAP, ORG_CHART). App() checks omega.state.viewMode against ViewMode.HEATMAP and ViewMode.ORG_CHART to conditionally render HeatmapOverlay and OrgChartView. |
| [./omega/components/GameHUD.js](.././omega/components/GameHUD.js.md) | Imports GameHUD component rendered unconditionally and provided the omega.state. Shows gameplay mode/status UI. |
| [./omega/components/SkillBar.js](.././omega/components/SkillBar.js.md) | Imports SkillBar component used when an agent is selected (selectedAgent !== null). App() passes selectedAgentId and onDispatchSkill handler (omega.dispatchSkill). |
| [./omega/components/ViewModeSwitch.js](.././omega/components/ViewModeSwitch.js.md) | Imports ViewModeSwitch component used to change omega viewMode (App passes viewMode and onChangeViewMode=omega.setViewMode). |
| [./omega/components/DelegationCanvas.js](.././omega/components/DelegationCanvas.js.md) | Imports DelegationCanvas component which renders delegation particle trails; App() passes omega.particles plus editor pan offsets and zoom to position them correctly. |
| [./omega/components/OrgChartView.js](.././omega/components/OrgChartView.js.md) | Imports OrgChartView component which App() renders when omega.state.viewMode === ViewMode.ORG_CHART; props include omega.state.agents, selectedAgentId, and onSelectAgent handler. |
| [./omega/components/HeatmapOverlay.js](.././omega/components/HeatmapOverlay.js.md) | Imports HeatmapOverlay component which App() renders when omega.state.viewMode === ViewMode.HEATMAP. App() computes agentPositions from officeState.characters and passes agent positions, grid cols/rows from officeState.getLayout(), zoom and pan offsets. |

## 📁 Directory

This file is part of the **src** directory. View the [directory index](_docs/webview-ui/src/README.md) to see all files in this module.

## Architecture Notes

- Singleton/global state pattern: officeState is stored in a module-level officeStateRef and instantiated lazily by getOfficeState(). editorState is a module-level instance of EditorState. These objects live outside React component state and are updated imperatively by message handlers and editor actions.
- Separation of concerns via hooks: useExtensionMessages handles incoming extension-host messages and provides app-level data (agents, assets, layoutReady). useEditorActions exposes editor command handlers and derived UI state (zoom, panRef, isEditMode, isDirty). useOmegaSystems encapsulates the Omega v2 subsystem and exposes updateSystems(dt) for per-frame updates.
- Real-time loop: App() starts an RAF loop in a useEffect that calls omega.updateSystems(dt) each frame; cleanup is implemented by a running flag. The design expects omega.updateSystems to be performant and non-blocking.
- Messaging integration: The file posts to the host with vscode.postMessage in user-interaction handlers (focusAgent, closeAgent). Incoming messages are handled by useExtensionMessages which also takes callbacks to register/unregister agents with omega.
- Minimal in-file error handling: The component relies primarily on guards (e.g., layoutReady) and hook implementations for correctness. There are no try/catch blocks in this file; side-effects are isolated inside useEffect hooks.

## Usage Examples

### Entering edit mode, placing a furniture item, rotating it, and saving

User toggles edit mode via BottomToolbar which calls editor.handleToggleEditMode (provided by useEditorActions). While editor.isEditMode is true, EditorToolbar is rendered and the user chooses a furniture type (EditorToolbar triggers onFurnitureTypeChange which calls editor.handleFurnitureTypeChange). The OfficeCanvas receives editorState and editor handlers; when the user places furniture, OfficeCanvas calls onEditorTileAction/onEditorSelectionChange which update editorState (selectedFurnitureUid and selection). The file shows a rotate hint when a rotatable item is selected (isRotatable check). The user presses R: useEditorKeyboard maps that key to editor.handleRotateSelected updating the selected furniture orientation. The Save button on the EditActionBar calls editor.handleSave which is expected to persist the layout (implementation provided by useEditorActions). If the layout has been saved previously, setLastSavedLayout is used by useExtensionMessages to mark the saved state.

### Agent selection and omega heatmap view

useExtensionMessages populates the agents and layoutReady flag. App() renders DelegationCanvas for particles and, when omega.state.viewMode === ViewMode.HEATMAP, renders HeatmapOverlay. App() computes agentPositions by iterating officeState.characters and building a Map<agentId, {x,y}> which is passed to HeatmapOverlay along with grid cols/rows from officeState.getLayout(). The user selects an agent in the HeatmapOverlay or OrgChartView; that triggers handleSelectAgent which calls vscode.postMessage({type: 'focusAgent', id}) to instruct the host to focus that agent. omega.dispatchSkill is wired into SkillBar so skills can be dispatched to the engine via the omega systems.

## Maintenance Notes

- Performance: omega.updateSystems(dt) is invoked via requestAnimationFrame every frame; heavy or blocking operations inside that function will hurt UI responsiveness. Consider throttling non-critical updates or splitting expensive work off the RAF path.
- Memory / lifecycle: The RAF loop uses a running flag and the keyboard listener is cleaned up in useEffect cleanup; ensure any additional listeners or subscriptions inside hooks (useExtensionMessages, useOmegaSystems) also implement proper cleanup to avoid leaks, especially during hot-reload in development.
- Global state implications: officeState and editorState are singletons outside React. This allows imperative updates from message handlers but makes unit testing components in isolation harder — tests must set or mock officeStateRef.current and editorState. Consider exposing reset or factory functions for tests.
- Edge cases: The UI guards on layoutReady before rendering OfficeCanvas; ensure useExtensionMessages reliably sets layoutReady only when office layout, characters, and assets needed by OfficeCanvas are present. Also verify undo/redo stack persistence semantics in EditorState when saving or resetting.
- Future improvements: Consider moving more state into React context or using a controlled store (e.g., Zustand/Redux) if more fine-grained subscription or time-travel debug is required. Also consider debouncing or batching postMessage calls to vscode if chatty.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*


---

## Functions and Classes


#### function getOfficeState

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript
function getOfficeState(): OfficeState
```

### Description

Returns the current OfficeState instance stored in officeStateRef.current, creating and storing a new OfficeState if none exists.


This function performs a lazy initialization of an OfficeState instance using an external reference named officeStateRef. It checks officeStateRef.current; if it is falsy (e.g., null or undefined), the function constructs a new OfficeState instance and assigns it to officeStateRef.current. Finally, it returns the value of officeStateRef.current. The function relies on the external identifiers officeStateRef and OfficeState which are not defined in this snippet.

### Returns

**Type:** `OfficeState`

The OfficeState instance stored in officeStateRef.current after ensuring it is initialized.


**Possible Values:**

- An existing OfficeState instance previously stored in officeStateRef.current
- A newly created OfficeState instance assigned to officeStateRef.current if it was not set

### Side Effects

> ❗ **IMPORTANT**
> This function has side effects that modify state or perform I/O operations.

- May assign a newly constructed OfficeState to officeStateRef.current when officeStateRef.current is falsy (mutates external reference)

### Usage Examples

#### Get the shared OfficeState singleton for use in the component

```typescript
const state = getOfficeState()
```

Retrieves the existing OfficeState instance if present; otherwise creates one, stores it in officeStateRef.current, and returns it.

### Complexity

O(1) time complexity and O(1) additional space complexity (ignores the space used by the OfficeState instance itself).

### Related Functions

- `OfficeState` - Constructor called to create a new instance when officeStateRef.current is falsy

### Notes

- The function depends on an external variable officeStateRef (expected to have a current property) and the OfficeState constructor; those must be defined elsewhere in the module or scope.
- The function performs a mutation of officeStateRef.current only when it's falsy; repeated calls return the same instance once initialized.

---



#### function EditActionBar

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript (tsx)
function EditActionBar({ editor, editorState: es }: { editor: ReturnType<typeof useEditorActions>; editorState: EditorState })
```

### Description

Implementation not visible

The function body / implementation is not present in the provided source snippet (only the function signature is visible). Because the implementation is not available, I cannot describe its internal logic, return value, side effects, called functions, or error conditions beyond what is explicit in the signature. The signature indicates this is a React component (TSX) named EditActionBar that accepts a props object with two properties: 'editor' typed as the return type of useEditorActions, and 'editorState' (aliased to 'es') typed as EditorState. No further behavior can be inferred from the available text without risking hallucination.

### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `editor` | `ReturnType<typeof useEditorActions>` | ✅ | A value produced by the useEditorActions hook; exact shape and responsibilities are defined by that hook. The implementation is not visible, so no further details are available.
<br>**Constraints:** Must be the return value of useEditorActions (exact contract not visible in snippet) |
| `editorState` | `EditorState` | ✅ | Prop passed in and renamed to 'es' inside the parameter destructuring; represents editor state. Exact structure and semantics are defined by the EditorState type which is not shown in the snippet.
<br>**Constraints:** Must conform to the EditorState type (definition not present in provided code) |

### Returns

**Type:** `Implementation not visible`

The return value is not visible in the provided snippet. Given the file extension (.tsx) and typical React patterns, this is likely a JSX.Element or null, but that cannot be asserted from the provided line alone.


**Possible Values:**

- Unknown (implementation not provided)

### Usage Examples

#### Rendering the component within JSX when you have editor actions and state

```typescript (tsx)
<EditActionBar editor={editorActions} editorState={editorState} />
```

Example shows how to pass the two required props based on the function signature. The actual runtime behavior of the component is not visible in the snippet.

### Complexity

Implementation not visible; time and space complexity cannot be determined from the signature alone.

### Related Functions

- `useEditorActions` - The 'editor' parameter is typed as ReturnType<typeof useEditorActions>, indicating this component expects the value returned by that hook.

### Notes

- Only the function signature line was provided. The implementation (body) is missing, so internal behavior, JSX structure, side effects, and returned value cannot be documented without the function body.
- The parameter 'editorState' is aliased to 'es' in the parameter destructuring.

---



#### function App

![Type: Sync](https://img.shields.io/badge/Type-Sync-green)

### Signature

```typescript (tsx)
function App(): JSX.Element
```

### Description

React functional component composing the main webview UI: wires editor and omega systems, registers keyboard and animation-frame effects, and renders canvas, overlays, toolbars, and debug views.


This React component initializes and connects multiple application subsystems and UI pieces for the webview. It obtains editor actions via useEditorActions, obtains Omega (game/hierarchy/gamification/particle) systems via useOmegaSystems, and subscribes to extension messages via useExtensionMessages. It registers a global keydown listener (only when not in edit mode) to forward single-character cheat keys to omega.processCheatKey, and starts an animation frame loop that calls omega.updateSystems(dt) each frame. It sets up local component state for debug mode and an editor keyboard tick counter and wires editor keyboard handling via useEditorKeyboard. It posts messages to the host via vscode.postMessage to focus/close agents. The component renders different children (OfficeCanvas, DelegationCanvas, HeatmapOverlay, OrgChartView, GameHUD, ViewModeSwitch, SkillBar, BottomToolbar, EditActionBar, EditorToolbar, ToolOverlay, DebugView) conditionally based on editor state, omega state, and layout readiness, and it displays UI hints (e.g., rotate hint) depending on selection and tool types.

### Returns

**Type:** `JSX.Element`

A React element tree representing the entire application webview UI when layoutReady is true; otherwise a centered 'Loading...' div.


**Possible Values:**

- JSX.Element containing a 'Loading...' message when layoutReady is false
- JSX.Element composing OfficeCanvas, overlays, toolbars, and optional debug/editor UIs when layoutReady is true

### Side Effects

> ❗ **IMPORTANT**
> This function has side effects that modify state or perform I/O operations.

- Registers a window 'keydown' event listener and removes it on unmount
- Starts a requestAnimationFrame loop that repeatedly calls omega.updateSystems(dt) until unmount
- Calls omega.processCheatKey when single-character keys are pressed and editor.isEditMode is false
- Posts messages to the host via vscode.postMessage (e.g., { type: 'focusAgent', id } and { type: 'closeAgent', id })
- Updates React component state via useState and useCallback hooks (isDebugMode, editorTickForKeyboard)
- Reads global/closure state via getOfficeState and editorState and may call editor action handlers (e.g., handleDeleteSelected, handleRotateSelected, etc.)
- Mutates/reads refs (containerRef and editor.panRef) used for layout and drawing offsets

### Usage Examples

#### Render the main webview UI inside a React app root

```typescript (tsx)
<App />
```

Mounts the application UI; App wires up editor and omega systems and manages animation and keyboard effects.

#### Host-side focusing an agent via user interaction inside the component

```typescript (tsx)
vscode.postMessage({ type: 'focusAgent', id: 123 })
```

App sends focus messages to the host when an agent is clicked (handled internally by handleClick/handleSelectAgent).

### Complexity

The component's render and hook setup run in O(1) time relative to the component code, but it registers a per-frame callback that calls omega.updateSystems(dt) each animation frame; the runtime cost per frame depends on omega.updateSystems implementation and number of agents/systems it updates (not visible in this function). Memory overhead is typical for a React component (hooks, refs, and children) and scales with rendered children and state.

### Related Functions

- `useEditorActions` - Called by App to obtain editor action handlers and editor state
- `useOmegaSystems` - Called by App to create/manage omega (game/particle/org chart) systems
- `useExtensionMessages` - Called by App to receive messages from the extension and register agent lifecycle callbacks
- `useEditorKeyboard` - Hook used by App to wire editor keyboard shortcuts into editor state and to increment editorTickForKeyboard
- `vscode.postMessage` - Called by App to send host messages (focusAgent, closeAgent)

### Notes

- The function is a React component and depends on many external hooks and values from the module closure (e.g., getOfficeState, editorState, PULSE_ANIMATION_DURATION_SEC, ViewMode, isRotatable) which are not defined in the visible snippet but are referenced.
- The animation loop uses a 'running' boolean closed over in the effect cleanup to stop updates; it calls requestAnimationFrame recursively.
- Keyboard cheat processing only triggers for single-character keys when not in edit mode.
- The component conditionally renders many child components depending on omega.state.viewMode, editor.isEditMode, editor.isDirty, and selectedAgent; those children are responsible for their own internals.
- No exceptions are thrown by this function itself; errors would come from called hooks or child components.

---


