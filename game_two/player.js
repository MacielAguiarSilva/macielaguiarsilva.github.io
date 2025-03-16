// player.js - Implementação do player com animação contínua via Sprite.update

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 60;
    this.speed = 3;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.5;
    this.jumpStrength = -8;
    this.onGround = false;
    this.health = 3;
    this.invulnerabilityTime = 0;
    this.facing = "right"; // "right" ou "left"
    
    // Cria o sprite com folha de sprite 4x3, com duração de frame 200ms
    this.sprite = new Sprite('assets/player.png', 4, 3, 200);
    // currentFrame será definido conforme o estado:
    // idle (parado): 0 para direita, 4 para esquerda
    // walk: ciclo entre 1,2,3 (para direita) ou 5,6,7 (para esquerda)
    // pulo: 8 para direita, 9 para esquerda
    this.currentFrame = 0;
  }
  
  update(controls, deltaTime, platforms) {
    // Atualiza os controles
    if (controls.left) {
      this.vx = -this.speed;
      this.facing = "left";
    } else if (controls.right) {
      this.vx = this.speed;
      this.facing = "right";
    } else {
      this.vx = 0;
    }
    
    // Pulo: só se estiver no chão
    if (controls.jump && this.onGround) {
      this.vy = this.jumpStrength;
      this.onGround = false;
      if (typeof audioManager !== 'undefined') audioManager.play('jump');
    }
    
    // Atualiza física
    this.vy += this.gravity;
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);
    
    // Checa colisão com plataformas para definir se está no chão
    this.onGround = false;
    for (let platform of platforms) {
      if (checkCollision(this, platform)) {
        if (this.vy > 0 && (this.y + this.height) >= platform.y && (this.y + this.height) <= platform.y + 15) {
          this.y = platform.y - this.height;
          this.vy = 0;
          this.onGround = true;
        }
      }
    }
    
    // Atualiza a animação:
    if (!this.onGround) {
      // Se no ar (pulando), fixa nos frames de pulo: 8 para direita, 9 para esquerda.
      this.currentFrame = (this.facing === "right") ? 8 : 9;
      // Também reinicia o tempo interno da animação para evitar acumulação.
      this.sprite.elapsedTime = 0;
    } else if (this.vx === 0) {
      // Se parado, fixa no idle: 0 para direita, 4 para esquerda.
      this.currentFrame = (this.facing === "right") ? 0 : 4;
      // Reseta a animação para que, ao começar a andar, a sequência inicie corretamente.
      this.sprite.currentFrame = this.currentFrame;
      this.sprite.elapsedTime = 0;
    } else {
      // Se andando, atualiza constantemente a animação do sprite.
      this.sprite.update(deltaTime);
      // Mapeia o frame da animação para o ciclo de caminhada desejado.
      // Supondo que a folha completa tem 12 frames e que queremos usar os frames 1,2,3 para a direita e 5,6,7 para a esquerda.
      if (this.facing === "right") {
        // Obtemos o índice do ciclo de caminhada: 0,1,2 (base 0)
        let walkFrame = this.sprite.currentFrame % 3; // valor entre 0 e 2
        // Mapeamos para os frames 1,2,3 (ou seja, adicionamos 1)
        this.currentFrame = 1 + walkFrame;
      } else {
        // Para a esquerda, queremos usar os frames 5,6,7. Subtraímos 3 do ciclo e depois adicionamos 5.
        let walkFrame = this.sprite.currentFrame % 3;
        this.currentFrame = 5 + walkFrame;
      }
    }
  }
  
  draw(ctx) {
    if (this.sprite.loaded && !this.sprite.failed) {
      // Calcula coluna e linha com base no currentFrame
      let col = this.currentFrame % this.sprite.columns;
      let row = Math.floor(this.currentFrame / this.sprite.columns);
      ctx.drawImage(
        this.sprite.image,
        col * this.sprite.frameWidth,
        row * this.sprite.frameHeight,
        this.sprite.frameWidth,
        this.sprite.frameHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

window.Player = Player;
