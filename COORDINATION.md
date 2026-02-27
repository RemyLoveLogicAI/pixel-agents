# 🤝 COORDINATION — Week 2 Task Split

**Date**: February 27, 2026  
**Status**: Active coordination between Qoder + Claude Code

---

## 📋 Current State

### ✅ Completed (Week 1 + Week 2 Start)
- Express server + REST API
- SQLite database
- WebSocket manager
- File watcher module (`cli/fileWatcher.ts`)
- JSONL parser (`cli/jsonlParser.ts`)
- Event processor (`observability/eventProcessor.ts`)
- GitHub wiki docs pushed

### ⏳ Remaining Week 2 Tasks

---

## 🎯 TASK ASSIGNMENTS

### Claude Code — Backend Integration
**Priority**: HIGH  
**Estimated**: 2-3 hours

| Task | Description | File |
|------|-------------|------|
| **4.4** | Wire file watcher into server startup | `src/index.ts` |
| **4.5** | Auto-detect JSONL files in `~/.claude/projects/` | `src/cli/workspaceScanner.ts` |
| **4.6** | Register agents automatically when JSONL found | `src/agents/autoRegister.ts` |
| **4.7** | Add polling fallback (2s) for unreliable fs.watch | `src/cli/fileWatcher.ts` |

**Acceptance Criteria**:
```bash
# Server starts and automatically:
# 1. Scans ~/.claude/projects/ for workspaces
# 2. Finds JSONL files
# 3. Creates agents in DB
# 4. Starts file watchers
# 5. Broadcasts events via WebSocket

npm run dev
# Should see:
# 🔍 Scanning workspaces...
# 📂 Found workspace: pixel-agents
# 👤 Auto-registered agent: claude-abc123
# 👁️ Watching: ~/.claude/projects/.../abc123.jsonl
```

---

### Qoder — Frontend Scaffold (Week 3 Preview)
**Priority**: MEDIUM  
**Estimated**: 2-3 hours

| Task | Description | File |
|------|-------------|------|
| **F.1** | Initialize Vite + React in `packages/frontend` | `vite.config.ts` |
| **F.2** | Port Canvas renderer from VS Code extension | `src/office/renderer.ts` |
| **F.3** | Create WebSocket client hook | `src/hooks/useWebSocket.ts` |
| **F.4** | Create API client | `src/api/client.ts` |

---

### Shared — Testing
**Priority**: MEDIUM

| Task | Owner | Description |
|------|-------|-------------|
| **5.2** | Claude Code | Integration tests (API endpoints) |
| **5.3** | Qoder | E2E tests (WebSocket flow) |

---

## 🔗 Communication Protocol

### When Claude Code completes a task:
1. Update this file with ✅ status
2. Add commit message: `✅ Task X.X: <description>`

### When Qoder completes a task:
1. Push to GitHub fork
2. Update this file

### If blocked:
1. Add `🚧 BLOCKED: <reason>` to this file
2. Continue with next task

---

## 📊 Progress Tracker

| Task | Owner | Status | Notes |
|------|-------|--------|-------|
| 4.4 | Claude Code | ⏳ | Wire watcher to server |
| 4.5 | Claude Code | ⏳ | Workspace scanner |
| 4.6 | Claude Code | ⏳ | Auto-register agents |
| 4.7 | Claude Code | ⏳ | Polling fallback |
| F.1 | Qoder | ⏳ | Frontend init |
| F.2 | Qoder | ⏳ | Canvas renderer |
| F.3 | Qoder | ⏳ | WebSocket hook |
| F.4 | Qoder | ⏳ | API client |
| 5.2 | Claude Code | ⏳ | Integration tests |
| 5.3 | Qoder | ⏳ | E2E tests |

---

## 🚀 Next Sync Point

After Claude Code completes 4.4-4.7:
- Test full flow: JSONL → watcher → parser → WebSocket
- Merge and sync
- Begin Week 3 frontend integration

---

**Last Updated**: 2026-02-27 by Qoder
