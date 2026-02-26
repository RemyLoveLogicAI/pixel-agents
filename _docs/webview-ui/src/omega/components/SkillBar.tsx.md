<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/components/SkillBar.tsx",
  "source_hash": "a6072fa5c93502b71c126b4c1968425eb01abc18898feaf77d46689a9a4e81bf",
  "last_updated": "2026-02-26T19:10:58.937600+00:00",
  "tokens_used": 5630,
  "complexity_score": 2,
  "estimated_review_time_minutes": 10,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [omega](../README.md) > [components](./README.md) > **SkillBar.mdx**

---

# SkillBar.tsx

> **File:** `webview-ui/src/omega/components/SkillBar.tsx`

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

This file defines a stateless React functional component SkillBar and an associated prop interface SkillBarProps. SkillBar enumerates all values of the OctoCodeSkill enum (imported from ../types.js) and renders a horizontally centered toolbar (barStyle) positioned near the bottom of the UI. For each skill it looks up SKILL_META and TIER_CONFIGS (imported from ../constants.js) to obtain a display icon, label, color and tier label; those values drive the button label, title attribute and button border/color styling.

The component is purely presentational and receives two props: selectedAgentId (number | null) and onDispatchSkill (callback). It computes a disabled state when selectedAgentId is null and applies different inline styles and button disabled attribute accordingly. Clicking a non-disabled button calls onDispatchSkill(selectedAgentId, skill). No network, storage, or side-effectful logic is included in this module; it depends only on local enums/constants and a parent to provide the dispatch callback. Inline style objects are used for the wrapper bar and per-button styling with explicit colors, padding, cursor and opacity changes for the disabled state.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../types.js](../../types.js.md) | Imports OctoCodeSkill (used as an enum/union of skill names). SkillBar enumerates Object.values(OctoCodeSkill) to build the list of buttons. |
| [../constants.js](../../constants.js.md) | Imports SKILL_META and TIER_CONFIGS. SKILL_META[skill] is used to read meta.icon, meta.label, meta.color and meta.tier. TIER_CONFIGS[meta.tier] is used to read tierCfg.label for the button title string. |

## 📁 Directory

This file is part of the **components** directory. View the [directory index](_docs/webview-ui/src/omega/components/README.md) to see all files in this module.

## Architecture Notes

- Implements a stateless functional React component pattern: renders based solely on props and imported constants, no internal state or hooks used.
- Uses enum/constant-driven rendering: skills are derived from OctoCodeSkill values and button visuals rely on SKILL_META and TIER_CONFIGS, making it data-driven and easy to extend by updating those constants.
- Inline CSS-in-JS style objects are used for both the container (barStyle) and per-button styles. This keeps styles colocated but may complicate theme-wide updates; migrating to a shared CSS/stylesheet or design-system tokens would centralize visual changes.
- Minimal error handling: the component guards against null selectedAgentId by disabling buttons; there are no runtime checks for missing SKILL_META entries (assumes SKILL_META and TIER_CONFIGS contain keys for every OctoCodeSkill).

## Usage Examples

### Dispatching a skill when an agent is selected

Parent component holds selectedAgentId (e.g., 42) and passes a handler onDispatchSkill. SkillBar renders enabled buttons. User clicks the 'BUILD' skill button; SkillBar calls onDispatchSkill(42, OctoCodeSkill.BUILD). Parent receives the call and performs the actual dispatch logic (network call, state update, etc.). If parent logic fails, SkillBar does not handle retries or errors—parent must manage outcomes.

### No agent selected — toolbar disabled

Parent passes selectedAgentId as null. SkillBar computes disabled=true and renders all buttons with disabled attribute, muted colors, reduced opacity and default cursor. Clicks do nothing because onClick first checks disabled/selectedAgentId and will not call onDispatchSkill. Parent should enable the bar by setting a valid selectedAgentId.

## Maintenance Notes

- Performance: mapping over Object.values(OctoCodeSkill) is cheap; no memoization required unless SKILL_META/TIER_CONFIGS are very large or re-renders are frequent. If parent causes frequent renders, wrap the component in React.memo to avoid unnecessary re-renders.
- Accessibility: buttons use title attributes and native <button disabled>. Consider adding aria-label or visually hidden text for screen readers if meta.icon is not descriptive. Keyboard focus styles are not explicitly provided and rely on browser defaults.
- Robustness: the component assumes SKILL_META and TIER_CONFIGS contain entries for every OctoCodeSkill value. Add defensive checks or fallbacks if those imports might be incomplete.
- Styling: styles are inline and repeated per button. If theming or CSS variables are required, move styles to a shared stylesheet or to a design system token module.
- Testing: unit tests should verify (1) rendering of one button per OctoCodeSkill, (2) correct title string composition using meta.label and tierCfg.label, (3) disabled behavior when selectedAgentId is null, and (4) that onDispatchSkill is called with correct args when clicked.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/components/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
