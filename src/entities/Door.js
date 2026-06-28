import { Entity } from './Entity.js';

/**
 * Door - 电路门
 * 对应开关激活后打开
 */
export class Door extends Entity {
  constructor(x, y, height, switchId) {
    super(x, y, 16, height);
    this.solid = true;
    this.switchId = switchId;
    this.open = false;
    this.openProgress = 0; // 0 = 关闭, 1 = 完全打开
    this.color = '#8b0000';
    this.colorOpen = '#2a5a2a';
  }

  update(dt) {
    if (this.open && this.openProgress < 1) {
      this.openProgress = Math.min(1, this.openProgress + dt * 2);
      if (this.openProgress >= 1) {
        this.solid = false;
      }
    }
  }

  /**
   * 被对应开关激活
   */
  activate() {
    this.open = true;
  }

  render(ctx) {
    var slideOffset = this.openProgress * this.width;

    // 门框
    ctx.fillStyle = '#444';
    ctx.fillRect(this.x - 2, this.y, this.width + 4, this.height);

    // 门体（滑动效果）
    ctx.fillStyle = this.open ? this.colorOpen : this.color;
    ctx.fillRect(this.x - slideOffset, this.y, this.width, this.height);

    // 电路纹理
    ctx.strokeStyle = this.open ? 'rgba(78, 204, 163, 0.5)' : 'rgba(255, 100, 100, 0.3)';
    ctx.lineWidth = 1;
    for (var i = 0; i < this.height; i += 8) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + i);
      ctx.lineTo(this.x + this.width, this.y + i + 4);
      ctx.stroke();
    }

    // 状态指示
    if (!this.open) {
      ctx.fillStyle = '#f00';
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
