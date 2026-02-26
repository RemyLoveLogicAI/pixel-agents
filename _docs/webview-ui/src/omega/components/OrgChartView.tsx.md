<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/components/OrgChartView.tsx",
  "source_hash": "86d18cadbb5a4526f5e3cc157326e041dbae6d2d321392f9a5b2ed121f2fd945",
  "last_updated": "2026-02-26T19:11:08.563070+00:00",
  "tokens_used": 7464,
  "complexity_score": 3,
  "estimated_review_time_minutes": 15,
  "external_dependencies": [
    "react"
  ]
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [omega](../README.md) > [components](./README.md) > **OrgChartView.mdx**

---

# OrgChartView.tsx

> **File:** `webview-ui/src/omega/components/OrgChartView.tsx`

![Complexity: Low](https://img.shields.io/badge/Complexity-Low-green) ![Review Time: 15min](https://img.shields.io/badge/Review_Time-15min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Usage Examples](#usage-examples)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This file exports the OrgChartView React component which draws a simple hierarchical org chart directly onto a canvas element. It accepts a typed list of HierarchicalAgent items, a selectedAgentId, and an onSelectAgent callback. The component computes a per-tier horizontal layout, draws delegation lines between parent and child agents, renders per-agent cards (emoji, name, and level) with visual styling from TIER_CONFIGS, and performs hit-testing on mouse clicks to map canvas coordinates back to agent ids.

The component is an immediate-mode canvas renderer executed inside a useEffect hook keyed by [agents, selectedAgentId]. It uses useRef to access the canvas DOM node and scales drawing operations by window.devicePixelRatio to keep visuals crisp on high-DPI displays. Layout math is deterministic: the canvas is divided into horizontal rows (rowH = canvas.height / 5), card size is constant (100x60 multiplied by dpr), and node positions are stored in a Map keyed by agent.id. Delegation lines are drawn with a dashed stroke and agent cards are drawn with fillRect/strokeRect plus text for emoji, name and level; tier labels are rendered at the left of each row.

Important implementation details: TIER_CONFIGS (imported from ../constants.js) provides per-tier color, emoji and label used when drawing cards and tier headings. Type-only imports from ../types.js (HierarchicalAgent and TierLevel) annotate props and local variables. The component does not manage internal React state; it is purely presentation — input (agents, selection) comes from props and selection is emitted via the onSelectAgent callback. The click handler recomputes the same layout to perform hit-testing (translating client coordinates to canvas coordinates using the canvas bounding rect and devicePixelRatio) and calls onSelectAgent when a card contains the click point.

## Dependencies

### External Dependencies

| Module | Usage |
| --- | --- |
| `react` | Imports useRef and useEffect (import { useRef, useEffect } from 'react') to obtain a canvas DOM reference and run a drawing side-effect when props change. Used for lifecycle (render-on-props-change) and to persist the canvas element between renders. |

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../types.js](../../types.js.md) | Type-only imports (import type { HierarchicalAgent } from '../types.js' and import type { TierLevel } from '../types.js') used to type the component props, the agents array, and local tier arrays and maps. These imports are only for TypeScript type-checking and do not affect runtime. |
| [../constants.js](../../constants.js.md) | Imports TIER_CONFIGS (import { TIER_CONFIGS } from '../constants.js') which supplies per-tier metadata (color, emoji, label). The drawing logic reads cfg.color, cfg.emoji and cfg.label for styling agent cards and tier labels. |

## 📁 Directory

This file is part of the **components** directory. View the [directory index](_docs/webview-ui/src/omega/components/README.md) to see all files in this module.

## Architecture Notes

- Rendering model: immediate-mode canvas rendering performed inside a useEffect hook that re-runs when agents or selectedAgentId change. There is no retained React state for the drawing; node positions are computed on each effect run and stored in a local Map.
- Scaling strategy: the component multiplies sizes and font sizes by window.devicePixelRatio and sets canvas.width/height to rect.size * dpr, while setting CSS width/height to the DOM rect to produce crisp high-DPI rendering.
- Hit-testing duplication: the click handler recomputes layout (spacing, positions) using the same math as the draw code to perform hit testing. This duplication can cause drift if the layout code diverges; centralizing layout into a shared helper would reduce risk.
- No resize listener or cleanup: canvas sizing occurs once per effect invocation using the parent bounding rect; there is no window resize listener, so visual/coordinate mismatches can occur if the parent size changes without props changing.
- Error handling: the component performs defensive null checks (canvas existence, 2D context, parent element) but otherwise assumes valid agent data and non-zero parent dimensions.

## Usage Examples

### Embedding the org chart in a sidebar overlay

Parent supplies an array of HierarchicalAgent objects with fields like id, name, tier, level and parentId. Render <OrgChartView agents={agents} selectedAgentId={selectedId} onSelectAgent={id => setSelectedId(id)} />. When the user clicks a card, onSelectAgent is called with the clicked agent's id; the parent can then update selectedAgentId to highlight the selection. Ensure the parent provides a stable bounding box (e.g., fixed height) or triggers a re-render on resize so the canvas is resized correctly.

### Updating visual highlight when selection changes

Change selectedAgentId in the parent component in response to other UI controls. Because useEffect depends on selectedAgentId, the canvas will be re-drawn with the selected card using a different fill/stroke styling (semi-transparent gold background and '#ffd700' stroke). No additional API calls are performed by OrgChartView; it only emits selection events via onSelectAgent.

## Maintenance Notes

- Performance: the component redraws the entire canvas on any agents or selection change. For large numbers of agents, consider batching updates, using requestAnimationFrame for drawing, or caching computed nodePositions between renders.
- Resize handling: add a resize observer or window resize listener to recompute canvas size and re-render when the parent element changes size. Currently, resizing the window may desynchronize click coordinates vs drawn positions until props change.
- Single-source layout: the draw logic and the hit-test logic duplicate layout calculations (spacing and positions). Refactor to a shared layout function that returns nodePositions so drawing and hit-testing remain consistent.
- Accessibility: canvas-based UI is not accessible to screen readers. Consider providing a parallel DOM list or ARIA controls for keyboard navigation and assistive technologies.
- Edge cases: the code handles empty tier rows (spacing uses row.length + 1) safely. However, if the parent element has zero width/height, canvas.width/height may be 0 and drawing will be skipped; add guard or logging if needed.
- Type-only imports with .js extension: the file uses `import type ... from '../types.js'`. Ensure TypeScript compiler settings (allowJs/resolveJsonModule) and bundler configuration accept this pattern in the project.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/components/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
