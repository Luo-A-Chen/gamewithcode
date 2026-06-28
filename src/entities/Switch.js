import { Entity } from './Entity.js';

/**
 * Switch - 电路开关
 * 踩上去激活，连接对应的门
 */
export class Switch extends Entity {
  constructor(x, y, switchId) {
    super(x, y, 32, 16);
    this.solid = false;
    this.switchId = switchId;
    this.activated = false;
    this.color_off = '#555';
    this.color_on = '#4ecca3';
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.activated) {
      // 玩家踩上去
      if (other.y + other.height <= this.y + 8 && other.vy >= 0) {
        this.activated = true;
        other.grounded = true;
        other.y = this.y - other.height;
        other.vy = 0;
      }
    }
  }

  update(dt) {
    // 开关无特殊更新
  }

  render(ctx) {
    // 底座
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x, this.y + 8, this.width, 8);

    // 按钮
    ctx.fillStyle = this.activated ? this.color_on : this.color_off;
    ctx.fillRect(this.x + 4, this.activated ? this.y + 4 : this.y, this.width - 8, this.activated ? 12 : 16);

    // 指示灯
    ctx.fillStyle = this.activated ? '#0f0' : '#600';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + (this.activated ? 8 : 4), 3, 0, Math.PI * 2);
    ctx.fill();

    // 标签
    ctx.fillStyle = '#aaa';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.switchId, this.x + this.width / 2, this.y + 24);
  }
}
