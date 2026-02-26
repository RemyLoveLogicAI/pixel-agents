// Omega v2 ULTRA: MCP + A2A Protocol Integration Layer
// Standards-compliant agent communication with NATS event bus

import { HierarchicalAgent, AgentTier, OctoCodeSkill, AgentSource } from './types.js';

// ============================================================================
// MCP (Model Context Protocol) Types
// ============================================================================

export enum MCPPrimitive {
  TOOL = 'tool',
  RESOURCE = 'resource',
  PROMPT = 'prompt',
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  mimeType: string;
  content: string | Buffer;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: { name: string; required: boolean }[];
  template: string;
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

// ============================================================================
// A2A (Agent-to-Agent) Protocol Types
// ============================================================================

export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory: boolean;
  };
  skills: A2ASkill[];
  authentication?: {
    schemes: string[];
    credentials?: string;
  };
}

export interface A2ASkill {
  id: string;
  name: string;
  description: string;
  tags: string[];
  examples?: string[];
}

export enum A2ATaskState {
  SUBMITTED = 'submitted',
  WORKING = 'working',
  INPUT_REQUIRED = 'input-required',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  FAILED = 'failed',
  UNKNOWN = 'unknown',
}

export interface A2ATask {
  id: string;
  sessionId: string;
  state: A2ATaskState;
  message?: A2AMessage;
  artifacts?: A2AArtifact[];
  history?: A2ATaskState[];
  metadata?: Record<string, unknown>;
}

export interface A2AMessage {
  role: 'user' | 'agent';
  parts: A2APart[];
}

export type A2APart = 
  | { type: 'text'; text: string }
  | { type: 'file'; file: { name: string; mimeType: string; bytes?: string; uri?: string } }
  | { type: 'data'; data: Record<string, unknown> };

export interface A2AArtifact {
  name: string;
  description?: string;
  parts: A2APart[];
  index?: number;
  append?: boolean;
  lastChunk?: boolean;
}

// ============================================================================
// NATS Event Bus Types
// ============================================================================

export interface NATSMessage {
  subject: string;
  data: Buffer | string;
  headers?: Record<string, string>;
}

export interface EventBusConfig {
  servers: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

// ============================================================================
// Protocol Layer Implementation
// ============================================================================

export class ProtocolLayer {
  private mcpTools: Map<string, MCPTool> = new Map();
  private mcpResources: Map<string, MCPResource> = new Map();
  private mcpPrompts: Map<string, MCPPrompt> = new Map();
  
  private agentCards: Map<string, AgentCard> = new Map();
  private activeTasks: Map<string, A2ATask> = new Map();
  
  private eventBusConnected = false;
  private subscriptions: Map<string, (msg: NATSMessage) => void> = new Map();

  // Callbacks
  onMCPRequest: ((req: MCPRequest) => Promise<MCPResponse>) | null = null;
  onA2ATaskCreate: ((task: A2ATask) => void) | null = null;
  onA2ATaskUpdate: ((task: A2ATask) => void) | null = null;
  onNATMessage: ((msg: NATSMessage) => void) | null = null;

  constructor() {
    this.registerDefaultMCPTools();
    this.registerDefaultA2ASkills();
  }

  // ============================================================================
  // MCP (Model Context Protocol) Implementation
  // ============================================================================

  private registerDefaultMCPTools(): void {
    // Agent management tools
    this.registerMCPTool({
      name: 'spawn_agent',
      description: 'Spawn a new hierarchical agent',
      inputSchema: {
        type: 'object',
        properties: {
          tier: { type: 'number', enum: [0, 1, 2, 3] },
          source: { type: 'string', enum: Object.values(AgentSource) },
          name: { type: 'string' },
        },
        required: ['tier', 'source'],
      },
      handler: async (args) => {
        return {
          success: true,
          agentId: `agent-${Date.now()}`,
          tier: args.tier,
          source: args.source,
        };
      },
    });

    this.registerMCPTool({
      name: 'delegate_skill',
      description: 'Delegate a skill to an agent',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          skill: { type: 'string', enum: Object.values(OctoCodeSkill) },
        },
        required: ['agentId', 'skill'],
      },
      handler: async (args) => {
        return {
          success: true,
          delegationId: `del-${Date.now()}`,
          agentId: args.agentId,
          skill: args.skill,
        };
      },
    });

