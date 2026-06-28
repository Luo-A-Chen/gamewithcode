import { Boss } from './Boss.js';

/**
 * XSSBoss - XSS攻击虫群（世界6 Boss）
 * 虫群冲锋，核心暴露时可攻击
 */
export class XSSBoss extends Boss {
  constructor(x, y) {
    super(x, y, 72, 72, 5);
    this.attackCooldown = 2;
    this.projectiles = [];
    this.coreExposed = false;
    this.coreTimer = 0;
  }

  attack() {
    if (!this.alive) return;
    // 虫群冲锋（多方向）
    for (var i = 0; i < 12; i++) {
      var a = (i / 12) * Math.PI * 2;
      this.projectiles.push({
        x: this.x + this.width / 2, y: this.y + this.height / 2,
        vx: Math.cos(a) * 120, vy: Math.sin(a) * 120,
        radius: 5, life: 2.5, color: '#8f0'
      });
    }
    this.coreExposed = true;
    this.coreTimer = 2.5;
  }

  updateBoss(dt) {
    if (this.coreExposed) {
      this.coreTimer -= dt;
      if (this.coreTimer <= 0) this.coreExposed = false;
    }
    for (var i = this.projectiles.length - 1; i >= 0; i--) {
      var p = this.projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) this.projectiles.splice(i, 1);
    }
  }

  checkStomp(player) {
    if (!this.alive) return false;
    var pb = player.y + player.height;
    return player.vy > 0 && pb > this.y && pb < this.y + 20 &&
      player.x + player.width > this.x && player.x < this.x + this.width;
  }

  render(ctx) {
    if (!this.alive) return;
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : '#1a2a1a';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#8f0';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('<script>', cx, cy + 4);
    if (this.coreExposed) {
      ctx.fillStyle = '#e94560';
      ctx.fillRect(cx - 8, cy - 8, 16, 16);
    }
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.fillStyle = p.color || '#8f0';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    this.renderHealthBar(ctx, this.x, this.y - 15, this.width);
    ctx.fillStyle = this.coreExposed ? '#e94560' : '#888';
    ctx.font = '10px monospace';
    ctx.fillText(this.coreExposed ? '踩核心！' : '虫群', cx, this.y - 20);
  }
}
