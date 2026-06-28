import { InputManager } from './InputManager.js';
import { Camera } from './Camera.js';
import { Player } from '../entities/Player.js';
import { LevelManager } from '../levels/LevelManager.js';
import { Renderer } from './Renderer.js';
import { CollisionSystem } from './CollisionSystem.js';
import { GameStateMachine } from './GameStateMachine.js';
import { ParticleSystem } from './ParticleSystem.js';
import { UIManager } from '../ui/UIManager.js';
import { AudioManager } from './AudioManager.js';
import { SaveManager } from './SaveManager.js';
import { TouchController } from './TouchController.js';
import { MenuState } from '../states/MenuState.js';
import { PlayingState } from '../states/PlayingState.js';
import { PausedState } from '../states/PausedState.js';
import { GameOverState } from '../states/GameOverState.js';
import { LevelClearState } from '../states/LevelClearState.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    this.input = new InputManager();
    this.touch = new TouchController(canvas);
    this.input.setTouch(this.touch);
    this.camera = new Camera(this.width, this.height);
    this.renderer = new Renderer(this.ctx);
    this.collision = new CollisionSystem();
    this.levelManager = new LevelManager();

    this.player = null;
    this.entities = [];
    this.running = false;
    this.lastTime = 0;
    this.score = 0;
    this.completedLevels = [];

    this.particles = new ParticleSystem();
    this.ui = new UIManager();
    this.audio = new AudioManager();
    this.saveManager = new SaveManager();

    this.stateMachine = new GameStateMachine(this);
    this.stateMachine.register('menu', new MenuState());
    this.stateMachine.register('playing', new PlayingState());
    this.stateMachine.register('paused', new PausedState());
    this.stateMachine.register('gameover', new GameOverState());
    this.stateMachine.register('levelclear', new LevelClearState());
  }

  start() {
    this.running = true;

    // 首次交互时初始化音频
    const initAudio = () => {
      this.audio.init();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);

    this.stateMachine.changeState('menu');
    requestAnimationFrame((t) => this.loop(t));
  }

  loadLevel(name) {
    var level = this.levelManager.load(name);
    this.player = new Player(level.spawn.x, level.spawn.y);
    this.entities = [this.player].concat(level.entities);
    this.camera.follow(this.player);
    this.score = 0;
    var save = this.saveManager.load();
    if (save && save.progress && save.progress.completedLevels) {
      this.completedLevels = save.progress.completedLevels;
    }
  }

  loop(timestamp) {
    if (!this.running) return;

    try {
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
      this.lastTime = timestamp;

      this.input.update();
      this.stateMachine.handleInput(this.input);
      this.stateMachine.update(dt);
      this.stateMachine.render();
    } catch (e) {
      console.error('Game loop error:', e);
      // 显示错误而不是白屏
      this.ctx.fillStyle = '#0f3460';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#e94560';
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText('Error: ' + e.message, 20, 40);
      this.ctx.fillText(e.stack ? e.stack.split('\n')[1] : '', 20, 60);
    }

    requestAnimationFrame((t) => this.loop(t));
  }
}
