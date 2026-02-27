# Pixel Agents — Claude Code Instructions

## 🎯 CURRENT PRIORITY

**Read `COORDINATION.md` for task assignments.**

You (Claude Code) are assigned:
- Task 4.4: Wire file watcher into server
- Task 4.5: Workspace scanner
- Task 4.6: Auto-register agents
- Task 4.7: Polling fallback
- Task 5.2: Integration tests

---

## 📁 Project Structure

```
packages/
├── backend/           ← YOU WORK HERE
│   └── src/
│       ├── index.ts   ← Server entry
│       ├── cli/       ← File watcher, JSONL parser
│       ├── agents/    ← Agent service
│       ├── api/       ← REST routes
│       └── observability/ ← WebSocket, event processor
├── frontend/          ← Qoder handles this
└── shared/            ← Shared types
```

---

## 🚀 Your Next Task: 4.4

**Wire file watcher into server startup**

In `packages/backend/src/index.ts`, add:

```typescript
import { startWatcher } from './cli/fileWatcher';
import { parseJsonL } from './cli/jsonlParser';
import { processEvents } from './observability/eventProcessor';

// After server starts, initialize watching
async function initializeWatching() {
  // TODO: Scan for workspaces and start watchers
  // See Task 4.5 for workspace scanner
}
```

---

## ✅ Acceptance Criteria

When complete, running `npm run dev` should:
1. Start Express server
2. Scan `~/.claude/projects/` for workspaces
3. Find JSONL files
4. Auto-register agents
5. Start file watchers
6. Broadcast events via WebSocket

---

## 📋 Communication

- Update `COORDINATION.md` when tasks complete
- Use commit messages: `✅ Task X.X: <description>`
- If blocked, add `🚧 BLOCKED:` note

---

## 🔗 Key Files

- Server: `packages/backend/src/index.ts`
- File Watcher: `packages/backend/src/cli/fileWatcher.ts`
- JSONL Parser: `packages/backend/src/cli/jsonlParser.ts`
- Event Processor: `packages/backend/src/observability/eventProcessor.ts`
- Agent Service: `packages/backend/src/agents/service.ts`
- WebSocket: `packages/backend/src/observability/websocket.ts`

---

**Start with Task 4.4. Go! 🚀**