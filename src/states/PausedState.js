import { State } from '../core/State.js';

/**
 * PausedState - 暂停状态
 * 支持继续、存档、读档、重新开始、返回主菜单
 */
export class PausedState extends State {
  constructor() {
    super();
    this.selectedIndex = 0;
    this.options = ['继续游戏', '保存进度', '重新开始', '返回主菜单'];
    this.hoverIndex = -1;
    this.saveMessage = '';
    this.saveMessageTimer = 0;
  }

  enter(game) {
    this.selectedIndex = 0;
    this.hoverIndex = -1;
    this.saveMessage = '';
    this.saveMessageTimer = 0;
  }

  getOptionRect(game, index) {
    const { width } = game;
    const y = 220 + index * 50;
    return { x: width / 2 - 130, y: y - 20, w: 260, h: 36 };
  }

  handleInput(game, input) {
    if (input.isJustPressed('Escape')) {
      game.stateMachine.changeState('playing');
      return;
    }

    if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      game.audio.playMenuSelect();
    }
    if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
      this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
      game.audio.playMenuSelect();
    }

    // 鼠标悬停
    this.hoverIndex = -1;
    for (let i = 0; i < this.options.length; i++) {
      const rect = this.getOptionRect(game, i);
      if (input.isMouseInRect(rect.x, rect.y, rect.w, rect.h)) {
        this.hoverIndex = i;
        if (this.selectedIndex !== i) game.audio.playMenuSelect();
        this.selectedIndex = i;
      }
    }

    const confirmed = input.isJustPressed('Space') || input.isJustPressed('Enter');
    const clicked = this.hoverIndex >= 0 && input._mouseClickedThisFrame;

    if (confirmed || clicked) {
      game.audio.playMenuConfirm();

      switch (this.selectedIndex) {
        case 0: // 继续
          game.stateMachine.changeState('playing');
          break;
        case 1: // 保存
          if (game.saveManager.save(game)) {
            this.saveMessage = '✓ 进度已保存';
          } else {
            this.saveMessage = '✗ 保存失败';
          }
          this.saveMessageTimer = 2;
          break;
        case 2: // 重新开始
          game.saveManager.deleteSave();
          game.loadLevel('level1');
          game.stateMachine.changeState('playing');
          break;
        case 3: // 返回主菜单
          game.saveManager.save(game); // 自动保存
          game.stateMachine.changeState('menu');
          break;
      }
    }
  }

  update(game, dt) {
    if (this.saveMessageTimer > 0) {
      this.saveMessageTimer -= dt;
    }
  }

  render(game) {
    const { ctx, width, height } = game;

    // 渲染游戏画面（冻结状态）
    game.stateMachine.states.playing.render(game);

    // 遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, width, height);

    // 标题
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂停', width / 2, 150);

    // 菜单选项
    for (let i = 0; i < this.options.length; i++) {
      const y = 220 + i * 50;
      const selected = i === this.selectedIndex;
      const hovered = i === this.hoverIndex;

      if (hovered) {
        const rect = this.getOptionRect(game, i);
        ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }

      if (selected) {
        ctx.fillStyle = '#e94560';
        ctx.fillRect(width / 2 - 120, y - 18, 6, 24);
      }

      ctx.fillStyle = selected ? '#fff' : '#888';
      ctx.font = `${selected ? 'bold ' : ''}20px "Segoe UI", sans-serif`;
      ctx.fillText(this.options[i], width / 2, y);
    }

    // 保存成功提示
    if (this.saveMessageTimer > 0) {
      ctx.globalAlpha = Math.min(1, this.saveMessageTimer);
      ctx.fillStyle = '#4ecca3';
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.fillText(this.saveMessage, width / 2, height - 80);
      ctx.globalAlpha = 1;
    }

    // 底部提示
    ctx.fillStyle = '#555';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('ESC 返回游戏', width / 2, height - 40);
  }
}
