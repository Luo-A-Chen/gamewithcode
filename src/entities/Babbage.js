import { NPC } from './NPC.js';

export class Babbage extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, '巴贝奇', [
      '你好！我是查尔斯·巴贝奇，差分机的发明者。',
      '1822年，我设计了差分机——用齿轮计算数学表。',
      '原理是"差分法"：把复杂计算变成简单的加法。',
      '看那些齿轮吗？推动它们到正确位置，就能启动机关。',
      '操作：← → 移动，空格跳跃（可二段跳），↑ 对话',
      '一路向右走，收集金色碎片，打败被Bug侵蚀的差分机！',
      'Boss会发射齿轮弹幕，等它头顶变红时跳踩攻击！',
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
