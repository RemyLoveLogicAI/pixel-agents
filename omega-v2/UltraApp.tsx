// Omega v2 ULTRA: Complete Application with All Systems Integrated
// Runtime mods, gamification, bidirectional sync, MCP/A2A protocols

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HierarchyEngine } from './HierarchyEngine.js';
import { OmegaRenderer } from './OmegaRenderer.js';
import { ModSystem, ModType, MOD_CONFIGS, createModAPI } from './ModSystem.js';
import { GamificationSystem, ACHIEVEMENTS, QUESTS, PlayerProfile } from './GamificationSystem.js';
import { BidirectionalSync, PixelInteraction, DevAction } from './BidirectionalSync.js';
import { ParticleSystem } from './ParticleSystem.js';
import { ProtocolLayer, ProtocolClient } from './ProtocolLayer.js';
import { 
  ViewMode, 
  AgentTier, 
  AgentSource, 
  OctoCodeSkill, 
  TIER_CONFIGS,
  SKILL_TIER_MAP,
  HierarchicalAgent,
} from './types.js';

export const UltraApp: React.FC = () => {
  // Core systems
  const [engine] = useState(() => new HierarchyEngine());
  const [modSystem] = useState(() => new ModSystem(engine));
  const [gameSystem] = useState(() => new GamificationSystem(engine, 'player-1', 'Developer'));
  const [syncSystem] = useState(() => new BidirectionalSync(engine));
  const [particleSystem] = useState(() => new ParticleSystem());
  const [protocolLayer] = useState(() => new ProtocolLayer());
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.OFFICE);
  const [activeMods, setActiveMods] = useState<ModType[]>([]);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [showGamification, setShowGamification] = useState(false);
  const [showMods, setShowMods] = useState(false);
  const [showProtocol, setShowProtocol] = useState(false);
  const [cheatBuffer, setCheatBuffer] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  
  // Console
  const [command, setCommand] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    '╔════════════════════════════════════╗',
    '║  Omega v2 ULTRA - Hierarchical AI  ║',
    '║  Runtime Mods | Gamification | MCP ║',
    '╚════════════════════════════════════╝',
    '',
    'Enter cheat codes or type "help"',
    '',
  ]);

  // Initialize systems
  useEffect(() => {
    // Connect gamification to engine events
    engine.onAgentSpawned = (agent) => {
      gameSystem.onAgentSpawned(agent.tier);
      particleSystem.emitSpawnEffect(agent.position.x, agent.position.y, TIER_CONFIGS[agent.tier].color);
    };

    engine.onAgentPromoted = (agent, fromTier) => {
      gameSystem.onAgentPromoted(fromTier);
      particleSystem.emitPromotionBurst(agent.position.x, agent.position.y);
      showNotification(`${agent.name} promoted to ${TIER_CONFIGS[agent.tier].label}!`, 'success');
    };

    engine.onDelegation = () => {
      gameSystem.onSkillDelegated(OctoCodeSkill.PLAN);
    };

    // Mod system events
    modSystem.onModActivated = (mod) => {
      gameSystem.onModActivated();
      particleSystem.emitModActivation(400, 300, mod.color, mod.emoji);
      showNotification(`${mod.name} activated!`, 'info');
    };

    modSystem.onCheatCodeEntered = () => {
      gameSystem.onCheatCodeUsed();
    };

    // Gamification events
    gameSystem.onAchievementUnlocked = (achievement) => {
      particleSystem.emitAchievementUnlocked(400, 300);
      showNotification(`Achievement: ${achievement.name}!`, 'success');
    };

    gameSystem.onLevelUp = (level) => {
      particleSystem.emitLevelUp(400, 300, level);
      showNotification(`Level Up! You are now level ${level}`, 'success');
    };

    gameSystem.onQuestCompleted = (quest) => {
      showNotification(`Quest Complete: ${quest.name}`, 'success');
    };

    // Bidirectional sync
    syncSystem.onActionTriggered = (action) => {
      setConsoleOutput(prev => [...prev, `[Action] ${action.type}`, '']);
    };

    // Start particle system
    particleSystem.start();

    // Update loop
    const interval = setInterval(() => {
      modSystem.update();
      setActiveMods(modSystem.getActiveMods().map(m => m.config.type));
      setProfile(gameSystem.getProfile());
    }, 1000);

    return () => {
      clearInterval(interval);
      particleSystem.stop();
    };
  }, [engine, modSystem, gameSystem, syncSystem, particleSystem]);

  // Keyboard handler for cheat codes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let key = e.key;
      
      // Convert arrow keys
      if (key === 'ArrowUp') key = '↑';
      if (key === 'ArrowDown') key = '↓';
      if (key === 'ArrowLeft') key = '←';
      if (key === 'ArrowRight') key = '→';
      
      const newBuffer = [...cheatBuffer, key].slice(-20);
      setCheatBuffer(newBuffer);
      modSystem.processKeyInput(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cheatBuffer, modSystem]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const executeCommand = () => {
    if (!command.trim()) return;
    
    let output = '';
    
    // Check for mod commands
    if (command.startsWith('mod ')) {
      const modType = command.split(' ')[1] as ModType;
      if (MOD_CONFIGS[modType]) {
        modSystem.activateMod(modType);
        output = `Activated ${MOD_CONFIGS[modType].name}`;
      } else {
        output = `Unknown mod: ${modType}`;
      }
    } else {
      output = engine.processCommand(command);
    }
    
    setConsoleOutput(prev => [...prev, `> ${command}`, output, '']);
    setCommand('');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#0a0a0f',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)',
        borderBottom: '2px solid #FFD700',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <span style={{ fontSize: 32, filter: 'drop-shadow(0 0 10px #FFD700)' }}>👔</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, color: '#FFD700', textShadow: '0 0 10px #FFD70050' }}>
              Omega v2 <span style={{ color: '#FF1493' }}>ULTRA</span>
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
              Hierarchical AI Orchestration with Runtime Mods
            </p>
          </div>
        </div>

        {/* Active Mods Display */}
        <div style={{ display: 'flex', gap: 8 }}>
          {activeMods.map(modType => {
            const config = MOD_CONFIGS[modType];
            const timeRemaining = modSystem.getModTimeRemaining(modType);
            
            return (
              <div
                key={modType}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  background: config.color + '30',
                  border: `1px solid ${config.color}`,
                  borderRadius: 4,
                  animation: 'pulse 1s infinite',
                }}
              >
                <span>{config.emoji}</span>
                <span style={{ fontSize: 11, fontWeight: 'bold', color: config.color }}>
                  {config.name}
                </span>
                {timeRemaining && (
                  <span style={{ fontSize: 10, color: '#888' }}>
                    {Math.ceil(timeRemaining / 1000)}s
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* View Toggle */}
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
                fontSize: 12,
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
        {/* Left Sidebar */}
        <aside style={{
          width: 260,
          background: '#12121a',
          borderRight: '1px solid #2a2a3e',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
          {/* Player Profile */}
          {profile && (
            <div style={{ padding: 15, borderBottom: '1px solid #2a2a3e' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>🎮</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 'bold', color: '#FFD700' }}>
                    {profile.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#888' }}>
                    Level {profile.level}
                  </div>
                </div>
              </div>
              
              {/* XP Bar */}
              <div style={{ marginBottom: 10 }}>
                <div style={{
                  height: 8,
                  background: '#2a2a3e',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${gameSystem.getXPProgress() * 100}%`,
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    transition: 'width 0.3s',
                  }} />
                </div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 4, textAlign: 'center' }}>
                  {gameSystem.getXPTONextLevel()} XP to next level
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10 }}>
                <div style={{ color: '#666' }}>🔥 Streak: {profile.streakDays}d</div>
                <div style={{ color: '#666' }}>🏆 Achievements: {profile.achievements.length}</div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ padding: 15, borderBottom: '1px solid #2a2a3e' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: 11, color: '#666', textTransform: 'uppercase' }}>
              Quick Actions
            </h3>
            
            <button
              onClick={() => setShowGamification(!showGamification)}
              style={{
                width: '100%',
                padding: 10,
                marginBottom: 8,
                background: showGamification ? '#FFD700' : '#2a2a3e',
                color: showGamification ? '#000' : '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🏆</span> Gamification
            </button>
            
            <button
              onClick={() => setShowMods(!showMods)}
              style={{
                width: '100%',
                padding: 10,
                marginBottom: 8,
                background: showMods ? '#FF1493' : '#2a2a3e',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🎮</span> Runtime Mods
            </button>
            
            <button
              onClick={() => setShowProtocol(!showProtocol)}
              style={{
                width: '100%',
                padding: 10,
                background: showProtocol ? '#4169E1' : '#2a2a3e',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🔌</span> MCP / A2A
            </button>
          </div>

          {/* Mod Panel */}
          {showMods && (
            <div style={{ padding: 15, borderBottom: '1px solid #2a2a3e' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: 11, color: '#666', textTransform: 'uppercase' }}>
                Runtime Mods
              </h3>
              {Object.values(MOD_CONFIGS).map(mod => (
                <button
                  key={mod.type}
                  onClick={() => modSystem.activateMod(mod.type)}
                  style={{
                    width: '100%',
                    padding: 8,
                    marginBottom: 6,
                    background: activeMods.includes(mod.type) ? mod.color + '40' : '#2a2a3e',
                    border: `1px solid ${mod.color}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>{mod.emoji}</span>
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ fontWeight: 'bold' }}>{mod.name}</div>
                    <div style={{ fontSize: 9, color: '#888' }}>{mod.cheatCode}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Center - Main Visualization */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <OmegaRenderer
            engine={engine}
            viewMode={viewMode}
            width={800}
            height={600}
          />
          
          {/* Gamification Overlay */}
          {showGamification && profile && (
            <div style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 300,
              maxHeight: 400,
              background: 'rgba(18, 18, 26, 0.95)',
              border: '1px solid #FFD700',
              borderRadius: 8,
              padding: 15,
              overflow: 'auto',
            }}>
              <h3 style={{ margin: '0 0 15px', color: '#FFD700', fontSize: 14 }}>
                🏆 Achievements ({profile.achievements.length}/{ACHIEVEMENTS.length})
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ACHIEVEMENTS.map(achievement => {
                  const unlocked = profile.achievements.includes(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      style={{
                        padding: 10,
                        background: unlocked ? '#FFD70020' : '#2a2a3e',
                        border: `1px solid ${unlocked ? '#FFD700' : '#3a3a4e'}`,
                        borderRadius: 4,
                        opacity: unlocked ? 1 : 0.5,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{achievement.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 'bold', color: unlocked ? '#FFD700' : '#888' }}>
                            {achievement.name}
                          </div>
                          <div style={{ fontSize: 10, color: '#666' }}>
                            {achievement.description}
                          </div>
                        </div>
                        {unlocked && <span style={{ color: '#FFD700' }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <h3 style={{ margin: '20px 0 15px', color: '#4169E1', fontSize: 14 }}>
                📋 Active Quests
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {gameSystem.getActiveQuests().map(({ quest, progress, completed }) => (
                  <div
                    key={quest.id}
                    style={{
                      padding: 10,
                      background: completed ? '#4169E120' : '#2a2a3e',
                      border: `1px solid ${completed ? '#4169E1' : '#3a3a4e'}`,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{quest.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                          {quest.name}
                        </div>
                        <div style={{ fontSize: 10, color: '#666' }}>
                          {progress}/{quest.target}
                        </div>
                        <div style={{
                          height: 4,
                          background: '#1a1a2e',
                          borderRadius: 2,
                          marginTop: 4,
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${(progress / quest.target) * 100}%`,
                            background: completed ? '#4169E1' : '#666',
                            borderRadius: 2,
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Console */}
        <aside style={{
          width: 350,
          background: '#12121a',
          borderLeft: '1px solid #2a2a3e',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '12px 15px',
            borderBottom: '1px solid #2a2a3e',
            fontSize: 12,
            color: '#666',
            textTransform: 'uppercase',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>Command Console</span>
            <span style={{ fontSize: 10, color: '#444' }}>
              {cheatBuffer.slice(-10).join('')}
            </span>
          </div>
          
          <div style={{
            flex: 1,
            padding: 15,
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: 1.5,
          }}>
            {consoleOutput.map((line, i) => (
              <div
                key={i}
                style={{
                  color: line.startsWith('>') ? '#4169E1' : 
                         line.includes('Error') || line.includes('failed') ? '#FF6B6B' :
                         line.includes('activated') || line.includes('Promoted') ? '#32CD32' :
                         line.includes('╔') || line.includes('║') || line.includes('╝') ? '#FFD700' :
                         '#e0e0e0',
                  marginBottom: 2,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {line}
              </div>
            ))}
          </div>

          <div style={{
            padding: 15,
            borderTop: '1px solid #2a2a3e',
          }}>
            <div style={{ 
              display: 'flex', 
              gap: 8,
              padding: 10,
              background: '#1a1a2e',
              borderRadius: 4,
            }}>
              <span style={{ color: '#4169E1', fontFamily: 'monospace' }}>&gt;</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeCommand()}
                placeholder="Enter command or cheat code..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e0e0e0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: notification.type === 'success' ? '#32CD32' : 
                     notification.type === 'warning' ? '#FFA500' : '#4169E1',
          color: '#fff',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 'bold',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'slideUp 0.3s ease',
          zIndex: 1000,
        }}>
          {notification.message}
        </div>
      )}

      {/* Global Styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UltraApp;
