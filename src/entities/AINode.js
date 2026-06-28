import { Entity } from './Entity.js';

/**
 * AINode - AI节点（世界7机制）
 * 靠近时自动为玩家搭建平台
 */
export class AINode extends Entity {
  constructor(x, y) {
    super(x, y, 24, 24);
    this.solid = false;
    this.activated = false;
    this.platformTimer = 0;
    this.pulseTimer = 0;
  }

  update(dt) {
    this.pulseTimer += dt;
    if (this.activated) {
      this.platformTimer += dt;
    }
  }

  onCollide(other) {
    if (other.constructor.name === 'Player') {
      this.activated = true;
    }
  }

  render(ctx) {
    var pulse = Math.sin(this.pulseTimer * 4) * 0.3 + 0.7;
    ctx.fillStyle = this.activated ? ('rgba(78, 204, 163, ' + pulse + ')') : '#333';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 神经网络连线效果
    if (this.activated) {
      ctx.strokeStyle = 'rgba(78, 204, 163, 0.3)';
      for (var i = 0; i < 3; i++) {
        var a = (i / 3) * Math.PI * 2 + this.pulseTimer;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2 + Math.cos(a) * 20, this.y + this.height / 2 + Math.sin(a) * 20);
        ctx.stroke();
      }
    }
  }
}
