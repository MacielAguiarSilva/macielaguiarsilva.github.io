/* map.js - Gerencia a geração e expansão das plataformas e chão */
class MapManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.worldWidth = canvasWidth * 4; // Mundo virtual 4 vezes maior que o canvas
    this.expansionThreshold = canvasWidth * 0.7;
    this.platformSpacing = 200;
  }
  
  generateInitialPlatforms() {
    const platforms = [];
    // Gera mais plataformas (por exemplo, 12 plataformas)
    for (let i = 0; i < 12; i++) {
      const width = 50 + Math.random() * 100;
      const x = i * (this.platformSpacing + width / 2);
      const y = this.canvasHeight - 100 - Math.random() * 150;
      platforms.push(new Platform(x, y, width, 10, 'fixed'));
    }
    // Chão: uma plataforma que ocupa toda a largura virtual, com altura maior
    const groundHeight = 40;
    platforms.push(new Platform(0, this.canvasHeight - groundHeight, this.worldWidth *100, groundHeight, 'fixed'));
    return platforms;
  }
  
  update(player, platforms) {
    if (player.x > this.expansionThreshold) {
      this.expansionThreshold += this.canvasWidth * 0.5;
      const width = 50 + Math.random() * 100;
      const x = player.x + Math.random() * this.canvasWidth;
      const y = this.canvasHeight - 100 - Math.random() * 150;
      platforms.push(new Platform(x, y, width, 10, 'fixed'));
    }
  }
}
