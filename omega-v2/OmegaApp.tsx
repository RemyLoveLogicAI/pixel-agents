// Omega v2: Main Application Component
// Full hierarchical agent system with CLI, visualization, and controls

import React, { useState, useRef, useEffect } from 'react';
import { HierarchyEngine } from './HierarchyEngine.js';
import { OmegaRenderer } from './OmegaRenderer.js';
import { ViewMode, AgentSource, AgentTier, TIER_CONFIGS, OctoCodeSkill } from './types.js';

export const OmegaApp: React.FC = () => {
  const [engine] = useState(() => new HierarchyEngine());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OFFICE);
  const [command, setCommand] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    'Omega v2 Hierarchical Agent System',
    'Type "help" for available commands',
    '',
  ]);
  const [spawnRate, setSpawnRate] = useState(50);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleOutput]);

  // Update spawn rate
  useEffect(() => {
    engine.setSpawnRate(spawnRate / 100);
  }, [spawnRate, engine]);

  const executeCommand = () => {
    if (!command.trim()) return;
    
    const output = engine.processCommand(command);
    setConsoleOutput(prev => [...prev, `> ${command}`, output, '']);
    setCommand('');
  };

  const quickSpawn = (tier: AgentTier, source: AgentSource) => {
    const cmd = `spawn ${tier} ${source}`;
    const output = engine.processCommand(cmd);
    setConsoleOutput(prev => [...prev, `> ${cmd}`, output, '']);
  };

  const quickDelegate = (skill: OctoCodeSkill) => {
    // Find first available agent that can handle this skill
    const agents = engine.getAllAgents();
    const targetTier = Object.entries(TIER_CONFIGS).find(
      ([, config]) => config.skills.includes(skill)
    )?.[0];
    
    if (targetTier !== undefined) {
      const agent = agents.find(a => a.tier === parseInt(targetTier));
      if (agent) {
        const cmd = `delegate ${agent.id} ${skill}`;
        const output = engine.processCommand(cmd);
        setConsoleOutput(prev => [...prev, `> ${cmd}`, output, '']);
      }
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0f0f1a',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        background: '#1a1a2e',
        borderBottom: '1px solid #2a2a3e',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span style={{ fontSize: 28 }}>👔</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, color: '#FFD700' }}>Omega v2</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#888' }}>Hierarchical Agent System</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: 5 }}>
          {Object.values(ViewMode).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '8px 16px',
                background: viewMode === mode ? '#4169E1' : '#2a2a3e',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 13,
                textTransform: 'capitalize',
              }}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel - Controls */}
        <aside style={{
          width: 280,
          background: '#1a1a2e',
          borderRight: '1px solid #2a2a3e',
          padding: 20,
          overflow: 'auto',
        }}>
          {/* Quick Spawn */}
          <section style={{ marginBottom: 25 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#888', textTransform: 'uppercase' }}>
              Quick Spawn
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.values(AgentTier).filter(t => typeof t === 'number').map(tier => {
                const config = TIER_CONFIGS[tier as AgentTier];
                return (
                  <div key={tier} style={{ display: 'flex', gap: 5 }}>
                    {Object.values(AgentSource).map(source => (
                      <button
                        key={source}
                        onClick={() => quickSpawn(tier as AgentTier, source)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: '#2a2a3e',
                          color: config.color,
                          border: `1px solid ${config.color}40`,
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                        }}
                        title={`Spawn ${config.label} (${source})`}
                      >
                        <span>{config.emoji}</span>
                        <span style={{ textTransform: 'uppercase', fontSize: 9 }}>{source[0]}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Skill Dispatch */}
          <section style={{ marginBottom: 25 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#888', textTransform: 'uppercase' }}>
              Dispatch Skill
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.values(OctoCodeSkill).map(skill => {
                const tier = Object.entries(TIER_CONFIGS).find(
                  ([, config]) => config.skills.includes(skill)
                )?.[1];
                
                return (
                  <button
                    key={skill}
                    onClick={() => quickDelegate(skill)}
                    style={{
                      padding: '8px 12px',
                      background: '#2a2a3e',
                      color: '#fff',
                      border: '1px solid #3a3a4e',
                      borderLeft: `3px solid ${tier?.color || '#888'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontFamily: 'monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{tier?.emoji}</span>
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Spawn Rate Slider */}
          <section style={{ marginBottom: 25 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#888', textTransform: 'uppercase' }}>
              Intern Spawn Rate
            </h3>
            <input
              type="range"
              min="0"
              max="100"
              value={spawnRate}
              onChange={(e) => setSpawnRate(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ textAlign: 'center', marginTop: 5, fontSize: 12, color: '#888' }}>
              {spawnRate}%
            </div>
          </section>

          {/* Legend */}
          <section>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#888', textTransform: 'uppercase' }}>
              Hierarchy
            </h3>
            {Object.values(AgentTier).filter(t => typeof t === 'number').map(tier => {
              const config = TIER_CONFIGS[tier as AgentTier];
              return (
                <div
                  key={tier}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px',
                    marginBottom: 5,
                    background: '#2a2a3e',
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{config.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: config.color, fontWeight: 'bold' }}>
                      {config.label}
                    </div>
                    <div style={{ fontSize: 10, color: '#666' }}>
                      Scale: {config.scale}x | Max: {config.maxDelegates}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </aside>

        {/* Center - Visualization */}
        <main style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <OmegaRenderer
            engine={engine}
            viewMode={viewMode}
            width={900}
            height={600}
          />
        </main>

        {/* Right Panel - Console */}
        <aside style={{
          width: 350,
          background: '#1a1a2e',
          borderLeft: '1px solid #2a2a3e',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #2a2a3e',
            fontSize: 14,
            color: '#888',
            textTransform: 'uppercase',
          }}>
            Command Console
          </div>
          
          <div style={{
            flex: 1,
            padding: 15,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: 12,
            lineHeight: 1.6,
          }}>
            {consoleOutput.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith('>') ? '#4169E1' : 
                         line.includes('Error') || line.includes('failed') ? '#FF6B6B' :
                         line.includes('Spawned') || line.includes('Promoted') ? '#32CD32' :
                         '#e0e0e0',
                  marginBottom: 2,
                }}
              >
                {line}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          <div style={{
            padding: 15,
            borderTop: '1px solid #2a2a3e',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ color: '#4169E1', fontFamily: 'monospace' }}>&gt;</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
                placeholder="Enter command..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e0e0e0',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ 
              marginTop: 10, 
              fontSize: 10, 
              color: '#666',
              fontFamily: 'monospace',
            }}>
              Commands: spawn, delegate, promote, demote, list, spawnrate
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OmegaApp;
