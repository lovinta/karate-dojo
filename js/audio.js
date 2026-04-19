/**
 * Harimau Kecil - AudioManager
 * Web Audio API sound effects generator
 * All sounds generated programmatically (no external files)
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.initialized = false;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
  }

  /**
   * Initialize Web Audio context on first user interaction
   * Call this on click/touch events
   */
  initAudio() {
    if (this.initialized) return;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create master gain at 40% volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);

      // Create separate gains for BGM and SFX
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.3;
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);

      this.initialized = true;
      console.log('AudioManager berjalan');
    } catch (e) {
      console.warn('Web Audio API tidak didukung:', e);
    }
  }

  /**
   * Alias for initAudio for compatibility
   */
  init() {
    this.initAudio();
  }

  /**
   * Resume audio context if suspended
   */
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.4;
    }
    return this.muted;
  }

  /**
   * Create noise buffer for various effects
   */
  createNoiseBuffer(duration = 1) {
    const sampleRate = this.ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  /**
   * Unified playSound interface - routes to appropriate sound
   */
  playSound(type) {
    if (!this.initialized) return;
    this.resume();

    switch (type) {
      case 'punch':
        this.playPunch();
        break;
      case 'kick':
        this.playKick();
        break;
      case 'kata':
        this.playKata();
        break;
      case 'block':
        this.playBlock();
        break;
      case 'playerHit':
        this.playPlayerHit();
        break;
      case 'combo':
        this.playCombo();
        break;
      case 'victory':
        this.playVictoryJingle();
        break;
      case 'gameOver':
        this.playGameOverTone();
        break;
      default:
        console.warn('Tipe suara tidak dikenal:', type);
    }
  }

  // ========== SOUND EFFECTS ==========

  /**
   * Punch sound - white noise burst 80ms
   */
  playPunch() {
    const now = this.ctx.currentTime;

    // White noise burst
    const noiseBuffer = this.createNoiseBuffer(0.1);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 0.5;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.08);

    // Low thump for impact
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Kick sound - low thud 100ms
   */
  playKick() {
    const now = this.ctx.currentTime;

    // Low frequency thud
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);

    // Whoosh layer
    const noiseBuffer = this.createNoiseBuffer(0.15);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.linearRampToValueAtTime(150, now + 0.1);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  /**
   * Kata sound - rising sweep + noise
   */
  playKata() {
    const now = this.ctx.currentTime;

    // Rising sweep oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.setValueAtTime(0.3, now + 0.2);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.4);

    // Noise burst at the peak
    const noiseBuffer = this.createNoiseBuffer(0.1);
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 3000;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now + 0.25);
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now + 0.25);
    noise.stop(now + 0.4);
  }

  /**
   * Block sound - metallic click
   */
  playBlock() {
    const now = this.ctx.currentTime;

    // High frequency click
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2500, now);
    osc.frequency.exponentialRampToValueAtTime(1500, now + 0.03);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);

    // Secondary metallic ring
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1800, now);
    osc2.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.25, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc2.connect(osc2Gain);
    osc2Gain.connect(this.sfxGain);

    osc2.start(now);
    osc2.stop(now + 0.08);
  }

  /**
   * Player hit sound - low impact
   */
  playPlayerHit() {
    const now = this.ctx.currentTime;

    // Low thud
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.15);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.7, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);

    // Distorted hit layer
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    // Simple distortion
    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(128);
    for (let i = 0; i < 128; i++) {
      const x = (i - 64) / 64;
      curve[i] = Math.tanh(x * 3);
    }
    distortion.curve = curve;

    const distGain = this.ctx.createGain();
    distGain.gain.setValueAtTime(0.3, now);
    distGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc2.connect(distortion);
    distortion.connect(distGain);
    distGain.connect(this.sfxGain);

    osc2.start(now);
    osc2.stop(now + 0.1);
  }

  /**
   * Combo sound - ascending arpeggio
   */
  playCombo() {
    const now = this.ctx.currentTime;
    // C5, E5, G5, C6 arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }

  /**
   * Victory jingle - 8-note melody
   */
  playVictoryJingle() {
    const now = this.ctx.currentTime;
    // 8-note triumphant melody
    const melody = [
      { freq: 523.25, start: 0, dur: 0.15 },    // C5
      { freq: 659.25, start: 0.15, dur: 0.15 },  // E5
      { freq: 783.99, start: 0.3, dur: 0.15 },   // G5
      { freq: 1046.50, start: 0.45, dur: 0.3 },  // C6
      { freq: 783.99, start: 0.8, dur: 0.15 },   // G5
      { freq: 1046.50, start: 0.95, dur: 0.4 },  // C6
      { freq: 1318.51, start: 1.4, dur: 0.2 },   // E6
      { freq: 1567.98, start: 1.6, dur: 0.5 },   // G6
    ];

    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = note.freq;

      const gain = this.ctx.createGain();
      const startTime = now + note.start;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
      gain.gain.setValueAtTime(0.35, startTime + (note.dur - 0.05));
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + note.dur);
    });
  }

  /**
   * Game over tone - descending sad tones
   */
  playGameOverTone() {
    const now = this.ctx.currentTime;
    // Descending minor phrases
    const melody = [
      { freq: 392.00, start: 0, dur: 0.3 },     // G4
      { freq: 349.23, start: 0.35, dur: 0.3 },   // F4
      { freq: 311.13, start: 0.7, dur: 0.3 },   // Eb4
      { freq: 293.66, start: 1.05, dur: 0.5 },   // D4
      { freq: 261.63, start: 1.6, dur: 0.4 },    // C4
      { freq: 233.08, start: 2.05, dur: 0.6 },   // Bb3
    ];

    melody.forEach(note => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = note.freq;

      const gain = this.ctx.createGain();
      const startTime = now + note.start;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.05);
      gain.gain.setValueAtTime(0.3, startTime + (note.dur - 0.1));
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + note.dur);
    });
  }

  // ========== LEGACY METHODS (for compatibility) ==========

  playJump() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(600, now + 0.15);
    osc.frequency.linearRampToValueAtTime(400, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.setValueAtTime(0.4, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playStar() {
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  playWrong() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i - 128) / 128;
      curve[i] = Math.tanh(x * 2);
    }
    distortion.curve = curve;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(distortion);
    distortion.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playLevelComplete() {
    this.playVictoryJingle();
  }

  // ========== BACKGROUND MUSIC ==========

  /**
   * Start background music - simple 4-bar 8-bit loop
   */
  playBGM() {
    if (!this.initialized || this.bgmPlaying) return;
    this.resume();

    this.bgmPlaying = true;
    const bpm = 140;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;

    const playBar = () => {
      if (!this.bgmPlaying) return;

      const now = this.ctx.currentTime;

      // Bass drum - beats 1 and 3
      [0, 2].forEach(beat => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(85, now + beat * beatDuration);
        osc.frequency.exponentialRampToValueAtTime(35, now + beat * beatDuration + 0.1);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, now + beat * beatDuration);
        gain.gain.exponentialRampToValueAtTime(0.01, now + beat * beatDuration + 0.12);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now + beat * beatDuration);
        osc.stop(now + beat * beatDuration + 0.12);
      });

      // Snare - beats 2 and 4
      [1, 3].forEach(beat => {
        const noiseBuffer = this.createNoiseBuffer(0.08);
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now + beat * beatDuration);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + beat * beatDuration + 0.08);

        noise.connect(noiseGain);
        noiseGain.connect(this.bgmGain);

        noise.start(now + beat * beatDuration);
        noise.stop(now + beat * beatDuration + 0.08);
      });

      // 8-bit melody - simple 4-bar loop
      // Bar 1: C4 -> E4 -> G4 -> C5
      // Bar 2: G4 -> A4 -> C5 -> G4
      // Bar 3: F4 -> A4 -> C5 -> F4
      // Bar 4: G4 -> B4 -> D5 -> G4
      const melodyPatterns = [
        [261.63, 329.63, 392.00, 523.25],  // Bar 1
        [392.00, 440.00, 523.25, 392.00],  // Bar 2
        [349.23, 440.00, 523.25, 349.23],  // Bar 3
        [392.00, 493.88, 587.33, 392.00],  // Bar 4
      ];

      let barIndex = 0;
      const playMelody = () => {
        if (!this.bgmPlaying) return;
        
        const pattern = melodyPatterns[barIndex % 4];
        const barStart = this.ctx.currentTime;

        pattern.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.value = freq;

          const gain = this.ctx.createGain();
          const noteStart = barStart + i * beatDuration;
          gain.gain.setValueAtTime(0, noteStart);
          gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.02);
          gain.gain.setValueAtTime(0.08, noteStart + beatDuration * 0.8);
          gain.gain.linearRampToValueAtTime(0.02, noteStart + beatDuration * 0.95);
          gain.gain.linearRampToValueAtTime(0, noteStart + beatDuration);

          osc.connect(gain);
          gain.connect(this.bgmGain);

          osc.start(noteStart);
          osc.stop(noteStart + beatDuration);
        });

        barIndex++;
        setTimeout(playMelody, barDuration * 1000);
      };

      playMelody();
    };

    playBar();
  }

  /**
   * Stop background music
   */
  stopBGM() {
    this.bgmPlaying = false;
  }

  // ========== TTS (placeholder - requires API key) ==========

  async speak(text, voiceId = 'UgBBYS2sOqTuMpoF3BR0') {
    console.log('TTS:', text);
    // TTS implementation would go here with ElevenLabs API
  }
}

// Create global audio instance
const audioManager = new AudioManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
