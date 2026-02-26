// Omega v2 ULTRA: Bidirectional Sync System
// Pixel world interactions trigger real development actions

import { HierarchicalAgent, AgentTier, OctoCodeSkill } from './types.js';
import { HierarchyEngine } from './HierarchyEngine.js';

export enum DevActionType {
  // File Operations
  OPEN_FILE = 'openFile',
  EDIT_FILE = 'editFile',
  CREATE_FILE = 'createFile',
  DELETE_FILE = 'deleteFile',
  
  // Terminal Operations
  RUN_COMMAND = 'runCommand',
  FOCUS_TERMINAL = 'focusTerminal',
  KILL_PROCESS = 'killProcess',
  
  // Git Operations
  GIT_COMMIT = 'gitCommit',
  GIT_PUSH = 'gitPush',
  GIT_BRANCH = 'gitBranch',
  GIT_CHECKOUT = 'gitCheckout',
  
  // Agent Operations
  SPAWN_AGENT = 'spawnAgent',
  KILL_AGENT = 'killAgent',
  PAUSE_AGENT = 'pauseAgent',
  RESUME_AGENT = 'resumeAgent',
  
  // IDE Operations
  SHOW_PANEL = 'showPanel',
  HIDE_PANEL = 'hidePanel',
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut',
}

export interface DevAction {
  type: DevActionType;
  agentId?: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}

export interface BidirectionalEvent {
  direction: 'pixel-to-dev' | 'dev-to-pixel';
  action: DevAction;
  agent?: HierarchicalAgent;
}

export interface PixelInteraction {
  type: 'click' | 'drag' | 'doubleClick' | 'rightClick' | 'hover';
  target: 'agent' | 'desk' | 'zone' | 'skill' | 'ui';
  targetId: string;
  position: { x: number; y: number };
  modifiers: { shift: boolean; ctrl: boolean; alt: boolean };
}

export class BidirectionalSync {
  private engine: HierarchyEngine;
  private actionQueue: DevAction[] = [];
  private eventHistory: BidirectionalEvent[] = [];
  private maxHistorySize = 1000;
  
  // Handlers for different action types
  private actionHandlers: Map<DevActionType, (action: DevAction) => Promise<boolean>> = new Map();
  
  // Callbacks
  onActionTriggered: ((action: DevAction) => void) | null = null;
  onPixelInteraction: ((interaction: PixelInteraction, agent: HierarchicalAgent | null) => void) | null = null;
  onSyncError: ((error: Error) => void) | null = null;

