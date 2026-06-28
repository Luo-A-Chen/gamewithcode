import { Entity } from './Entity.js';

export class Switch extends Entity {
  constructor(x, y, switchId) {
    super(x, y, 32, 16);
    this.solid = false;
    this.switchId = switchId;
    this.activated = false;
    this.cooldown = 0;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.activated && this.cooldown <= 0) {
      // 玩家底部接触开关顶部即可触发
      var playerBottom = other.y + other.height;
      if (playerBottom >= this.y && playerBottom <= this.y + this.height + 8) {
        this.activated = true;
        this.cooldown = 0.5;
        // 让玩家站在开关上
        other.y = this.y - other.height;
        if (other.vy > 0) other.vy = 0;
        other.grounded = true;
      }
    }
  }

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
  }

  render(ctx) {
    // 底座
    ctx.fillStyle = '#444';
    ctx.fillRect(this.x, this.y + 10, this.width, 6);

    // 按钮
    ctx.fillStyle = this.activated ? '#4ecca3' : '#888';
    var btnY = this.activated ? this.y + 6 : this.y;
    var btnH = this.activated ? 10 : 16;
    ctx.fillRect(this.x + 2, btnY, this.width - 4, btnH);

    // 指示灯
    ctx.fillStyle = this.activated ? '#0f0' : '#600';
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + (this.activated ? 8 : 4), 3, 0, Math.PI * 2);
    ctx.fill();

    // 标签
    ctx.fillStyle = this.activated ? '#4ecca3' : '#aaa';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.activated ? '[ON]' : '[' + this.switchId + ']', this.x + this.width / 2, this.y + 26);
  }
}
