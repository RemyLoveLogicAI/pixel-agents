<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/constants.ts",
  "source_hash": "5449c079f55fc437a9afb9e0e82351c06f15947385256d2b1cf1ea502c11a035",
  "last_updated": "2026-02-26T19:06:46.652013+00:00",
  "tokens_used": 8078,
  "complexity_score": 2,
  "estimated_review_time_minutes": 10,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../README.md) > [webview-ui](../README.md) > [src](./README.md) > **constants**

---

# constants.ts

> **File:** `webview-ui/src/constants.ts`

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

This file is a pure configuration/constants module in TypeScript. It exports a set of named constants and configuration objects that cover theming (P palette), hierarchy sizing and rings (HIERARCHY), tool metadata (TOOL_META), available game modifications (GAME_MODS), grid and layout sizing, character animation timing, a ‘matrix’ visual effect, many rendering constants (z-sorting offsets, outline alphas, dashed patterns, button sizing/factors), overlay color constants for canvas rendering, camera follow parameters, zoom constraints and timing, editor defaults (including typed FloorColor defaults), notification sound frequency and timing constants, and various game-logic constants (timers, pulse duration, hitbox sizes, etc.). Most values are numeric scalars, hex color strings, rgba strings, small typed tuples (e.g., [number, number]) and small objects/arrays; they are intended to be imported by UI, renderer, and game modules rather than run directly.

Because the file contains no runtime logic, side effects, or exported functions/classes, it acts as a single source of truth for magic numbers and visual defaults across the project. The file imports a single TypeScript type, FloorColor, from './office/types.js' to annotate floor/wall/neutrals used by the editor defaults. Several constants explicitly encode units in their names (e.g., _PX_, _SEC_, _MS_, _HZ_) which makes them easy to interpret by callers; others are semantic (PALETTE_COUNT, HUE_SHIFT ranges, MAX_COLS/ROWS). Important design decisions visible in the file: grouping by functional areas (theming, rendering, animation, editor, game logic) and using typed tuples for patterns (SELECTION_DASH_PATTERN, VOID_TILE_DASH_PATTERN) so consumers can rely on consistent shapes. The file intentionally avoids behavior and only provides values — consumers are expected to interpret units and apply these values in render/game loops and UI logic.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [./office/types.js](.././office/types.js.md) | Imports the named type FloorColor to annotate DEFAULT_FLOOR_COLOR, DEFAULT_WALL_COLOR, and DEFAULT_NEUTRAL_COLOR. The import appears exactly as: "import type { FloorColor } from './office/types.js'" and is used only for compile-time typing of color default objects. |

## 📁 Directory

This file is part of the **src** directory. View the [directory index](_docs/webview-ui/src/README.md) to see all files in this module.

## Architecture Notes

- Centralized constants module: this file follows a single-responsibility pattern for configuration. It is read-only and should be imported wherever UI rendering, editor tools, or game logic need consistent tuning parameters or color values.
- Type safety for editor colors: DEFAULT_FLOOR_COLOR, DEFAULT_WALL_COLOR, and DEFAULT_NEUTRAL_COLOR are annotated with the imported FloorColor type, ensuring compile-time shape checks for those color objects.
- Domain grouping: constants are grouped by domain (theming, grid/layout, animation, matrix effect, rendering overlays, camera, zoom, editor, notification sound, game logic). This grouping helps consumers import only what they need and makes maintenance easier.
- No runtime side effects: the module exports pure values and performs no initialization or I/O. Error handling is therefore unnecessary at module-load time, but consumers must interpret units (px, sec, ms, Hz) correctly.
- Inter-module integration: other modules (renderer, game loop, editor UI, audio utility) are expected to import these constants. The file does not declare which modules do so — calling code must map constants to implementation details (e.g., WALK_SPEED_PX_PER_SEC used by movement update logic).

## Usage Examples

### Adjusting character movement and animation timing

A movement/update loop in the character controller should use WALK_SPEED_PX_PER_SEC (48) for translating world position per second and WALK_FRAME_DURATION_SEC (0.15) to advance sprite animation frames. For typing / chat animation, use TYPE_FRAME_DURATION_SEC (0.3). If you increase WALK_SPEED_PX_PER_SEC, verify animations and collision/hitbox logic still align (CHARACTER_HIT_HALF_WIDTH / CHARACTER_HIT_HEIGHT).

### Adding a new tool icon and color to the UI

To add a new tool entry, append an object to TOOL_META with shape { color: P.<paletteKey>, icon: "<glyph>", label: "<LABEL>" }. Reuse colors from the P palette object to keep consistent theming. Consumers rendering tool buttons will read TOOL_META entries to get the label, icon glyph, and color for button styling.

### Tuning the grid layout for a larger map

Update TILE_SIZE, DEFAULT_COLS and DEFAULT_ROWS to change the editor grid unit and default map dimensions. If you increase TILE_SIZE, check related rendering offsets such as CHARACTER_SITTING_OFFSET_PX and BUBBLE_VERTICAL_OFFSET_PX; also verify camera and zoom behaviors (PAN_MARGIN_FRACTION, ZOOM_MIN/MAX) to ensure UI remains usable.

### Adding a new GAME_MOD

Append an object to GAME_MODS with keys { id, name, desc, cost, color } where color should usually reference one of the palette colors (P.<key>). The UI that renders the in-game store or toggles will read these fields to display the mod name/description, cost, and color accent.

## Maintenance Notes

- Keep units explicit: many constants include units (PX, SEC, MS, HZ). When adding new constants, follow this naming convention to prevent misuse by consumers.
- Synchronized updates: changes to palette values (P) can affect multiple modules (tool metadata, game mods, overlays). Update all dependent UI components and visual tests whenever palette colors change.
- Sprite/matrix dependencies: MATRIX_SPRITE_COLS, MATRIX_SPRITE_ROWS, MATRIX_TRAIL_LENGTH and related thresholds are likely tied to assets/spritesheets. If you change sprite dimensions, update these constants and corresponding sprite atlas / renderer logic.
- Limits and constraints: MAX_COLS/MAX_ROWS and TILE_SIZE changes can impact performance and layout calculations. When increasing maximum map sizes, profile memory usage and rendering performance in the canvas pipeline.
- Type import path: the FloorColor type is imported from './office/types.js'. If the file is moved or refactored, update that import to keep type annotations correct.
- Testing: add snapshot/UI tests that reference a few constants (palette, HIERARCHY sizes, GAME_MODS) so visual regressions are caught when these values change.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
