# 🚀 Vision & Roadmap

## The Ultimate Vision

**Pixel Agents aims to be the definitive visualization and orchestration layer for AI coding agents.**

Imagine:
- 📱 Checking your phone and seeing your AI agents working in their pixel office
- 🎮 Tapping an agent to give it a new task while commuting
- 🏆 Leveling up your "Boss" agent after it completes 100 delegations
- 🏢 Different offices for different projects, with agents moving between them
- 👥 Hierarchical teams: Boss → Supervisor → Employee → Intern

---

## 4-Week Implementation Plan

### Week 1: Backend Foundation ✅
- [x] Express server + REST endpoints
- [x] SQLite database
- [x] WebSocket real-time
- [x] File watcher (JSONL)
- [x] Health checks

### Week 2: CLI Observability 🔨
- [ ] JSONL parsing improvements
- [ ] Event aggregation
- [ ] Command execution
- [ ] Multi-workspace awareness
- [ ] Workspace routing

### Week 3: Web Client
- [ ] Vite + React setup
- [ ] Canvas rendering (port from extension)
- [ ] API client
- [ ] WebSocket client
- [ ] Real-time animation

### Week 4: Integration + Polish
- [ ] Workspace switcher UI
- [ ] Sub-agent hierarchy
- [ ] Responsive design (mobile)
- [ ] Docker deployment
- [ ] Documentation

---

## Future Features (Post-MVP)

### Agent Hierarchy System (Omega v2 ULTRA)

```
BOSS (👔)
├── scale: 1.4x
├── skills: /plan, /orchestrate
├── spawns: Supervisors
│
├── SUPERVISOR (📋)
│   ├── scale: 1.15x
│   ├── skills: /research, /review, /analyze
│   ├── max delegates: 3
│   │
│   └── EMPLOYEE (💻)
│       ├── scale: 1.0x
│       ├── skills: /generate, /test, /build
│       ├── max delegates: 8
│       │
│       └── INTERN (📎)
│           ├── scale: 0.85x
│           └── skills: /lint, /docs, /format
```

### Runtime Mods (Cheat Codes)

| Mod | Cheat Code | Effect |
|-----|------------|--------|
| **TURBO** | ↑↑↓↓←→←→BA | 2x execution speed |
| **GOD MODE** | IDDQD | Unlimited resources |
| **TIME WARP** | MATRIX | Slow motion replay |
| **ZEN** | PEACE | Minimal UI mode |

### Gamification System

- **XP System**: Earn XP for completed tasks
- **Levels**: Progress from Intern → Boss
- **Achievements**: Unlock badges for milestones
- **Quests**: Daily/weekly challenges
- **Leaderboards**: Compare with team

### Multi-CLI Support

| CLI | Status |
|-----|--------|
| Claude Code | ✅ Supported |
| Cursor | 📋 Planned |
| Codex | 📋 Planned |
| OpenCode | 📋 Planned |
| Custom (MCP) | 📋 Planned |

---

## Success Metrics

By Week 4, these must work:

1. ✅ **Web Client** — Interactive office simulator, see agents, send commands
2. ✅ **Observability** — See CLI activity represented visually in real-time
3. ✅ **Multi-workspace** — Different offices for different workspaces
4. ✅ **Sub-agent Hierarchy** — Sub-agents with different sprites