/* platforms.js - Define plataformas fixas (e móveis, se necessário) */

class Platform {
  constructor(x, y, width, height, type = 'fixed', options = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type; // 'fixed' ou 'moving'
    if (this.type === 'moving') {
      this.vx = options.vx || 2;
      this.range = options.range || 100;
      this.startX = x;
      this.direction = 1;
    }
  }
  
  update(deltaTime) {
    if (this.type === 'moving') {
      this.x += this.vx * this.direction * (deltaTime / 16);
      if (Math.abs(this.x - this.startX) > this.range) {
        this.direction *= -1;
      }
    }
  }
  
  draw(ctx) {
    ctx.fillStyle = '#555';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
