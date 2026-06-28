import { NPC } from './NPC.js';
export class AINPC extends NPC {
  constructor(x, y) {
    super(x, y, 28, 44, 'AI 研究者', [
      '欢迎来到智能纪元！这是最后的时代。',
      '深度学习让机器学会了看、听、甚至创造。',
      '神经网络就像这些发光的节点，互相连接传递信息。',
      '靠近AI节点会自动搭建平台，这就是AI辅助！',
      'Bug King是所有Bug的集合体，用你学到的一切击败它！',
      '这是最后的战斗，加油！',
    ]);
    this.color = '#6a4a8a';
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
