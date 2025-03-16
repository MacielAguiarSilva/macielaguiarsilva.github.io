// main.js - Inicialização do jogo, background com paralaxe e loop principal
document.addEventListener('DOMContentLoaded', function() {
  // Garante que o objeto Sprites (ou as imagens) estejam disponíveis
  // Se você usar paths diretamente no background, não depende de Sprites para esse recurso.
  let canvas, ctx;
  let player, mapManager, enemyManager, controls, platforms;
  let lastTime = 0;
  let gameOver = false;
  let score = 0;
  let cameraOffsetX = 0;
  let audioStarted = false;
  let backgroundLayers = [];
  
  // Inicializa o background com paralaxe utilizando os caminhos corretos
  function initBackground() {
    backgroundLayers = [
      { image: (new Image()), parallaxFactor: 0.2 },
      { image: (new Image()), parallaxFactor: 0.4 },
      { image: (new Image()), parallaxFactor: 0.6 }
    ];
    backgroundLayers[0].image.src = "assets/bg_layer1.png";
    backgroundLayers[1].image.src = "assets/bg_layer2.png";
    backgroundLayers[2].image.src = "assets/bg_layer3.png";
    
    // Se ocorrer erro no carregamento, marcar uma flag "failed"
    backgroundLayers.forEach(layer => {
      layer.image.failed = false;
      layer.image.onload = () => {
        // Nenhuma ação necessária
      };
      layer.image.onerror = () => {
        console.error("Erro ao carregar o background: " + layer.image.src);
        layer.image.failed = true;
      };
    });
  }
  
  // Desenha o background com paralaxe; repete horizontalmente usando o tamanho real da imagem.
function drawBackground() {
  backgroundLayers.forEach(layer => {
    if (layer.image.complete && !layer.image.failed) {
      // Calcula a escala para que a altura da imagem seja igual à altura do canvas.
      let scale = canvas.height / layer.image.height;
      let scaledWidth = layer.image.width * scale;
      // Calcula o deslocamento horizontal com base no fator de paralaxe e na largura escalada.
      let offsetX = (-cameraOffsetX * layer.parallaxFactor) % scaledWidth;
      if (offsetX > 0) offsetX -= scaledWidth;
      // Desenha a imagem repetidamente horizontalmente até cobrir toda a largura do canvas.
      for (let x = offsetX; x < canvas.width; x += scaledWidth) {
        ctx.drawImage(layer.image, x, 0, scaledWidth, canvas.height);
      }
    } else {
      // Fallback: preenche com uma cor sólida baseada no parallax.
      let color = (layer.parallaxFactor === 0.2) ? "#444" : (layer.parallaxFactor === 0.4) ? "#555" : "#666";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  });
}
  
  function initGame() {
    const gameContainer = document.getElementById('gameContainer');
    canvas = document.getElementById('gameCanvas');
    canvas.width = gameContainer.clientWidth;
    canvas.height = gameContainer.clientHeight;
    ctx = canvas.getContext('2d');
    
    initBackground();
    
    // Cria os elementos do jogo (Player, MapManager, EnemyManager, Controls, Plataformas)
    player = new Player(100, canvas.height * 0.6);
    player.invulnerabilityTime = 0; // Definido no construtor, mas aqui garantimos
    mapManager = new MapManager(canvas.width, canvas.height);
    enemyManager = new EnemyManager();
    controls = new Controls();
    platforms = mapManager.generateInitialPlatforms();
    
    score = 0;
    player.health = 300;
    gameOver = false;
    lastTime = 0;
    document.getElementById('retryButton').style.display = 'none';
    
    // Inicia áudio, se aplicável
    if (!audioStarted && typeof audioManager !== 'undefined') {
      audioManager.playBackground();
      audioStarted = true;
    }
  }
  
  function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (player.invulnerabilityTime > 0) {
      player.invulnerabilityTime -= deltaTime;
      if (player.invulnerabilityTime < 0) player.invulnerabilityTime = 0;
    }
    
    // Game Over: se o player cair muito abaixo da tela
    if (player.y > canvas.height + 100) {
      gameOver = true;
    }
    
    if (gameOver) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(-cameraOffsetX, 0);
      platforms.forEach(platform => platform.draw(ctx));
      player.draw(ctx);
      enemyManager.draw(ctx);
      ctx.restore();
      
      ctx.fillStyle = 'white';
      ctx.font = '20px sans-serif';
      ctx.fillText(`FPS: ${Debug.currentFPS || '...'}`, canvas.width - 100, 30);
      ctx.fillText(`Score: ${score}`, 20, 30);
      ctx.fillText(`Health: ${player.health}`, 20, 60);
      
      ctx.fillStyle = 'white';
      ctx.font = '48px sans-serif';
      ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
      document.getElementById('retryButton').style.display = 'block';
      return;
    }
    
    controls.update();
    player.update(controls, deltaTime, platforms);
    platforms.forEach(platform => platform.update(deltaTime));
    enemyManager.update(deltaTime, player, platforms);
    
    // Checa colisões com inimigos (código omitido para brevidade, mas deve ser o mesmo)
    for (let i = enemyManager.groundEnemies.length - 1; i >= 0; i--) {
      let enemy = enemyManager.groundEnemies[i];
      if (checkCollision(player, enemy)) {
        if (player.vy > 0 && (player.y + player.height - enemy.y) < 20) {
          enemyManager.groundEnemies.splice(i, 1);
          player.vy = player.jumpStrength * 0.5;
          score += 100;
          if (typeof audioManager !== 'undefined') audioManager.play('jump');
        } else {
          gameOver = true;
          if (typeof audioManager !== 'undefined') audioManager.play('death');
        }
      }
    }
    for (let i = enemyManager.flyingEnemies.length - 1; i >= 0; i--) {
      let eagle = enemyManager.flyingEnemies[i];
      if (checkCollision(player, eagle)) {
        if (player.vy > 0 && (player.y + player.height - eagle.y) < 20) {
          enemyManager.flyingEnemies.splice(i, 1);
          player.vy = player.jumpStrength * 0.5;
          score += 100;
          if (typeof audioManager !== 'undefined') audioManager.play('jump');
        } else {
          if (player.invulnerabilityTime === 0) {
            player.health--;
            player.invulnerabilityTime = 1000;
            if (typeof audioManager !== 'undefined') audioManager.play('damage');
            if (player.health <= 0) {
              gameOver = true;
              if (typeof audioManager !== 'undefined') audioManager.play('death');
            }
          }
        }
      }
    }
    
    mapManager.update(player, platforms);
    cameraOffsetX = Math.max(0, player.x - canvas.width / 2);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    ctx.save();
    ctx.translate(-cameraOffsetX, 0);
    platforms.forEach(platform => platform.draw(ctx));
    player.draw(ctx);
    enemyManager.draw(ctx);
    ctx.restore();
    
    try {
      Debug.logFPS(deltaTime);
    } catch (e) {}
    
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText(`FPS: ${Debug.currentFPS || '...'}`, canvas.width - 100, 30);
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Health: ${player.health}`, 20, 60);
    
    requestAnimationFrame(gameLoop);
  }
  
  // Event listeners para o botão Retry e Start:
  document.getElementById('retryButton').addEventListener('click', () => {
    window.location.reload();
  });
  document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    initGame();
    requestAnimationFrame(gameLoop);
  });
});
