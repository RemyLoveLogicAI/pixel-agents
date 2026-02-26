<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/constants.ts",
  "source_hash": "f9dd7ccbebb71a981cff0e834bf523e86738659d506579867f529b6fae5a437f",
  "last_updated": "2026-02-26T19:11:10.071446+00:00",
  "tokens_used": 9014,
  "complexity_score": 2,
  "estimated_review_time_minutes": 10,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../README.md) > [webview-ui](../../README.md) > [src](../README.md) > [omega](./README.md) > **constants**

---

# constants.ts

> **File:** `webview-ui/src/omega/constants.ts`

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

This file is a pure constants/configuration module that centralizes all "magic numbers" and static definitions used throughout the Omega v2 UI and game logic. It exports a color palette (OP), per-tier configuration (TIER_CONFIGS), per-skill metadata (SKILL_META), a mapping from skills to tiers (SKILL_TIER_MAP), default game mods (DEFAULT_MODS), cheat-code mappings (CHEAT_CODES), default achievements and quests, particle and UI layout constants, and XP-related tuning constants. All exported values are typed; key records use TypeScript types and enums imported from './types.js' to provide compile-time guarantees (for example TIER_CONFIGS is typed Record<TierLevel, TierConfig>). The palette OP is declared with `as const` to preserve literal types for colors.

Because this module contains no functions or classes (it only declares and exports constants and typed records), it is side-effect free and safe to import from render and logic modules. Typical consumers are UI rendering code (reads colors, sizes, icons, labels), game systems (reads XP numbers, mod definitions, cheat-code map, achievements and quests for initialization), and agent/skill code (reads SKILL_META, SKILL_TIER_MAP and TIER_CONFIGS to determine available skills, promotion rules and visuals). Important fields are explicit in the code: TIER_CONFIGS entries include tier, label, emoji, scale, maxCount, canDelegateTo, canSpawn, skills, color, ringColor, size, and crownSprite; SKILL_META entries include skill, tier, tool, label, color, and icon; DEFAULT_MODS items include id, name, desc, cost, color, active, and expiresAt; achievements and quests have id, name, desc and progress-related fields.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [./types.js](.././types.js.md) | Imports both type-only exports and value exports from the local types module. Specifically: `import type { TierConfig, SkillMeta, GameMod, Achievement, Quest } from './types.js'` is used to type the records (e.g., TIER_CONFIGS: Record<TierLevel, TierConfig>, DEFAULT_MODS: GameMod[]). `import { TierLevel, OctoCodeSkill } from './types.js'` imports the TierLevel and OctoCodeSkill enums/values which are used as keys for TIER_CONFIGS, SKILL_META, SKILL_TIER_MAP and for listing skills in each tier. |

## 📁 Directory

This file is part of the **omega** directory. View the [directory index](_docs/webview-ui/src/omega/README.md) to see all files in this module.

## Architecture Notes

- This module implements a single responsibility: centralizing static configuration and magic numbers. No functions or classes are present — only typed exports.
- Typed records: TIER_CONFIGS and SKILL_META use Record keyed by enums (TierLevel, OctoCodeSkill). This provides compile-time checks that every enum value is covered and that each entry satisfies the expected shape (TierConfig, SkillMeta, etc.).
- Design choice: separating presentation values (colors, sizes, emojis/icons) from logic values (XP, mod costs, targets) lets UI and game logic import only what they need; everything is immutable at module-level and safe to reuse.
- No external side effects or runtime configuration: all values are hard-coded. To change semantics (e.g., add a new tier or skill) the corresponding enums/types in ./types.js must be updated in lock-step to avoid type mismatches.

## Usage Examples

### Rendering an agent node in the team view

UI code reads TIER_CONFIGS[TierLevel.EMPLOYEE] to obtain the color (color), ringColor, size, scale and label to render a visual node for an employee. The UI can show the emoji (emoji) as a compact avatar. SKILL_META entries can be used to render a skill toolbar for that agent by filtering SKILL_META for skills whose tier equals the agent's tier (or by using the skills array present on each TIER_CONFIGS entry). This produces consistent visuals and tooltips using the label and icon fields from SKILL_META.

### Granting XP for player actions

Game logic increments player/team XP using constants like XP_PER_TOOL_USE, XP_PER_DELEGATION, XP_PER_PROMOTION and XP_PER_SKILL_COMPLETE. Level calculations reference XP_LEVEL_BASE and XP_LEVEL_MULTIPLIER to compute thresholds. These constants are pure numbers exported from this module and are intended to be consumed in reward/level-up logic elsewhere in the codebase.

### Initializing default gameplay state

At session start the game initializes available mods from DEFAULT_MODS (each object contains id, name, desc, cost, color, active, expiresAt). DEFAULT_ACHIEVEMENTS and DEFAULT_QUESTS provide the initial lists used by achievement/quest managers to track progress and presentation. CHEAT_CODES is consulted when parsing a code string to map to a mod id or special event (e.g., entering 'iddqd' maps to 'godmode').

## Maintenance Notes

- When adding new TierLevel or OctoCodeSkill enum values in ./types.js, update TIER_CONFIGS, SKILL_META and SKILL_TIER_MAP to include entries for the new values to maintain type-safety. Missing enum keys could cause a TypeScript type error.
- Be cautious changing numeric tuning values (XP constants, particle counts, sizes): these are referenced by runtime logic and UI code; coordinate changes with tests or visual QA to avoid unintended gameplay imbalance or layout breakage.
- Icons are stored as Unicode emoji strings — if you need fallback or platform-specific rendering, consider replacing the icon field with a component or an icon key consumed by the UI mapping layer.
- DEFAULT_MODS and other arrays contain mutable objects (e.g., active, expiresAt). Consumers that mutate these objects should clone them if they want to keep the base defaults intact for resets or testing.
- Add unit tests to assert that critical numeric thresholds are within expected bounds (e.g., XP_LEVEL_MULTIPLIER > 1, PARTICLE_MAX_COUNT reasonable for target platforms) and that record keys align with the enums.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
