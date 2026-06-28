import { Entity } from './Entity.js';

/**
 * LanguageFragment - 语言碎片
 * 每关 3 个，收集后显示该时代编程语言介绍
 */
export class LanguageFragment extends Entity {
  constructor(x, y, fragmentId, worldId = 1) {
    super(x, y, 24, 24);
    this.solid = false;
    this.fragmentId = fragmentId;
    this.worldId = worldId;
    this.collected = false;

    // 浮动动画
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 2.5;
    this.baseY = y;

    // 旋转动画
    this.rotation = 0;
    this.rotationSpeed = 1.5;

    // 颜色（金色碎片）
    this.color = '#ffd700';
    this.glowColor = 'rgba(255, 215, 0, 0.3)';
  }

  update(dt) {
    if (this.collected) return;

    // 浮动
    this.bobOffset += this.bobSpeed * dt;
    this.y = this.baseY + Math.sin(this.bobOffset) * 8;

    // 旋转
    this.rotation += this.rotationSpeed * dt;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.collected) {
      this.collected = true;
      this.dead = true;
      // 触发收集事件（后续接入事件系统）
    }
  }

  render(ctx) {
    if (this.collected) return;

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // 光晕
    ctx.fillStyle = this.glowColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();

    // 旋转的碎片
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);

    // 碎片形状（菱形）
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();

    // 内部高光
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(4, 0);
    ctx.lineTo(0, 6);
    ctx.lineTo(-4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();

    // 标记文字（小号）
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('F', cx, cy + 4);
  }
}
