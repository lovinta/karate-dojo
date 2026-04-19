/**
 * Harimau Kecil - Main Application
 * Entry point, state management, and game router
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const AppState = {
  currentGame: null,      // Currently active game module
  stars: 0,               // Total stars earned
  beltLevel: 0,           // 0=White, 1=Yellow, 2=Orange, 3=Green, 4=Blue, 5=Brown, 6=Black
  gameState: 'menu',      // 'menu' | 'playing' | 'paused' | 'gameover' | 'levelComplete'
  
  // Belt names
  beltNames: ['Putih', 'Kuning', 'Orange', 'Hijau', 'Biru', 'Coklat', 'Hitam'],
  
  // Stars required per belt level
  starsPerBelt: 10,
  
  // Load state from localStorage
  load() {
    try {
      const saved = localStorage.getItem('karateDojoState');
      if (saved) {
        const data = JSON.parse(saved);
        this.stars = data.stars || 0;
        this.beltLevel = Math.floor(this.stars / this.starsPerBelt);
        this.beltLevel = Math.min(this.beltLevel, 6); // Cap at black belt
      }
    } catch (e) {
      console.warn('Failed to load state:', e);
    }
  },
  
  // Save state to localStorage
  save() {
    try {
      localStorage.setItem('karateDojoState', JSON.stringify({
        stars: this.stars
      }));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  },
  
  // Add a star and check for belt promotion
  addStar() {
    this.stars++;
    this.save();
    
    // Check for belt promotion
    const newBeltLevel = Math.floor(this.stars / this.starsPerBelt);
    const promoted = newBeltLevel > this.beltLevel && newBeltLevel <= 6;
    
    if (promoted) {
      this.beltLevel = Math.min(newBeltLevel, 6);
      return { promoted: true, newBelt: this.beltLevel, beltName: this.beltNames[this.beltLevel] };
    }
    
    return { promoted: false };
  },
  
  // Reset game state
  reset() {
    this.currentGame = null;
    this.gameState = 'menu';
  }
};

// ============================================
// GAME ROUTER
// ============================================

const GameRouter = {
  games: {
    'sensei-says': null,
    'belt-runner': null,
    'target-strike': null,
    'kata-combo': null
  },
  
  // Initialize all game modules
  init() {
    // Lazy load games
    if (typeof SenseiSays !== 'undefined') {
      this.games['sensei-says'] = SenseiSays;
    }
    if (typeof BeltRunner !== 'undefined') {
      this.games['belt-runner'] = BeltRunner;
    }
    if (typeof TargetStrike !== 'undefined') {
      this.games['target-strike'] = TargetStrike;
    }
    if (typeof KataCombo !== 'undefined') {
      this.games['kata-combo'] = KataCombo;
    }
  },
  
  // Get game by ID
  getGame(gameId) {
    return this.games[gameId] || null;
  },
  
  // Get all available games
  getAllGames() {
    return Object.keys(this.games).filter(id => this.games[id] !== null);
  }
};

// ============================================
// SENSEI MASCOT
// ============================================

let sensei = null;

// ============================================
// AUDIO ENGINE
// ============================================

let audio = null;

// ============================================
// PARTICLE SYSTEM
// ============================================

let particleSystem = null;

// ============================================
// DOM REFERENCES
// ============================================

const DOM = {
  // Canvas
  gameCanvas: null,
  ctx: null,
  
  // Screens
  gameSelectionScreen: null,
  gameArena: null,
  
  // Top bar
  beltStripe: null,
  beltLabel: null,
  starsContainer: null,
  starCount: null,
  
  // Game arena
  gameHeader: null,
  gameTitle: null,
  gameScore: null,
  backButton: null,
  gameControls: null,
  
  // Control buttons
  btnPunch: null,
  btnKick: null,
  btnJump: null,
  btnBlock: null,
  
  // Sensei
  senseiContainer: null,
  senseiCanvas: null,
  senseiSpeech: null,
  senseiText: null,
  
  // Overlays
  beltPromotionOverlay: null,
  levelCompleteOverlay: null,
  gameOverOverlay: null,
  
  // Initialize all DOM references
  init() {
    this.gameCanvas = document.getElementById('gameCanvas');
    this.ctx = this.gameCanvas.getContext('2d');
    
    this.gameSelectionScreen = document.getElementById('gameSelectionScreen');
    this.gameArena = document.getElementById('gameArena');
    
    this.beltStripe = document.getElementById('beltStripe');
    this.beltLabel = document.getElementById('beltLabel');
    this.starsContainer = document.getElementById('starsContainer');
    this.starCount = document.getElementById('starCount');
    
    this.gameHeader = document.getElementById('gameHeader');
    this.gameTitle = document.getElementById('gameTitle');
    this.gameScore = document.getElementById('gameScore');
    this.backButton = document.getElementById('backButton');
    this.gameControls = document.getElementById('gameControls');
    
    this.btnPunch = document.getElementById('btnPunch');
    this.btnKick = document.getElementById('btnKick');
    this.btnJump = document.getElementById('btnJump');
    this.btnBlock = document.getElementById('btnBlock');
    
    this.senseiContainer = document.getElementById('senseiContainer');
    this.senseiCanvas = document.getElementById('senseiCanvas');
    this.senseiSpeech = document.getElementById('senseiSpeech');
    this.senseiText = document.getElementById('senseiText');
    
    this.beltPromotionOverlay = document.getElementById('beltPromotionOverlay');
    this.levelCompleteOverlay = document.getElementById('levelCompleteOverlay');
    this.gameOverOverlay = document.getElementById('gameOverOverlay');
  }
};

// ============================================
// UI FUNCTIONS
// ============================================

const UI = {
  // Update belt display
  updateBelt(level, name) {
    const beltClasses = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'];
    DOM.beltStripe.className = beltClasses[level] || 'white';
    DOM.beltLabel.textContent = 'Ikat Pinggang ' + name;
  },
  
  // Update star counter
  updateStars(count) {
    DOM.starCount.textContent = count;
    
    // Render stars (up to 10 visible)
    const maxStars = 10;
    let html = '';
    for (let i = 0; i < maxStars; i++) {
      const earned = i < count % maxStars || (count >= maxStars && i < (count % maxStars || maxStars));
      html += `<span class="star ${earned ? 'earned' : ''}">⭐</span>`;
    }
    DOM.starsContainer.innerHTML = html;
    
    // Also update count display
    DOM.starCount.textContent = count;
  },
  
  // Show game selection screen
  showGameSelection() {
    AppState.reset();
    
    DOM.gameSelectionScreen.classList.remove('hidden');
    DOM.gameArena.classList.add('hidden');
    DOM.senseiContainer.classList.remove('hidden');
    
    hideAllOverlays();
  },
  
  // Show game arena
  showGameArena(gameName) {
    DOM.gameSelectionScreen.classList.add('hidden');
    DOM.gameArena.classList.remove('hidden');
    DOM.senseiContainer.classList.add('hidden');
    
    DOM.gameTitle.textContent = gameName;
    DOM.gameScore.textContent = 'Skor: 0';
    
    hideAllOverlays();
  },
  
  // Show belt promotion overlay
  showBeltPromotion(oldBelt, newBelt, beltName) {
    const oldBeltNames = AppState.beltNames;
    const beltClasses = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'];
    
    document.getElementById('oldBelt').querySelector('.belt-visual').className = 'belt-visual ' + beltClasses[oldBelt];
    document.getElementById('oldBelt').querySelector('span').textContent = oldBeltNames[oldBelt];
    
    document.getElementById('newBelt').querySelector('.belt-visual').className = 'belt-visual ' + beltClasses[newBelt];
    document.getElementById('newBelt').querySelector('span').textContent = beltName;
    
    document.getElementById('promotionText').textContent = `Kamu mendapat Ikat Pinggang ${beltName}!`;
    
    DOM.beltPromotionOverlay.classList.remove('hidden');
    
    // Play celebration sounds
    if (audio) {
      audio.playLevelComplete();
    }
    
    // Show fireworks
    if (particleSystem) {
      particleSystem.fireworks(400, 300);
    }
  },
  
  // Show level complete overlay
  showLevelComplete(starsEarned = 1) {
    const starsEl = document.getElementById('starsEarned');
    let html = '';
    for (let i = 0; i < starsEarned; i++) {
      html += '<span class="earned-star">⭐</span>';
    }
    starsEl.innerHTML = html;
    
    DOM.levelCompleteOverlay.classList.remove('hidden');
    
    if (audio) {
      audio.playLevelComplete();
    }
  },
  
  // Show game over overlay
  showGameOver() {
    DOM.gameOverOverlay.classList.remove('hidden');
  },
  
  // Update game score display
  updateScore(score) {
    DOM.gameScore.textContent = `Skor: ${score}`;
  },
  
  // Screen shake effect
  screenShake() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 400);
  },
  
  // Show sensei speech
  showSenseiSpeech(text, duration = 2000) {
    DOM.senseiText.textContent = text;
    DOM.senseiSpeech.classList.remove('hidden');
    
    setTimeout(() => {
      DOM.senseiSpeech.classList.add('hidden');
    }, duration);
  }
};

// ============================================
// GAME FUNCTIONS
// ============================================

function showGameSelection() {
  UI.showGameSelection();
}

function startGame(gameId) {
  const gameModule = GameRouter.getGame(gameId);
  
  if (!gameModule) {
    console.error('Game not found:', gameId);
    return;
  }
  
  // Map game ID to display name
  const gameNames = {
    'sensei-says': 'Sensei Mengatakan',
    'belt-runner': 'Pelari Ikat Pinggang',
    'target-strike': 'Pukul Target',
    'kata-combo': 'Kata Kombo'
  };
  
  UI.showGameArena(gameNames[gameId] || 'Game');
  
  AppState.currentGame = gameModule;
  AppState.gameState = 'playing';
  
  // Initialize game
  if (gameModule.init) {
    gameModule.init(DOM.gameCanvas, DOM.ctx, {
      onScore: (score) => UI.updateScore(score),
      onEnd: (won) => endGame(won),
      onShake: () => UI.screenShake(),
      audio: audio,
      particles: particleSystem
    });
  }
  
  // Start game loop
  if (gameModule.start) {
    gameModule.start();
  }
}

function endGame(won) {
  AppState.gameState = 'gameover';
  
  if (AppState.currentGame && AppState.currentGame.cleanup) {
    AppState.currentGame.cleanup();
  }
  
  if (won) {
    const result = AppState.addStar();
    UI.updateStars(AppState.stars);
    UI.updateBelt(AppState.beltLevel, AppState.beltNames[AppState.beltLevel]);
    
    if (result.promoted) {
      // Belt promotion
      setTimeout(() => {
        const oldBelt = result.newBelt - 1;
        UI.showBeltPromotion(oldBelt, result.newBelt, result.beltName);
      }, 500);
    } else {
      // Just star earned
      setTimeout(() => {
        UI.showLevelComplete(1);
      }, 500);
    }
    
    // Play sensei congratulations
    if (sensei) {
      const messages = ['Kerja bagus!', 'Hebat!', 'Kamu berhasil!', 'Kuat sekali!'];
      sensei.setExpression('happy');
      sensei.speak(messages[Math.floor(Math.random() * messages.length)]);
    }
  } else {
    // Game over
    setTimeout(() => {
      UI.showGameOver();
    }, 500);
    
    if (sensei) {
      sensei.setExpression('sad');
      sensei.speak('Coba lagi - kamu pasti bisa!');
    }
  }
  
  // Show sensei after returning to menu
  setTimeout(() => {
    DOM.senseiContainer.classList.remove('hidden');
  }, 1000);
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
  // Game card clicks
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      const gameId = card.dataset.game;
      if (gameId) {
        // Initialize audio on first interaction
        if (audio && !audio.initialized) {
          audio.init();
        }
        
        startGame(gameId);
      }
    });
  });
  
  // Back button
  DOM.backButton.addEventListener('click', () => {
    if (AppState.currentGame && AppState.currentGame.cleanup) {
      AppState.currentGame.cleanup();
    }
    AppState.reset();
    showGameSelection();
  });
  
  // Control buttons (keyboard + touch)
  const controlActions = {
    punch: 'punch',
    kick: 'kick',
    jump: 'jump',
    block: 'block'
  };
  
  Object.entries(controlActions).forEach(([action, name]) => {
    const btn = DOM['btn' + action.charAt(0).toUpperCase() + action.slice(1)];
    if (btn) {
      btn.addEventListener('click', () => {
        if (AppState.currentGame && AppState.currentGame.handleAction) {
          AppState.currentGame.handleAction(name);
        }
      });
    }
  });
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (AppState.gameState !== 'playing' || !AppState.currentGame) return;
    
    const keyMap = {
      'ArrowLeft': 'punch',
      'ArrowRight': 'kick',
      'ArrowUp': 'jump',
      'ArrowDown': 'block',
      'z': 'punch',
      'x': 'kick',
      ' ': 'jump'
    };
    
    const action = keyMap[e.key];
    if (action && AppState.currentGame.handleAction) {
      AppState.currentGame.handleAction(action);
      e.preventDefault();
    }
    
    // ESC to go back
    if (e.key === 'Escape') {
      DOM.backButton.click();
    }
  });
  
  // Overlay buttons
  document.getElementById('playAgainButton')?.addEventListener('click', () => {
    hideAllOverlays();
    if (AppState.currentGame && AppState.currentGame.start) {
      AppState.currentGame.start();
      AppState.gameState = 'playing';
    }
  });
  
  document.getElementById('menuButton')?.addEventListener('click', () => {
    hideAllOverlays();
    showGameSelection();
  });
  
  document.getElementById('retryButton')?.addEventListener('click', () => {
    hideAllOverlays();
    if (AppState.currentGame && AppState.currentGame.start) {
      AppState.currentGame.start();
      AppState.gameState = 'playing';
    }
  });
  
  document.getElementById('menuButton2')?.addEventListener('click', () => {
    hideAllOverlays();
    showGameSelection();
  });
  
  document.getElementById('promotionContinue')?.addEventListener('click', () => {
    hideAllOverlays();
    showGameSelection();
  });
}

function hideAllOverlays() {
  DOM.beltPromotionOverlay?.classList.add('hidden');
  DOM.levelCompleteOverlay?.classList.add('hidden');
  DOM.gameOverOverlay?.classList.add('hidden');
}

// ============================================
// CANVAS SETUP
// ============================================

function resizeCanvas() {
  const canvas = DOM.gameCanvas;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  
  DOM.ctx.scale(dpr, dpr);
}

// ============================================
// GAME LOOP
// ============================================

let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  // Clear canvas
  const ctx = DOM.ctx;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  
  // Draw background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, '#1D3557');
  gradient.addColorStop(1, '#152a4a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  
  // Draw dojo floor pattern when in menu
  if (AppState.gameState === 'menu') {
    drawDojoBackground(ctx);
  }
  
  // Update and draw particles
  if (particleSystem) {
    particleSystem.update(deltaTime);
    particleSystem.draw(ctx);
  }
  
  // Update and draw current game
  if (AppState.currentGame && AppState.gameState === 'playing') {
    if (AppState.currentGame.update) {
      AppState.currentGame.update(deltaTime);
    }
    if (AppState.currentGame.draw) {
      AppState.currentGame.draw(ctx);
    }
  }
  
  // Update sensei
  if (sensei && AppState.gameState === 'menu') {
    sensei.update(deltaTime);
    const senseiCtx = sensei.canvas.getContext('2d');
    sensei.draw(senseiCtx);
  }
  
  requestAnimationFrame(gameLoop);
}

function drawDojoBackground(ctx) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  
  // Draw tatami pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  
  const tatamiW = 80;
  const tatamiH = 40;
  
  for (let y = h * 0.4; y < h; y += tatamiH) {
    const offset = (Math.floor((y - h * 0.4) / tatamiH) % 2) * (tatamiW / 2);
    for (let x = -tatamiW + offset; x < w + tatamiW; x += tatamiW) {
      ctx.strokeRect(x, y, tatamiW, tatamiH);
    }
  }
  
  // Draw "DOJO" text watermark
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#F1FAEE';
  ctx.font = 'bold 200px Fredoka One, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DOJO', w / 2, h / 2);
  ctx.restore();
}

// ============================================
// INITIALIZATION
// ============================================

function initApp() {
  // Initialize DOM references
  DOM.init();
  
  // Load saved state
  AppState.load();
  
  // Initialize game router
  GameRouter.init();
  
  // Initialize audio
  audio = new AudioManager();
  
  // Initialize particle system
  particleSystem = new ParticleSystem();
  
  // Initialize sensei
  sensei = new Sensei(DOM.senseiCanvas);
  
  // Setup canvas
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Setup event listeners
  setupEventListeners();
  
  // Initialize UI
  UI.updateStars(AppState.stars);
  UI.updateBelt(AppState.beltLevel, AppState.beltNames[AppState.beltLevel]);
  
  // Show game selection
  showGameSelection();
  
  // Start game loop
  requestAnimationFrame(gameLoop);
  
  console.log('🥋 Dojo Harimau Kecil dimulai!');
  console.log('⭐ Stars:', AppState.stars);
  console.log('🎖️ Belt:', AppState.beltNames[AppState.beltLevel]);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
