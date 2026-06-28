import { Boss } from './Boss.js';

/**
 * MemoryLeakBoss - 内存泄漏黑洞（世界5 Boss）
 * 不断膨胀，需要在缩小时攻击
 */
export class MemoryLeakBoss extends Boss {
  constructor(x, y) {
    super(x, y, 64, 64, 4);
    this.attackCooldown = 3;
    this.projectiles = [];
    this.shrinkPhase = false;
    this.shrinkTimer = 0;
  }

  attack() {
    if (!this.alive) return;
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2;
      this.projectiles.push({
        x: this.x + this.width / 2, y: this.y + this.height / 2,
        vx: Math.cos(a) * 80, vy: Math.sin(a) * 80,
        radius: 10, life: 3, color: '#222'
      });
    }
    this.shrinkPhase = true;
    this.shrinkTimer = 2.5;
  }

  updateBoss(dt) {
    if (this.shrinkPhase) {
      this.shrinkTimer -= dt;
      if (this.shrinkTimer <= 0) this.shrinkPhase = false;
    }
    for (var i = this.projectiles.length - 1; i >= 0; i--) {
      var p = this.projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) this.projectiles.splice(i, 1);
    }
  }

  checkStomp(player) {
    if (!this.alive || !this.shrinkPhase) return false;
    var pb = player.y + player.height;
    return player.vy > 0 && pb > this.y && pb < this.y + 20 &&
      player.x + player.width > this.x && player.x < this.x + this.width;
  }

  render(ctx) {
    if (!this.alive) return;
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;
    var scale = this.shrinkPhase ? 0.7 : 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : (this.shrinkPhase ? '#1a1a1a' : '#0a0a0a');
    ctx.beginPath();
    ctx.arc(cx, cy, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.fillStyle = p.color || '#333';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    this.renderHealthBar(ctx, this.x, this.y - 20, this.width);
    ctx.fillStyle = this.shrinkPhase ? '#ff0' : '#888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.shrinkPhase ? '踩我！' : '泄漏中...', cx, this.y - 25);
  }
}
