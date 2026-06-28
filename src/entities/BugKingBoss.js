import { Boss } from './Boss.js';

/**
 * BugKingBoss - Bug King 最终Boss（世界7）
 * 综合所有攻击模式
 */
export class BugKingBoss extends Boss {
  constructor(x, y) {
    super(x, y, 80, 80, 6);
    this.dormantMessage = "进入最终区域后出现";
    this.attackCooldown = 2;
    this.projectiles = [];
    this.vulnerable = false;
    this.vulnTimer = 0;
  }

  attack() {
    if (!this.alive) return;
    // 混合弹幕
    for (var i = 0; i < 16; i++) {
      var a = (i / 16) * Math.PI * 2;
      this.projectiles.push({
        x: this.x + this.width / 2, y: this.y + this.height / 2,
        vx: Math.cos(a) * 100, vy: Math.sin(a) * 100,
        radius: 6, life: 3, color: '#e94560'
      });
    }
    this.vulnerable = true;
    this.vulnTimer = 2.5;
  }

  updateBoss(dt) {
    if (this.vulnerable) {
      this.vulnTimer -= dt;
      if (this.vulnTimer <= 0) this.vulnerable = false;
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
    if (this.dormant) { super.render(ctx); return; }
    if (!this.alive) return;
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : (this.vulnerable ? '#3a0a0a' : '#1a0a0a');
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BUG', cx, cy + 5);
    if (this.vulnerable) {
      ctx.fillStyle = '#ff0';
      ctx.font = '10px monospace';
      ctx.fillText('KING', cx, cy + 18);
    }
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.fillStyle = p.color || '#e94560';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    this.renderHealthBar(ctx, this.x, this.y - 15, this.width);
    ctx.fillStyle = this.vulnerable ? '#ff0' : '#888';
    ctx.font = '10px monospace';
    ctx.fillText(this.vulnerable ? '最终一击！' : 'Bug King', cx, this.y - 20);
  }
}
