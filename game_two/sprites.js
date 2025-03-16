// sprites.js - Nova implementação da classe Sprite para controle de animação

class Sprite {
  /**
   * Cria um objeto Sprite para animar uma folha de sprite.
   * @param {string} src - Caminho da imagem.
   * @param {number} columns - Número de colunas na folha.
   * @param {number} rows - Número de linhas na folha.
   * @param {number} frameDuration - Duração de cada frame (em milissegundos).
   */
  constructor(src, columns, rows, frameDuration = 200) {
    this.image = new Image();
    this.image.src = src;
    this.columns = columns;
    this.rows = rows;
    this.frameDuration = frameDuration;
    this.totalFrames = columns * rows;
    this.currentFrame = 0;
    this.elapsedTime = 0;
    this.loaded = false;
    this.failed = false;
    this.frameWidth = 0;
    this.frameHeight = 0;
    
    this.image.onload = () => {
      this.loaded = true;
      this.frameWidth = this.image.width / this.columns;
      this.frameHeight = this.image.height / this.rows;
    };
    
    this.image.onerror = () => {
      console.error("Erro ao carregar a imagem: " + src);
      this.failed = true;
    };
  }
  
  /**
   * Atualiza a animação com base no deltaTime.
   * Esse método incrementa o tempo decorrido e, se ultrapassar a duração do frame, avança para o próximo.
   * Se você quiser controlar manualmente o frame (por exemplo, para ciclos específicos), você pode ignorar esta atualização.
   * @param {number} deltaTime - Tempo decorrido desde a última atualização (ms).
   */
  update(deltaTime) {
    if (!this.loaded || this.failed) return;
    this.elapsedTime += deltaTime;
    if (this.elapsedTime >= this.frameDuration) {
      this.elapsedTime -= this.frameDuration;
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
    }
  }
  
  /**
   * Desenha um frame específico da folha.
   * @param {CanvasRenderingContext2D} ctx - O contexto do canvas.
   * @param {number} frame - O índice do frame a ser desenhado.
   * @param {number} x - Posição x onde desenhar.
   * @param {number} y - Posição y onde desenhar.
   * @param {number} width - Largura do desenho.
   * @param {number} height - Altura do desenho.
   */
  drawFrame(ctx, frame, x, y, width, height) {
    if (!this.loaded || this.failed) return;
    let col = frame % this.columns;
    let row = Math.floor(frame / this.columns);
    ctx.drawImage(
      this.image,
      col * this.frameWidth,
      row * this.frameHeight,
      this.frameWidth,
      this.frameHeight,
      x,
      y,
      width,
      height
    );
  }
}

window.Sprite = Sprite;
