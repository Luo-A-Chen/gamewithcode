import { NPC } from './NPC.js';
export class Hopper extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, 'Grace Hopper', [
      '你好！我是Grace Hopper，计算机先驱。',
      '1944年，我为Mark I编写了第一个编译器。',
      '"Bug"这个词就是从我发现的一只飞蛾开始的！',
      '收集打孔卡片，学习编程语言的诞生。',
      '前方的递归怪物代表无限循环，找到EXIT出口就能击败它！',
    ]);
    this.color = '#8b6914';
  }
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 8);
    if (this.promptAlpha > 0) {
      ctx.globalAlpha = this.promptAlpha;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('按 ↑ 对话', this.x + this.width / 2, this.y - 22);
      ctx.globalAlpha = 1;
    }
  }
}
