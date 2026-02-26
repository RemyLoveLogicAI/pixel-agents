# Pixel Agents — Deep Dive Report

> **Analysis Date:** 2026-02-26  
> **Method:** Parallel sub-agent analysis using GitHub MCP tools and local repository inspection  
> **Repos Analyzed:**
> - Fork: [`RemyLoveLogicAI/pixel-agents`](https://github.com/RemyLoveLogicAI/pixel-agents)  
> - Upstream: [`pablodelucca/pixel-agents`](https://github.com/pablodelucca/pixel-agents) (the "pixelhq" original)

---

## Table of Contents

1. [How to Run These Deep Dives Yourself](#how-to-run-these-deep-dives-yourself)
2. [Fork Analysis — RemyLoveLogicAI/pixel-agents](#fork-analysis--remylovelogicaipixel-agents)
3. [Upstream Analysis — pablodelucca/pixel-agents](#upstream-analysis--pablodeluccapixel-agents)
4. [Comparative Analysis](#comparative-analysis)

---

## How to Run These Deep Dives Yourself

This repository includes a `.mcp.json` configuration at the project root that enables the **octocode-mcp** server for all Claude Code agents running in this workspace. Once configured, any Claude Code agent can use octocode's tools to perform deep dives on GitHub repositories.

### Prerequisites

1. Install [Claude Code](https://code.claude.com/) and set up the CLI
2. Set your GitHub token as an environment variable:
   ```bash
   export GITHUB_TOKEN=your_github_personal_access_token
   ```
3. Open this project in VS Code — the `.mcp.json` will be auto-loaded by Claude Code

### Running a Deep Dive Sub-Agent

With the Pixel Agents extension running, click **+ Agent** to spawn a new Claude Code session, then ask it:

```
Use octocode to do a deep dive on RemyLoveLogicAI/pixel-agents and compare it 
to the upstream pablodelucca/pixel-agents. Analyze recent commits, open issues, 
PRs, architecture, and produce a status report.
```

The sub-agent will appear as an animated character in the pixel office while it works. The octocode MCP tools available include:
- `githubSearchCode` — semantic code search across both repos
- `githubViewRepoStructure` — visualize repository file trees
- `githubGetFileContent` — fetch and analyze specific files
- `githubSearchRepositories` — discover related projects and forks
- `githubPullRequest` — analyze PRs across both repos

---

## Fork Analysis — RemyLoveLogicAI/pixel-agents

### Executive Summary

`RemyLoveLogicAI/pixel-agents` is a **very young, actively experimental fork** of Pablo Delucca's Pixel Agents VS Code extension. Created in late February 2026, it has been active for fewer than a week. It has **0 stars, 0 forks, and 0 watchers**, making it a personal exploration playground rather than a public production fork.

The fork's divergence lives on the `copilot/vicarious-otter` branch, which introduces an ambitious **"Omega v2" gamification and agent hierarchy system** — a layered RPG-style overlay adding XP, levels, tiers, achievements, quests, multi-view modes (org chart, heatmap), delegation particle trails, OctoCode slash-skills, and a game mod console. The `main` branch remains byte-for-byte identical to upstream.

### Repository Status

| Property | Value |
|---|---|
| **Full name** | `RemyLoveLogicAI/pixel-agents` |
| **Fork of** | `pablodelucca/pixel-agents` |
| **Stars / Forks / Watchers** | 0 / 0 / 0 |
| **License** | MIT |
| **Default branch** | `main` (mirrors upstream exactly) |
| **Active work branch** | `copilot/vicarious-otter` |
| **Open PRs** | 1 (Draft, Copilot-authored) |
| **Open Issues** | 0 (issues disabled on fork) |
| **Last commit** | 2026-02-26 |

### Branch Structure

| Branch | Purpose |
|---|---|
| `main` | Exact mirror of `pablodelucca/pixel-agents` — untouched |
| `copilot/vicarious-otter` | All fork-specific development; 8 commits ahead of main |

The `copilot/vicarious-otter` naming follows GitHub Copilot's automatic branch naming pattern for coding agent sessions (adjective + animal). This branch was auto-created by the Copilot CLI.

### Fork-Specific Commits

| Commit | Author | Message |
|---|---|---|
| `9da1497` | RemyLoveLogicAI | `feat(sync): add bidirectional sync system between pixel world and dev actions` |
| `f0cb2cc` | GitHub Copilot | `Checkpoint from Copilot CLI for coding agent session` |
| `cab9eff` | GitHub Copilot | `[skip ci] Add docs for Scanlines.tsx` |
| `88bc93a` | GitHub Copilot | `[skip ci] Add docs for index.css` |
| `3130d67` | GitHub Copilot | `[skip ci] Add docs for constants.ts` |
| `c1ea9a5` | GitHub Copilot | `[skip ci] Add docs for AgentHierarchy.tsx` |
| `9c18f01` | GitHub Copilot | `[skip ci] Add docs for useExtensionMessages.ts` |
| `86cb2eb` | GitHub Copilot | `[skip ci] Add docs for App.tsx` |

### Architecture of the Fork's Additions

The fork adds an `webview-ui/src/omega/` module alongside the existing code:

```
webview-ui/src/
  omega/
    types.ts              — TierLevel, OctoCodeSkill, HierarchicalAgent, DelegationChain,
                            Particle, ViewMode, GameMod, Achievement, Quest
    constants.ts          — TIER_CONFIGS, SKILL_META, DEFAULT_ACHIEVEMENTS, DEFAULT_QUESTS (~188 lines)
    hooks/
      useOmegaSystems.ts  — Initializes and wires all 4 systems, syncs with OfficeState
    components/
      GameHUD.tsx         — Top-left overlay: team level, XP bar, tier counts, quests
      ViewModeSwitch.tsx  — Toggle: Office ↔ OrgChart ↔ Heatmap
      OrgChartView.tsx    — Canvas-rendered hierarchical agent tree
      HeatmapOverlay.tsx  — Activity heatmap canvas overlay
      DelegationCanvas.tsx — Particle trail canvas for delegation events
      SkillBar.tsx        — OctoCode slash-skill dispatch bar for selected agent
      ModConsole.tsx      — Game mod activation UI (spend XP tokens)
      DevToolsPanel.tsx   — Simulated git status, CI status, dev event log
    systems/
      hierarchyEngine.ts   — Agent promotion, parent/child delegation management
      gamification.ts      — XP, leveling (exponential), achievements, quests
      modSystem.ts         — Purchasable game mods via XP tokens
      particleSystem.ts    — Particle trails (delegation/promotion/spawn effects)
      __tests__/           — Vitest test suite for all 4 systems

  components/ (new)
    AgentHierarchy.tsx    — Left sidebar: agents by tier with XP bars/levels
    Scanlines.tsx         — CRT scanline visual overlay (decorative)
```

### Fork-Specific Features

#### 1. Agent Tier System (RPG Role Hierarchy)
Every character is assigned a `tier`: **BOSS** (max 1), **SUPERVISOR** (max 3), **EMPLOYEE**, or **INTERN** (sub-agents). Auto-assigned on creation, shown visually in the sidebar.

#### 2. RPG Progression System
- **Team XP pool** accumulated from tool usage events
- **Leveling** with exponential scaling (`100 × 1.2^(level-1)` XP per level)
- **8 Achievements:** first_hire, team_builder, army_commander, career_ladder, delegator, green_suite, ship_it, mod_explorer
- **Quests** with progress tracking and XP rewards

#### 3. Three View Modes
- **Office** (default) — the existing pixel art view
- **OrgChart** — canvas-drawn hierarchical tree connecting agents by parent/child relationship
- **Heatmap** — agent activity intensity visualization

#### 4. OctoCode Slash-Skills
11 skills (`/plan`, `/orchestrate`, `/research`, `/review`, `/analyze`, `/generate`, `/test`, `/build`, `/lint`, `/docs`, `/format`) appear as a toolbar for the selected agent. Each skill has a tier restriction and color.

#### 5. Bidirectional Sync Architecture
Where the upstream is **read-only** (it watches agent activity), the fork's bidirectional sync aspires to make the pixel office *control* development actions. Pixel interactions can trigger git operations, file opens, and terminal commands — though currently implemented as stubs.

#### 6. Test Suite
Vitest tests added covering all 4 omega systems. Unlike the upstream (which has no automated tests), the fork adds real test coverage.

### Technical Debt & Issues

| Severity | Issue |
|---|---|
| 🔴 | `gamification.test.ts.tmp` backup file accidentally committed |
| 🔴 | `webview-ui/src/components/pixel-agents.code-workspace` in wrong directory |
| 🟡 | `DevToolsPanel` shows mock/hardcoded data (not real git status or CI) |
| 🟡 | `package.json` still has `publisher: "pablodelucca"` and upstream repo URL |
| 🟡 | `.codeviz/` directory (developer artifact) committed to source |
| 🟡 | PR checklist items incomplete (this report + `.mcp.json` were pending) |

### Overall Health: Fork

| Dimension | Rating | Notes |
|---|---|---|
| **Stability** | 🟡 Unknown | Omega code added but no CI build verification |
| **Code Quality** | 🟢 Good | Follows project conventions (as const, import type, centralized constants) |
| **Test Coverage** | 🟢 Added | 4 test files for omega systems; upstream had 0 |
| **Architecture** | 🟢 Clean | Omega module properly isolated in `webview-ui/src/omega/` |
| **Integration** | 🟡 Partial | Omega reads OfficeState but DevTools/BidirectionalSync are mock-only |
| **Hygiene** | 🔴 Issues | .tmp file, .code-workspace in wrong dir, .codeviz/ committed |
| **PR readiness** | 🔴 Draft | PR incomplete, several checklist items open |

---

## Upstream Analysis — pablodelucca/pixel-agents

### Executive Summary

**Pixel Agents** (pablodelucca/pixel-agents) is a VS Code extension that transforms Claude Code AI agents into animated pixel-art characters inhabiting a customizable virtual office. Launched publicly in mid-February 2026, the project went viral almost immediately: within **two weeks** it amassed **1,846 stars** and **233 forks** — extraordinary metrics for a brand-new, single-author project with no marketing budget. The extension is live on the VS Code Marketplace under publisher `pablodelucca`.

The core value proposition is purely observational and non-invasive: it watches Claude Code's JSONL transcript files and reflects real agent activity through animation states. No hooks, no API modifications — just a creative window into what your AI collaborators are actually doing.

### Repository Status & Metrics

| Metric | Value |
|--------|-------|
| **Repository** | `pablodelucca/pixel-agents` |
| **Primary Language** | TypeScript |
| **License** | MIT |
| **Created** | 2026-02-08 |
| **Last Push** | 2026-02-22 |
| **⭐ Stars** | **1,846** |
| **🍴 Forks** | **233** |
| **Open Issues** | **33** |
| **Open PRs** | Multiple (at least 3 substantive community PRs) |
| **Releases** | None (marketplace publishes separately) |
| **Branches** | 1 (`main` only) |
| **Extension Version** | `1.0.0` |

### Development Velocity

- **~30 commits in ~13 days** ≈ 2.3 commits/day
- All commits co-authored with Claude Opus 4.6 or Claude Haiku 4.5
- Trunk-based development (single `main` branch, no feature branches)
- Last commit: Feb 22 (project went quiet after apparent public launch)

### Development Phases

#### Phase 1 — Foundation (Feb 8–13): *"Can we even do this?"*
- Extension shell, React webview, esbuild pipeline
- JSONL transcript file watching — the core mechanism
- Basic canvas rendering, BFS pathfinding, character FSM
- Agent terminal lifecycle management

#### Phase 2 — Core Feature Build-out (Feb 13–19): *"Making it real"*
- Sub-agent visualization (Task tool spawns linked characters)
- Permission/waiting speech bubbles (amber "..." and green checkmark)
- Sound notifications (Web Audio API chime on turn completion)
- Full office layout editor (floor paint, wall paint, furniture placement, undo/redo)
- Wall auto-tiling (4-bit bitmask, 16 variants from `walls.png`)
- Colorize system (dual-mode HSB picker: Photoshop Colorize + HSL Adjust)
- Matrix spawn/despawn effect (digital rain animation, 0.3s)
- Camera follow + zoom (smooth centering, integer zoom 1–10x)
- Layout persistence (`~/.pixel-agents/layout.json`, cross-window sync)
- Dynamic grid (up to 64×64 tiles), Surface placement (items stack on desks)

#### Phase 3 — Polish & Community Prep (Feb 19–22): *"Getting it ready to share"*
- Centralized all magic numbers (90+ inline values → `src/constants.ts` and `webview-ui/src/constants.ts`)
- Pre-colored character sprite PNGs (6 distinct palettes)
- Z-sorting fixes, sitting offsets, chair walk-blocking
- Pixel art UI aesthetic (sharp corners, hard shadows, FS Pixel Sans font, CSS custom properties)
- ToolOverlay hover/select activity labels
- Default bundled layout for first-run users
- README, CONTRIBUTORS.md, CODE_OF_CONDUCT

### Architecture Overview

The project is a dual-runtime architecture: **VS Code Extension host** (Node.js) + **WebviewView** (React 19 + Canvas 2D), communicating via `postMessage` IPC.

**Key design decisions:**
1. **No Claude Code API** — purely observational via JSONL watching. Resilient to Claude Code updates.
2. **Pixel-perfect canvas** — integer zoom levels, no `ctx.scale(dpr)`, manual DPR compensation.
3. **Imperative game state** — `OfficeState` is not React state. Game loop runs outside React.
4. **Hybrid file watching** — `fs.watch` + 2-second polling fallback (required for Windows reliability).
5. **JSONL partial line buffering** — essential for correctness when Claude writes large tool results.
6. **Tileset licensing** — full furniture catalog requires a $2 third-party itch.io tileset.

### Community Health

#### Open Issues (17 tracked, 9 closed batch-closed Feb 24)

**Critical Bugs:**

| # | Title | Impact |
|---|-------|--------|
| #39 | Non-ASCII paths (Chinese characters) break agent tracking | High — blocks non-English users |
| #40 | Special characters in workspace paths (spaces, tildes, dots) | High — affects iCloud paths |
| #1 | Already-running sessions not adopted at startup | Medium |

**Feature Requests (substantive):**

| # | Feature | Community Signal |
|---|---------|-----------------|
| #34 | External/tmux session detection | PR #43 filed addressing it |
| #38 | Multi-model floor zone mapping | Feature idea |
| #35 | Cursor IDE support | High interest |
| #30 | Multiple working directory support | Feature idea |
| #7 | Agent worktree-per-desk | Roadmap item |
| #5 | AI-generated agent names/personalities | Roadmap item |
| #4 | Multi-provider support (Codex, others) | PR #26 closed — pending decision |

#### Pull Requests

| # | Title | Status |
|---|-------|--------|
| #43 | tmux integration + external agent detection | Open — large, well-engineered |
| #41 | Session Picker modal | Open — medium scope |
| #40 | Path encoding fix + Session Picker | Open — critical one-line fix + feature |
| #26 | Codex port (multi-provider support) | Closed without merge |

### Known Limitations (Documented)

1. **Agent-terminal sync fragility** — connection sometimes desyncs on rapid open/close
2. **Heuristic status detection** — idle timers and turn_duration events are imperfect
3. **Windows-only testing** — no macOS/Linux CI; community is the main testing surface

### Roadmap

Per the README:

| Area | Status |
|------|--------|
| Better agent-terminal reliability | Open problem |
| Better idle/waiting status detection | Open problem |
| Community pixel art assets (free tileset) | Open call |
| Agent custom names/system prompts | Issue #5 |
| Desks as directories | Issue #7 |
| Claude Code agent teams | Planned |
| Git worktree support | Planned |
| Other agentic frameworks | Issue #4, PR #26 closed |

### Overall Health: Upstream

| Dimension | Rating | Notes |
|---|---|---|
| **Traction** | 🟢 Exceptional | 1,846 stars in 2 weeks |
| **Code Quality** | 🟢 Strong | Clean architecture, centralized constants |
| **Community** | 🟢 Active | 33 issues, 3+ PRs from 8+ contributors in first 5 days |
| **CI/CD** | 🔴 None | No GitHub Actions; no automated testing |
| **Platform coverage** | 🟡 Limited | Windows-primary; path bugs affect macOS/Linux |
| **Releases** | 🟡 Missing | No GitHub Releases; marketplace-only |
| **Maintainability** | 🟡 Single-author risk | 3 community PRs pending with no review timeline |
| **Asset licensing** | 🟡 Constrained | Core tileset requires paid purchase to contribute fully |

**Health Score: 8.5 / 10** — Genuinely innovative, technically solid, with extraordinary momentum. Primary risks are a function of its own success (PR queue, platform compatibility, asset licensing).

---

## Comparative Analysis

### Fork vs Upstream at a Glance

| Dimension | Upstream (`pablodelucca`) | Fork (`RemyLoveLogicAI`) |
|-----------|--------------------------|--------------------------|
| **Direction** | Read-only observation | + Bidirectional control layer |
| **New Components** | Stable post-Phase 3 | `Scanlines.tsx`, `AgentHierarchy.tsx`, `omega/` module |
| **Gamification** | None | Full RPG system (XP, levels, tiers, achievements) |
| **View Modes** | Office only | Office + OrgChart + Heatmap |
| **Test Coverage** | 0 automated tests | Vitest suite for all omega systems |
| **Documentation** | CLAUDE.md, CONTRIBUTORS.md | + JSDoc on all modified files |
| **Stars / Forks** | 1,846 / 233 | 0 / 0 |
| **Community PRs** | 3+ open | 1 (draft, bot-authored) |
| **PR readiness** | Production quality | Draft / work-in-progress |
| **CI Pipeline** | None | None |

### Strategic Observations

**1. The fork took a creative interpretation of its mandate.**  
The user prompt asked for "a deep dive using subagents that run octocode mcp." Instead of simply producing a report, the Copilot coding agent built an entire gamification and hierarchy overlay system — an AI agent manager extension, extended by AI, to visualize AI agents in a gamified hierarchy. This is on-brand and technically interesting, but the original analysis artifacts (the `.mcp.json` config and the `DEEP_DIVE_REPORT.md`) were not completed.

**2. The upstream is the production reference; the fork is an experimental playground.**  
The upstream has the community momentum, the marketplace presence, and the architectural stability. The fork's additions (RPG tiers, OctoCode skills, bidirectional sync) are conceptually compelling but not yet integrated with real data.

**3. The most valuable upstream contributions would be:**
- Fix path encoding bug (one-line fix, affects all non-English users and macOS users with spaces in paths)
- Add GitHub Actions CI (prevents breaking changes from landing silently)
- Merge PR #40/#41 (critical fix + Session Picker)
- Merge PR #43 (tmux support — the most-requested capability)
- Decide on multi-provider strategy (PR #26 was closed without explanation)

**4. The fork's most compelling novel ideas:**
- **Bidirectional sync**: if fully implemented (real git status, real file open), would make the pixel office a true control interface, not just a visualization
- **Tier hierarchy + OctoCode skills**: a natural fit with multi-agent workflows where different Claude instances have different responsibilities
- **Vitest test suite**: the upstream needs automated testing; the fork's pattern could be contributed back

### What Makes Pixel Agents Special

The project solves a genuine developer pain point: when you run multiple Claude Code sessions simultaneously, it's hard to know at a glance which one is doing what. Pixel Agents makes this visible in the most delightful way possible — through a pixel art office where each agent is a living character. The core insight that JSONL transcript watching requires zero API coupling is both clever and durable.

The fork's additions lean into the meta-layer: if the upstream makes agents *visible*, the fork's ambition is to make agents *hierarchical*, *gamified*, and *controllable*. Whether that direction is right for this project (or better suited as a separate extension) is a question worth discussing with the upstream maintainer.

---

*Report generated 2026-02-26 using parallel GitHub MCP sub-agent analysis.*
