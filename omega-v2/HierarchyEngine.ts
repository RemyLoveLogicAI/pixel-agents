// Omega v2: Hierarchical Agent Engine
// Manages 4-tier delegation, skill routing, and organizational structure

import {
  AgentTier,
  AgentSource,
  OctoCodeSkill,
  HierarchicalAgent,
  DelegationChain,
  ParticleTrail,
  TIER_CONFIGS,
  SKILL_TIER_MAP,
  OfficeZone,
  ViewMode,
} from './types.js';

export class HierarchyEngine {
  private agents: Map<string, HierarchicalAgent> = new Map();
  private delegations: DelegationChain[] = [];
  private particles: ParticleTrail[] = [];
  private zones: OfficeZone[] = [];
  private nextId = 1;
  private spawnRate = 0.5; // 0-1, controls intern auto-spawn

  // Event callbacks
  onAgentSpawned: ((agent: HierarchicalAgent) => void) | null = null;
  onAgentPromoted: ((agent: HierarchicalAgent, fromTier: AgentTier) => void) | null = null;
  onDelegation: ((chain: DelegationChain) => void) | null = null;
  onParticleCreated: ((particle: ParticleTrail) => void) | null = null;

  constructor() {
    this.initializeOfficeZones();
  }

  private initializeOfficeZones(): void {
    this.zones = [
      {
        id: 'executive-suite',
        name: 'Executive Suite',
        tier: AgentTier.BOSS,
        bounds: { x: 0, y: 0, width: 300, height: 200 },
        deskPositions: [{ x: 150, y: 100 }],
      },
      {
        id: 'supervisor-wing',
        name: 'Supervisor Wing',
        tier: AgentTier.SUPERVISOR,
        bounds: { x: 320, y: 0, width: 400, height: 250 },
        deskPositions: [
          { x: 370, y: 80 },
          { x: 520, y: 80 },
          { x: 670, y: 80 },
        ],
      },
      {
        id: 'employee-floor',
        name: 'Employee Floor',
        tier: AgentTier.EMPLOYEE,
        bounds: { x: 0, y: 220, width: 500, height: 300 },
        deskPositions: [
          { x: 50, y: 280 }, { x: 150, y: 280 }, { x: 250, y: 280 }, { x: 350, y: 280 },
          { x: 50, y: 400 }, { x: 150, y: 400 }, { x: 250, y: 400 }, { x: 350, y: 400 },
        ],
      },
      {
        id: 'intern-pool',
        name: 'Intern Pool',
        tier: AgentTier.INTERN,
        bounds: { x: 520, y: 270, width: 400, height: 350 },
        deskPositions: Array.from({ length: 12 }, (_, i) => ({
          x: 560 + (i % 4) * 90,
          y: 320 + Math.floor(i / 4) * 100,
        })),
      },
    ];
  }

  // Agent Lifecycle
  spawnAgent(
    tier: AgentTier,
    source: AgentSource,
    parentId: string | null = null,
    name?: string
  ): HierarchicalAgent {
    const id = `agent-${this.nextId++}`;
    const config = TIER_CONFIGS[tier];
    
    const zone = this.zones.find(z => z.tier === tier);
    const existingInTier = Array.from(this.agents.values()).filter(a => a.tier === tier).length;
    const deskPos = zone?.deskPositions[existingInTier % (zone?.deskPositions.length || 1)];
    
    const agent: HierarchicalAgent = {
      id,
      name: name || `${config.label} ${existingInTier + 1}`,
      tier,
      source,
      parentId,
      childIds: [],
      skillQueue: [],
      position: deskPos || { x: 400 + Math.random() * 200, y: 300 + Math.random() * 200 },
      activityLevel: 0,
      isActive: true,
      spawnTime: Date.now(),
      promotedFrom: null,
    };

    this.agents.set(id, agent);

    // Link to parent
    if (parentId) {
      const parent = this.agents.get(parentId);
      if (parent) {
        parent.childIds.push(id);
        this.createParticleTrail(parent.position, agent.position, 'spawn', config.color);
      }
    }

    this.onAgentSpawned?.(agent);
    return agent;
  }

  // Auto-spawn interns based on workload
  autoSpawnInterns(): void {
    const employees = this.getAgentsByTier(AgentTier.EMPLOYEE);
    const interns = this.getAgentsByTier(AgentTier.INTERN);
    
    for (const employee of employees) {
      const workload = employee.skillQueue.length;
      const assignedInterns = employee.childIds.length;
      const neededInterns = Math.min(
        Math.ceil(workload * this.spawnRate),
        TIER_CONFIGS[AgentTier.EMPLOYEE].maxDelegates - assignedInterns
      );

      for (let i = 0; i < neededInterns; i++) {
        // Find available intern or spawn new
        const availableIntern = interns.find(intern => 
          !intern.parentId && intern.isActive
        );
        
        if (availableIntern) {
          this.assignParent(availableIntern.id, employee.id);
        } else if (interns.length < 20) { // Cap total interns
          this.spawnAgent(AgentTier.INTERN, AgentSource.OCTOCODE, employee.id);
        }
      }
    }
  }

