// Omega v2 ULTRA: Advanced Particle System
// Visual effects for delegation, promotion, spawning, and mod activation

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: ParticleType;
  rotation: number;
  rotationSpeed: number;
}

export enum ParticleType {
  DELEGATION = 'delegation',
  PROMOTION = 'promotion',
  SPAWN = 'spawn',
  MOD_ACTIVATION = 'mod',
  ACHIEVEMENT = 'achievement',
  LEVEL_UP = 'levelup',
  SKILL_BURST = 'skill',
  TRAIL = 'trail',
}

export interface EmitterConfig {
  x: number;
  y: number;
  type: ParticleType;
  color: string;
  count: number;
  spread: number;
  speed: number;
  size: number;
  life: number;
  gravity?: number;
  fadeOut?: boolean;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private intensityMultiplier = 1.0;

  onParticleSpawn: ((particle: Particle) => void) | null = null;
  onParticleDeath: ((particle: Particle) => void) | null = null;

  constructor() {}

  setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  setIntensity(multiplier: number): void {
    this.intensityMultiplier = multiplier;
  }

  // Start animation loop
  start(): void {
    if (this.animationId) return;
    
    const animate = () => {
      this.update(1 / 60); // Assume 60fps
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Emit particles
  emit(config: EmitterConfig): void {
    const count = Math.floor(config.count * this.intensityMultiplier);
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i / count) + Math.random() * config.spread;
      const speed = config.speed * (0.5 + Math.random() * 0.5);
      
      const particle: Particle = {
        id: `p-${Date.now()}-${Math.random()}`,
        x: config.x + (Math.random() - 0.5) * 10,
        y: config.y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: config.life * (0.8 + Math.random() * 0.4),
        maxLife: config.life,
        size: config.size * (0.5 + Math.random() * 0.5),
        color: config.color,
        alpha: 1,
        type: config.type,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      };

      this.particles.push(particle);
      this.onParticleSpawn?.(particle);
    }
  }

