import { Boss } from './Boss.js';

/**
 * RelayBoss - 暴走的继电器
 * 世界2 Boss
 * 玩法：躲避电弧，等继电器过载时攻击核心
 */
export class RelayBoss extends Boss {
  constructor(x, y) {
    super(x, y, 72, 72, 6); // 4 点血
    this.dormantMessage = "连通所有电路后出现";
    this.attackCooldown = 1.8;
    this.projectiles = [];
    this.overloaded = false;
    this.overloadTimer = 0;
    this.sparkTimer = 0;
    this.phase = 1;
    this.moveDir = 1;
    this.moveSpeed = 50;
  }

  attack() {
    if (!this.alive) return;

    // 发射电弧（十字形弹幕）
    var speed = 150;
    this.projectiles.push(
      { x: this.x + this.width / 2, y: this.y + this.height / 2, vx: speed, vy: 0, radius: 6, life: 2.5, color: '#0ff' },
      { x: this.x + this.width / 2, y: this.y + this.height / 2, vx: -speed, vy: 0, radius: 6, life: 2.5, color: '#0ff' },
      { x: this.x + this.width / 2, y: this.y + this.height / 2, vx: 0, vy: speed, radius: 6, life: 2.5, color: '#0ff' },
      { x: this.x + this.width / 2, y: this.y + this.height / 2, vx: 0, vy: -speed, radius: 6, life: 2.5, color: '#0ff' }
    );

    // Phase 2+: 斜向电弧
    if (this.phase >= 2) {
      var d = speed * 0.7;
    this.projectiles.push(
      { x: cx, y: cy, vx: d, vy: -d, radius: 5, life: 2, color: "#ff0" },
      { x: cx, y: cy, vx: -d, vy: d, radius: 5, life: 2, color: "#ff0" }
    );
      this.projectiles.push(
        { x: this.x + this.width / 2, y: this.y + this.height / 2, vx: d, vy: d, radius: 5, life: 2, color: '#ff0' },
        { x: this.x + this.width / 2, y: this.y + this.height / 2, vx: -d, vy: -d, radius: 5, life: 2, color: '#ff0' }
      );
    }

    // Phase 3: 追踪弹
    if (this.phase >= 3) {
      this.projectiles.push({
        x: this.x + this.width / 2, y: this.y + this.height / 2,
        vx: this.moveDir * 120, vy: -100,
        radius: 10, life: 4, color: "#f0f"
      });
    }
    // 攻击后过载
    this.overloaded = true;
    this.overloadTimer = 2;
  }

  updateBoss(dt) {
    // 左右移动
    this.x += this.moveSpeed * (this.moveDir || 1) * dt;
    if (this.x < 600) this.moveDir = 1;
    if (this.x > 900) this.moveDir = -1;

    // 过载计时
    if (this.overloaded) {
      this.overloadTimer -= dt;
      if (this.overloadTimer <= 0) {
        this.overloaded = false;
      }
    }

    // 火花效果
    this.sparkTimer += dt;

    // 更新子弹
    for (var i = this.projectiles.length - 1; i >= 0; i--) {
      var p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  checkStomp(player) {
    if (!this.alive) return false;
    var playerBottom = player.y + player.height;
    if (player.vy > 0 && playerBottom > this.y && playerBottom < this.y + 20) {
      if (player.x + player.width > this.x && player.x < this.x + this.width) {
        return true;
      }
    }
    return false;
  }

  render(ctx) {
    if (this.dormant) { super.render(ctx); return; }
    if (!this.alive) return;

    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    // 受击闪烁
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      // 主体（继电器外壳）
      ctx.fillStyle = this.overloaded ? '#3a1a1a' : '#2a2a3e';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // 线圈纹理
      ctx.strokeStyle = '#4a4a6e';
      ctx.lineWidth = 2;
      for (var i = 0; i < 6; i++) {
        var ly = this.y + 8 + i * 10;
        ctx.beginPath();
        ctx.moveTo(this.x + 4, ly);
        ctx.lineTo(this.x + this.width - 4, ly);
        ctx.stroke();
      }

      // 核心
      if (this.overloaded) {
        // 过载状态：可攻击，闪烁
        var pulse = Math.sin(this.overloadTimer * 10) * 4;
        ctx.fillStyle = '#e94560';
        ctx.fillRect(cx - 12 - pulse, cy - 12 - pulse, 24 + pulse * 2, 24 + pulse * 2);
      } else {
        ctx.fillStyle = '#555';
        ctx.fillRect(cx - 10, cy - 10, 20, 20);
      }

      // 火花
      if (this.overloaded) {
        ctx.fillStyle = '#ff0';
        for (var s = 0; s < 3; s++) {
          var sx = cx + Math.sin(this.sparkTimer * 10 + s * 2) * 30;
          var sy = cy + Math.cos(this.sparkTimer * 8 + s * 3) * 25;
          ctx.fillRect(sx - 1, sy - 1, 3, 3);
        }
      }
    }

    // 子弹（电弧）
    for (var j = 0; j < this.projectiles.length; j++) {
      var p = this.projectiles[j];
      ctx.fillStyle = p.color || '#0ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      // 电弧尾迹
      ctx.strokeStyle = p.color || '#0ff';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 血条
    this.renderHealthBar(ctx, this.x, this.y - 15, this.width);

    // 状态提示
    ctx.fillStyle = this.overloaded ? '#e94560' : '#888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.overloaded ? '过载！踩我！' : '继电器', cx, this.y - 20);
  }
}
