<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/components/AgentHierarchy.tsx",
  "source_hash": "612eb8f3019f06f11bd9e8742cc7ff1663308f94ae23303e7e13dfa0a489e3b7",
  "last_updated": "2026-02-26T19:07:09.838973+00:00",
  "tokens_used": 5064,
  "complexity_score": 3,
  "estimated_review_time_minutes": 10,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../README.md) > [webview-ui](../../README.md) > [src](../README.md) > [components](./README.md) > **AgentHierarchy.mdx**

---

# AgentHierarchy.tsx

> **File:** `webview-ui/src/components/AgentHierarchy.tsx`

![Complexity: Low](https://img.shields.io/badge/Complexity-Low-green) ![Review Time: 10min](https://img.shields.io/badge/Review_Time-10min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Usage Examples](#usage-examples)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

Exports a single presentational React functional component, AgentHierarchy, which receives an OfficeState instance and renders characters grouped into the fixed tiers defined by the project HIERARCHY (boss, supervisor, employee, intern). It converts officeState.characters (a Map) to an array, filters characters per tier, and renders each as a clickable card that invokes onSelectAgent with the agent id. Each card shows a one-character tool icon (from extractToolName), a tool label with fallbacks (idle/thinking), an activity indicator when active, an XP progress bar computed from xp and maxXp, and the agent level. Styling is done with inline styles using color constants from P and HIERARCHY metadata for ring and size. The component is read-only: it does not mutate OfficeState or perform IO; a tick prop (named _tick) is accepted to allow external periodic re-renders. Callers must ensure Character objects include expected fields (id, tier, isActive, isSubagent, currentTool, palette, xp, maxXp, level) and avoid maxXp values that would cause NaN/Infinity in XP calculations.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../office/engine/officeState.js](../../office/engine/officeState.js.md) | Imports the OfficeState type to annotate the officeState prop in the Props interface. The component expects officeState.characters to be an iterable (used via Array.from(officeState.characters.values())). |
| [../office/types.js](../../office/types.js.md) | Imports the Character type (imported as a type) to annotate local variables and to clarify fields accessed on each character (id, tier, isActive, isSubagent, currentTool, palette, xp, maxXp, level). |
| [../constants.js](../../constants.js.md) | Imports HIERARCHY and P constants. HIERARCHY is used to obtain tier metadata (label, ring, size) for rendering tier headings and sizing. P supplies color constants used throughout the inline styles (borders, backgrounds, cyan/green/dmt/etc.). |
| [../office/toolUtils.js](../../office/toolUtils.js.md) | Imports extractToolName used to convert a character's currentTool into a human-readable tool name or icon character. The return value is used to form both a single-character toolIcon (substring(0,1)) and a toolLabel (fallbacks applied when extractToolName returns null/undefined). |

## 📁 Directory

This file is part of the **components** directory. View the [directory index](_docs/webview-ui/src/components/README.md) to see all files in this module.

## Architecture Notes

- Component style: React functional component with a local Props TypeScript interface, fully presentational (receives state and a selection callback; does not perform side effects or mutate OfficeState).
- Rendering pattern: tiers are iterated in a fixed order (['boss','supervisor','employee','intern']), characters are filtered per-tier from officeState.characters.values(), and each agent is rendered as a clickable card that calls onSelectAgent(a.id).
- State and data flow: the component reads from OfficeState (characters Map) and is driven entirely by props: officeState, selectedAgent, onSelectAgent, and tick. The tick prop is present to allow a parent to force periodic re-renders; internally it is named _tick to avoid unused-variable warnings.
- Error handling and edge cases: there is no defensive checking for missing fields on Character objects (e.g., maxXp === 0 will cause the XP width calculation to produce NaN). Consumers must ensure Character objects conform to the expected shape. There are no try/catch blocks since no IO or async operations occur.

## Usage Examples

### Embedding AgentHierarchy in a sidebar and responding to agent selection

Provide the component with the current OfficeState (containing a Map of Character objects), the id of the currently selected agent (or null), a handler function onSelectAgent that accepts a numeric id, and a tick value that you increment periodically to force re-render when agent activity changes. AgentHierarchy highlights the selected agent and calls onSelectAgent(a.id) when a card is clicked. Displayed fields include a single-character tool icon, a tool label (falls back to 'thinking' if active, 'idle' otherwise), an activity dot when a.isActive is true, an XP bar computed from a.xp and a.maxXp, and LV.{a.level}.

## Maintenance Notes

- Performance: converting officeState.characters (assumed to be a Map) to an array on every render (Array.from(...)) may be costly if the character set is large; consider memoization with useMemo keyed on officeState.characters (or a stable derived array from parent) to reduce work.
- Styling and theming: the component uses heavy inline styles. If the app requires theme changes or responsive adjustments, consider extracting styles to a CSS/SCSS file or a styled-component to reduce inline duplication and improve maintainability.
- Robustness: guard against division-by-zero in the XP bar calculation. If a.maxXp can be 0 or undefined, clamp and default (e.g., const pct = a.maxXp ? (a.xp / a.maxXp) * 100 : 0) to avoid NaN width values.
- Testing: unit tests should provide OfficeState fixtures with Character entries covering edge cases (missing currentTool, currentTool that extractToolName returns null for, a.maxXp === 0, negative ids for subagents, many characters per tier).
- Future enhancements: move repeated inline style fragments (agent card, icon box, progress bar) into helper variables or small subcomponents to simplify readability and enable reuse; add ARIA attributes and keyboard navigation for accessibility.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/components/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
