# 🔌 API Reference

**Version**: 0.1.0 (MVP)  
**Base URL**: `http://localhost:3000/api`  
**WebSocket**: `ws://localhost:3000`

---

## REST Endpoints

### Agents

#### List All Agents
```http
GET /api/agents?workspace=<id>
```

**Response** (200):
```json
{
  "agents": [
    {
      "id": "agent-1",
      "name": "Claude - Main Task",
      "terminalId": "terminal-abc123",
      "workspace": "workspace-1",
      "status": "working",
      "currentTool": "file-read",
      "sprite": { "palette": 0, "hueShift": 0 },
      "position": { "x": 5, "y": 3 }
    }
  ],
  "total": 1
}
```

#### Get Agent Details
```http
GET /api/agents/:id
```

#### Send Command to Agent
```http
POST /api/agents/:id/command
Content-Type: application/json

{
  "content": "Fix the bug in src/index.ts",
  "priority": "high"
}
```

---

### Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces` | List workspaces |
| POST | `/api/workspaces` | Create workspace |
| PUT | `/api/workspaces/:id/layout` | Update layout |

---

### Observability

#### Get Events
```http
GET /api/observability/events?since=<timestamp>&workspace=<id>
```

#### Health Check
```http
GET /api/health
```

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'observability',
  workspace: 'workspace-1'
}));
```

### Message Types

| Type | Description |
|------|-------------|
| `agent_status_changed` | Agent status update |
| `tool_started` | Tool execution began |
| `tool_completed` | Tool finished |
| `tool_error` | Tool failed |
| `agent_output` | stdout/stderr |

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_WORKSPACE` | 400 | Invalid workspace |
| `AGENT_NOT_FOUND` | 404 | Agent not found |
| `INTERNAL_ERROR` | 500 | Server error |