import { NPC } from './NPC.js';
export class Stroustrup extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, 'Bjarne Stroustrup', [
      '我是Bjarne Stroustrup，C++语言的创造者。',
      '1983年，我在C语言基础上加入了面向对象特性。',
      '继承、封装、多态——这是面向对象的三大支柱。',
      '踩Class方块可以获得新能力，这就是"继承"！',
      '内存泄漏黑洞会膨胀，等它缩小时踩它头顶！',
    ]);
    this.color = '#4a4a8a';
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
