/* enemy.js - Inimigos terrestres (GroundEnemy) e voadores (FlyingEnemy)
   - Inimigo terrestre: folha de sprite com 3 colunas x 2 linhas (6 frames)
     • Para andar para a direita: ciclo entre frames 1,2,3 (índices 0,1,2; idle = 1 → índice 0)
     • Para andar para a esquerda: ciclo entre frames 4,5,6 (índices 3,4,5; idle = 4 → índice 3)
   - Inimigo voador: folha de sprite com 6 colunas x 6 linhas (36 frames)
     • Estados:
         idle: se facing right, linha 0; se facing left, linha 1.
         attack: se facing right, linha 2; se facing left, linha 3.
         return: se facing right, linha 4; se facing left, linha 5.
     • No estado “return”, o movimento é diagonal.
*/

class GroundEnemy {
  constructor(x, y, level = 1) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.level = level;
    this.speed = 1.5 + level * 0.2;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.5;
    this.onGround = false;
    this.state = "attack"; // ou "wander"
    this.jumpCooldown = 0;
    this.facing = "right"; // "right" ou "left"
    // Propriedade para resolução de colisões (se necessário)
    this.collisionCooldown = 0;
    // Controle de animação
    this.frameTimer = 0;
    this.frameInterval = 200; // ms para troca de frame
    // Cria o sprite com folha 3x2
    this.sprite = new Sprite('assets/enemy_ground.png', 3, 2, this.frameInterval);
    // Definindo ciclos:
    // Para direita: usar índices 0,1,2 (idle = índice 0)
    // Para esquerda: usar índices 3,4,5 (idle = índice 3)
    this.baseRight = 0;
    this.baseLeft = 3;
    this.currentFrame = (this.facing === "right") ? this.baseRight : this.baseLeft;
  }

  update(deltaTime, player, platforms) {
    // Atualiza o cooldown de colisão para evitar múltiplos pulos seguidos
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= deltaTime;
      if (this.collisionCooldown < 0) this.collisionCooldown = 0;
    }

    const horizontalDistance = Math.abs(player.x - this.x);
    this.state = (horizontalDistance < 300 && player.y >= this.y - 20) ? "attack" : "wander";

    if (this.state === "attack") {
      this.vx = (player.x < this.x ? -this.speed : this.speed);
      this.facing = (player.x < this.x ? "left" : "right");
      if (player.y < this.y - 10 && this.onGround && this.jumpCooldown <= 0) {
        this.vy = -7;
        this.onGround = false;
        this.jumpCooldown = 1000;
      }
    } else {
      if (Math.random() < 0.01) {
        this.vx = (Math.random() < 0.5 ? -this.speed : this.speed);
        this.facing = (this.vx < 0 ? "left" : "right");
      }
      if (this.onGround && Math.random() < 0.005 && this.jumpCooldown <= 0) {
        this.vy = -7;
        this.onGround = false;
        this.jumpCooldown = 1000;
      }
    }
    if (this.jumpCooldown > 0) this.jumpCooldown -= deltaTime;
    if (!this.onGround) this.vy += this.gravity;
    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);

    // Colisão com plataformas
    this.onGround = false;
    for (let platform of platforms) {
      if (checkCollision(this, platform)) {
        if (this.vy > 0 && (this.y + this.height) >= platform.y && (this.y + this.height) <= platform.y + 15) {
          this.y = platform.y - this.height;
          this.vy = 0;
          this.onGround = true;
          break;
        }
      }
    }

    // Atualiza a animação:
    if (!this.onGround && this.vx === 0) {
      // Se no ar ou parado, usa idle:
      this.currentFrame = (this.facing === "right") ? this.baseRight : this.baseLeft;
      this.frameTimer = 0;
    } else {
      this.frameTimer += deltaTime;
      if (this.frameTimer >= this.frameInterval) {
        this.frameTimer = 0;
        if (this.facing === "right") {
          // Ciclo para direita: índices 0,1,2
          if (this.currentFrame < this.baseRight || this.currentFrame >= this.baseRight + 2) {
            this.currentFrame = this.baseRight;
          } else {
            this.currentFrame = ((this.currentFrame - this.baseRight + 1) % 3) + this.baseRight;
          }
        } else {
          // Ciclo para esquerda: índices 3,4,5
          if (this.currentFrame < this.baseLeft || this.currentFrame >= this.baseLeft + 2) {
            this.currentFrame = this.baseLeft;
          } else {
            this.currentFrame = ((this.currentFrame - this.baseLeft + 1) % 3) + this.baseLeft;
          }
        }
      }
    }
  }

  draw(ctx) {
    if (this.sprite.loaded && !this.sprite.failed) {
      let col = this.currentFrame % this.sprite.columns;
      let row = Math.floor(this.currentFrame / this.sprite.columns);
      let frameWidth = this.sprite.frameWidth || (this.sprite.image.width / this.sprite.columns);
      let frameHeight = this.sprite.frameHeight || (this.sprite.image.height / this.sprite.rows);
      ctx.drawImage(
        this.sprite.image,
        col * frameWidth, row * frameHeight,
        frameWidth, frameHeight,
        this.x, this.y,
        this.width, this.height
      );
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

window.GroundEnemy = GroundEnemy;


/* Inimigo voador (“FlyingEnemy”) – folha de sprite com 6 colunas e 6 linhas.
   Estados e suas linhas:
     - idle: se facing right, linha 0; se facing left, linha 1.
     - attack: se facing right, linha 2; se facing left, linha 3.
     - return: se facing right, linha 4; se facing left, linha 5.
   No estado "return", a águia retorna diagonalmente de forma consistente.
*/
class FlyingEnemy {
  constructor(x, y, level = 1) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.level = level;
    this.baseAltitude = 50;
    this.attackSpeed = 3.5 + level * 0.3;
    if (window.innerWidth > 800) {
      this.attackSpeed *= window.innerWidth / 800;
    }
    this.returnSpeed = 2.0;
    this.cooldownTime = 1500;
    this.attackDuration = 2000;
    this.state = "idle"; // idle, attack, return, cooldown
    this.stateTimer = 0;
    this.target = { x: 0, y: 0 };
    this.facing = "right";
    // Fixa a direção de retorno ao sair do estado attack
    this.returnDirection = "right";
    // Cria o sprite: folha com 6 colunas e 6 linhas
    this.sprite = new Sprite('assets/enemy_flying.png', 6, 6, 200);
  }

  update(deltaTime, player) {
    this.stateTimer += deltaTime;
    if (this.state !== "return") {
      this.facing = (player.x < this.x) ? "left" : "right";
    }
    
    let desiredRow;
    if (this.state === "idle") {
      desiredRow = (this.facing === "right") ? 0 : 1;
      if (Math.abs(player.x - this.x) < 600) {
        this.state = "attack";
        this.stateTimer = 0;
        this.target.x = player.x;
        this.target.y = player.y;
      }
    } else if (this.state === "attack") {
      desiredRow = (this.facing === "right") ? 2 : 3;
      let dx = this.target.x - this.x;
      let dy = this.target.y - this.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        let vx = (dx / dist) * this.attackSpeed;
        let vy = (dy / dist) * this.attackSpeed;
        this.x += vx * (deltaTime / 16);
        this.y += vy * (deltaTime / 16);
      }
      if (dist < 10 || this.stateTimer >= this.attackDuration) {
        // Fixa a direção de retorno antes de transitar para "return"
        this.returnDirection = this.facing;
        this.state = "return";
        this.stateTimer = 0;
      }
    } else if (this.state === "return") {
      desiredRow = (this.returnDirection === "right") ? 4 : 5;
      // Movimento diagonal consistente
      let diagSpeed = this.returnSpeed / Math.sqrt(2);
      if (this.returnDirection === "right") {
        this.x += diagSpeed * (deltaTime / 16);
      } else {
        this.x -= diagSpeed * (deltaTime / 16);
      }
      this.y -= diagSpeed * (deltaTime / 16);
      if (this.y <= this.baseAltitude) {
        this.y = this.baseAltitude;
        this.state = "cooldown";
        this.stateTimer = 0;
      }
    } else if (this.state === "cooldown") {
      desiredRow = (this.facing === "right") ? 0 : 1;
      if (this.stateTimer >= this.cooldownTime) {
        this.state = "idle";
        this.stateTimer = 0;
      }
    }
    
    if (this.sprite.loaded && !this.sprite.failed) {
      let currentRow = Math.floor(this.sprite.currentFrame / this.sprite.columns);
      if (currentRow !== desiredRow) {
        this.sprite.currentFrame = desiredRow * this.sprite.columns;
      }
      this.sprite.update(deltaTime);
    }
  }

  draw(ctx) {
    if (this.sprite.loaded && !this.sprite.failed) {
      let col = this.sprite.currentFrame % this.sprite.columns;
      let row = Math.floor(this.sprite.currentFrame / this.sprite.columns);
      let frameWidth = this.sprite.frameWidth || (this.sprite.image.width / this.sprite.columns);
      let frameHeight = this.sprite.frameHeight || (this.sprite.image.height / this.sprite.rows);
      ctx.drawImage(
        this.sprite.image,
        col * frameWidth, row * frameHeight,
        frameWidth, frameHeight,
        this.x, this.y,
        this.width, this.height
      );
    } else {
      ctx.fillStyle = 'orange';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

window.FlyingEnemy = FlyingEnemy;


/* Gerenciador de inimigos */
class EnemyManager {
  constructor() {
    this.groundEnemies = [];
    this.flyingEnemies = [];
    // Para que os inimigos nasçam fora da visão da câmera, usamos offsets maiores:
    this.groundSpawnOffset = 600; // inimigos terrestres nascem a ±600px do player
    this.flyingSpawnOffset = 800;  // inimigos voadores a ±800px do player
    this.groundSpawnTimer = 0;
    this.groundSpawnInterval = 2000;
    this.flyingSpawnTimer = 0;
    this.flyingSpawnInterval = 8000;
    this.currentLevel = 1;
  }

  update(deltaTime, player, platforms) {
    this.groundSpawnTimer += deltaTime;
    if (this.groundSpawnTimer >= this.groundSpawnInterval) {
      this.groundSpawnTimer = 0;
      this.currentLevel++;
      this.spawnGroundEnemy(player);
    }
    this.flyingSpawnTimer += deltaTime;
    if (this.flyingSpawnTimer >= this.flyingSpawnInterval) {
      this.flyingSpawnTimer = 0;
      this.spawnFlyingEnemy(player);
    }
    this.groundEnemies.forEach(enemy => enemy.update(deltaTime, player, platforms));
    this.flyingEnemies.forEach(enemy => enemy.update(deltaTime, player));
    this.resolveCollisions();
  }

  // Inimigos terrestres nascem fora da visão: a uma distância mínima definida pelo spawnOffset
  spawnGroundEnemy(player) {
    const offset = this.groundSpawnOffset;
    // Gera aleatoriamente à esquerda ou à direita do player
    const spawnX = player.x + (Math.random() < 0.5 ? -offset : offset);
    const spawnY = player.y - 50 + Math.random() * 100;
    const newEnemy = new GroundEnemy(spawnX, spawnY, this.currentLevel);
    if (!this.isOverlapping(newEnemy)) {
      this.groundEnemies.push(newEnemy);
    }
  }

  spawnFlyingEnemy(player) {
    const offset = this.flyingSpawnOffset;
    const spawnX = player.x + (Math.random() < 0.5 ? -offset : offset);
    const spawnY = 50; // voadores sempre nascem perto do topo
    const newEnemy = new FlyingEnemy(spawnX, spawnY, this.currentLevel);
    if (!this.isOverlapping(newEnemy)) {
      this.flyingEnemies.push(newEnemy);
    }
  }

  isOverlapping(newEnemy) {
    const all = this.groundEnemies.concat(this.flyingEnemies);
    for (let enemy of all) {
      if (checkCollision(newEnemy, enemy)) return true;
    }
    return false;
  }

  resolveCollisions() {
    // Resolução de colisões para inimigos terrestres: evitar sobreposição
    for (let i = 0; i < this.groundEnemies.length; i++) {
      for (let j = i + 1; j < this.groundEnemies.length; j++) {
        let enemy1 = this.groundEnemies[i];
        let enemy2 = this.groundEnemies[j];
        if (checkCollision(enemy1, enemy2)) {
          // Se os inimigos estiverem se movendo na mesma direção ou ambos parados, empurra-os para evitar sobreposição.
          // Se eles se moverem em direções opostas, permitem atravessar.
          if (enemy1.vx * enemy2.vx >= 0) {
            // Empurra-os com base na sobreposição
            let overlap = (enemy1.x + enemy1.width) - enemy2.x;
            if (overlap > 0) {
              enemy1.x -= overlap / 2;
              enemy2.x += overlap / 2;
            }
          }
        }
      }
    }
  }

  draw(ctx) {
    this.groundEnemies.forEach(enemy => enemy.draw(ctx));
    this.flyingEnemies.forEach(enemy => enemy.draw(ctx));
  }
}

window.EnemyManager = EnemyManager;