    this.registerMCPTool({
      name: 'promote_agent',
      description: 'Promote an agent to the next tier',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
        },
        required: ['agentId'],
      },
      handler: async (args) => {
        return {
          success: true,
          agentId: args.agentId,
          newTier: 'promoted',
        };
      },
    });

    this.registerMCPTool({
      name: 'activate_mod',
      description: 'Activate a runtime mod',
      inputSchema: {
        type: 'object',
        properties: {
          modType: { type: 'string', enum: ['turbo', 'swarm', 'timewarp', 'godmode', 'stealth', 'zen'] },
        },
        required: ['modType'],
      },
      handler: async (args) => {
        return {
          success: true,
          modType: args.modType,
          activatedAt: Date.now(),
        };
      },
    });

    // File operation tools
    this.registerMCPTool({
      name: 'read_file',
      description: 'Read a file from the workspace',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
        },
        required: ['path'],
      },
      handler: async (args) => {
        // Would integrate with actual file system
        return { content: `// Content of ${args.path}` };
      },
    });

    this.registerMCPTool({
      name: 'write_file',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          content: { type: 'string' },
        },
        required: ['path', 'content'],
      },
      handler: async (args) => {
        return { success: true, bytesWritten: args.content.length };
      },
    });

    // Git tools
    this.registerMCPTool({
      name: 'git_status',
      description: 'Get git repository status',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => {
        return {
          branch: 'main',
          modified: [],
          staged: [],
          untracked: [],
        };
      },
    });

    this.registerMCPTool({
      name: 'git_commit',
      description: 'Create a git commit',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          files: { type: 'array', items: { type: 'string' } },
        },
        required: ['message'],
      },
      handler: async (args) => {
        return {
          success: true,
          commitHash: `abc${Date.now()}`,
          message: args.message,
        };
      },
    });
  }

  private registerDefaultA2ASkills(): void {
    // Register Omega v2 as an A2A agent
    const omegaCard: AgentCard = {
      name: 'Omega v2 Hierarchical Agent System',
      description: '4-tier organizational agent orchestration with OctoCode skill integration',
      url: 'http://localhost:7777/.well-known/agent.json',
      version: '2.0.0',
      capabilities: {
        streaming: true,
        pushNotifications: false,
        stateTransitionHistory: true,
      },
      skills: [
        {
          id: 'hierarchical_delegation',
          name: 'Hierarchical Delegation',
          description: 'Delegate tasks through 4-tier Boss→Supervisor→Employee→Intern chain',
          tags: ['orchestration', 'delegation', 'hierarchy'],
        },
        {
          id: 'skill_routing',
          name: 'OctoCode Skill Routing',
          description: 'Route /plan, /research, /generate, /lint skills to appropriate tiers',
          tags: ['skills', 'routing', 'octocode'],
        },
        {
          id: 'mod_activation',
          name: 'Runtime Mod Activation',
          description: 'Activate TURBO, SWARM, TIME WARP, GOD MODE mods',
          tags: ['mods', 'performance', 'cheats'],
        },
        {
          id: 'visualization',
          name: 'Agent Visualization',
          description: 'Real-time pixel-art visualization of agent hierarchy and activity',
          tags: ['ui', 'visualization', 'pixel-art'],
        },
      ],
    };

    this.registerAgentCard('omega-v2', omegaCard);
  }

  // MCP Registration Methods
  registerMCPTool(tool: MCPTool): void {
    this.mcpTools.set(tool.name, tool);
  }

  registerMCPResource(resource: MCPResource): void {
    this.mcpResources.set(resource.uri, resource);
  }

  registerMCPPrompt(prompt: MCPPrompt): void {
    this.mcpPrompts.set(prompt.name, prompt);
  }

  // A2A Registration Methods
  registerAgentCard(agentId: string, card: AgentCard): void {
    this.agentCards.set(agentId, card);
  }

  // MCP Request Handling
  async handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
    const { id, method, params = {} } = request;

    try {
      switch (method) {
        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              tools: Array.from(this.mcpTools.values()).map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema,
              })),
            },
          };

        case 'tools/call': {
          const toolName = params.name as string;
          const tool = this.mcpTools.get(toolName);
          
          if (!tool) {
            return {
              jsonrpc: '2.0',
              id,
              error: { code: -32601, message: `Tool not found: ${toolName}` },
            };
          }

          const result = await tool.handler(params.arguments as Record<string, unknown>);
          return {
            jsonrpc: '2.0',
            id,
            result: { content: [{ type: 'text', text: JSON.stringify(result) }] },
          };
        }

        case 'resources/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              resources: Array.from(this.mcpResources.values()),
            },
          };

        case 'prompts/list':
          return {
            jsonrpc: '2.0',
            id,
            result: {
              prompts: Array.from(this.mcpPrompts.values()),
            },
          };

        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Method not found: ${method}` },
          };
      }
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: (error as Error).message },
      };
    }
  }

  // A2A Task Management
  createA2ATask(skillId: string, message: A2AMessage, metadata?: Record<string, unknown>): A2ATask {
    const task: A2ATask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: `session-${Date.now()}`,
      state: A2ATaskState.SUBMITTED,
      message,
      metadata,
    };

    this.activeTasks.set(task.id, task);
    this.onA2ATaskCreate?.(task);
    
    // Auto-transition to working
    setTimeout(() => {
      this.updateTaskState(task.id, A2ATaskState.WORKING);
    }, 100);

    return task;
  }

  updateTaskState(taskId: string, state: A2ATaskState, message?: A2AMessage): A2ATask | null {
    const task = this.activeTasks.get(taskId);
    if (!task) return null;

    task.state = state;
    if (message) task.message = message;
    
    if (!task.history) task.history = [];
    task.history.push(state);

    this.onA2ATaskUpdate?.(task);
    return task;
  }

  addTaskArtifact(taskId: string, artifact: A2AArtifact): void {
    const task = this.activeTasks.get(taskId);
    if (!task) return;

    if (!task.artifacts) task.artifacts = [];
    task.artifacts.push(artifact);
    
    this.onA2ATaskUpdate?.(task);
  }

  getTask(taskId: string): A2ATask | undefined {
    return this.activeTasks.get(taskId);
  }

  getAgentCard(agentId: string): AgentCard | undefined {
    return this.agentCards.get(agentId);
  }

  // Well-known endpoint for A2A discovery
  getWellKnownAgentCard(): Record<string, unknown> {
    // Return the primary agent card (Omega v2)
    const card = this.agentCards.get('omega-v2');
    if (!card) return {};

    return {
      ...card,
      // Add HierarchicalAgent-specific metadata
      hierarchy: {
        tiers: ['Boss', 'Supervisor', 'Employee', 'Intern'],
        maxDepth: 4,
        delegationModes: ['auto', 'manual', 'swarm'],
      },
      mods: {
        available: ['turbo', 'swarm', 'timewarp', 'godmode', 'stealth', 'zen'],
        active: [], // Would be populated from ModSystem
      },
    };
  }

  // ============================================================================
  // NATS Event Bus (Simulated - would use actual NATS client)
  // ============================================================================

  async connectEventBus(config: EventBusConfig): Promise<boolean> {
    // Simulated connection
    console.log('[ProtocolLayer] Connecting to NATS:', config.servers);
    this.eventBusConnected = true;
    return true;
  }

  disconnectEventBus(): void {
    this.eventBusConnected = false;
    this.subscriptions.clear();
  }

  publish(subject: string, data: unknown, headers?: Record<string, string>): void {
    if (!this.eventBusConnected) return;

    const msg: NATSMessage = {
      subject,
      data: typeof data === 'string' ? data : JSON.stringify(data),
      headers,
    };

    this.onNATMessage?.(msg);
  }

  subscribe(subject: string, handler: (msg: NATSMessage) => void): void {
    this.subscriptions.set(subject, handler);
  }

  unsubscribe(subject: string): void {
    this.subscriptions.delete(subject);
  }

  // Topic hierarchy helpers
  static getAgentSubject(agentId: string, eventType: string): string {
    return `agent.${agentId}.${eventType}`;
  }

  static getTierSubject(tier: AgentTier, eventType: string): string {
    return `tier.${tier}.${eventType}`;
  }

  static getSkillSubject(skill: OctoCodeSkill): string {
    return `skill.${skill.replace('/', '')}`;
  }

  static getBroadcastSubject(eventType: string): string {
    return `broadcast.${eventType}`;
  }
}

// ============================================================================
// Protocol Client for External Integration
// ============================================================================

export class ProtocolClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:7777') {
    this.baseUrl = baseUrl;
  }

  // MCP Client Methods
  async listTools(): Promise<MCPTool[]> {
    const response = await this.mcpRequest('tools/list');
    return response.result?.tools || [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    const response = await this.mcpRequest('tools/call', { name, arguments: args });
    return response.result;
  }

  private async mcpRequest(method: string, params?: Record<string, unknown>): Promise<MCPResponse> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    };

    // Simulated request - would be actual HTTP/WebSocket
    console.log('[ProtocolClient] MCP Request:', request);
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {},
    };
  }

  // A2A Client Methods
  async discoverAgent(url: string): Promise<AgentCard | null> {
    try {
      const response = await fetch(`${url}/.well-known/agent.json`);
      return await response.json();
    } catch {
      return null;
    }
  }

  async sendTask(agentUrl: string, skillId: string, message: A2AMessage): Promise<A2ATask> {
    const response = await fetch(`${agentUrl}/tasks/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, message }),
    });
    return await response.json();
  }

  async getTaskStatus(agentUrl: string, taskId: string): Promise<A2ATask> {
    const response = await fetch(`${agentUrl}/tasks/${taskId}`);
    return await response.json();
  }
}
