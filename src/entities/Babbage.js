import { NPC } from './NPC.js';

export class Babbage extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, '巴贝奇', [
      '你好！我是查尔斯·巴贝奇，差分机的发明者。',
      '1822年，我设计了差分机——用齿轮计算数学表。',
      '原理是"差分法"：f(x)=x²+x+1',
      'f(0)=1, f(1)=3, f(2)=7, f(3)=13',
      '看那些带数字的齿轮吗？把它们推到标注相同数字的槽位！',
      '全部放对后，差分法会被验证，Boss就会出现！',
      '操作：← → 移动，空格跳跃，靠近齿轮推它移动',
      '去吧，用齿轮的力量修复这段历史！',
    ]);
    this.color = '#b8860b';
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 帽子（维多利亚时代风格）
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(this.x - 2, this.y - 8, this.width + 4, 8);
    ctx.fillRect(this.x + 4, this.y - 16, this.width - 8, 8);

    // 眼镜
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.3, this.y + 12, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x + this.width * 0.7, this.y + 12, 4, 0, Math.PI * 2);
    ctx.stroke();

    // 名字标签
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 20);

    // 对话提示
    if (this.promptAlpha > 0) {
      ctx.globalAlpha = this.promptAlpha;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.fillText('按 ↑ 对话', this.x + this.width / 2, this.y - 34);
      ctx.globalAlpha = 1;
    }
  }
}
