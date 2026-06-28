import { Entity } from './Entity.js';

/**
 * PunchCard - 打孔卡片（世界3收集物）
 * 收集后显示编程概念
 */
export class PunchCard extends Entity {
  constructor(x, y, cardId, text) {
    super(x, y, 24, 16);
    this.solid = false;
    this.cardId = cardId;
    this.text = text || 'PRINT';
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.baseY = y;
  }

  update(dt) {
    if (this.collected) return;
    this.bobOffset += 2.5 * dt;
    this.y = this.baseY + Math.sin(this.bobOffset) * 4;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.collected) {
      this.collected = true;
      this.dead = true;
    }
  }

  render(ctx) {
    if (this.collected) return;
    // 卡片背景
    ctx.fillStyle = '#f5f5dc';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // 边框
    ctx.strokeStyle = '#8b8b00';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    // 打孔
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x + 4, this.y + 4, 3, 3);
    ctx.fillRect(this.x + 10, this.y + 4, 3, 3);
    ctx.fillRect(this.x + 16, this.y + 4, 3, 3);
    // 文字
    ctx.fillStyle = '#333';
    ctx.font = '6px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height - 2);
  }
}
