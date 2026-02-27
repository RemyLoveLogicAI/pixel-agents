# 🏗️ Architecture

## System Overview

Pixel Agents uses a **hybrid architecture** supporting both VS Code extension (v1) and standalone web client (v2).

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACES                          │
├─────────────────┬─────────────────────┬─────────────────────────┤
│   VS Code       │    Web Client       │    Mobile Client        │
│   Extension     │    (React/Canvas)   │    (PWA)                │
│   (v1.0)        │    (v2.0)           │    (v2.0)               │
└────────┬────────┴──────────┬──────────┴────────────┬────────────┘
         │                   │                       │
         │ postMessage       │ REST + WebSocket      │ REST + WS
         │                   │                       │
         ▼                   ▼                       ▼
┌─────────────────┐  ┌─────────────────────────────────────────────┐
│  VS Code Host   │  │            BACKEND SERVICE                  │
│  (Node.js)      │  │  • Express Server (REST API)                │
│                 │  │  • WebSocket (Real-time events)             │
│  • FileWatcher  │  │  • SQLite Database                          │
│  • AgentManager │  │  • gRPC (Future)                            │
│  • Transcript   │  │                                             │
│    Parser       │  └─────────────────────────────────────────────┘
└────────┬────────┘                      │
         │                               │
         │ fs.watch + polling            │
         ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    CLI OBSERVABILITY LAYER                        │
│  ~/.claude/projects/<hash>/<session>.jsonl                       │
│                                                                   │
│  Supported: Claude Code | Future: Cursor, Codex, OpenCode        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Package Structure (v2.0)

```
pixel-agents/
├── packages/
│   ├── backend/              ← Node.js + Express + SQLite
│   │   ├── src/
│   │   │   ├── index.ts      ← Server entry
│   │   │   ├── api/          ← REST routes
│   │   │   ├── database/     ← SQLite models
│   │   │   ├── cli/          ← File watcher
│   │   │   └── observability/← Event streaming
│   │   └── package.json
│   │
│   ├── frontend/             ← React + Vite + Canvas
│   │   ├── src/
│   │   │   ├── components/   ← React UI
│   │   │   ├── office/       ← Canvas renderer
│   │   │   ├── stores/       ← Zustand state
│   │   │   └── api/          ← Backend client
│   │   └── package.json
│   │
│   └── shared/               ← TypeScript interfaces
│       ├── src/types.ts
│       └── package.json
│
├── src/                      ← VS Code extension (v1)
├── webview-ui/               ← Extension webview (v1)
└── package.json              ← Root workspaces
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Extension** | TypeScript + VS Code API | VS Code integration |
| **Backend** | Node.js + Express | REST API server |
| **Real-time** | WebSocket | Live observability |
| **Database** | SQLite | Persistence |
| **Frontend** | React 19 + Vite | Web UI |
| **Rendering** | Canvas 2D | Pixel art office |
| **State** | Zustand | Client state |
| **Build** | esbuild + Vite | Fast bundling |
| **Testing** | Vitest | Unit/integration |

---

## Data Flow

### Agent Status Update

```
1. Claude Code writes to JSONL
   ~/.claude/projects/<hash>/<session>.jsonl
   
2. File Watcher detects change
   fs.watch + 2s polling backup
   
3. Transcript Parser extracts event
   tool_use → agentToolStart
   tool_result → agentToolDone
   turn_duration → agentStatus:waiting
   
4. Event pushed to clients
   Extension: postMessage to webview
   Backend: WebSocket broadcast + DB update
   
5. UI updates
   Character animation changes
   Speech bubble appears
   Status indicator updates
```