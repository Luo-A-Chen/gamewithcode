import { Entity } from './Entity.js';

/**
 * PushableBox - 可推动的箱子/齿轮
 * 世界1核心机制：推箱子到指定位置触发机关
 */
export class PushableBox extends Entity {
  constructor(x, y) {
    super(x, y, 32, 32);
    this.speed = 150;        // 被推动时的速度
    this.friction = 0.85;    // 摩擦力（减速）
    this.pushDir = 0;        // 当前被推动的方向
    this.isBeingPushed = false;
    this.color = '#b8860b';  // 深金色（铜色）
    this.borderColor = '#daa520';
  }

  update(dt) {
    // 被推动时移动
    if (this.isBeingPushed) {
      this.vx = this.pushDir * this.speed;
    } else {
      // 自然减速
      this.vx *= this.friction;
      if (Math.abs(this.vx) < 1) this.vx = 0;
    }

    // 应用重力
    this.vy += 980 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 重置
    this.isBeingPushed = false;
    this.pushDir = 0;
    this.grounded = false;
  }

  /**
   * 被玩家推动
   */
  push(direction) {
    this.isBeingPushed = true;
    this.pushDir = direction;
  }

  onCollide(other) {
    // 碰撞处理由 CollisionSystem 统一管理
  }

  render(ctx) {
    // 箱子主体
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 边框
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // 齿轮装饰
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 1;

    // 中心圆
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();

    // 齿轮齿
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4);
      ctx.lineTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12);
      ctx.stroke();
    }

    // 推动方向指示
    if (this.isBeingPushed) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      const dir = this.pushDir;
      ctx.fillRect(
        this.x + (dir > 0 ? this.width - 4 : 0),
        this.y + 4,
        4,
        this.height - 8
      );
    }
  }
}
