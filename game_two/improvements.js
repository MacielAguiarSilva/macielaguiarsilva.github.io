/* improvements.js - Debug simples (FPS) */

class Debug {
  static logFPS(deltaTime) {
    if (!this.fpsTime) {
      this.fpsTime = 0;
      this.frameCount = 0;
    }
    this.fpsTime += deltaTime;
    this.frameCount++;
    if (this.fpsTime >= 1000) {
      this.currentFPS = (this.frameCount * 1000 / this.fpsTime).toFixed(1);
      this.fpsTime = 0;
      this.frameCount = 0;
    }
  }
}
