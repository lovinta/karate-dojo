/**
 * Harimau Kecil - Kata Combo Game
 * Rhythm + sequencing memory game
 */

const KataCombo = {
  // Game state
  canvas: null,
  ctx: null,
  callbacks: {},
  
  // Game settings
  moves: ['punch', 'kick', 'jump', 'block'],
  comboLengths: [3, 4, 5, 6], // Progressive combo lengths
  combosToWin: 3,
  
  // Game state
  currentCombo: [],
  playerInput: [],
  comboNumber: 0,
  comboLength: 3,
  score: 0,
  isShowingCombo: false,
  isPlayerTurn: false,
  inputIndex: 0,
  gameOver: false,
  
  // Timing
  showMoveDuration: 800,
  pauseBetweenMoves: 400,
  inputTimeout: 3000,
  lastInputTime: 0,
  
  // Animation
  lastTime: 0,
  currentMoveIndex: 0,
  currentMove: null,
  feedbackText: '',
  feedbackColor: '#06D6A0',
  feedbackTimer: 0,
  
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
    this.currentCombo = [];
    this.playerInput = [];
    this.comboNumber = 0;
    this.comboLength = this.comboLengths[0];
    this.score = 0;
    this.isShowingCombo = false;
    this.isPlayerTurn = false;
    this.inputIndex = 0;
    this.gameOver = false;
    this.feedbackText = '';
    this.feedbackTimer = 0;
  },
  
  /**
   * Start the game
   */
  start() {
    this.reset();
    this.nextCombo();
  },
  
  /**
   * Generate next combo
   */
  nextCombo() {
    this.comboNumber++;
    this.playerInput = [];
    this.inputIndex = 0;
    this.isPlayerTurn = false;
    
    // Generate random combo
    this.currentCombo = [];
    for (let i = 0; i < this.comboLength; i++) {
      this.currentCombo.push(this.moves[Math.floor(Math.random() * this.moves.length)]);
    }
    
    // Update combo length for next round
    if (this.comboNumber > this.combosToWin) {
      // Won!
      this.gameOver = true;
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(true);
      }
      return;
    }
    
    if (this.comboNumber > 1) {
      // Increase difficulty
      const lengthIndex = Math.min(this.comboNumber - 1, this.comboLengths.length - 1);
      this.comboLength = this.comboLengths[lengthIndex];
    }
    
    // Show combo after delay
    setTimeout(() => this.showCombo(), 1000);
    
    this.updateScore();
  },
  
  /**
   * Show the combo sequence
   */
  showCombo() {
    this.isShowingCombo = true;
    this.isPlayerTurn = false;
    this.currentMoveIndex = 0;
    
    // Announce combo
    if (this.callbacks.audio) {
      this.callbacks.audio.speak(`Kombo ${this.comboNumber}!`);
    }
    
    setTimeout(() => this.showNextMove(), 500);
  },
  
  /**
   * Show next move in sequence
   */
  showNextMove() {
    if (this.currentMoveIndex >= this.currentCombo.length) {
      // Done showing
      this.isShowingCombo = false;
      this.isPlayerTurn = true;
      this.currentMove = null;
      this.lastInputTime = Date.now();
      
      if (this.callbacks.audio) {
        this.callbacks.audio.speak('Giliranmu!');
      }
      return;
    }
    
    this.currentMove = this.currentCombo[this.currentMoveIndex];
    
    // Play sound
    if (this.callbacks.audio) {
      switch (this.currentMove) {
        case 'punch': this.callbacks.audio.playPunch(); break;
        case 'kick': this.callbacks.audio.playKick(); break;
        case 'jump': this.callbacks.audio.playJump(); break;
        case 'block': this.callbacks.audio.playBlock(); break;
      }
    }
    
    // Screen shake on impact
    if (this.callbacks.onShake) {
      this.callbacks.onShake();
    }
    
    setTimeout(() => {
      this.currentMoveIndex++;
      setTimeout(() => this.showNextMove(), this.pauseBetweenMoves);
    }, this.showMoveDuration);
  },
  
  /**
   * Handle player action
   */
  handleAction(action) {
    if (!this.isPlayerTurn || this.isShowingCombo) return;
    
    this.lastInputTime = Date.now();
    
    // Play sound
    if (this.callbacks.audio) {
      switch (action) {
        case 'punch': this.callbacks.audio.playPunch(); break;
        case 'kick': this.callbacks.audio.playKick(); break;
        case 'jump': this.callbacks.audio.playJump(); break;
        case 'block': this.callbacks.audio.playBlock(); break;
      }
    }
    
    this.playerInput.push(action);
    
    const currentIndex = this.playerInput.length - 1;
    
    // Check if correct
    if (action !== this.currentCombo[currentIndex]) {
      // Wrong!
      this.handleWrongInput();
      return;
    }
    
    // Correct input - show feedback
    this.showFeedback('✓', '#06D6A0');
    
    // Check if combo complete
    if (this.playerInput.length === this.currentCombo.length) {
      this.isPlayerTurn = false;
      this.score += 100 * this.comboLength;
      this.showFeedback('Sempurna!', '#FFB703');
      
      // Particles
      if (this.callbacks.particles) {
        this.callbacks.particles.starBurst(window.innerWidth / 2, window.innerHeight / 2);
      }
      
      // Next combo after delay
      setTimeout(() => this.nextCombo(), 2000);
    }
    
    this.updateScore();
  },
  
  /**
   * Handle wrong input
   */
  handleWrongInput() {
    this.showFeedback('✗', '#E63946');
    
    if (this.callbacks.audio) {
      this.callbacks.audio.playWrong();
    }
    if (this.callbacks.onShake) {
      this.callbacks.onShake();
    }
    
    // Retry same combo
    this.playerInput = [];
    this.inputIndex = 0;
    
    setTimeout(() => {
      if (this.callbacks.audio) {
        this.callbacks.audio.speak('Coba lagi!');
      }
      this.showCombo();
    }, 1500);
  },
  
  /**
   * Show feedback text
   */
  showFeedback(text, color) {
    this.feedbackText = text;
    this.feedbackColor = color;
    this.feedbackTimer = 500;
  },
  
  /**
   * Check for input timeout
   */
  checkTimeout() {
    if (!this.isPlayerTurn || this.isShowingCombo) return;
    
    const elapsed = Date.now() - this.lastInputTime;
    if (elapsed > this.inputTimeout && this.playerInput.length > 0) {
      // Timed out - restart current combo
      this.playerInput = [];
      this.inputIndex = 0;
      this.showFeedback('Terlalu lambat!', '#E63946');
      
      if (this.callbacks.audio) {
        this.callbacks.audio.speak('Terlalu lambat! Coba lagi.');
      }
      
      setTimeout(() => this.showCombo(), 1500);
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
    
    // Update feedback timer
    if (this.feedbackTimer > 0) {
      this.feedbackTimer -= deltaTime;
    }
    
    // Check timeout
    this.checkTimeout();
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
    
    // Draw background
    this.drawBackground(ctx, w, h);
    
    // Draw combo progress
    this.drawComboProgress(ctx, cx, 80);
    
    // Draw current combo display
    this.drawComboDisplay(ctx, cx, cy);
    
    // Draw feedback
    if (this.feedbackTimer > 0) {
      this.drawFeedback(ctx, cx, cy + 100);
    }
    
    // Draw player input progress
    if (this.isPlayerTurn) {
      this.drawInputProgress(ctx, cx, cy + 150);
    }
    
    // Draw instructions
    this.drawInstructions(ctx, cx, h - 40);
  },
  
  /**
   * Draw background
   */
  drawBackground(ctx, w, h) {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#1D3557');
    gradient.addColorStop(1, '#152a4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    // Tatami pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    
    const tatamiW = 80;
    const tatamiH = 40;
    
    for (let y = h * 0.5; y < h; y += tatamiH) {
      const offset = (Math.floor((y - h * 0.5) / tatamiH) % 2) * (tatamiW / 2);
      for (let x = -tatamiW + offset; x < w + tatamiW; x += tatamiW) {
        ctx.strokeRect(x, y, tatamiW, tatamiH);
      }
    }
  },
  
  /**
   * Draw combo progress
   */
  drawComboProgress(ctx, cx, y) {
    ctx.fillStyle = '#FFB703';
    ctx.font = 'bold 24px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Kombo ${this.comboNumber}/${this.combosToWin}`, cx, y);
  },
  
  /**
   * Draw combo display
   */
  drawComboDisplay(ctx, cx, cy) {
    const spacing = 70;
    const startX = cx - (this.currentCombo.length - 1) * spacing / 2;
    
    this.currentCombo.forEach((move, i) => {
      const x = startX + i * spacing;
      const isActive = this.isShowingCombo && this.currentMoveIndex === i;
      const isCompleted = i < this.playerInput.length;
      
      this.drawMoveButton(ctx, move, x, cy, isActive, isCompleted);
    });
    
    // Show/hide indicator
    if (this.isShowingCombo) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '20px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Perhatikan baik-baik...', cx, cy - 80);
    } else if (this.isPlayerTurn) {
      ctx.fillStyle = '#06D6A0';
      ctx.font = '20px "Nunito", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Giliranmu! Ulangi kombo', cx, cy - 80);
    }
  },
  
  /**
   * Draw move button
   */
  drawMoveButton(ctx, move, x, y, isActive, isCompleted) {
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
    
    const radius = 35;
    
    ctx.save();
    
    // Scale for active animation
    if (isActive) {
      const scale = 1 + Math.sin(Date.now() * 0.02) * 0.1;
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      ctx.translate(-x, -y);
    }
    
    // Circle background
    ctx.fillStyle = isCompleted ? colors[move] : 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = isCompleted ? '#FFFFFF' : colors[move];
    ctx.lineWidth = isActive ? 5 : 3;
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Icon
    ctx.font = `${radius}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icons[move], x, y);
    
    // Checkmark for completed
    if (isCompleted) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px Arial';
      ctx.fillText('✓', x + radius - 5, y - radius + 5);
    }
    
    ctx.restore();
  },
  
  /**
   * Draw feedback text
   */
  drawFeedback(ctx, cx, cy) {
    ctx.save();
    
    ctx.fillStyle = this.feedbackColor;
    ctx.font = 'bold 48px "Fredoka One", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Pop animation
    const scale = 1 + (this.feedbackTimer / 500) * 0.3;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    
    ctx.fillText(this.feedbackText, cx, cy);
    
    ctx.restore();
  },
  
  /**
   * Draw input progress
   */
  drawInputProgress(ctx, cx, cy) {
    const totalWidth = 250;
    const barHeight = 15;
    const x = cx - totalWidth / 2;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, cy, totalWidth, barHeight);
    
    // Progress
    const progress = this.playerInput.length / this.currentCombo.length;
    ctx.fillStyle = '#06D6A0';
    ctx.fillRect(x, cy, totalWidth * progress, barHeight);
    
    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, cy, totalWidth, barHeight);
    
    // Timeout indicator
    if (this.playerInput.length < this.currentCombo.length) {
      const elapsed = Date.now() - this.lastInputTime;
      const remaining = 1 - elapsed / this.inputTimeout;
      
      if (remaining < 0.3) {
        ctx.fillStyle = `rgba(230, 57, 70, ${0.5 + Math.sin(Date.now() * 0.02) * 0.3})`;
        ctx.fillRect(x, cy, totalWidth * remaining, barHeight);
      }
    }
  },
  
  /**
   * Draw instructions
   */
  drawInstructions(ctx, cx, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tekan tombol atau Arrow Keys: ← Tinju, → Tendang, ↑ Lompat, ↓ Block', cx, y);
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
  module.exports = KataCombo;
}
