<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/components/HeatmapOverlay.tsx",
  "source_hash": "c570be2292423da815f39865345af4c5c5cdf32f67235a8cfdec338231a3e4df",
  "last_updated": "2026-02-26T19:08:56.343082+00:00",
  "tokens_used": 7439,
  "complexity_score": 4,
  "estimated_review_time_minutes": 10,
  "external_dependencies": [
    "react"
  ]
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [omega](../README.md) > [components](./README.md) > **HeatmapOverlay.mdx**

---

# HeatmapOverlay.tsx

> **File:** `webview-ui/src/omega/components/HeatmapOverlay.tsx`

![Complexity: Medium](https://img.shields.io/badge/Complexity-Medium-yellow) ![Review Time: 10min](https://img.shields.io/badge/Review_Time-10min-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)
- [Usage Examples](#usage-examples)
- [Maintenance Notes](#maintenance-notes)
- [Functions and Classes](#functions-and-classes)

---

## Overview

This file implements HeatmapOverlay, a React functional component that draws an activity intensity heatmap into a single HTMLCanvasElement. It accepts a list of agents (HierarchicalAgent[]), the grid dimensions (cols, rows), viewport transform parameters (offsetX, offsetY, zoom), and agentPositions (Map<number, { x: number; y: number }>) and uses the canvas 2D context to compute and render per-tile heat values. The drawing accounts for devicePixelRatio and TILE_SIZE (imported from '../../office/types.js'), scales coordinates by zoom and dpr, computes a per-tile aggregated heat contribution from agents within a configurable radius (heatRadius = s * 4), paints tiles with an HSLA color based on heat, and renders a small legend in the top-right of the canvas.

The component is implemented with React hooks: useRef to obtain the canvas DOM node and useEffect to perform imperative drawing whenever any prop in the dependency list changes ([agents, cols, rows, offsetX, offsetY, zoom, agentPositions]). The code is defensive — it returns early if canvas, 2D context, or parent element cannot be accessed. The algorithm is immediate-mode (redraw entire canvas on each effect invocation) and loops over rows × cols and for each tile iterates through agents to accumulate heat, producing O(rows * cols * agents) work. No external APIs, I/O, or persistence is used; all inputs come from props and local imports (React types and TILE_SIZE). The component returns a <canvas> element styled as an overlay (position: absolute; inset: 0; pointerEvents: none) so it can be layered on top of other content without intercepting pointer events.

## Dependencies

### External Dependencies

| Module | Usage |
| --- | --- |
| `react` | Imports useRef and useEffect from 'react'. useRef is used to hold a reference to the canvas DOM element (const canvasRef = useRef<HTMLCanvasElement>(null)). useEffect runs the drawing routine whenever inputs change. Marked as external because 'react' is an npm package. |

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../types.js](../../types.js.md) | Imports the HierarchicalAgent type via `import type { HierarchicalAgent } from '../types.js'`. This type is used in the HeatmapOverlayProps interface (agents: HierarchicalAgent[]) to type the agents prop. Marked internal (project-local). |
| [../../office/types.js](../../../office/types.js.md) | Imports TILE_SIZE via `import { TILE_SIZE } from '../../office/types.js'`. TILE_SIZE is used to compute s = TILE_SIZE * zoom * dpr which determines tile pixel size and heatRadius. Marked internal (project-local). |

## 📁 Directory

This file is part of the **components** directory. View the [directory index](_docs/webview-ui/src/omega/components/README.md) to see all files in this module.

## Architecture Notes

- Pattern: React functional component with imperative canvas drawing inside useEffect. The component exposes no state; it is fully controlled by props passed from parent components.
- Immediate-mode rendering: every prop change in the dependency array triggers a full redraw of the canvas. Drawing uses the 2D canvas API (getContext('2d')) and devicePixelRatio adjustments to maintain crisp visuals on high-DPI displays.
- Coordinate system and scaling: canvas.width/height are set to parent.getBoundingClientRect() multiplied by dpr; all drawing uses device-pixel coordinates (positions multiplied by dpr). Tile size s = TILE_SIZE * zoom * dpr, and agent positions from agentPositions are multiplied by zoom * dpr before comparing to tile centers.
- Performance trade-offs: current implementation is O(rows * cols * agents) due to nested loops and per-tile agent distance checks. There is no throttling (e.g., requestAnimationFrame) or spatial indexing (e.g., grid/quadtree) to reduce agent checks.
- Error handling: defensive early returns if canvas, context, or parent element are unavailable. There is no try/catch around canvas operations; failures will silently abort drawing due to these checks.

## Usage Examples

### Overlaying activity heatmap on an office canvas

Parent component maintains a list of agents (HierarchicalAgent[]) and a Map of agentPositions keyed by agent.id with { x, y } coordinates. The parent passes cols, rows, offsetX, offsetY, zoom and agentPositions into <HeatmapOverlay ... />. When the parent updates zoom/offset (panning/zooming) or agentPositions (agents move or activityLevel changes), React re-renders the component; the useEffect callback runs and redraws the entire heatmap. Expected outcome: a semi-transparent colored grid is painted on the overlay canvas showing low→high activity, with a small legend in the top-right. If agentPositions lacks an entry for an agent, that agent is skipped (the code checks for pos and continue).

### Updating agent activity levels

When an agent's activityLevel property changes in the agents prop array, pass the updated agents array into HeatmapOverlay. The useEffect dependency includes agents, so the canvas will be cleared and re-computed: each tile iterates agents and accumulates heat using agent.activityLevel * (1 - dist / heatRadius). The heat is clamped to 1 and used to compute hue (blue→yellow→red) and alpha (heat * 0.35). Expected outcome: tiles near highly active agents become warmer in color and more opaque.

## Maintenance Notes

- Performance: For large grids or many agents this component may become CPU-bound. Consider optimizations: spatial indexing (quadtrees or binning) to avoid checking every agent per tile, reducing redraw frequency (debounce/throttle or requestAnimationFrame), or using an offscreen canvas/WebGL for faster compositing.
- Precision & DPI: The code multiplies sizes and positions by window.devicePixelRatio and sets canvas.width/height to scaled pixel values. Keep all drawing coordinates in device-pixel space to avoid blurring. Any changes to coordinate math must maintain this dpr convention.
- AgentCoordinates contract: agentPositions Map values are multiplied by zoom and dpr inside the component. Maintain a contract with callers that agentPositions entries are in the same logical coordinate space expected by the parent (pre-zoom/unscaled positions). Document this clearly where agentPositions are produced.
- Legend & layout: The legend is drawn in canvas-space pixels relative to canvas.width (legendX = canvas.width - 120 * dpr). If parent layout changes or the overlay is positioned differently, verify that the legend remains visible. Consider making legend sizing configurable.
- Testing: Unit tests should verify that the component early-returns when canvas/context/parent are missing and that heat calculations produce expected clamped values for edge distances (0, heatRadius, >heatRadius). Visual regression tests (snapshot or pixel tests) are recommended for the canvas output.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/components/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
