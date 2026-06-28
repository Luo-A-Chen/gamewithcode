import { Boss } from './Boss.js';

/**
 * RecursionBoss - 无限递归怪物（世界3 Boss）
 * 分身攻击，需要找到递归出口
 */
export class RecursionBoss extends Boss {
  constructor(x, y) {
    super(x, y, 64, 64, 5);
    this.attackCooldown = 2;
    this.projectiles = [];
    this.exitExposed = false;
    this.exitTimer = 0;
    this.exitX = x + 100;
    this.exitY = y;
  }

  attack() {
    if (!this.alive) return;
    // 弹幕（递归分裂效果）
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      this.projectiles.push({
        x: this.x + this.width / 2, y: this.y + this.height / 2,
        vx: Math.cos(a) * 100, vy: Math.sin(a) * 100,
        radius: 6, life: 3, color: '#0f0'
      });
    }
    this.exitExposed = true;
    this.exitTimer = 3;
  }

  updateBoss(dt) {
    if (this.exitExposed) {
      this.exitTimer -= dt;
      if (this.exitTimer <= 0) this.exitExposed = false;
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
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = this.exitExposed ? '#1a3a1a' : '#2a2a3e';
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    // 递归符号
    ctx.fillStyle = '#0f0';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('f(f(x))', cx, cy + 4);
    // 出口
    if (this.exitExposed) {
      ctx.fillStyle = '#ff0';
      ctx.fillRect(this.exitX - 10, this.exitY - 10, 20, 20);
      ctx.fillStyle = '#000';
      ctx.font = '8px monospace';
      ctx.fillText('EXIT', this.exitX, this.exitY + 3);
    }
    // 子弹
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.fillStyle = p.color || '#0f0';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    this.renderHealthBar(ctx, this.x, this.y - 15, this.width);
    ctx.fillStyle = this.exitExposed ? '#ff0' : '#888';
    ctx.font = '10px monospace';
    ctx.fillText(this.exitExposed ? '去EXIT！' : '递归中...', cx, this.y - 20);
  }
}
