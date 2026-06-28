import { Entity } from './Entity.js';

/**
 * Enemy - 敌人基类
 * 简单巡逻型敌人，碰到玩家可被踩死
 */
export class Enemy extends Entity {
  constructor(x, y, patrolRange = 100) {
    super(x, y, 32, 32);
    this.speed = 60;
    this.patrolRange = patrolRange;
    this.startX = x;
    this.direction = 1;
    this.color = '#ff6b6b';
    this.alive = true;
  }

  update(dt) {
    if (!this.alive) return;

    this.x += this.speed * this.direction * dt;

    // 巡逻范围
    if (this.x > this.startX + this.patrolRange) {
      this.direction = -1;
    } else if (this.x < this.startX - this.patrolRange) {
      this.direction = 1;
    }
  }

  onCollide(other) {
    if (other.constructor.name !== 'Player') return;
    if (!this.alive) return;

    // 被玩家踩（玩家从上方落下）
    if (other.vy > 0 && other.y + other.height - 10 < this.y) {
      this.alive = false;
      this.dead = true;
      other.vy = -300; // 弹起
    } else {
      // 伤害玩家
      const knockbackX = other.x < this.x ? -200 : 200;
      other.takeDamage(1, knockbackX);
    }
  }

  render(ctx) {
    if (!this.alive) return;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 眼睛
    ctx.fillStyle = '#fff';
    const eyeX = this.direction > 0
      ? this.x + this.width * 0.6
      : this.x + this.width * 0.2;
    ctx.fillRect(eyeX, this.y + 8, 5, 5);
  }
}
