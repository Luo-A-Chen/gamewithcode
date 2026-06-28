import { NPC } from './NPC.js';

export class Babbage extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, '巴贝奇', [
      '你好！我是查尔斯·巴贝奇，差分机的发明者。',
      '在我那个时代，数学家要花几年手算对数表，还经常出错。',
      '我发现：任何多项式都可以用纯加法算出来！',
      '这就是"差分法"：f(x)=x²+x+1',
      'f(0)=1, f(1)=3, f(2)=7, f(3)=13',
      '看到那些齿轮了吗？把它们放到对应数值的槽位。',
      '按 Shift/E 可以把齿轮扔出去（弧线，3-4格距离）。',
      '放错位置齿轮会弹开，放对才固定。',
      '全部放好后，差分机会自动计算——这就是自动化的起点！',
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
