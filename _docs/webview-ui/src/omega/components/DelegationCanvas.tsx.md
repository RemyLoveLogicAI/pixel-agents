<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/components/DelegationCanvas.tsx",
  "source_hash": "dbe3b10aa8be1c82611e34e6d5b4916f9d2dc84f0291baa7237c5648bed637af",
  "last_updated": "2026-02-26T19:08:56.267181+00:00",
  "tokens_used": 6226,
  "complexity_score": 3,
  "estimated_review_time_minutes": 10,
  "external_dependencies": [
    "react"
  ]
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [omega](../README.md) > [components](./README.md) > **DelegationCanvas.mdx**

---

# DelegationCanvas.tsx

> **File:** `webview-ui/src/omega/components/DelegationCanvas.tsx`

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

This file implements a single exported React component: DelegationCanvas. The component accepts a typed props object (DelegationCanvasProps) containing an OmegaParticleSystem (type-imported from ../systems/particleSystem.js) and numeric viewport transform values offsetX, offsetY, and zoom. Internally it creates a ref to an HTMLCanvasElement and uses a ref to hold the current animation frame id. A useEffect hook sets up an animation loop (requestAnimationFrame) that: ensures the canvas matches its parent element size (scaled by window.devicePixelRatio), clears the canvas each frame, computes scaled offsets and zoom using devicePixelRatio, and calls particles.render(ctx, ox, oy, z) only when particles.getParticleCount() > 0 or particles.getTrailCount() > 0. The effect performs defensive checks for the canvas element and 2D rendering context and cleans up by cancelling the animation frame and stopping the loop on unmount or dependency changes.

The component is designed as a purely presentational/visual overlay: it does not manage particle state itself but invokes methods on the provided OmegaParticleSystem. Important implementation details: the canvas size is updated using parent.getBoundingClientRect() and window.devicePixelRatio; canvas.width/height are set to the DPR-scaled pixel size while style.width/style.height preserve CSS layout; clearRect clears the entire backing buffer before rendering; pointer events are disabled on the canvas and imageRendering is set to 'pixelated'. The useEffect dependency array includes particles, offsetX, offsetY, and zoom, so changes to those will restart the animation loop. Cleanup uses cancelAnimationFrame(frameRef.current) and a local running flag to stop the loop reliably.

## Dependencies

### External Dependencies

| Module | Usage |
| --- | --- |
| `react` | Imports named hooks useRef and useEffect from 'react'. useRef is used twice: to hold the canvas DOM element (canvasRef) and to store the current animation frame id (frameRef). useEffect establishes the animation loop that resizes the canvas, clears it, computes DPR-scaled offsets (ox, oy) and zoom (z), and schedules frames via requestAnimationFrame; it also performs cleanup with cancelAnimationFrame. |

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../systems/particleSystem.js](../../systems/particleSystem.js.md) | Type-only import: OmegaParticleSystem is imported as a TypeScript type and used to type the particles prop on DelegationCanvasProps. The runtime code calls the following methods on the particles object: particles.getParticleCount(), particles.getTrailCount(), and particles.render(ctx, ox, oy, z). These exact method names are referenced in the component implementation and are required on the provided object at runtime. |

## 📁 Directory

This file is part of the **components** directory. View the [directory index](_docs/webview-ui/src/omega/components/README.md) to see all files in this module.

## Architecture Notes

- Implements an imperative, animation-loop based rendering pattern inside a React functional component using useEffect and requestAnimationFrame rather than React render cycles. This keeps expensive per-frame canvas operations outside React reconciliation.
- Canvas is sized to its parent element's bounding rectangle and scaled by window.devicePixelRatio to render crisply on high-DPI displays. Both the backing buffer (canvas.width/height) and CSS size (style.width/style.height) are updated to maintain layout while matching physical pixels.
- The component delegates all particle/trail drawing to the provided OmegaParticleSystem instance and performs minimal conditional logic: it only calls particles.render when particles.getParticleCount() or particles.getTrailCount() indicate content to draw.
- Resource lifecycle: a running flag plus cancelAnimationFrame(frameRef.current) are used in cleanup to reliably stop the animation loop when the component unmounts or dependencies change. Defensive checks ensure canvas and 2D context exist before starting the loop.

## Usage Examples

### Render particle trails as an overlay above a UI 'office' area

Mount DelegationCanvas as a positioned child covering the desired area and pass a live OmegaParticleSystem instance along with camera transforms. On mount DelegationCanvas will: (1) obtain the canvas 2D context, (2) start an animation loop with requestAnimationFrame, (3) each frame compute devicePixelRatio-scaled offsets (ox = offsetX * dpr, oy = offsetY * dpr) and zoom (z = zoom * dpr), resize the canvas backing buffer if the parent size changed, clear the canvas, and then call particles.render(ctx, ox, oy, z) when particles.getParticleCount() > 0 or particles.getTrailCount() > 0. On unmount it cancels the scheduled animation frame and stops the loop. Errors like missing canvas or context are short-circuited by early returns.

## Maintenance Notes

- Performance: particles.render is called every frame when there are active particles or trails. Ensure the OmegaParticleSystem implementation is efficient and that expensive allocations are avoided per-frame. If the system is frequently recreated (new object identity), the effect will restart; consider memoizing the particles instance or stable props to avoid unnecessary restarts.
- Canvas resizing: resizing occurs by reading parent.getBoundingClientRect() each frame. If parent layout is expensive or you prefer fewer layout reads, consider only checking size on resize events or at a lower frequency.
- DPR handling: devicePixelRatio is read each frame; if the DPR changes (e.g., window moved between screens) the component will adapt. If you need consistent behavior across renders, consider caching or responding to 'resize'/'change' events explicitly.
- Edge cases: the component assumes particles exposes getParticleCount, getTrailCount, and render(ctx, ox, oy, z). Missing methods will cause runtime errors. Validate the particles object at construction time or provide a shim in tests.
- Testing: unit tests can mount the component with a fake canvas parent and a mock OmegaParticleSystem that records calls to getParticleCount/getTrailCount/render. For integration, verify proper cleanup by asserting cancelAnimationFrame is called on unmount and that no frames persist.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/components/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
