import { State } from '../core/State.js';

/**
 * GameOverState - 游戏结束状态
 */
export class GameOverState extends State {
  constructor() {
    super();
    this.selectedIndex = 0;
    this.options = ['重试', '返回主菜单'];
    this.fadeAlpha = 0;
    this.hoverIndex = -1;
  }

  enter(game) {
    this.selectedIndex = 0;
    this.fadeAlpha = 0;
    this.hoverIndex = -1;
  }

  getOptionRect(game, index) {
    const { width } = game;
    const y = 300 + index * 50;
    return { x: width / 2 - 100, y: y - 20, w: 200, h: 36 };
  }

  handleInput(game, input) {
    if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    }
    if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
      this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
    }

    // 鼠标悬停
    this.hoverIndex = -1;
    for (let i = 0; i < this.options.length; i++) {
      if (input.isMouseInRect(...Object.values(this.getOptionRect(game, i)))) {
        this.hoverIndex = i;
        this.selectedIndex = i;
      }
    }

    const confirmed = input.isJustPressed('Space') || input.isJustPressed('Enter');
    const clicked = this.hoverIndex >= 0 && input._mouseClickedThisFrame;

    if (confirmed || clicked) {
      game.audio.playMenuConfirm();
      switch (this.selectedIndex) {
        case 0: game.loadLevel('level1'); game.stateMachine.changeState('playing'); break;
        case 1: game.stateMachine.changeState('menu'); break;
      }
    }
  }

  update(game, dt) {
    this.fadeAlpha = Math.min(1, this.fadeAlpha + dt * 2);
  }

  render(game) {
    const { ctx, width, height } = game;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = this.fadeAlpha * 0.7;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    ctx.globalAlpha = this.fadeAlpha;

    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 42px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', width / 2, 170);

    ctx.fillStyle = '#aaa';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText(`得分: ${game.score}`, width / 2, 230);

    for (let i = 0; i < this.options.length; i++) {
      const y = 300 + i * 50;
      const selected = i === this.selectedIndex;
      const hovered = i === this.hoverIndex;

      if (hovered) {
        const rect = this.getOptionRect(game, i);
        ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }

      if (selected) {
        ctx.fillStyle = '#e94560';
        ctx.fillRect(width / 2 - 90, y - 18, 6, 24);
      }

      ctx.fillStyle = selected ? '#fff' : '#888';
      ctx.font = `${selected ? 'bold ' : ''}20px "Segoe UI", sans-serif`;
      ctx.fillText(this.options[i], width / 2, y);
    }

    ctx.globalAlpha = 1;
  }
}
