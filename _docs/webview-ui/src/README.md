<details><summary>Directory Metadata (for smart change detection)</summary>

```json
{
  "doc_type": "directory_index",
  "directory_path": "_docs/webview-ui/src",
  "directory_hash": "4a4035032a18a934fb43d334d4a12ee9635e4b701b1b2b7aa5a32a4af3170592",
  "file_count": 3,
  "file_hashes": {
    "App.tsx": "45efd427932e2708",
    "constants.ts": "d51a1b16cdefd13c",
    "index.css": "3391b0dae4bd51e5"
  }
}
```

</details>

[Documentation Home](../../README.md) > [webview-ui](../README.md) > [src](./README.md) > **src**

---

# 📁 src

> **Purpose:** Holds the webview UI source for the extension's frontend layer, including the main UI entry, shared constants, and styling for the webview UI.
> 

![Organization: Hierarchical](https://img.shields.io/badge/Organization-Hierarchical-blue)

## 📑 Table of Contents


- [Overview](#overview)
- [Subdirectories](#subdirectories)
- [All Files](#all-files)
- [Dependencies](#dependencies)
- [Architecture Notes](#architecture-notes)

---

## Overview

This directory contains the root-level source files that make up the webview UI layer. At the root there are three files: App.tsx (the main UI entry file for the webview UI), constants.ts (shared static values used by the webview UI), and index.css (global styles applied to the webview layer). These root files together provide the entry point, configuration values, and base styling for the webview UI.

Below the root, the directory is organized into focused subdirectories. The components/ folder holds TSX UI component source files (two files: AgentHierarchy.tsx and Scanlines.tsx) that provide self-contained visual elements. The hooks/ folder contains a single TypeScript hook (useExtensionMessages.ts) that encapsulates extension message handling logic for components to consume. The office/ folder stores TypeScript type definitions and engine-level office-related source (a root types.ts plus an engine subfolder for character-related sources). The omega/ folder centralizes constants (root constants.ts) and a dedicated components/ subfolder for omega-specific UI elements. Together, root files and these subdirectories form the webview UI implementation: root files bootstrap and style the UI while subdirectories provide components, reusable hooks, types, and area-specific constants used throughout the webview.


### File Organization

Root-level files provide the main entry (App.tsx), shared constants, and global styles. Feature- or concern-specific code is grouped into subdirectories: components for visual elements, hooks for reusable logic, office for typed definitions and engine-level types, and omega for area-specific constants and components. This keeps UI elements, reusable hooks, and type/constant definitions separated and discoverable.

## 📂 Subdirectories

This directory contains the following subdirectories:

### [📁 components](./components/README.md)

**Purpose:** Holds UI component source files (TSX) used by the webview-ui layer; provides self-contained visual elements for the webview.

![Files: 2](https://img.shields.io/badge/Files-2-blue)

---

### [📁 hooks](./hooks/README.md)

**Purpose:** Contains TypeScript hook(s) used by the webview UI layer; provides reusable logic exposed as hooks for components to consume.

![Files: 1](https://img.shields.io/badge/Files-1-blue)

---

### [📁 office](./office/README.md)

**Purpose:** Houses TypeScript type definitions and engine-level office-related source used by the webview UI to represent office module types and engine character code.

![Files: 1](https://img.shields.io/badge/Files-1-blue)

---

### [📁 omega](./omega/README.md)

**Purpose:** Holds constants and UI component sources for the omega area of the webview UI, providing centralized static values and a dedicated components folder for visual/control elements.

![Files: 1](https://img.shields.io/badge/Files-1-blue)

---
## 📂 All Files

| File | Type |
| --- | --- |
| [App.tsx](./App.tsx.md) | ⚛️ React |
| [constants.ts](./constants.ts.md) | 📘 TypeScript |
| [index.css](./index.css.md) | 🎨 CSS |

## Dependencies

### Internal Dependencies

| Dependency | Usage |
| --- | --- |
| [components/](../components/.md) | Provides UI building blocks used by App.tsx and other parts of the webview UI. |
| [hooks/](../hooks/.md) | Exposes reusable behavior (e.g. extension message handling) for components and App.tsx to consume. |
| [office/](../office/.md) | Supplies TypeScript types and engine-level office-related definitions referenced by UI code. |
| [omega/](../omega/.md) | Contains area-specific constants and components used by parts of the UI that target the omega area. |

## Architecture Notes

- Separation of concerns: root-level entry, shared constants, and styling are separated from components, hooks, types, and area-specific constants.
- Components are intended to be self-contained visual elements; hooks provide reusable logic for message handling so UI and behavior are decoupled.
- office/ centralizes type declarations and engine-level sources to isolate domain types from UI implementation.

---

## Navigation

**↑ Parent Directory:** [Go up](../README.md)
**🔗 Related:** [components](./components/README.md) • [hooks](./hooks/README.md) • [office](./office/README.md) • [omega](./omega/README.md)

---

*Generated by Woden Docbot*