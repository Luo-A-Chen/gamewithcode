import { State } from '../core/State.js';

export class LevelClearState extends State {
  constructor() {
    super();
    this.fadeAlpha = 0;
    this.showStats = false;
    this.statsTimer = 0;
    this.nextLevel = null;
  }

  enter(game) {
    this.fadeAlpha = 0;
    this.showStats = false;
    this.statsTimer = 0;

    // 确定下一关
    var current = game.levelManager.currentLevelName || 'level1';
    var levelOrder = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'level7'];
    var idx = levelOrder.indexOf(current);
    this.nextLevel = (idx >= 0 && idx < levelOrder.length - 1) ? levelOrder[idx + 1] : null;
  }

  handleInput(game, input) {
    if (this.showStats && (input.isJustPressed('Space') || input.isJustPressed('Enter') || input._mouseClickedThisFrame)) {
      if (this.nextLevel) {
        game.loadLevel(this.nextLevel);
        game.stateMachine.changeState('playing');
      } else {
        game.stateMachine.changeState('menu');
      }
    }
  }

  update(game, dt) {
    this.fadeAlpha = Math.min(1, this.fadeAlpha + dt * 2);
    this.statsTimer += dt;
    if (this.statsTimer > 1) {
      this.showStats = true;
    }
  }

  render(game) {
    var ctx = game.ctx;
    var width = game.width;
    var height = game.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = this.fadeAlpha;

    ctx.fillStyle = '#4ecca3';
    ctx.font = 'bold 42px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('关卡通关！', width / 2, 160);

    if (this.showStats) {
      ctx.fillStyle = '#fff';
      ctx.font = '20px "Segoe UI", sans-serif';
      ctx.fillText('得分: ' + game.score, width / 2, 240);

      ctx.font = '36px "Segoe UI", sans-serif';
      ctx.fillText('★ ★ ★', width / 2, 300);

      ctx.fillStyle = '#888';
      ctx.font = '16px "Segoe UI", sans-serif';
      if (this.nextLevel) {
        ctx.fillText('按 Space/Enter 进入下一关', width / 2, 380);
      } else {
        ctx.fillText('恭喜通关！按 Space/Enter 返回主菜单', width / 2, 380);
      }
    }

    ctx.globalAlpha = 1;
  }
}
