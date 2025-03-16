/* controls.js - Registra controles apenas quando o clique/toque ocorre exatamente nos botões */

class Controls {
  constructor() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.setupKeyboard();
    this.setupMobileButtons();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.jump = true;
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') this.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') this.jump = false;
    });
  }

  setupMobileButtons() {
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnJump = document.getElementById('btnJump');

    // Registra os eventos somente se o clique/touch ocorrer sobre o botão
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); this.left = true; });
    btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); this.left = false; });
    btnLeft.addEventListener('mousedown', (e) => { e.preventDefault(); this.left = true; });
    btnLeft.addEventListener('mouseup', (e) => { e.preventDefault(); this.left = false; });

    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); this.right = true; });
    btnRight.addEventListener('touchend', (e) => { e.preventDefault(); this.right = false; });
    btnRight.addEventListener('mousedown', (e) => { e.preventDefault(); this.right = true; });
    btnRight.addEventListener('mouseup', (e) => { e.preventDefault(); this.right = false; });

    btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump = true; });
    btnJump.addEventListener('touchend', (e) => { e.preventDefault(); this.jump = false; });
    btnJump.addEventListener('mousedown', (e) => { e.preventDefault(); this.jump = true; });
    btnJump.addEventListener('mouseup', (e) => { e.preventDefault(); this.jump = false; });
  }

  update() {
    // Atualizações por frame se necessário
  }
}
