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

    // 标记当前关卡完成
    var current = game.levelManager.currentLevelName || 'level1';
    if (game.completedLevels.indexOf(current) < 0) {
      game.completedLevels.push(current);
    }
    game.saveManager.save(game);

    // 确定下一关
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
      ctx.fillText('得分: ' + game.score, width / 2, 230);

      // 通关奖励
      if (game._lastReward) {
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px "Segoe UI", sans-serif';
        ctx.fillText('获得通关道具', width / 2, 270);

        // 道具框
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(width / 2 - 100, 285, 200, 60);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.fillText(game._lastReward.name, width / 2, 310);

        ctx.fillStyle = '#aaa';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillText(game._lastReward.desc, width / 2, 332);
      }

      ctx.font = '36px "Segoe UI", sans-serif';
      ctx.fillText('★ ★ ★', width / 2, 380);

      ctx.fillStyle = '#888';
      ctx.font = '16px "Segoe UI", sans-serif';
      if (this.nextLevel) {
        ctx.fillText('按 Space/Enter 进入下一关', width / 2, 430);
      } else {
        ctx.fillText('恭喜通关！按 Space/Enter 返回主菜单', width / 2, 430);
      }
    }

    ctx.globalAlpha = 1;
  }
}