  // Predefined effects
  emitDelegationTrail(fromX: number, fromY: number, toX: number, toY: number, color: string): void {
    const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
    const steps = Math.floor(distance / 20);
    
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t;
      const y = fromY + (toY - fromY) * t;
      
      setTimeout(() => {
        this.emit({
          x,
          y,
          type: ParticleType.TRAIL,
          color,
          count: 2,
          spread: 0.5,
          speed: 0.5,
          size: 3,
          life: 0.3,
          fadeOut: true,
        });
      }, i * 20);
    }
  }

  emitPromotionBurst(x: number, y: number): void {
    // Golden explosion
    this.emit({
      x,
      y,
      type: ParticleType.PROMOTION,
      color: '#FFD700',
      count: 50,
      spread: Math.PI * 2,
      speed: 8,
      size: 6,
      life: 1.5,
      gravity: 0.2,
      fadeOut: true,
    });

    // Secondary sparkles
    setTimeout(() => {
      this.emit({
        x,
        y,
        type: ParticleType.PROMOTION,
        color: '#FFA500',
        count: 20,
        spread: Math.PI * 2,
        speed: 4,
        size: 3,
        life: 1,
        fadeOut: true,
      });
    }, 200);
  }

  emitSpawnEffect(x: number, y: number, tierColor: string): void {
    this.emit({
      x,
      y,
      type: ParticleType.SPAWN,
      color: tierColor,
      count: 30,
      spread: Math.PI * 2,
      speed: 5,
      size: 4,
      life: 1,
      fadeOut: true,
    });
  }

  emitModActivation(x: number, y: number, modColor: string, modEmoji: string): void {
    // Ring expansion
    for (let ring = 0; ring < 3; ring++) {
      setTimeout(() => {
        const count = 20 + ring * 10;
        this.emit({
          x,
          y,
          type: ParticleType.MOD_ACTIVATION,
          color: modColor,
          count,
          spread: Math.PI * 2,
          speed: 3 + ring * 2,
          size: 5 - ring,
          life: 1.5,
          fadeOut: true,
        });
      }, ring * 150);
    }

    // Emoji particles
    if (modEmoji) {
      setTimeout(() => {
        this.emit({
          x,
          y,
          type: ParticleType.MOD_ACTIVATION,
          color: '#FFFFFF',
          count: 5,
          spread: Math.PI * 2,
          speed: 2,
          size: 20,
          life: 2,
          fadeOut: true,
        });
      }, 300);
    }
  }

  emitAchievementUnlocked(x: number, y: number): void {
    // Trophy sparkle
    this.emit({
      x,
      y,
      type: ParticleType.ACHIEVEMENT,
      color: '#FFD700',
      count: 100,
      spread: Math.PI * 2,
      speed: 10,
      size: 4,
      life: 2,
      gravity: 0.1,
      fadeOut: true,
    });

    // Rising stars
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        this.emit({
          x: x + (Math.random() - 0.5) * 100,
          y: y + 50,
          type: ParticleType.ACHIEVEMENT,
          color: '#FFF',
          count: 1,
          spread: 0.2,
          speed: 3,
          size: 8,
          life: 1.5,
          gravity: -0.3,
          fadeOut: true,
        });
      }, i * 100);
    }
  }

  emitLevelUp(x: number, y: number, level: number): void {
    // Number particles
    const levelStr = level.toString();
    for (let i = 0; i < levelStr.length; i++) {
      setTimeout(() => {
        this.emit({
          x: x + (i - levelStr.length / 2) * 30,
          y,
          type: ParticleType.LEVEL_UP,
          color: '#00FF00',
          count: 20,
          spread: Math.PI / 4,
          speed: 6,
          size: 8,
          life: 2,
          gravity: 0.1,
          fadeOut: true,
        });
      }, i * 200);
    }

    // Shockwave
    setTimeout(() => {
      this.emit({
        x,
        y,
        type: ParticleType.LEVEL_UP,
        color: '#00FF00',
        count: 60,
        spread: Math.PI * 2,
        speed: 15,
        size: 2,
        life: 0.8,
        fadeOut: true,
      });
    }, levelStr.length * 200);
  }

  emitSkillBurst(x: number, y: number, skillColor: string): void {
    this.emit({
      x,
      y,
      type: ParticleType.SKILL_BURST,
      color: skillColor,
      count: 25,
      spread: Math.PI * 2,
      speed: 6,
      size: 5,
      life: 0.8,
      fadeOut: true,
    });
  }

  // Update all particles
  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      
      // Apply gravity
      if (p.type === ParticleType.PROMOTION || p.type === ParticleType.ACHIEVEMENT) {
        p.vy += 0.2 * dt * 60;
      }
      
      // Update rotation
      p.rotation += p.rotationSpeed * dt * 60;
      
      // Update life
      p.life -= dt;
      
      // Fade out
      if (p.life < 0.3) {
        p.alpha = p.life / 0.3;
      }
      
      // Remove dead particles
      if (p.life <= 0) {
        this.onParticleDeath?.(p);
        this.particles.splice(i, 1);
      }
    }
  }

  // Render all particles
  render(): void {
    if (!this.ctx) return;

    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      switch (p.type) {
        case ParticleType.TRAIL:
          this.renderTrailParticle(p);
          break;
        case ParticleType.PROMOTION:
        case ParticleType.ACHIEVEMENT:
          this.renderStarParticle(p);
          break;
        case ParticleType.MOD_ACTIVATION:
          this.renderRingParticle(p);
          break;
        case ParticleType.LEVEL_UP:
          this.renderDiamondParticle(p);
          break;
        default:
          this.renderCircleParticle(p);
      }

      this.ctx.restore();
    }
  }

  private renderCircleParticle(p: Particle): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.fillStyle = p.color;
    this.ctx.fill();
  }

  private renderTrailParticle(p: Particle): void {
    if (!this.ctx) return;
    
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
    gradient.addColorStop(0, p.color);
    gradient.addColorStop(1, p.color + '00');
    
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
  }

  private renderStarParticle(p: Particle): void {
    if (!this.ctx) return;
    
    const spikes = 4;
    const outerRadius = p.size;
    const innerRadius = p.size * 0.4;
    
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / spikes;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fillStyle = p.color;
    this.ctx.fill();
  }

  private renderRingParticle(p: Particle): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    this.ctx.strokeStyle = p.color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private renderDiamondParticle(p: Particle): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -p.size);
    this.ctx.lineTo(p.size, 0);
    this.ctx.lineTo(0, p.size);
    this.ctx.lineTo(-p.size, 0);
    this.ctx.closePath();
    this.ctx.fillStyle = p.color;
    this.ctx.fill();
  }

  // Utility methods
  clear(): void {
    this.particles = [];
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  // Create ambient particles (background effect)
  emitAmbientParticles(width: number, height: number, count: number = 5): void {
    for (let i = 0; i < count; i++) {
      this.emit({
        x: Math.random() * width,
        y: Math.random() * height,
        type: ParticleType.TRAIL,
        color: `hsla(${Math.random() * 360}, 70%, 50%, 0.3)`,
        count: 1,
        spread: Math.PI * 2,
        speed: 0.5,
        size: 2,
        life: 3,
        fadeOut: true,
      });
    }
  }
}
