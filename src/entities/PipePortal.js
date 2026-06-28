import { Entity } from './Entity.js';

/**
 * PipePortal - 管道传送门（世界4机制）
 * 踩上去传送到对应出口
 */
export class PipePortal extends Entity {
  constructor(x, y, pipeId, targetId) {
    super(x, y, 32, 32);
    this.solid = false;
    this.pipeId = pipeId;
    this.targetId = targetId;
    this.used = false;
    this.cooldown = 0;
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.used && this.cooldown <= 0) {
      this.used = true;
    }
  }

  render(ctx) {
    // 管道入口
    ctx.fillStyle = '#2a4a2a';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    // 箭头
    ctx.fillStyle = '#4ecca3';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↓', this.x + this.width / 2, this.y + this.height / 2 + 6);
    // 标签
    ctx.font = '8px monospace';
    ctx.fillText(this.pipeId, this.x + this.width / 2, this.y - 4);
  }
}
