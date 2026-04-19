/**
 * Avicenna's Karate Dojo - Target Strike Game
 * Accuracy + speed target hitting game
 */

const TargetStrike = {
  // Game state
  canvas: null,
  ctx: null,
  callbacks: {},
  
  // Game settings
  targetsToWin: 20,
  targetLifetime: 2000,
  spawnInterval: 800,
  
  // Game state
  targets: [],
  score: 0,
  hits: 0,
  misses: 0,
  startTime: 0,
  gameOver: false,
  
  // Animation
  lastTime: 0,
  lastSpawn: 0,
  
  // Target types
  targetTypes: [
    { type: 'punch', icon: '🥊', color: '#E63946', points: 10 },
    { type: 'kick', icon: '🦵', color: '#4A90D9', points: 15 },
    { type: 'fly', icon: '🥏', color: '#06D6A0', points: 20 }
  ],
  
  /**
   * Initialize the game
   */
  init(canvas, ctx, callbacks) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.reset();
  },
  
  /**
   * Reset game state
   */
  reset() {
    this.targets = [];
    this.score = 0;
    this.hits = 0;
    this.misses = 0;
    this.gameOver = false;
    this.startTime = Date.now();
    this.lastSpawn = 0;
    this.spawnInterval = 800;
  },
  
  /**
   * Start the game
   */
  start() {
    this.reset();
  },
  
  /**
   * Handle player action (for keyboard controls)
   */
  handleAction(action) {
    // For keyboard, we auto-target nearest matching target
    const matchingTargets = this.targets.filter(t => t.type === action);
    if (matchingTargets.length > 0) {
      // Hit the oldest matching target
      this.hitTarget(matchingTargets[0]);
    }
  },
  
  /**
   * Spawn a new target
   */
  spawnTarget() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Avoid spawning in edges
    const margin = 80;
    const x = margin + Math.random() * (w - margin * 2);
    const y = margin + Math.random() * (h * 0.5);
    
    const targetType = this.targetTypes[Math.floor(Math.random() * this.targetTypes.length)];
    
    const target = {
      x: x,
      y: y,
      radius: 40 + Math.random() * 20,
      type: targetType.type,
      icon: targetType.icon,
      color: targetType.color,
      points: targetType.points,
      spawnTime: Date.now(),
      lifetime: this.targetLifetime,
      scale: 0,
      growing: true
    };
    
    this.targets.push(target);
  },
  
  /**
   * Handle canvas click/tap
   */
  handleClick(x, y) {
    // Check if clicked on any target
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i];
      const dist = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
      
      if (dist <= target.radius) {
        this.hitTarget(target);
        return true;
      }
    }
    
    // Missed
    this.misses++;
    if (this.callbacks.audio) {
      this.callbacks.audio.playWrong();
    }
    return false;
  },
  
  /**
   * Hit a target
   */
  hitTarget(target) {
    const index = this.targets.indexOf(target);
    if (index === -1) return;
    
    this.targets.splice(index, 1);
    this.hits++;
    this.score += target.points;
    
    // Effects
    if (this.callbacks.audio) {
      this.callbacks.audio.playStar();
    }
    if (this.callbacks.particles) {
      this.callbacks.particles.starBurst(target.x, target.y);
    }
    if (this.callbacks.onShake) {
      this.callbacks.onShake();
    }
    
    // Update score
    this.updateScore();
    
    // Check win condition
    if (this.hits >= this.targetsToWin) {
      this.gameOver = true;
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(true);
      }
    }
  },
  
  /**
   * Update score display
   */
  updateScore() {
    if (this.callbacks.onScore) {
      this.callbacks.onScore(this.score);
    }
  },
  
  /**
   * Update game state
   */
  update(deltaTime) {
    if (this.gameOver) return;
    
    const now = Date.now();
    
    // Spawn targets
    if (now - this.lastSpawn > this.spawnInterval) {
      this.spawnTarget();
      this.lastSpawn = now;
      
      // Gradually decrease spawn interval
      this.spawnInterval = Math.max(400, 800 - this.hits * 15);
    }
    
    // Update targets
    this.targets.forEach(target => {
      // Grow animation
      if (target.growing && target.scale < 1) {
        target.scale += 0.1;
        if (target.scale >= 1) {
          target.scale = 1;
          target.growing = false;
        }
      }
      
      // Check lifetime
      const age = now - target.spawnTime;
      if (age >= target.lifetime) {
        // Target expired - remove and count as miss
        const index = this.targets.indexOf(target);
        if (index !== -1) {
          this.targets.splice(index, 1);
          this.misses++;
        }
      }
    });
    
    this.lastTime = now;
  },
  
  /**
   * Draw game state
   */
  draw(ctx) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Draw background
    this.drawBackground(ctx, w, h);
    
    // Draw targets
    this.targets.forEach(target => this.drawTarget(ctx, target));
    
    // Draw crosshair cursor
    this.drawCrosshair(ctx);
    
    // Draw HUD
    this.drawHUD(ctx, w, h);
  },
  
  /**
   * Draw background
   */
  drawBackground(ctx, w, h) {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1D3557');
    gradient.addColorStop(1, '#152a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Dojo target board area
    const boardX = w * 0.1;
    const boardY = h * 0.1;
    const boardW = w * 0.8;
    const boardH = h * 0.6;
    
    // Board background
    ctx.fillStyle = '#2D4A3E';
    ctx.fillRect(boardX, boardY, boardW, boardH);
    
    // Target rings
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    for (let r = 50; r < Math.min(boardW, boardH) / 2; r += 50) {
      ctx.beginPath();
      ctx.arc(w / 2, boardY + boardH / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Board border
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 10;
    ctx.strokeRect(boardX, boardY, boardW, boardH);
  },
  
  /**
   * Draw target
   */
  drawTarget(ctx, target) {
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.scale(target.scale, target.scale);
    
    // Age-based opacity (fade out near end of life)
    const age = Date.now() - target.spawnTime;
    const lifeRatio = age / target.lifetime;
    const alpha = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
    
    ctx.globalAlpha = alpha;
    
    // Pulsing effect
    const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;
    ctx.scale(pulse, pulse);
    
    // Outer ring
    ctx.strokeStyle = target.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, target.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner circle
    ctx.fillStyle = target.color;
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    
    ctx.globalAlpha = alpha;
    
    // Icon
    ctx.font = `${target.radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(target.icon, 0, 0);
    
    // Points indicator
    ctx.fillStyle = '#FFB703';
    ctx.font = 'bold 14px "Nunito", sans-serif';
    ctx.fillText(`+${target.points}`, 0, target.radius + 15);
    
    ctx.restore();
  },
  
  /**
   * Draw crosshair
   */
  drawCrosshair(ctx) {
    // Crosshair drawn at mouse position by canvas event
  },
  
  /**
   * Draw HUD
   */
  drawHUD(ctx, w, h) {
    // Progress bar
    const progress = this.hits / this.targetsToWin;
    const barWidth = 200;
    const barHeight = 20;
    const barX = w / 2 - barWidth / 2;
    const barY = 20;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    ctx.fillStyle = '#06D6A0';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.hits}/${this.targetsToWin}`, w / 2, barY + 15);
    
    // Score
    ctx.fillStyle = '#FFB703';
    ctx.font = 'bold 24px "Fredoka One", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 20, 35);
    
    // Hits/Misses
    ctx.fillStyle = '#06D6A0';
    ctx.font = '16px "Nunito", sans-serif';
    ctx.fillText(`Hits: ${this.hits}`, 20, 60);
    
    ctx.fillStyle = '#E63946';
    ctx.fillText(`Misses: ${this.misses}`, 20, 80);
    
    // Instructions
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '14px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Click or tap targets! Z=Punch, X=Kick, Space=Jump', w / 2, h - 20);
  },
  
  /**
   * Cleanup when game ends
   */
  cleanup() {
    this.reset();
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TargetStrike;
}
