<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/office/types.ts",
  "source_hash": "cd8e691964c72083356d141c0b9e2b23202ee6446fdd0edf2f919b7e708fb6ca",
  "last_updated": "2026-02-26T19:08:54.620934+00:00",
  "tokens_used": 6876,
  "complexity_score": 2,
  "estimated_review_time_minutes": 10,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../README.md) > [webview-ui](../../README.md) > [src](../README.md) > [office](./README.md) > **types**

---

# types.ts

> **File:** `webview-ui/src/office/types.ts`

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

This file is a pure type-and-constant declaration module for the office webview UI. It re-exports several layout constants from ../constants.js (TILE_SIZE, DEFAULT_COLS, DEFAULT_ROWS, MAX_COLS, MAX_ROWS, and MATRIX_EFFECT_DURATION_SEC aliased to MATRIX_EFFECT_DURATION) and declares a set of const objects (TileType, CharacterState, Direction, FurnitureType, EditTool) that are converted to TypeScript union types via the (typeof X)[keyof typeof X] pattern. The file also defines numerous interfaces that model the UI data: FloorColor, Seat, FurnitureInstance, ToolActivity, FurnitureCatalogEntry, PlacedFurniture, OfficeLayout, Character, plus a SpriteData type (string[][]) used throughout. There are no functions or classes in this module.

The types here are intended for compile-time safety and runtime-friendly literal values (using as const). They describe how layout data is structured for serialization/deserialization between the host and the webview, for rendering and editing the office grid, furniture placement, character state and animation, and per-tile color adjustments. Important design choices visible in the code: numeric codes for TileType and Direction (compact for storage/serialization), string literal states for CharacterState and furniture/tool types, and per-tile FloorColor objects that support two modes (colorize vs adjust) via documented numeric ranges and an optional boolean. OfficeLayout includes a version field (value 1) to support future format evolution and parallel arrays for tiles and tileColors.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../constants.js](../../constants.js.md) | Re-exports named constants: TILE_SIZE, DEFAULT_COLS, DEFAULT_ROWS, MAX_COLS, MAX_ROWS, and MATRIX_EFFECT_DURATION_SEC (aliased to MATRIX_EFFECT_DURATION) so other modules can import layout dimensions and timing constants from this types module. |

## 📁 Directory

This file is part of the **office** directory. View the [directory index](_docs/webview-ui/src/office/README.md) to see all files in this module.

## Architecture Notes

- Type declaration module pattern: This file centralizes all UI-facing type definitions and small runtime-safe enums (created with `as const`), making it the canonical contract for office layout and character data exchanged between systems (renderer, editor, network).
- Literal-to-union technique: Uses `as const` + `(typeof X)[keyof typeof X]` to produce both a runtime value object and a corresponding TypeScript union type, enabling value reuse at runtime and strict typing at compile time.
- Compact numeric coding: TileType and Direction use numeric codes (0..n) which are efficient for storage and serialization. Character and furniture state values use string literals for readability.
- Versioning: OfficeLayout includes a `version: 1` field to allow migration logic elsewhere; when formats change, consumers should switch on this field.
- No I/O or side effects: This module contains no functions, no external calls, and only type/constant exports; validation and behavior are expected to be implemented by other modules.

## Usage Examples

### Validate or construct an OfficeLayout payload to send to the renderer

Create an OfficeLayout object with version=1, set cols/rows using DEFAULT_COLS/DEFAULT_ROWS (re-exported), populate `tiles` as a flat array of TileType numeric codes (e.g., TileType.FLOOR_1) aligning with cols*rows, and optionally set `tileColors` to an array of FloorColor|null parallel to `tiles`. Use PlacedFurniture entries with uid, type (FurnitureType or asset ID), and tile col/row to place furniture. Consumers should respect `tileColors` null meaning wall/no color.

### Render or animate a Character in the UI

Use a Character object (fields defined here) to drive rendering: `x`/`y` are pixel positions, `tileCol`/`tileRow` are current tile indices, `dir` is a Direction numeric code for sprite selection, `state` is a CharacterState string for choosing idle/walk/type animation sequences, and `frame`/`frameTimer` manage animation timing. Matrix effect fields (`matrixEffect`, `matrixEffectTimer`, `matrixEffectSeeds`) tie into the MATRIX_EFFECT_DURATION value re-exported from constants.

## Maintenance Notes

- Adding new TileType values: Extend the TileType const object and keep numeric values consistent; update any persistence/migration code and increment OfficeLayout.version if on-disk or network format changes.
- OfficeLayout.version bumps: If you change the layout shape (e.g., switch tiles from flat array to 2D), increment the `version` and provide migration logic in code that loads saved layouts.
- SpriteData expectations: SpriteData is string[][] where each entry is a hex color string or empty string for transparent; consuming code should validate dimensions against furniture footprintW/footprintH where applicable.
- FloorColor numeric ranges: The comments document expected ranges (h: 0–360 or -180–180 depending on mode; s, b, c ranges). Validation should be performed by callers; this file only documents the contract.
- Keep re-exports in sync: The re-export from ../constants.js must match available names in that module; if constants are renamed upstream, update the alias (`MATRIX_EFFECT_DURATION`) accordingly.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/office/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
