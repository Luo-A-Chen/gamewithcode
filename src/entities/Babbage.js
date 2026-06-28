import { NPC } from './NPC.js';

/**
 * Babbage - 查尔斯·巴贝奇
 * 世界1 NPC，给玩家操作提示
 */
export class Babbage extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, '巴贝奇', [
      '你好！我是查尔斯·巴贝奇，差分机的发明者。',
      '这个世界被 Bug 侵蚀了，需要你来修复！',
      '操作说明：← → 移动，空格跳跃（可二段跳）',
      '一路向右走，收集金色菱形碎片。',
      '遇到敌人可以踩它的头。',
      '最右边有一个大 Boss，踩它头顶 3 次就能击败它！',
      '小心 Boss 发射的齿轮弹幕，左右躲避即可。',
      '去吧，勇士！修复历史的重任就交给你了！',
    ]);
    this.color = '#b8860b';
  }

  render(ctx) {
    // 身体
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 帽子
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
