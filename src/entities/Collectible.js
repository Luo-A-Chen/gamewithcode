import { Entity } from './Entity.js';

/**
 * Collectible - 可收集物品（金币等）
 */
export class Collectible extends Entity {
  constructor(x, y) {
    super(x, y, 20, 20);
    this.solid = false;
    this.collected = false;
    this.bobOffset = 0;
    this.bobSpeed = 3;
    this.baseY = y;
    this.color = '#ffd700';
  }

  update(dt) {
    this.bobOffset += this.bobSpeed * dt;
    this.y = this.baseY + Math.sin(this.bobOffset) * 6;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.collected) {
      this.collected = true;
      this.dead = true;
    }
  }

  render(ctx) {
    if (this.collected) return;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.width / 2,
      0, Math.PI * 2
    );
    ctx.fill();

    // 光晕
    ctx.strokeStyle = '#ffed4a';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
