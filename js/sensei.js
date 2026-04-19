/**
 * Avicenna's Karate Dojo - Sensei Mascot
 * Cartoon character drawn with Canvas API + ElevenLabs TTS
 */

class Sensei {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Position
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    
    // Animation
    this.bouncePhase = 0;
    this.bounceSpeed = 0.003;
    this.baseY = this.y;
    
    // Expression state
    this.expression = 'idle'; // 'idle', 'happy', 'sad', 'encouraging'
    
    // Colors
    this.skinColor = '#FFD9B3';
    this.hairColor = '#2D2D2D';
    this.dobokColor = '#FFFFFF';
    this.beltColor = '#2D2D2D';
    this.outlineColor = '#1D3557';
    
    // Dimensions (relative to canvas)
    this.scale = 1;
    
    // Speech bubble
    this.speechText = '';
    this.speechVisible = false;
  }
  
  /**
   * Set mascot expression
   */
  setExpression(expression) {
    this.expression = expression;
  }
  
  /**
   * Trigger bounce animation
   */
  animateBounce() {
    this.bounceSpeed = 0.01;
    setTimeout(() => {
      this.bounceSpeed = 0.003;
    }, 500);
  }
  
  /**
   * Play voice using ElevenLabs TTS
   */
  async speak(text) {
    this.speechText = text;
    this.speechVisible = true;
    
    const apiKey = process.env.ELEVENLABS_API_KEY || process.env.REACT_APP_ELEVENLABS_API_KEY || '';
    
    if (!apiKey) {
      console.warn('ElevenLabs API key not found');
      // Fallback: just show speech bubble
      setTimeout(() => {
        this.speechVisible = false;
      }, 3000);
      return;
    }
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/UgBBYS2sOqTuMpoF3BR0', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('TTS request failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        this.speechVisible = false;
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
      
      // Auto-hide after max duration
      setTimeout(() => {
        this.speechVisible = false;
        if (audioUrl) URL.revokeObjectURL(audioUrl);
      }, 5000);
      
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback: just show speech bubble
      setTimeout(() => {
        this.speechVisible = false;
      }, 3000);
    }
  }
  
  /**
   * Update animation state
   */
  update(deltaTime) {
    this.bouncePhase += this.bounceSpeed * deltaTime;
    this.y = this.baseY + Math.sin(this.bouncePhase) * 10;
  }
  
  /**
   * Draw the Sensei character
   */
  draw(ctx) {
    const x = this.x;
    const y = this.y;
    const s = this.scale;
    
    ctx.save();
    ctx.translate(x, y);
    
    // Draw belt first (behind body)
    this.drawBelt(ctx, s);
    
    // Draw body (dobok)
    this.drawBody(ctx, s);
    
    // Draw head
    this.drawHead(ctx, s);
    
    // Draw face based on expression
    this.drawFace(ctx, s);
    
    // Draw arms
    this.drawArms(ctx, s);
    
    // Draw legs
    this.drawLegs(ctx, s);
    
    ctx.restore();
  }
  
  /**
   * Draw belt at waist
   */
  drawBelt(ctx, s) {
    ctx.save();
    
    const beltWidth = 60 * s;
    const beltHeight = 12 * s;
    const beltY = 30 * s;
    
    // Belt (black)
    ctx.fillStyle = this.beltColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.roundRect(-beltWidth / 2, beltY - beltHeight / 2, beltWidth, beltHeight, 4);
    ctx.fill();
    ctx.stroke();
    
    // Belt knot
    ctx.fillStyle = this.beltColor;
    ctx.beginPath();
    ctx.ellipse(0, beltY + 8 * s, 15 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Draw body (torso in dobok)
   */
  drawBody(ctx, s) {
    ctx.save();
    
    const bodyWidth = 70 * s;
    const bodyHeight = 80 * s;
    const bodyY = -20 * s;
    
    // Main body (V-neck dobok)
    ctx.fillStyle = this.dobokColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    
    // Body shape with V-neck
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, bodyY - bodyHeight / 2); // Top left
    ctx.lineTo(-bodyWidth / 2, bodyY + bodyHeight / 2); // Bottom left
    ctx.lineTo(bodyWidth / 2, bodyY + bodyHeight / 2); // Bottom right
    ctx.lineTo(bodyWidth / 2, bodyY - bodyHeight / 2); // Top right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // V-neck line
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20 * s, bodyY - bodyHeight / 2);
    ctx.lineTo(0, bodyY - bodyHeight / 2 + 30 * s);
    ctx.lineTo(20 * s, bodyY - bodyHeight / 2);
    ctx.stroke();
    
    // Collar line
    ctx.strokeStyle = '#CCC';
    ctx.beginPath();
    ctx.moveTo(-25 * s, bodyY - bodyHeight / 2);
    ctx.lineTo(-20 * s, bodyY - bodyHeight / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20 * s, bodyY - bodyHeight / 2);
    ctx.lineTo(25 * s, bodyY - bodyHeight / 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Draw head
   */
  drawHead(ctx, s) {
    ctx.save();
    
    const headRadius = 45 * s;
    const headY = -90 * s;
    
    // Head shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.beginPath();
    ctx.ellipse(5, headY + 5, headRadius, headRadius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Head
    ctx.fillStyle = this.skinColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Hair (top)
    ctx.fillStyle = this.hairColor;
    ctx.beginPath();
    ctx.ellipse(0, headY - 35 * s, 40 * s, 20 * s, 0, 0, Math.PI);
    ctx.fill();
    
    // Ears
    ctx.fillStyle = this.skinColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    
    // Left ear
    ctx.beginPath();
    ctx.ellipse(-42 * s, headY, 8 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right ear
    ctx.beginPath();
    ctx.ellipse(42 * s, headY, 8 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Draw face (eyes, mouth) based on expression
   */
  drawFace(ctx, s) {
    ctx.save();
    
    const headY = -90 * s;
    
    switch (this.expression) {
      case 'happy':
        this.drawHappyFace(ctx, s, headY);
        break;
      case 'sad':
        this.drawSadFace(ctx, s, headY);
        break;
      case 'encouraging':
        this.drawEncouragingFace(ctx, s, headY);
        break;
      default: // idle
        this.drawIdleFace(ctx, s, headY);
    }
    
    ctx.restore();
  }
  
  /**
   * Draw idle/neutral face
   */
  drawIdleFace(ctx, s, headY) {
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    
    // Eye whites
    ctx.beginPath();
    ctx.ellipse(-15 * s, headY - 5 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(15 * s, headY - 5 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pupils
    ctx.fillStyle = '#2D2D2D';
    ctx.beginPath();
    ctx.arc(-15 * s, headY - 3 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15 * s, headY - 3 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-13 * s, headY - 5 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(17 * s, headY - 5 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, headY + 10 * s, 15 * s, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  }
  
  /**
   * Draw happy face
   */
  drawHappyFace(ctx, s, headY) {
    // Happy eyes (closed, curved lines)
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    // Left eye
    ctx.beginPath();
    ctx.arc(-15 * s, headY - 5 * s, 8 * s, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(15 * s, headY - 5 * s, 8 * s, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    
    // Big smile
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(0, headY + 10 * s, 20 * s, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = this.outlineColor;
    ctx.stroke();
    
    // Rosy cheeks
    ctx.fillStyle = 'rgba(255, 150, 150, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-30 * s, headY + 10 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(30 * s, headY + 10 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw sad face
   */
  drawSadFace(ctx, s, headY) {
    // Sad eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    
    // Eye whites
    ctx.beginPath();
    ctx.ellipse(-15 * s, headY - 5 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(15 * s, headY - 5 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Sad pupils (looking down)
    ctx.fillStyle = '#2D2D2D';
    ctx.beginPath();
    ctx.arc(-15 * s, headY - 1 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15 * s, headY - 1 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyebrows (slanted down)
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-25 * s, headY - 20 * s);
    ctx.lineTo(-8 * s, headY - 15 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25 * s, headY - 20 * s);
    ctx.lineTo(8 * s, headY - 15 * s);
    ctx.stroke();
    
    // Sad mouth
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, headY + 25 * s, 12 * s, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  }
  
  /**
   * Draw encouraging face
   */
  drawEncouragingFace(ctx, s, headY) {
    // Determined eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    
    // Eye whites
    ctx.beginPath();
    ctx.ellipse(-15 * s, headY - 5 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(15 * s, headY - 5 * s, 10 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pupils (looking forward, determined)
    ctx.fillStyle = '#2D2D2D';
    ctx.beginPath();
    ctx.arc(-15 * s, headY - 5 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15 * s, headY - 5 * s, 5 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-13 * s, headY - 7 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(17 * s, headY - 7 * s, 2 * s, 0, Math.PI * 2);
    ctx.fill();
    
    // Raised eyebrows
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-25 * s, headY - 18 * s);
    ctx.lineTo(-8 * s, headY - 22 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25 * s, headY - 18 * s);
    ctx.lineTo(8 * s, headY - 22 * s);
    ctx.stroke();
    
    // Encouraging smile
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, headY + 8 * s, 18 * s, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    
    // Open mouth (talking)
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.ellipse(0, headY + 18 * s, 8 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  /**
   * Draw arms
   */
  drawArms(ctx, s) {
    ctx.save();
    
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 8 * s;
    ctx.lineCap = 'round';
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(-35 * s, 0);
    ctx.lineTo(-55 * s, 30 * s);
    ctx.stroke();
    
    // Left hand
    ctx.fillStyle = this.skinColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-55 * s, 35 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Right arm
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 8 * s;
    ctx.beginPath();
    ctx.moveTo(35 * s, 0);
    ctx.lineTo(55 * s, 30 * s);
    ctx.stroke();
    
    // Right hand
    ctx.fillStyle = this.skinColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(55 * s, 35 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Draw legs
   */
  drawLegs(ctx, s) {
    ctx.save();
    
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 10 * s;
    ctx.lineCap = 'round';
    
    // Left leg
    ctx.beginPath();
    ctx.moveTo(-20 * s, 55 * s);
    ctx.lineTo(-25 * s, 100 * s);
    ctx.stroke();
    
    // Left foot
    ctx.fillStyle = this.dobokColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-35 * s, 95 * s, 25 * s, 12 * s, 4);
    ctx.fill();
    ctx.stroke();
    
    // Right leg
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 10 * s;
    ctx.beginPath();
    ctx.moveTo(20 * s, 55 * s);
    ctx.lineTo(25 * s, 100 * s);
    ctx.stroke();
    
    // Right foot
    ctx.fillStyle = this.dobokColor;
    ctx.strokeStyle = this.outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10 * s, 95 * s, 25 * s, 12 * s, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sensei;
}