  // Skill Delegation
  delegateSkill(fromId: string, skill: OctoCodeSkill, toId?: string): DelegationChain | null {
    const fromAgent = this.agents.get(fromId);
    if (!fromAgent) return null;

    const requiredTier = SKILL_TIER_MAP[skill];
    const fromConfig = TIER_CONFIGS[fromAgent.tier];

    // Check if this agent can execute this skill
    if (fromAgent.tier !== requiredTier && fromAgent.tier > requiredTier) {
      // Agent is below required tier, cannot execute - must delegate up
      if (fromAgent.parentId) {
        return this.delegateSkill(fromAgent.parentId, skill);
      }
      return null;
    }

    // If specific target provided, validate
    if (toId) {
      const toAgent = this.agents.get(toId);
      if (!toAgent || !fromConfig.canDelegateTo.includes(toAgent.tier)) {
        return null;
      }

      const chain: DelegationChain = {
        fromId,
        toId,
        skill,
        timestamp: Date.now(),
        status: 'pending',
      };

      this.delegations.push(chain);
      toAgent.skillQueue.push(skill);
      
      this.createParticleTrail(
        fromAgent.position,
        toAgent.position,
        'delegation',
        TIER_CONFIGS[requiredTier].color
      );

      this.onDelegation?.(chain);
      return chain;
    }

    // Auto-delegate to appropriate tier
    if (fromAgent.tier === requiredTier) {
      // Execute directly
      fromAgent.skillQueue.push(skill);
      fromAgent.activityLevel = Math.min(1, fromAgent.activityLevel + 0.2);
      
      const chain: DelegationChain = {
        fromId,
        toId: fromId,
        skill,
        timestamp: Date.now(),
        status: 'active',
      };
      this.delegations.push(chain);
      return chain;
    }

    // Find appropriate child or spawn
    const appropriateChild = fromAgent.childIds
      .map(id => this.agents.get(id))
      .find(child => child && child.tier === requiredTier);

    if (appropriateChild) {
      return this.delegateSkill(fromId, skill, appropriateChild.id);
    }

    // Spawn new agent if allowed
    if (fromConfig.canSpawn.includes(requiredTier)) {
      const newAgent = this.spawnAgent(requiredTier, fromAgent.source, fromId);
      return this.delegateSkill(fromId, skill, newAgent.id);
    }

    return null;
  }

  // Promotion System
  promoteAgent(agentId: string): HierarchicalAgent | null {
    const agent = this.agents.get(agentId);
    if (!agent || agent.tier === AgentTier.BOSS) return null;

    const newTier = agent.tier - 1 as AgentTier;
    const oldTier = agent.tier;
    
    // Update agent
    agent.promotedFrom = oldTier;
    agent.tier = newTier;
    
    // Reassign to appropriate zone
    const zone = this.zones.find(z => z.tier === newTier);
    const existingInTier = this.getAgentsByTier(newTier).length;
    const deskPos = zone?.deskPositions[existingInTier % (zone?.deskPositions.length || 1)];
    
    if (deskPos) {
      this.createParticleTrail(agent.position, deskPos, 'promotion', '#FFD700');
      agent.position = deskPos;
    }

    // Update parent relationships
    if (agent.parentId) {
      const oldParent = this.agents.get(agent.parentId);
      if (oldParent) {
        oldParent.childIds = oldParent.childIds.filter(id => id !== agentId);
      }
    }

    // Find new parent at higher tier
    const potentialParents = this.getAgentsByTier(newTier - 1 as AgentTier);
    const newParent = potentialParents.find(p => p.childIds.length < TIER_CONFIGS[p.tier].maxDelegates);
    
    if (newParent) {
      agent.parentId = newParent.id;
      newParent.childIds.push(agentId);
    } else {
      agent.parentId = null;
    }

    this.onAgentPromoted?.(agent, oldTier);
    return agent;
  }

  // Demotion (for completeness)
  demoteAgent(agentId: string): HierarchicalAgent | null {
    const agent = this.agents.get(agentId);
    if (!agent || agent.tier === AgentTier.INTERN) return null;

    const newTier = agent.tier + 1 as AgentTier;
    
    agent.tier = newTier;
    
    // Reassign position
    const zone = this.zones.find(z => z.tier === newTier);
    const existingInTier = this.getAgentsByTier(newTier).length;
    const deskPos = zone?.deskPositions[existingInTier % (zone?.deskPositions.length || 1)];
    
    if (deskPos) {
      agent.position = deskPos;
    }

    return agent;
  }

  // Helper methods
  private assignParent(childId: string, parentId: string): void {
    const child = this.agents.get(childId);
    const parent = this.agents.get(parentId);
    
    if (child && parent) {
      // Remove from old parent
      if (child.parentId) {
        const oldParent = this.agents.get(child.parentId);
        if (oldParent) {
          oldParent.childIds = oldParent.childIds.filter(id => id !== childId);
        }
      }
      
      child.parentId = parentId;
      if (!parent.childIds.includes(childId)) {
        parent.childIds.push(childId);
      }
    }
  }

