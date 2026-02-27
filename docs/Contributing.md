# 🤝 Contributing

We welcome contributions! Here's how to get started.

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/RemyLoveLogicAI/pixel-agents.git
cd pixel-agents

# Install dependencies
npm install
cd webview-ui && npm install && cd ..

# Build
npm run build

# Launch (F5 in VS Code)
```

---

## Development Modes

### VS Code Extension (v1)
```bash
npm run watch
# Then F5 to launch Extension Development Host
```

### Backend Service (v2)
```bash
cd packages/backend
npm run dev
# Server at localhost:3000
```

### Frontend (v2)
```bash
cd packages/frontend
npm run dev
# UI at localhost:5173
```

---

## Code Style

- TypeScript strict mode
- No comments unless complex logic
- Pixel-perfect rendering (integer zoom)
- Constants in `constants.ts`
- Types in `types.ts`

---

## Areas for Contribution

### High Priority
- 🔧 Agent-terminal sync reliability
- 🎯 Better status detection
- 🖼️ Community pixel art assets

### Features
- 👥 Agent teams visualization
- 📁 Desks as directories
- 🌿 Git worktree support
- 🔌 Other CLI frameworks

---

## Pull Request Process

1. **Fork** the repository
2. **Create** feature branch
3. **Make** your changes
4. **Test** (`npm test`)
5. **Submit** PR

---

## Code of Conduct

See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md)

---

## Support

- 💬 [GitHub Issues](https://github.com/RemyLoveLogicAI/pixel-agents/issues)
- 💖 [Sponsor](https://github.com/sponsors/pablodelucca)