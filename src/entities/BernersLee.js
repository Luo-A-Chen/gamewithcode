import { NPC } from './NPC.js';
export class BernersLee extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, 'Tim Berners-Lee', [
      '我是Tim Berners-Lee，万维网的发明者。',
      '1989年，我在CERN发明了HTML和HTTP协议。',
      '超链接是Web的核心——点击就能跳转到新世界。',
      '踩蓝色[link]方块可以传送到远处！',
      'XSS虫群会四散攻击，等核心暴露时踩它！',
    ]);
    this.color = '#2a4a8a';
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
