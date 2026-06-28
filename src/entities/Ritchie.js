import { NPC } from './NPC.js';
export class Ritchie extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, 'Dennis Ritchie', [
      '我是Dennis Ritchie，C语言和Unix的创造者。',
      '1972年，我在贝尔实验室创造了C语言。',
      'C语言像一把手术刀——精准、锋利，也容易伤到自己。',
      '看到那些管道了吗？Unix的哲学就是用管道连接程序。',
      '前方的野指针幽灵会瞬移，等它硬直时踩它！',
    ]);
    this.color = '#4a6a4a';
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
