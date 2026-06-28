import { Entity } from './Entity.js';

/**
 * ClassBlock - 类方块（世界5机制）
 * 踩上去复制玩家能力（二段跳/冲刺）
 */
export class ClassBlock extends Entity {
  constructor(x, y, ability) {
    super(x, y, 32, 32);
    this.solid = true;
    this.ability = ability; // 'doubleJump' or 'dash'
    this.used = false;
    this.glowTimer = 0;
  }

  update(dt) {
    this.glowTimer += dt;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.used) {
      if (this.ability === 'doubleJump') {
        other.maxJumps = 3;
      }
      this.used = true;
    }
  }

  render(ctx) {
    var pulse = Math.sin(this.glowTimer * 3) * 0.2 + 0.8;
    ctx.fillStyle = this.used ? '#333' : ('rgba(100, 200, 255, ' + pulse + ')');
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#4ecca3';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.used ? 'OK' : 'Class', this.x + this.width / 2, this.y + this.height / 2 + 4);
  }
}
