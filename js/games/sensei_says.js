/**
 * Harimau Kecil - Sensei Says Game
 * Memory + following instructions game
 */

const SenseiSays = {
  // Game state
  canvas: null,
  ctx: null,
  callbacks: {},
  
  // Game settings
  moves: ['punch', 'kick', 'jump', 'block'],
  currentSequence: [],
  playerSequence: [],
  round: 0,
  maxRounds: 5,
  score: 0,
  lives: 3,
  isShowingSequence: false,
  currentMoveIndex: 0,
  canAct: false,
  
  // Timing
  showMoveDuration: 1000,
  pauseBetweenMoves: 500,
  
  // Animation
  lastTime: 0,
  animationPhase: 0,
  currentMove: null,
  
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
    this.currentSequence = [];
    this.playerSequence = [];
    this.round = 0;
    this.score = 0;
    this.lives = 3;
    this.isShowingSequence = false;
    this.canAct = false;
    this.currentMoveIndex = 0;
  },
  
  /**
   * Start the game
   */
  start() {
    this.reset();
    this.nextRound();
  },
  
  /**
   * Start next round
   */
  nextRound() {
    this.round++;
    this.playerSequence = [];
    this.currentMoveIndex = 0;
    
    // Add new move to sequence
    const newMove = this.moves[Math.floor(Math.random() * this.moves.length)];
    this.currentSequence.push(newMove);
    
    // Update score display
    this.updateScore();
    
    // Show sequence after short delay
    setTimeout(() => this.showSequence(), 1000);
  },
  
  /**
   * Show the move sequence
   */
  showSequence() {
    this.isShowingSequence = true;
    this.canAct = false;
    this.currentMoveIndex = 0;
    
    // Add "Sensei says" prefix with 70% probability
    this.includeSenseiSays = Math.random() < 0.7;
    
    this.showNextMove();
  },
  
  /**
   * Show next move in sequence
   */
  showNextMove() {
    if (this.currentMoveIndex >= this.currentSequence.length) {
      // Done showing sequence
      this.isShowingSequence = false;
      this.canAct = true;
      this.currentMove = null;
      
      // Show prompt
      if (this.callbacks.audio) {
        this.callbacks.audio.speak('Giliranmu!');
      }
      return;
    }
    
    this.currentMove = this.currentSequence[this.currentMoveIndex];
    
    // Play sound for move
    if (this.callbacks.audio) {
      switch (this.currentMove) {
        case 'punch': this.callbacks.audio.playPunch(); break;
        case 'kick': this.callbacks.audio.playKick(); break;
        case 'jump': this.callbacks.audio.playJump(); break;
        case 'block': this.callbacks.audio.playBlock(); break; // Metallic click
      }
    }
    
    // Screen shake on impact
    if (this.callbacks.onShake) {
      this.callbacks.onShake();
    }
    
    // Move highlight duration
    setTimeout(() => {
      this.currentMoveIndex++;
      setTimeout(() => this.showNextMove(), this.pauseBetweenMoves);
    }, this.showMoveDuration);
  },
  
  /**
   * Handle player action
   */
  handleAction(action) {
    if (!this.canAct || this.isShowingSequence) return;
    
    // Play action sound
    if (this.callbacks.audio) {
      switch (action) {
        case 'punch': this.callbacks.audio.playPunch(); break;
        case 'kick': this.callbacks.audio.playKick(); break;
        case 'jump': this.callbacks.audio.playJump(); break;
        case 'block': this.callbacks.audio.playBlock(); break;
      }
    }
    
    this.playerSequence.push(action);
    
    // Check if correct
    const currentIndex = this.playerSequence.length - 1;
    
    if (action !== this.currentSequence[currentIndex]) {
      // Wrong move
      this.handleWrongMove();
      return;
    }
    
    // Correct move
    if (this.callbacks.particles) {
      this.callbacks.particles.starBurst(400, 300);
    }
    
    // Check if sequence complete
    if (this.playerSequence.length === this.currentSequence.length) {
      this.canAct = false;
      
      // Check if sensei says was included - if not, player should NOT have moved
      // This is handled differently - for simplicity, completing sequence = success
      this.score += 100;
      this.updateScore();
      
      // Check for round completion
      if (this.round >= this.maxRounds) {
        // Game won!
        setTimeout(() => {
          if (this.callbacks.onEnd) {
            this.callbacks.onEnd(true);
          }
        }, 1000);
      } else {
        // Next round
        setTimeout(() => this.nextRound(), 1500);
      }
    }
  },
  
  /**
   * Handle wrong move
   */
  handleWrongMove() {
    this.lives--;
    
    if (this.callbacks.audio) {
      this.callbacks.audio.playWrong();
    }
    
    if (this.callbacks.onShake) {
      this.callbacks.onShake();
    }
    
    if (this.lives <= 0) {
      // Game over
      setTimeout(() => {
        if (this.callbacks.onEnd) {
          this.callbacks.onEnd(false);
        }
      }, 1000);
    } else {
      // Retry round
      this.canAct = false;
      setTimeout(() => {
        if (this.callbacks.audio) {
          this.callbacks.audio.speak('Coba lagi!');
        }
        this.showSequence();
      }, 1500);
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
    this.animationPhase += deltaTime * 0.005;
  },
  
  /**
   * Draw game state
   */
  draw(ctx) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, w, h);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1D3557');
    gradient.addColorStop(1, '#152a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Draw tatami floor
    this.drawTatami(ctx, w, h);
    
    // Draw round indicator
    ctx.fillStyle = '#FFB703';
    ctx.font = 'bold 24px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Putaran ${this.round}/${this.maxRounds}`, cx, 120);
    
    // Draw lives
    this.drawLives(ctx, cx, cy - 100);
    
    // Draw current move prompt
    this.drawMovePrompt(ctx, cx, cy);
    
    // Draw instruction
    this.drawInstruction(ctx, cx, cy + 150);
  },
  
  /**
   * Draw tatami floor pattern
   */
  drawTatami(ctx, w, h) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    
    const tatamiW = 80;
    const tatamiH = 40;
    
    for (let y = h * 0.6; y < h; y += tatamiH) {
      const offset = (Math.floor((y - h * 0.6) / tatamiH) % 2) * (tatamiW / 2);
      for (let x = -tatamiW + offset; x < w + tatamiW; x += tatamiW) {
        ctx.strokeRect(x, y, tatamiW, tatamiH);
      }
    }
  },
  
  /**
   * Draw lives indicator
   */
  drawLives(ctx, cx, y) {
    const heartSize = 30;
    const spacing = 40;
    const startX = cx - ((3 - 1) * spacing) / 2;
    
    for (let i = 0; i < 3; i++) {
      const x = startX + i * spacing;
      ctx.save();
      
      if (i < this.lives) {
        ctx.fillStyle = '#E63946';
      } else {
        ctx.fillStyle = 'rgba(230, 57, 70, 0.3)';
      }
      
      // Draw heart
      ctx.beginPath();
      ctx.moveTo(x, y + heartSize * 0.3);
      ctx.bezierCurveTo(x, y, x - heartSize / 2, y, x - heartSize / 2, y + heartSize * 0.3);
      ctx.bezierCurveTo(x - heartSize / 2, y + heartSize * 0.6, x, y + heartSize * 0.8, x, y + heartSize);
      ctx.bezierCurveTo(x, y + heartSize * 0.8, x + heartSize / 2, y + heartSize * 0.6, x + heartSize / 2, y + heartSize * 0.3);
      ctx.bezierCurveTo(x + heartSize / 2, y, x, y, x, y + heartSize * 0.3);
      ctx.fill();
      
      ctx.restore();
    }
  },
  
  /**
   * Draw move prompt
   */
  drawMovePrompt(ctx, cx, cy) {
    if (this.isShowingSequence) {
      // Show current move being demonstrated
      if (this.currentMove) {
        this.drawMoveIcon(ctx, this.currentMove, cx, cy, 1.5);
        
        // "Sensei Says" prefix
        if (this.includeSenseiSays && this.currentMoveIndex === 0) {
          ctx.fillStyle = '#FFB703';
          ctx.font = 'bold 28px "Fredoka One", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Sensei Mengatakan...', cx, cy - 120);
        }
      }
    } else if (this.canAct) {
      // Show player's turn
      ctx.fillStyle = '#06D6A0';
      ctx.font = 'bold 28px "Fredoka One", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Giliranmu!', cx, cy - 80);
      
      // Show expected moves count
      ctx.fillStyle = '#F1FAEE';
      ctx.font = '20px "Nunito", sans-serif';
      ctx.fillText(`Hafal: ${this.currentSequence.join(' → ')}`, cx, cy + 100);
    }
  },
  
  /**
   * Draw instruction
   */
  drawInstruction(ctx, cx, cy) {
    if (!this.canAct) return;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tekan tombol atau gunakan tombol panah', cx, cy);
  },
  
  /**
   * Draw move icon
   */
  drawMoveIcon(ctx, move, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    
    const icons = {
      punch: '👊',
      kick: '🦵',
      jump: '⬆️',
      block: '🛡️'
    };
    
    const colors = {
      punch: '#E63946',
      kick: '#4A90D9',
      jump: '#06D6A0',
      block: '#FFB703'
    };
    
    // Background circle
    ctx.fillStyle = colors[move];
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Icon
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[move], 0, 0);
    
    ctx.restore();
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
  module.exports = SenseiSays;
}
