/**
 * Avicenna's Karate Dojo - Particle System
 * Star bursts, confetti, and fireworks effects
 */

// ============================================
// PARTICLE CLASS
// ============================================

class Particle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = options.vx || (Math.random() - 0.5) * 8;
    this.vy = options.vy || (Math.random() - 0.5) * 8;
    this.gravity = options.gravity || 0.15;
    this.friction = options.friction || 0.98;
    this.size = options.size || 8;
    this.color = options.color || '#FFB703';
    this.alpha = options.alpha || 1;
    this.decay = options.decay || 0.02;
    this.rotation = options.rotation || 0;
    this.rotationSpeed = options.rotationSpeed || (Math.random() - 0.5) * 0.2;
    this.shape = options.shape || 'circle'; // 'circle', 'square', 'star', 'confetti'
    this.life = 1;
  }

  update(deltaTime) {
    this.vy += this.gravity;
    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.life -= this.decay;
    this.alpha = Math.max(0, this.life);
  }

  draw(ctx) {
    if (this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.fillStyle = this.color;

    switch (this.shape) {
      case 'square':
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        break;
      case 'star':
        this.drawStar(ctx, 0, 0, 5, this.size, this.size / 2);
        break;
      case 'confetti':
        ctx.fillRect(-this.size / 3, -this.size / 2, this.size / 1.5, this.size);
        break;
      default: // circle
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  isDead() {
    return this.life <= 0;
  }
}

// ============================================
// STAR BURST EFFECT
// ============================================

class StarBurst {
  constructor(x, y) {
    this.particles = [];
    this.duration = 1000; // ms
    this.startTime = Date.now();

    // Create star particles
    const colors = ['#FFB703', '#FFD54F', '#FFF176', '#FFEB3B'];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.1,
        friction: 0.96,
        size: 10 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: 'star',
        decay: 0.025,
        rotationSpeed: (Math.random() - 0.5) * 0.3
      }));
    }

    // Add center burst particles
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, {
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        gravity: 0.05,
        friction: 0.95,
        size: 6 + Math.random() * 6,
        color: '#FFFFFF',
        shape: 'circle',
        decay: 0.04
      }));
    }
  }

  update(deltaTime) {
    this.particles.forEach(p => p.update(deltaTime));
    this.particles = this.particles.filter(p => !p.isDead());
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  isDead() {
    return this.particles.length === 0;
  }
}

// ============================================
// CONFETTI EFFECT
// ============================================

class Confetti {
  constructor(x, y) {
    this.particles = [];
    this.colors = ['#E63946', '#FFB703', '#06D6A0', '#FF6B9D', '#4A90D9', '#9B59B6'];

    // Create confetti pieces
    for (let i = 0; i < 50; i++) {
      const angle = (Math.random() - 0.3) * Math.PI; // Mostly upward
      const speed = 4 + Math.random() * 8;
      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: Math.sin(angle) * speed,
        gravity: 0.12,
        friction: 0.98,
        size: 6 + Math.random() * 8,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape: 'confetti',
        decay: 0.008,
        rotationSpeed: (Math.random() - 0.5) * 0.4
      }));
    }
  }

  update(deltaTime) {
    this.particles.forEach(p => p.update(deltaTime));
    this.particles = this.particles.filter(p => !p.isDead());
  }

  draw(ctx) {
    this.particles.forEach(p => p.draw(ctx));
  }

  isDead() {
    return this.particles.length === 0;
  }
}

// ============================================
// FIREWORKS EFFECT
// ============================================

class Fireworks {
  constructor(x, y) {
    this.rings = [];
    this.particles = [];
    this.colors = ['#FFB703', '#E63946', '#06D6A0', '#FFFFFF', '#FF6B9D'];

    // Create multiple rings
    for (let r = 0; r < 3; r++) {
      const ringParticles = [];
      const radius = 30 + r * 20;
      const count = 12 + r * 4;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        ringParticles.push({
          angle: angle,
          radius: radius,
          speed: 2 + Math.random() * 2
        });
      }

      this.rings.push({ particles: ringParticles, color: color, alpha: 1 });
    }

    // Initial burst particles
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.particles.push(new Particle(x, y, {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.08,
        friction: 0.97,
        size: 4 + Math.random() * 4,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape: 'circle',
        decay: 0.015,
        rotationSpeed: 0
      }));
    }
  }

  update(deltaTime) {
    // Update rings
    this.rings.forEach(ring => {
      ring.radius += 3;
      ring.alpha -= 0.02;
    });
    this.rings = this.rings.filter(r => r.alpha > 0);

    // Update particles
    this.particles.forEach(p => p.update(deltaTime));
    this.particles = this.particles.filter(p => !p.isDead());
  }

  draw(ctx) {
    // Draw rings
    this.rings.forEach(ring => {
      ctx.save();
      ctx.globalAlpha = ring.alpha;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ring.particles.forEach(p => {
        const x = p.radius * Math.cos(p.angle);
        const y = p.radius * Math.sin(p.angle);
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.restore();
    });

    // Draw particles
    this.particles.forEach(p => p.draw(ctx));
  }

  isDead() {
    return this.rings.length === 0 && this.particles.length === 0;
  }
}

// ============================================
// PARTICLE SYSTEM MANAGER
// ============================================

class ParticleSystem {
  constructor() {
    this.effects = [];
    this.maxEffects = 20;
  }

  /**
   * Add a star burst effect at position
   */
  starBurst(x, y) {
    this.addEffect(new StarBurst(x, y));
  }

  /**
   * Add a confetti effect at position
   */
  confetti(x, y) {
    this.addEffect(new Confetti(x, y));
  }

  /**
   * Add a fireworks effect at position
   */
  fireworks(x, y) {
    this.addEffect(new Fireworks(x, y));
  }

  /**
   * Add effect and manage max count
   */
  addEffect(effect) {
    this.effects.push(effect);
    if (this.effects.length > this.maxEffects) {
      this.effects.shift();
    }
  }

  /**
   * Update all effects
   */
  update(deltaTime) {
    this.effects.forEach(effect => effect.update(deltaTime));
    this.effects = this.effects.filter(effect => !effect.isDead());
  }

  /**
   * Draw all effects
   */
  draw(ctx) {
    this.effects.forEach(effect => effect.draw(ctx));
  }

  /**
   * Clear all effects
   */
  clear() {
    this.effects = [];
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Particle, StarBurst, Confetti, Fireworks, ParticleSystem };
}
