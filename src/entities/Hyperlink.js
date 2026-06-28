import { Entity } from './Entity.js';

/**
 * Hyperlink - 超链接传送门（世界6机制）
 * 踩上传送到指定位置
 */
export class Hyperlink extends Entity {
  constructor(x, y, targetX, targetY) {
    super(x, y, 32, 16);
    this.solid = false;
    this.targetX = targetX;
    this.targetY = targetY;
    this.used = false;
    this.cooldown = 0;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.used && this.cooldown <= 0) {
      other.x = this.targetX;
      other.y = this.targetY;
      other.vx = 0;
      other.vy = 0;
      this.used = true;
      this.cooldown = 1;
      setTimeout(function() { this.used = false; }.bind(this), 1000);
    }
  }

  render(ctx) {
    ctx.fillStyle = '#1a1a4e';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#4e88ff';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[link]', this.x + this.width / 2, this.y + 12);
  }
}
