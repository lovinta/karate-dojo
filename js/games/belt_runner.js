/**
 * Avicenna's Karate Dojo - Belt Runner Game
 * Side-scrolling runner with reaction time challenges
 */

const BeltRunner = {
  // Game state
  canvas: null,
  ctx: null,
  callbacks: {},
  
  // Player state
  player: {
    x: 100,
    y: 0,
    lane: 1, // 0=bottom, 1=middle, 2=top
    width: 50,
    height: 70,
    jumping: false,
    ducking: false,
    striking: false,
    jumpVelocity: 0,
    groundY: 0
  },
  
  // Game settings
  gameDuration: 60000, // 60 seconds
  startTime: 0,
  elapsedTime: 0,
  speed: 5,
  baseSpeed: 5,
  score: 0,
  lives: 3,
  
  // Obstacles
  obstacles: [],
  obstacleSpawnInterval: 1500,
  lastObstacleSpawn: 0,
  
  // Lanes (y positions)
  lanes: [],
  
  // Animation
  lastTime: 0,
  groundOffset: 0,
  
  // Actions
  actionCooldown: 0,
  
  /**
   * Initialize the game
   */
  init(canvas, ctx, callbacks) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.callbacks = callbacks;
    
    // Calculate lanes
    const h = window.innerHeight;
    this.lanes = [h * 0.75, h * 0.55, h * 0.35];
    
    // Set player ground position
    this.player.groundY = this.lanes[1];
    this.player.y = this.player.groundY;
    
    this.reset();
  },
  
  /**
   * Reset game state
   */
  reset() {
    this.player.lane = 1;
    this.player.y = this.player.groundY;
    this.player.jumping = false;
    this.player.ducking = false;
    this.player.striking = false;
    this.player.jumpVelocity = 0;
    
    this.obstacles = [];
    this.speed = this.baseSpeed;
    this.score = 0;
    this.lives = 3;
    this.elapsedTime = 0;
    this.lastObstacleSpawn = 0;
    this.startTime = Date.now();
  },
  
  /**
   * Start the game
   */
  start() {
    this.reset();
    this.gameLoop();
  },
  
  /**
   * Main game loop
   */
  gameLoop() {
    if (this.callbacks.onEnd) {
      // Check if game should end
      const now = Date.now();
      this.elapsedTime = now - this.startTime;
      
      if (this.elapsedTime >= this.gameDuration) {
        // Won! Survived 60 seconds
        this.score += 1000; // Time bonus
        this.callbacks.onScore(this.score);
        this.callbacks.onEnd(true);
        return;
      }
    }
  },
  
  /**
   * Handle player action
   */
  handleAction(action) {
    if (this.actionCooldown > 0) return;
    this.actionCooldown = 200;
    
    const player = this.player;
    
    switch (action) {
      case 'jump':
        if (!player.jumping && player.lane === 1) {
          player.jumping = true;
          player.jumpVelocity = -18;
          player.y += player.jumpVelocity;
          if (this.callbacks.audio) this.callbacks.audio.playJump();
        }
        break;
        
      case 'kick':
        // Move up a lane
        if (player.lane < 2) {
          player.lane++;
          player.y = this.lanes[player.lane];
          if (this.callbacks.audio) this.callbacks.audio.playKick();
        }
        break;
        
      case 'punch':
        // Move down a lane
        if (player.lane > 0) {
          player.lane--;
          player.y = this.lanes[player.lane];
          if (this.callbacks.audio) this.callbacks.audio.playPunch();
        }
        break;
        
      case 'block':
        // Strike action
        player.striking = true;
        setTimeout(() => player.striking = false, 200);
        if (this.callbacks.audio) this.callbacks.audio.playPunch();
        break;
    }
    
    this.updateScore();
  },
  
  /**
   * Spawn obstacle
   */
  spawnObstacle() {
    const types = ['low', 'high', 'enemy'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let lane, height, y;
    
    switch (type) {
      case 'low':
        lane = 0; // Bottom lane
        y = this.lanes[0];
        height = 40;
        break;
      case 'high':
        lane = 2; // Top lane
        y = this.lanes[2];
        height = 40;
        break;
      case 'enemy':
        lane = 1; // Middle lane
        y = this.lanes[1];
        height = 50;
        break;
    }
    
    this.obstacles.push({
      x: window.innerWidth + 50,
      y: y,
      lane: lane,
      width: 40,
      height: height,
      type: type,
      hit: false
    });
  },
  
  /**
   * Update obstacles
   */
  updateObstacles(deltaTime) {
    const now = Date.now();
    
    // Spawn new obstacles
    if (now - this.lastObstacleSpawn > this.obstacleSpawnInterval) {
      this.spawnObstacle();
      this.lastObstacleSpawn = now;
      
      // Decrease spawn interval as game progresses
      const progress = this.elapsedTime / this.gameDuration;
      this.obstacleSpawnInterval = Math.max(800, 1500 - progress * 700);
      
      // Increase speed
      this.speed = this.baseSpeed + progress * 3;
    }
    
    // Update obstacle positions
    this.obstacles.forEach(obs => {
      obs.x -= this.speed;
    });
    
    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(obs => obs.x > -100);
    
    // Check collisions
    this.checkCollisions();
  },
  
  /**
   * Check collisions with obstacles
   */
  checkCollisions() {
    const player = this.player;
    
    this.obstacles.forEach(obs => {
      if (obs.hit) return;
      
      // Simple collision detection
      const playerBox = {
        x: player.x,
        y: player.y - player.height,
        width: player.width,
        height: player.height
      };
      
      const obsBox = {
        x: obs.x,
        y: obs.y - obs.height,
        width: obs.width,
        height: obs.height
      };
      
      if (this.boxCollision(playerBox, obsBox)) {
        obs.hit = true;
        
        // Check if player can avoid
        if (obs.type === 'low' && player.lane === 0 && player.jumping) {
          // Jumped over low obstacle
          this.score += 50;
          return;
        }
        if (obs.type === 'high' && player.lane === 2 && player.ducking) {
          // Ducked under high obstacle - not implemented in simple version
        }
        if (obs.type === 'enemy' && player.striking) {
          // Struck the enemy
          this.score += 100;
          if (this.callbacks.particles) {
            this.callbacks.particles.starBurst(obs.x, obs.y);
          }
          return;
        }
        
        // Hit!
        this.lives--;
        if (this.callbacks.audio) this.callbacks.audio.playPlayerHit();
        if (this.callbacks.onShake) this.callbacks.onShake();
        
        if (this.lives <= 0) {
          if (this.callbacks.onEnd) {
            this.callbacks.onEnd(false);
          }
        }
      }
    });
    
    this.updateScore();
  },
  
  /**
   * Box collision helper
   */
  boxCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  },
  
  /**
   * Update player physics
   */
  updatePlayer(deltaTime) {
    const player = this.player;
    
    // Jump physics
    if (player.jumping) {
      player.jumpVelocity += 0.8; // Gravity
      player.y += player.jumpVelocity;
      
      // Land
      if (player.y >= player.groundY) {
        player.y = player.groundY;
        player.jumping = false;
        player.jumpVelocity = 0;
      }
    }
    
    // Action cooldown
    if (this.actionCooldown > 0) {
      this.actionCooldown -= deltaTime;
    }
  },
  
  /**
   * Update score display
   */
  updateScore() {
    if (this.callbacks.onScore) {
      this.callbacks.onScore(Math.floor(this.score));
    }
  },
  
  /**
   * Update game state
   */
  update(deltaTime) {
    // Update elapsed time
    const now = Date.now();
    this.elapsedTime = now - this.startTime;
    
    // Check win condition
    if (this.elapsedTime >= this.gameDuration) {
      if (this.callbacks.onEnd) {
        this.callbacks.onScore(this.score + 1000);
        this.callbacks.onEnd(true);
      }
      return;
    }
    
    // Update player
    this.updatePlayer(deltaTime);
    
    // Update obstacles
    this.updateObstacles(deltaTime);
    
    // Score based on time survived
    this.score += deltaTime * 0.01;
    
    // Ground scroll
    this.groundOffset += this.speed;
    if (this.groundOffset > 80) this.groundOffset = 0;
    
    this.updateScore();
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
    
    // Draw lanes
    this.drawLanes(ctx, w, h);
    
    // Draw ground
    this.drawGround(ctx, w, h);
    
    // Draw obstacles
    this.obstacles.forEach(obs => this.drawObstacle(ctx, obs));
    
    // Draw player
    this.drawPlayer(ctx);
    
    // Draw HUD
    this.drawHUD(ctx, w, h);
  },
  
  /**
   * Draw background
   */
  drawBackground(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#B0E0E6');
    gradient.addColorStop(1, '#98D8C8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 5; i++) {
      const x = ((i * 200 - this.groundOffset * 0.5) % (w + 200)) - 100;
      const y = 50 + (i % 3) * 40;
      this.drawCloud(ctx, x, y);
    }
  },
  
  /**
   * Draw cloud
   */
  drawCloud(ctx, x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 10, 30, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 25, y + 5, 20, 0, Math.PI * 2);
    ctx.fill();
  },
  
  /**
   * Draw lanes
   */
  drawLanes(ctx, w, h) {
    // Lane dividers
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    
    this.lanes.forEach((laneY, i) => {
      if (i < this.lanes.length - 1) {
        ctx.beginPath();
        ctx.moveTo(0, laneY);
        ctx.lineTo(w, laneY);
        ctx.stroke();
      }
    });
    
    ctx.setLineDash([]);
  },
  
  /**
   * Draw ground
   */
  drawGround(ctx, w, h) {
    const groundY = h * 0.85;
    
    // Grass
    const gradient = ctx.createLinearGradient(0, groundY, 0, h);
    gradient.addColorStop(0, '#90EE90');
    gradient.addColorStop(1, '#228B22');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, groundY, w, h - groundY);
    
    // Tatami pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    const tatamiW = 80;
    const offset = this.groundOffset;
    for (let x = -tatamiW + offset; x < w + tatamiW; x += tatamiW) {
      ctx.strokeRect(x, groundY, tatamiW, 40);
    }
  },
  
  /**
   * Draw obstacle
   */
  drawObstacle(ctx, obs) {
    ctx.save();
    
    const icons = {
      low: '🪨',
      high: '🦅',
      enemy: '👊'
    };
    
    ctx.font = `${obs.height}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[obs.type], obs.x + obs.width / 2, obs.y - obs.height / 2);
    
    ctx.restore();
  },
  
  /**
   * Draw player
   */
  drawPlayer(ctx) {
    const player = this.player;
    
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y);
    
    // Bounce animation
    const bounce = Math.sin(Date.now() * 0.01) * 3;
    ctx.translate(0, bounce);
    
    // Draw karate kid
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (player.striking) {
      ctx.fillText('💥', 0, -player.height / 2);
    } else if (player.jumping) {
      ctx.fillText('🥷', 0, -player.height / 2);
    } else {
      ctx.fillText('🥋', 0, -player.height / 2);
    }
    
    ctx.restore();
  },
  
  /**
   * Draw HUD
   */
  drawHUD(ctx, w, h) {
    // Timer
    const remaining = Math.max(0, this.gameDuration - this.elapsedTime);
    const seconds = Math.floor(remaining / 1000);
    const progress = remaining / this.gameDuration;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(w / 2 - 100, 10, 200, 30);
    
    ctx.fillStyle = progress > 0.3 ? '#06D6A0' : '#E63946';
    ctx.fillRect(w / 2 - 98, 12, 196 * progress, 26);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${seconds}s`, w / 2, 30);
    
    // Lives
    for (let i = 0; i < 3; i++) {
      ctx.font = '24px Arial';
      ctx.fillStyle = i < this.lives ? '#E63946' : 'rgba(230, 57, 70, 0.3)';
      ctx.fillText('❤️', 30 + i * 35, 30);
    }
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
  module.exports = BeltRunner;
}
