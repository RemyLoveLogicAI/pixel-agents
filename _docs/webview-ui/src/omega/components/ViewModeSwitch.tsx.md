<details>
<summary>Documentation Metadata (click to expand)</summary>

```json
{
  "doc_type": "file_overview",
  "file_path": "webview-ui/src/omega/components/ViewModeSwitch.tsx",
  "source_hash": "7bd0cd0532a630f17caea5a9dcb34d5dc5ca36eadaa5a494c67904b00e58bcd4",
  "last_updated": "2026-02-26T19:10:58.501981+00:00",
  "tokens_used": 5543,
  "complexity_score": 2,
  "estimated_review_time_minutes": 10,
  "external_dependencies": []
}
```

</details>

[Documentation Home](../../../../README.md) > [webview-ui](../../../README.md) > [src](../../README.md) > [omega](../README.md) > [components](./README.md) > **ViewModeSwitch.mdx**

---

# ViewModeSwitch.tsx

> **File:** `webview-ui/src/omega/components/ViewModeSwitch.tsx`

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

This file exports a single stateless functional React component, ViewModeSwitch, typed with a TypeScript interface ViewModeSwitchProps. The component receives the current viewMode (of type ViewMode) and an onChangeViewMode callback, renders three adjacent buttons (one per supported ViewMode) and calls onChangeViewMode(mode) when a button is clicked. Visual differences between the active and inactive modes are implemented via inline conditional styles (background, text color, boxShadow). A module-level constant modes lists the supported modes and labels.

ViewModeSwitch is a purely presentational overlay: it is absolutely positioned (bottom-right) with a fixed z-index, no internal state, and no side effects beyond invoking the provided callback. It relies on the ViewMode enum imported from ../types.js to type-check props and to identify modes in the modes array. The component is designed to be embedded in a parent that holds the selected view state and provides an updater function; the parent is responsible for changing application state when onChangeViewMode is invoked. No external APIs, databases, or side-effectful libraries are touched in this file.

## Dependencies

### Internal Dependencies

| Module | Usage |
| --- | --- |
| [../types.js](../../types.js.md) | Imports the named export ViewMode which is used for typing the viewMode prop and for the mode values in the local modes array. The component compares runtime viewMode values against those enum values and passes them to the onChangeViewMode callback. |

## 📁 Directory

This file is part of the **components** directory. View the [directory index](_docs/webview-ui/src/omega/components/README.md) to see all files in this module.

## Architecture Notes

- Implements a presentational (stateless) functional React component pattern: no internal state, behavior driven entirely by props.
- Inline styles are used to conditionally style active vs inactive buttons instead of CSS classes; this simplifies local styling but reduces ability to theme from CSS files.
- Renders buttons by mapping a module-level modes array into JSX; the array pairs ViewMode enum values with display labels so adding a new mode requires updating the modes array and the ViewMode type.
- Positioning uses absolute placement (bottom: 44, right: 8) and zIndex:50 making the component an overlay; ensure parent stacking context does not interfere.

## Usage Examples

### Embedding as a view-mode toggle in a parent that holds view state

Parent component stores the current selected mode (type ViewMode) and passes it as viewMode to ViewModeSwitch. Parent also passes a function onChangeViewMode that updates that state. When a user clicks one of the rendered buttons, ViewModeSwitch calls onChangeViewMode(mode) with the chosen ViewMode value. The parent reacts by updating its state and re-rendering children to reflect the selected view (Office / Org Chart / Heatmap).

## Maintenance Notes

- Inline styles: consider extracting to CSS modules or styled-components if theming or responsive adjustments are required.
- Accessibility: the buttons lack ARIA attributes and keyboard-focus styling; add aria-pressed or role where appropriate and ensure visible focus outlines for keyboard users.
- Button key uses mode (enum) directly; ensure ViewMode values are stable (string/number) so React keys remain consistent.
- Visual overlap via marginLeft: -2 is used to visually join buttons; changing border width or radius requires adjusting this value.
- Unit tests should verify: the correct button appears active based on viewMode, clicking each button calls onChangeViewMode with the correct ViewMode, and the component renders without runtime errors when provided valid props.

---

## Navigation

**↑ Parent Directory:** [Go up](_docs/webview-ui/src/omega/components/README.md)

---

*This documentation was automatically generated by AI ([Woden DocBot](https://github.com/marketplace/ai-document-creator)) and may contain errors. It is the responsibility of the user to validate the accuracy and completeness of this documentation.*
