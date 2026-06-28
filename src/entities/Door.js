import { Entity } from './Entity.js';

/**
 * Door - 电路门
 * 未通电时完全封闭，通电后滑开
 */
export class Door extends Entity {
  constructor(x, y, height, switchId) {
    super(x, y, 24, height);
    this.solid = true;
    this.switchId = switchId;
    this.open = false;
    this.openProgress = 0;
  }

  update(dt) {
    if (this.open && this.openProgress < 1) {
      this.openProgress = Math.min(1, this.openProgress + dt * 2);
      if (this.openProgress >= 1) {
        this.solid = false;
      }
    }
  }

  activate() {
    this.open = true;
  }

  render(ctx) {
    var slideOffset = this.openProgress * (this.width + 10);

    // 门框
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x - 4, this.y, this.width + 8, this.height);

    // 门体
    if (this.openProgress < 1) {
      ctx.fillStyle = this.open ? '#2a5a2a' : '#8b0000';
      ctx.fillRect(this.x - slideOffset, this.y, this.width, this.height);
      ctx.fillRect(this.x + slideOffset, this.y, this.width, this.height);
    }

    // 电路纹理
    ctx.strokeStyle = this.open ? 'rgba(78, 204, 163, 0.6)' : 'rgba(255, 50, 50, 0.4)';
    ctx.lineWidth = 2;
    for (var i = 0; i < this.height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + i);
      ctx.lineTo(this.x + this.width, this.y + i + 6);
      ctx.stroke();
    }

    // 状态灯
    var lightY = this.y + this.height / 2;
    ctx.fillStyle = this.open ? '#0f0' : '#f00';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, lightY, 5, 0, Math.PI * 2);
    ctx.fill();

    // 标签
    ctx.fillStyle = this.open ? '#4ecca3' : '#e94560';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.open ? 'OPEN' : 'LOCKED', this.x + this.width / 2, this.y - 8);
  }
}
