import { NPC } from './NPC.js';

/**
 * Turing - 图灵的影子
 * 世界2 NPC
 */
export class Turing extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, '图灵', [
      '欢迎来到电子黎明。我是艾伦·图灵的影子。',
      '1943年，ENIAC诞生了——世界上第一台电子计算机。',
      '它用18000个真空管取代了齿轮，计算速度提升了1000倍。',
      '看到那些开关了吗？踩上去可以打开对应的门。',
      '这个世界的核心是二进制：0和1，开和关。',
      '前方有一个暴走的继电器，它被Bug侵蚀了。',
      '等它过载时（变红闪烁），跳到它头顶攻击！',
      '去吧，用0和1的力量修复这个时代！',
    ]);
    this.color = '#4a4a6e';
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 高帽
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x + 2, this.y - 12, this.width - 4, 12);
    ctx.fillRect(this.x - 2, this.y - 4, this.width + 4, 4);

    // 眼睛
    ctx.fillStyle = '#aaa';
    ctx.fillRect(this.x + 6, this.y + 10, 4, 4);
    ctx.fillRect(this.x + 18, this.y + 10, 4, 4);

    ctx.fillStyle = '#fff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 18);

    if (this.promptAlpha > 0) {
      ctx.globalAlpha = this.promptAlpha;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('按 ↑ 对话', this.x + this.width / 2, this.y - 32);
      ctx.globalAlpha = 1;
    }
  }
}