  constructor(engine: HierarchyEngine) {
    this.engine = engine;
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers(): void {
    // Agent operations
    this.actionHandlers.set(DevActionType.SPAWN_AGENT, async (action) => {
      const tier = action.payload?.tier as AgentTier;
      const source = action.payload?.source as string;
      if (tier !== undefined) {
        this.engine.spawnAgent(tier, source as any);
        return true;
      }
      return false;
    });

    this.actionHandlers.set(DevActionType.KILL_AGENT, async (action) => {
      // Would integrate with actual agent termination
      console.log(`[BidirectionalSync] Kill agent: ${action.agentId}`);
      return true;
    });

    this.actionHandlers.set(DevActionType.PAUSE_AGENT, async (action) => {
      const agent = action.agentId ? this.engine.getAgent(action.agentId) : null;
      if (agent) {
        agent.isActive = false;
        return true;
      }
      return false;
    });

    this.actionHandlers.set(DevActionType.RESUME_AGENT, async (action) => {
      const agent = action.agentId ? this.engine.getAgent(action.agentId) : null;
      if (agent) {
        agent.isActive = true;
        return true;
      }
      return false;
    });

    // File operations (would integrate with VS Code API)
    this.actionHandlers.set(DevActionType.OPEN_FILE, async (action) => {
      const filePath = action.payload?.path as string;
      console.log(`[BidirectionalSync] Open file: ${filePath}`);
      // Would call vscode.workspace.openTextDocument
      return true;
    });

    this.actionHandlers.set(DevActionType.RUN_COMMAND, async (action) => {
      const command = action.payload?.command as string;
      console.log(`[BidirectionalSync] Run command: ${command}`);
      // Would execute in terminal
      return true;
    });

    // Git operations
    this.actionHandlers.set(DevActionType.GIT_COMMIT, async (action) => {
      const message = action.payload?.message as string;
      console.log(`[BidirectionalSync] Git commit: ${message}`);
      return true;
    });

    this.actionHandlers.set(DevActionType.GIT_PUSH, async () => {
      console.log('[BidirectionalSync] Git push');
      return true;
    });
  }

  // Pixel World → Dev Actions
  handlePixelInteraction(interaction: PixelInteraction): void {
    this.onPixelInteraction?.(interaction, null);

    const action = this.interactionToAction(interaction);
    if (action) {
      this.queueAction(action);
    }
  }

  private interactionToAction(interaction: PixelInteraction): DevAction | null {
    switch (interaction.type) {
      case 'click':
        return this.handleClickInteraction(interaction);
      case 'doubleClick':
        return this.handleDoubleClickInteraction(interaction);
      case 'rightClick':
        return this.handleRightClickInteraction(interaction);
      case 'drag':
        return this.handleDragInteraction(interaction);
      default:
        return null;
    }
  }

  private handleClickInteraction(interaction: PixelInteraction): DevAction | null {
    if (interaction.target === 'agent' && interaction.targetId) {
      const agent = this.engine.getAgent(interaction.targetId);
      if (!agent) return null;

      // Ctrl+Click: Focus terminal
      if (interaction.modifiers.ctrl) {
        return {
          type: DevActionType.FOCUS_TERMINAL,
          agentId: interaction.targetId,
          timestamp: Date.now(),
        };
      }

      // Shift+Click: Pause/Resume
      if (interaction.modifiers.shift) {
        return {
          type: agent.isActive ? DevActionType.PAUSE_AGENT : DevActionType.RESUME_AGENT,
          agentId: interaction.targetId,
          timestamp: Date.now(),
        };
      }

      // Alt+Click: Kill agent
      if (interaction.modifiers.alt) {
        return {
          type: DevActionType.KILL_AGENT,
          agentId: interaction.targetId,
          timestamp: Date.now(),
        };
      }

      // Regular click: Show agent info (no dev action)
      return null;
    }

    if (interaction.target === 'skill') {
      // Click on skill bar item
      const skill = interaction.targetId as OctoCodeSkill;
      return {
        type: DevActionType.RUN_COMMAND,
        payload: { command: skill },
        timestamp: Date.now(),
      };
    }

    if (interaction.target === 'zone') {
      // Click on office zone
      return {
        type: DevActionType.SHOW_PANEL,
        payload: { panel: interaction.targetId },
        timestamp: Date.now(),
      };
    }

    return null;
  }

  private handleDoubleClickInteraction(interaction: PixelInteraction): DevAction | null {
    if (interaction.target === 'agent' && interaction.targetId) {
      // Double-click agent: Promote
      this.engine.promoteAgent(interaction.targetId);
      return null; // Internal action, no dev action needed
    }

    if (interaction.target === 'desk') {
      // Double-click empty desk: Spawn agent at that tier
      const tier = parseInt(interaction.targetId) as AgentTier;
      return {
        type: DevActionType.SPAWN_AGENT,
        payload: { tier, source: 'octocode' },
        timestamp: Date.now(),
      };
    }

    return null;
  }

  private handleRightClickInteraction(interaction: PixelInteraction): DevAction | null {
    if (interaction.target === 'agent' && interaction.targetId) {
      // Right-click: Context menu actions
      return {
        type: DevActionType.SHOW_PANEL,
        payload: { 
          panel: 'agentContextMenu',
          agentId: interaction.targetId,
        },
        timestamp: Date.now(),
      };
    }

    return null;
  }

  private handleDragInteraction(interaction: PixelInteraction): DevAction | null {
    if (interaction.target === 'agent' && interaction.targetId) {
      // Drag agent to new position
      const agent = this.engine.getAgent(interaction.targetId);
      if (agent) {
        agent.position = interaction.position;
        
        // If dragged to a desk, assign that desk
        return {
          type: DevActionType.SHOW_PANEL,
          payload: {
            panel: 'agentReassigned',
            agentId: interaction.targetId,
            newPosition: interaction.position,
          },
          timestamp: Date.now(),
        };
      }
    }

    return null;
  }

  // Action Queue Management
  queueAction(action: DevAction): void {
    this.actionQueue.push(action);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    while (this.actionQueue.length > 0) {
      const action = this.actionQueue.shift()!;
      
      try {
        const handler = this.actionHandlers.get(action.type);
        if (handler) {
          const success = await handler(action);
          
          if (success) {
            this.recordEvent({
              direction: 'pixel-to-dev',
              action,
              agent: action.agentId ? this.engine.getAgent(action.agentId) : undefined,
            });
            
            this.onActionTriggered?.(action);
          }
        }
      } catch (error) {
        this.onSyncError?.(error as Error);
      }
    }
  }

  // Dev World → Pixel Actions
  handleDevEvent(eventType: string, payload: Record<string, unknown>): void {
    const action: DevAction = {
      type: eventType as DevActionType,
      payload,
      timestamp: Date.now(),
    };

    this.recordEvent({
      direction: 'dev-to-pixel',
      action,
    });

    // Update pixel world based on dev event
    this.updatePixelWorld(action);
  }

  private updatePixelWorld(action: DevAction): void {
    switch (action.type) {
      case 'agentStatusChange':
        const agentId = action.payload?.agentId as string;
        const status = action.payload?.status as string;
        const agent = this.engine.getAgent(agentId);
        if (agent) {
          agent.isActive = status === 'active';
          agent.activityLevel = status === 'active' ? 1 : 0;
        }
        break;

      case 'fileModified':
        // Highlight agent working on that file
        const filePath = action.payload?.path as string;
        // Would find agent by file association
        break;

      case 'terminalOutput':
        // Show activity burst on terminal-associated agent
        const terminalId = action.payload?.terminalId as string;
        // Would find agent by terminal association
        break;
    }
  }

  // Event History
  private recordEvent(event: BidirectionalEvent): void {
    this.eventHistory.push(event);
    
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  getEventHistory(limit: number = 100): BidirectionalEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getRecentPixelToDevActions(limit: number = 50): DevAction[] {
    return this.eventHistory
      .filter(e => e.direction === 'pixel-to-dev')
      .slice(-limit)
      .map(e => e.action);
  }

  getRecentDevToPixelEvents(limit: number = 50): BidirectionalEvent[] {
    return this.eventHistory
      .filter(e => e.direction === 'dev-to-pixel')
      .slice(-limit);
  }

  // Custom Action Handler Registration
  registerActionHandler(
    type: DevActionType,
    handler: (action: DevAction) => Promise<boolean>
  ): void {
    this.actionHandlers.set(type, handler);
  }

  unregisterActionHandler(type: DevActionType): void {
    this.actionHandlers.delete(type);
  }

  // Clear history
  clearHistory(): void {
    this.eventHistory = [];
    this.actionQueue = [];
  }
}

// Helper for creating common actions
export const ActionFactory = {
  spawnAgent: (tier: AgentTier, source: string): DevAction => ({
    type: DevActionType.SPAWN_AGENT,
    payload: { tier, source },
    timestamp: Date.now(),
  }),

  killAgent: (agentId: string): DevAction => ({
    type: DevActionType.KILL_AGENT,
    agentId,
    timestamp: Date.now(),
  }),

  pauseAgent: (agentId: string): DevAction => ({
    type: DevActionType.PAUSE_AGENT,
    agentId,
    timestamp: Date.now(),
  }),

  resumeAgent: (agentId: string): DevAction => ({
    type: DevActionType.RESUME_AGENT,
    agentId,
    timestamp: Date.now(),
  }),

  openFile: (path: string): DevAction => ({
    type: DevActionType.OPEN_FILE,
    payload: { path },
    timestamp: Date.now(),
  }),

  runCommand: (command: string, cwd?: string): DevAction => ({
    type: DevActionType.RUN_COMMAND,
    payload: { command, cwd },
    timestamp: Date.now(),
  }),

  gitCommit: (message: string, files?: string[]): DevAction => ({
    type: DevActionType.GIT_COMMIT,
    payload: { message, files },
    timestamp: Date.now(),
  }),

  gitPush: (branch?: string): DevAction => ({
    type: DevActionType.GIT_PUSH,
    payload: { branch },
    timestamp: Date.now(),
  }),
};
