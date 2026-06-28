import { Entity } from './Entity.js';

/**
 * NPC - 非玩家角色基类
 * 靠近后按上键触发对话
 */
export class NPC extends Entity {
  constructor(x, y, width, height, name, dialogues) {
    super(x, y, width, height);
    this.solid = false;
    this.isNPC = true;
    this.name = name;
    this.dialogues = dialogues; // 对话文本数组
    this.dialogIndex = 0;
    this.isTalking = false;
    this.talkRange = 60; // 触发对话的距离
    this.showPrompt = false; // 显示"按上键对话"提示
    this.promptAlpha = 0;
    this.color = '#4ecca3';
  }

  /**
   * 检测玩家是否在对话范围内
   */
  checkPlayerNearby(player) {
    const dx = Math.abs((player.x + player.width / 2) - (this.x + this.width / 2));
    const dy = Math.abs((player.y + player.height / 2) - (this.y + this.height / 2));
    const near = dx < this.talkRange && dy < this.talkRange;

    this.showPrompt = near && !this.isTalking;
    return near;
  }

  /**
   * 开始对话
   */
  startDialog() {
    if (this.dialogues.length === 0) return;
    this.isTalking = true;
    this.dialogIndex = 0;
  }

  /**
   * 下一句对话
   */
  nextDialog() {
    this.dialogIndex++;
    if (this.dialogIndex >= this.dialogues.length) {
      this.endDialog();
    }
  }

  /**
   * 结束对话
   */
  endDialog() {
    this.isTalking = false;
    this.dialogIndex = 0;
  }

  update(dt) {
    // 提示文字淡入淡出
    if (this.showPrompt) {
      this.promptAlpha = Math.min(1, this.promptAlpha + dt * 5);
    } else {
      this.promptAlpha = Math.max(0, this.promptAlpha - dt * 5);
    }
  }

  render(ctx) {
    // NPC 身体
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 名字标签
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y - 8);

    // 对话提示
    if (this.promptAlpha > 0) {
      ctx.globalAlpha = this.promptAlpha;
      ctx.fillStyle = '#ffd700';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillText('↑ 对话', this.x + this.width / 2, this.y - 22);
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 渲染对话框（在 UI 层绘制）
   */
  renderDialog(ctx, canvasWidth, canvasHeight) {
    if (!this.isTalking) return;

    const text = this.dialogues[this.dialogIndex];
    if (!text) return;

    // 对话框背景
    const boxHeight = 100;
    const boxY = canvasHeight - boxHeight - 20;
    const boxX = 40;
    const boxWidth = canvasWidth - 80;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // NPC 名字
    ctx.fillStyle = '#4ecca3';
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.name, boxX + 16, boxY + 24);

    // 对话文本
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(text, boxX + 16, boxY + 50);

    // 继续提示
    const isLast = this.dialogIndex >= this.dialogues.length - 1;
    ctx.fillStyle = '#888';
    ctx.font = '12px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      isLast ? '按空格关闭' : '按空格继续 ▶',
      boxX + boxWidth - 16,
      boxY + boxHeight - 12
    );

    // 进度指示
    ctx.textAlign = 'center';
    ctx.fillText(
      `${this.dialogIndex + 1}/${this.dialogues.length}`,
      boxX + boxWidth / 2,
      boxY + boxHeight - 12
    );
  }
}
