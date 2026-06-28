import { Entity } from './Entity.js';

/**
 * BugLog - Bug 日志
 * 隐藏收集物，记录真实历史上的著名 Bug
 */
export class BugLog extends Entity {
  constructor(x, y, logId) {
    super(x, y, 20, 20);
    this.solid = false;
    this.logId = logId;
    this.collected = false;

    // 闪烁动画
    this.blinkTimer = 0;
    this.blinkSpeed = 3;
    this.visible = true;

    // 颜色（绿色终端风格）
    this.color = '#4ecca3';
    this.bgColor = '#0a0a1a';
  }

  update(dt) {
    if (this.collected) return;

    this.blinkTimer += this.blinkSpeed * dt;
    this.visible = Math.sin(this.blinkTimer) > -0.3;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.collected) {
      this.collected = true;
      this.dead = true;
    }
  }

  render(ctx) {
    if (this.collected || !this.visible) return;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // 终端背景
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 终端边框
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Bug 图标
    ctx.fillStyle = this.color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', cx, cy + 4);
  }
}
