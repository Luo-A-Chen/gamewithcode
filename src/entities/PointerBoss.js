import { Boss } from './Boss.js';

/**
 * PointerBoss - 野指针幽灵（世界4 Boss）
 * 瞬移攻击，硬直时可被攻击
 */
export class PointerBoss extends Boss {
  constructor(x, y) {
    super(x, y, 56, 56, 4);
    this.attackCooldown = 2.5;
    this.projectiles = [];
    this.stunned = false;
    this.stunTimer = 0;
    this.teleportTimer = 0;
  }

  attack() {
    if (!this.alive) return;
    // 冲刺攻击
    this.projectiles.push({
      x: this.x + this.width / 2, y: this.y + this.height / 2,
      vx: 200, vy: 0, radius: 8, life: 2, color: '#f0f'
    });
    this.stunned = true;
    this.stunTimer = 1.5;
  }

  updateBoss(dt) {
    if (this.stunned) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) this.stunned = false;
    }
    for (var i = this.projectiles.length - 1; i >= 0; i--) {
      var p = this.projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
      if (p.life <= 0) this.projectiles.splice(i, 1);
    }
  }

  checkStomp(player) {
    if (!this.alive || !this.stunned) return false;
    var pb = player.y + player.height;
    return player.vy > 0 && pb > this.y && pb < this.y + 20 &&
      player.x + player.width > this.x && player.x < this.x + this.width;
  }

  render(ctx) {
    if (!this.alive) return;
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;
    ctx.fillStyle = this.stunned ? '#3a1a3a' : '#2a2a3e';
    if (this.hitFlash > 0) ctx.fillStyle = '#fff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    // NULL 符号
    ctx.fillStyle = '#f0f';
    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NULL', cx, cy + 5);
    // 子弹
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.fillStyle = p.color || '#f0f';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    this.renderHealthBar(ctx, this.x, this.y - 15, this.width);
    ctx.fillStyle = this.stunned ? '#ff0' : '#888';
    ctx.font = '10px monospace';
    ctx.fillText(this.stunned ? '踩我！' : '指针', cx, this.y - 20);
  }
}
