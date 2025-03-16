// audio.js - Gerencia os efeitos sonoros e a música de fundo com volumes ajustados.
class AudioManager {
  constructor() {
    this.sounds = {};
    // Música de fundo com volume 1; outros efeitos com volume 0.5.
    this.loadSound('background', 'assets/background.mp3', 1);
    this.loadSound('jump', 'assets/jump.mp3', 0.5);
    this.loadSound('walk', 'assets/walk.mp3', 0.5);
    this.loadSound('damage', 'assets/damage.mp3', 0.5);
    this.loadSound('death', 'assets/death.mp3', 0.5);
  }
  
  loadSound(name, src, volume) {
    const audio = new Audio();
    if (audio.canPlayType('audio/mpeg')) {
      audio.src = src;
      audio.volume = volume;
      audio.load();
      this.sounds[name] = audio;
    } else {
      console.error(`Formato MP3 não suportado para o som ${name}.`);
    }
  }
  
  play(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      try {
        sound.currentTime = 0;
        sound.play().catch(e => console.error(`Erro ao tocar ${soundName}:`, e));
      } catch (e) {
        console.error(`Erro ao tocar ${soundName}:`, e);
      }
    }
  }
  
  stop(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (e) {
        console.error(`Erro ao parar ${soundName}:`, e);
      }
    }
  }
  
  playBackground() {
    const bg = this.sounds['background'];
    if (bg) {
      bg.loop = true;
      this.play('background');
    }
  }
}

const audioManager = new AudioManager();
