// Omega v2: React Renderer Component
// Visualizes 4-tier hierarchy with delegation chains and particle effects

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AgentTier,
  AgentSource,
  HierarchicalAgent,
  ParticleTrail,
  OfficeZone,
  ViewMode,
  TIER_CONFIGS,
  OctoCodeSkill,
  SKILL_TIER_MAP,
} from './types.js';
import { HierarchyEngine } from './HierarchyEngine.js';

interface OmegaRendererProps {
  engine: HierarchyEngine;
  viewMode: ViewMode;
  width: number;
  height: number;
}

const SOURCE_BADGES: Record<AgentSource, { bg: string; text: string; label: string }> = {
  [AgentSource.CLAUDE]: { bg: '#D4A574', text: '#3D2914', label: 'Claude' },
  [AgentSource.CURSOR]: { bg: '#4A5568', text: '#FFFFFF', label: 'Cursor' },
  [AgentSource.CODEX]: { bg: '#10A37F', text: '#FFFFFF', label: 'Codex' },
  [AgentSource.OCTOCODE]: { bg: '#F97316', text: '#FFFFFF', label: 'OctoCode' },
  [AgentSource.CUSTOM]: { bg: '#8B5CF6', text: '#FFFFFF', label: 'Custom' },
};

export const OmegaRenderer: React.FC<OmegaRendererProps> = ({
  engine,
  viewMode,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agents, setAgents] = useState<HierarchicalAgent[]>([]);
  const [particles, setParticles] = useState<ParticleTrail[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<OctoCodeSkill | null>(null);
  const animationRef = useRef<number>();

  // Sync with engine
  useEffect(() => {
    const update = () => {
      setAgents(engine.getAllAgents());
      setParticles(engine.getParticles());
    };

    engine.onAgentSpawned = update;
    engine.onAgentPromoted = update;
    engine.onDelegation = update;
    engine.onParticleCreated = update;

    update();

    // Animation loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;
      engine.update(deltaTime);
      setParticles([...engine.getParticles()]);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [engine]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    if (viewMode === ViewMode.OFFICE) {
      renderOfficeView(ctx);
    } else if (viewMode === ViewMode.ORG_CHART) {
      renderOrgChartView(ctx);
    } else if (viewMode === ViewMode.HEATMAP) {
      renderHeatmapView(ctx);
    }

    // Render particles on top
    renderParticles(ctx);
  }, [agents, particles, viewMode, width, height, selectedAgent]);

  const renderOfficeView = (ctx: CanvasRenderingContext2D) => {
    const zones = engine.getZones();

    // Draw zones
    zones.forEach(zone => {
      const config = TIER_CONFIGS[zone.tier];
      
      // Zone background
      ctx.fillStyle = config.color + '15'; // 15 = ~8% opacity
      ctx.fillRect(zone.bounds.x, zone.bounds.y, zone.bounds.width, zone.bounds.height);
      
      // Zone border
      ctx.strokeStyle = config.color + '40';
      ctx.lineWidth = 2;
      ctx.strokeRect(zone.bounds.x, zone.bounds.y, zone.bounds.width, zone.bounds.height);
      
      // Zone label
      ctx.fillStyle = config.color;
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(zone.name, zone.bounds.x + 10, zone.bounds.y + 20);

      // Desk positions
      zone.deskPositions.forEach((pos, i) => {
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(pos.x - 20, pos.y - 15, 40, 30);
        ctx.strokeStyle = '#3a3a4e';
        ctx.strokeRect(pos.x - 20, pos.y - 15, 40, 30);
      });
    });

    // Draw agents
    agents.forEach(agent => {
      const config = TIER_CONFIGS[agent.tier];
      const isSelected = agent.id === selectedAgent;
      
      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(agent.position.x, agent.position.y, 35 * config.scale, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Agent circle
      ctx.beginPath();
      ctx.arc(agent.position.x, agent.position.y, 25 * config.scale, 0, Math.PI * 2);
      ctx.fillStyle = config.color;
      ctx.fill();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(agent.position.x, agent.position.y, 20 * config.scale, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a2e';
      ctx.fill();

      // Emoji
      ctx.font = `${24 * config.scale}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.emoji, agent.position.x, agent.position.y);

      // Source badge (small dot)
      const badgeColor = SOURCE_BADGES[agent.source].bg;
      ctx.beginPath();
      ctx.arc(
        agent.position.x + 20 * config.scale,
        agent.position.y - 20 * config.scale,
        6,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = badgeColor;
      ctx.fill();

      // Name label
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px system-ui';
      ctx.fillText(agent.name, agent.position.x, agent.position.y + 35 * config.scale);

      // Activity indicator
      if (agent.activityLevel > 0) {
        ctx.beginPath();
        ctx.arc(
          agent.position.x,
          agent.position.y,
          28 * config.scale,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * agent.activityLevel
        );
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw delegation lines
    renderDelegationLines(ctx);
  };

  const renderOrgChartView = (ctx: CanvasRenderingContext2D) => {
    const tierLevels: HierarchicalAgent[][] = [
      agents.filter(a => a.tier === AgentTier.BOSS),
      agents.filter(a => a.tier === AgentTier.SUPERVISOR),
      agents.filter(a => a.tier === AgentTier.EMPLOYEE),
      agents.filter(a => a.tier === AgentTier.INTERN),
    ];

    const levelHeight = height / 5;
    const cardWidth = 140;
    const cardHeight = 80;

    tierLevels.forEach((tierAgents, tierIndex) => {
      const y = levelHeight * (tierIndex + 1) - cardHeight / 2;
      const spacing = width / (tierAgents.length + 1);

      tierAgents.forEach((agent, i) => {
        const x = spacing * (i + 1) - cardWidth / 2;
        const config = TIER_CONFIGS[agent.tier];

        // Card background
        ctx.fillStyle = '#2a2a3e';
        ctx.fillRect(x, y, cardWidth, cardHeight);
        
        // Card border
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidth, cardHeight);

        // Emoji
        ctx.font = '24px serif';
        ctx.textAlign = 'center';
        ctx.fillText(config.emoji, x + cardWidth / 2, y + 25);

        // Name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px system-ui';
        ctx.fillText(agent.name, x + cardWidth / 2, y + 50);

        // Source badge
        const badge = SOURCE_BADGES[agent.source];
        ctx.fillStyle = badge.bg;
        ctx.fillRect(x + 10, y + 60, cardWidth - 20, 16);
        ctx.fillStyle = badge.text;
        ctx.font = '10px system-ui';
        ctx.fillText(badge.label, x + cardWidth / 2, y + 71);

        // Update position for line drawing
        agent.position = { x: x + cardWidth / 2, y: y + cardHeight / 2 };
      });
    });

    renderDelegationLines(ctx);
  };

  const renderHeatmapView = (ctx: CanvasRenderingContext2D) => {
    // Background grid
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        let heat = 0;
        
        agents.forEach(agent => {
          const dx = x + gridSize / 2 - agent.position.x;
          const dy = y + gridSize / 2 - agent.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            heat += agent.activityLevel * (1 - dist / 150);
          }
        });

        heat = Math.min(1, heat);
        if (heat > 0.1) {
          const hue = (1 - heat) * 240; // Blue to red
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${heat * 0.5})`;
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }
    }

    // Draw agents on top
    agents.forEach(agent => {
      const config = TIER_CONFIGS[agent.tier];
      const heat = agent.activityLevel;
      const hue = (1 - heat) * 240;

      ctx.beginPath();
      ctx.arc(agent.position.x, agent.position.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${(heat * 100).toFixed(0)}%`, agent.position.x, agent.position.y + 4);
    });
  };

  const renderDelegationLines = (ctx: CanvasRenderingContext2D) => {
    agents.forEach(agent => {
      if (agent.parentId) {
        const parent = agents.find(a => a.id === agent.parentId);
        if (parent) {
          ctx.beginPath();
          ctx.moveTo(parent.position.x, parent.position.y);
          ctx.lineTo(agent.position.x, agent.position.y);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });
  };

  const renderParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      const progress = particle.progress;
      const x = particle.from.x + (particle.to.x - particle.from.x) * progress;
      const y = particle.from.y + (particle.to.y - particle.from.y) * progress;

      // Trail
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, particle.color + '00');

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  };

  // Click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked agent
    const clicked = agents.find(agent => {
      const dx = x - agent.position.x;
      const dy = y - agent.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < 30;
    });

    setSelectedAgent(clicked?.id || null);
  }, [agents]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        style={{ 
          border: '1px solid #3a3a4e', 
          borderRadius: 8,
          cursor: 'pointer',
        }}
      />
      
      {/* Skill Bar */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        background: 'rgba(26, 26, 46, 0.95)',
        padding: 10,
        borderRadius: 8,
        border: '1px solid #3a3a4e',
      }}>
        {Object.values(OctoCodeSkill).map(skill => {
          const tier = SKILL_TIER_MAP[skill];
          const config = TIER_CONFIGS[tier];
          const isHovered = hoveredSkill === skill;
          
          return (
            <button
              key={skill}
              onClick={() => {
                if (selectedAgent) {
                  engine.delegateSkill(selectedAgent, skill);
                }
              }}
              onMouseEnter={() => setHoveredSkill(skill)}
              onMouseLeave={() => setHoveredSkill(null)}
              style={{
                padding: '6px 12px',
                background: isHovered ? config.color : '#2a2a3e',
                color: '#ffffff',
                border: `1px solid ${config.color}`,
                borderRadius: 4,
                cursor: selectedAgent ? 'pointer' : 'not-allowed',
                fontSize: 12,
                fontFamily: 'monospace',
                opacity: selectedAgent ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{config.emoji}</span>
              <span>{skill}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Info */}
      {selectedAgent && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(26, 26, 46, 0.95)',
          padding: 15,
          borderRadius: 8,
          border: '1px solid #3a3a4e',
          minWidth: 200,
        }}>
          {(() => {
            const agent = agents.find(a => a.id === selectedAgent);
            if (!agent) return null;
            const config = TIER_CONFIGS[agent.tier];
            
            return (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10,
                  marginBottom: 10,
                }}>
                  <span style={{ fontSize: 32 }}>{config.emoji}</span>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{agent.name}</div>
                    <div style={{ color: config.color, fontSize: 12 }}>{config.label}</div>
                  </div>
                </div>
                <div style={{ color: '#888', fontSize: 11, marginBottom: 5 }}>
                  Source: {SOURCE_BADGES[agent.source].label}
                </div>
                <div style={{ color: '#888', fontSize: 11, marginBottom: 5 }}>
                  Children: {agent.childIds.length}
                </div>
                <div style={{ color: '#888', fontSize: 11, marginBottom: 10 }}>
                  Activity: {(agent.activityLevel * 100).toFixed(0)}%
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button
                    onClick={() => engine.promoteAgent(agent.id)}
                    disabled={agent.tier === AgentTier.BOSS}
                    style={{
                      flex: 1,
                      padding: '5px 10px',
                      background: agent.tier === AgentTier.BOSS ? '#333' : '#4169E1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: agent.tier === AgentTier.BOSS ? 'not-allowed' : 'pointer',
                      fontSize: 11,
                    }}
                  >
                    Promote
                  </button>
                  <button
                    onClick={() => engine.demoteAgent(agent.id)}
                    disabled={agent.tier === AgentTier.INTERN}
                    style={{
                      flex: 1,
                      padding: '5px 10px',
                      background: agent.tier === AgentTier.INTERN ? '#333' : '#FF69B4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: agent.tier === AgentTier.INTERN ? 'not-allowed' : 'pointer',
                      fontSize: 11,
                    }}
                  >
                    Demote
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