  private createParticleTrail(
    from: { x: number; y: number },
    to: { x: number; y: number },
    type: 'delegation' | 'promotion' | 'spawn',
    color: string
  ): void {
    const particle: ParticleTrail = {
      id: `particle-${Date.now()}-${Math.random()}`,
      from,
      to,
      color,
      progress: 0,
      type,
    };
    
    this.particles.push(particle);
    this.onParticleCreated?.(particle);
  }

  // Getters
  getAgent(id: string): HierarchicalAgent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): HierarchicalAgent[] {
    return Array.from(this.agents.values());
  }

  getAgentsByTier(tier: AgentTier): HierarchicalAgent[] {
    return this.getAllAgents().filter(a => a.tier === tier);
  }

  getAgentsBySource(source: AgentSource): HierarchicalAgent[] {
    return this.getAllAgents().filter(a => a.source === source);
  }

  getChildren(parentId: string): HierarchicalAgent[] {
    const parent = this.agents.get(parentId);
    if (!parent) return [];
    return parent.childIds.map(id => this.agents.get(id)).filter((a): a is HierarchicalAgent => !!a);
  }

  getDelegationChains(agentId?: string): DelegationChain[] {
    if (agentId) {
      return this.delegations.filter(d => d.fromId === agentId || d.toId === agentId);
    }
    return this.delegations;
  }

  getParticles(): ParticleTrail[] {
    return this.particles;
  }

  getZones(): OfficeZone[] {
    return this.zones;
  }

  setSpawnRate(rate: number): void {
    this.spawnRate = Math.max(0, Math.min(1, rate));
  }

  // Update loop
  update(deltaTime: number): void {
    // Update particles
    this.particles = this.particles.filter(p => {
      p.progress += deltaTime * 2; // 0.5s to complete
      return p.progress < 1;
    });

    // Decay activity levels
    for (const agent of this.agents.values()) {
      if (agent.activityLevel > 0) {
        agent.activityLevel = Math.max(0, agent.activityLevel - deltaTime * 0.1);
      }
    }

    // Auto-spawn interns
    this.autoSpawnInterns();
  }

  // Command processing
  processCommand(command: string): string {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'spawn': {
        const tier = parseInt(parts[1]) as AgentTier;
        const source = (parts[2] as AgentSource) || AgentSource.OCTOCODE;
        if (tier >= 0 && tier <= 3) {
          const agent = this.spawnAgent(tier, source);
          return `Spawned ${TIER_CONFIGS[tier].emoji} ${agent.name} (${agent.id})`;
        }
        return 'Usage: spawn <tier:0-3> [source:claude|cursor|codex|octocode|custom]';
      }

      case 'delegate': {
        const fromId = parts[1];
        const skill = parts[2] as OctoCodeSkill;
        const toId = parts[3];
        
        if (fromId && skill) {
          const chain = this.delegateSkill(fromId, skill, toId);
          if (chain) {
            return `Delegated ${skill} from ${chain.fromId} to ${chain.toId}`;
          }
          return 'Delegation failed - check agent IDs and tier permissions';
        }
        return 'Usage: delegate <agent-id> <skill> [target-agent-id]';
      }

      case 'promote': {
        const agentId = parts[1];
        if (agentId) {
          const agent = this.promoteAgent(agentId);
          if (agent) {
            return `Promoted ${agent.name} to ${TIER_CONFIGS[agent.tier].label}! 🎉`;
          }
          return 'Promotion failed - agent not found or already at max tier';
        }
        return 'Usage: promote <agent-id>';
      }

      case 'demote': {
        const agentId = parts[1];
        if (agentId) {
          const agent = this.demoteAgent(agentId);
          if (agent) {
            return `Demoted ${agent.name} to ${TIER_CONFIGS[agent.tier].label}`;
          }
          return 'Demotion failed - agent not found or already at min tier';
        }
        return 'Usage: demote <agent-id>';
      }

      case 'list': {
        const agents = this.getAllAgents();
        return agents.map(a => 
          `${TIER_CONFIGS[a.tier].emoji} ${a.name} (${a.id}) - ${AgentSource[a.source]} - ${a.childIds.length} children`
        ).join('\n') || 'No agents spawned yet';
      }

      case 'spawnrate': {
        const rate = parseFloat(parts[1]);
        if (!isNaN(rate)) {
          this.setSpawnRate(rate);
          return `Spawn rate set to ${(this.spawnRate * 100).toFixed(0)}%`;
        }
        return `Current spawn rate: ${(this.spawnRate * 100).toFixed(0)}%`;
      }

      default:
        return `Unknown command: ${cmd}. Available: spawn, delegate, promote, demote, list, spawnrate`;
    }
  }
}
