import { Boss } from './Boss.js';

/**
 * DifferentialEngine - 被卡住的差分机
 * 世界1 Boss - 简化版，踩头3次击败
 */
export class DifferentialEngine extends Boss {
  constructor(x, y) {
    super(x, y, 80, 80, 3); // 3 点血
    this.attackCooldown = 3;
    this.gearAngle = 0;
    this.gearSpeed = 2;
    this.projectiles = [];
    this.vulnerable = false;
    this.vulnerableTimer = 0;
  }

  onPhaseChange(newPhase) {
    if (newPhase === 2) {
      this.attackCooldown = 2.5;
      this.gearSpeed = 3;
    } else if (newPhase === 3) {
      this.attackCooldown = 2;
      this.gearSpeed = 4;
    }
  }

  onDefeat() {
    this.projectiles = [];
  }

  attack() {
    if (!this.alive) return;

    // 发射齿轮弹幕（固定模式，容易躲避）
    var angles = [0, 1, 2, 3, 4, 5];
    for (var i = 0; i < angles.length; i++) {
      var a = (angles[i] / 6) * Math.PI * 2;
      this.projectiles.push({
        x: this.x + this.width / 2,
        y: this.y + this.height / 2,
        vx: Math.cos(a) * 120,
        vy: Math.sin(a) * 120,
        radius: 8,
        life: 2.5,
      });
    }

    // 攻击后暴露弱点
    this.vulnerable = true;
    this.vulnerableTimer = 2.5;
  }

  updateBoss(dt) {
    this.gearAngle += this.gearSpeed * dt;

    if (this.vulnerable) {
      this.vulnerableTimer -= dt;
      if (this.vulnerableTimer <= 0) {
        this.vulnerable = false;
      }
    }

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

  /**
   * 检测玩家是否踩到 Boss 头顶
   */
  checkStomp(player) {
    if (!this.alive) return false;

    var px = player.x;
    var py = player.y;
    var pw = player.width;
    var ph = player.height;

    // 玩家在 Boss 上方且正在下落
    var playerBottom = py + ph;
    var bossTop = this.y;

    if (player.vy > 0 && playerBottom > bossTop && playerBottom < bossTop + 20) {
      if (px + pw > this.x && px < this.x + this.width) {
        return true;
      }
    }
    return false;
  }

  render(ctx) {
    if (!this.alive) return;

    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    if (this.isIntro) {
      ctx.globalAlpha = Math.min(1, this.introTimer / 1.5);
    }

    // 受击闪烁
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      // 主体
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(this.x, this.y, this.width, this.height);

      // 边框
      ctx.strokeStyle = '#4a4a6e';
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x, this.y, this.width, this.height);

      // 齿轮装饰
      this.drawGear(ctx, cx, cy, 25, 10, this.gearAngle);
      this.drawGear(ctx, this.x + 15, this.y + 15, 12, 6, -this.gearAngle * 1.5);
      this.drawGear(ctx, this.x + this.width - 15, this.y + this.height - 15, 14, 8, this.gearAngle * 0.8);

      // 核心（弱点）- 始终可见，闪烁时表示可攻击
      var coreX = this.x + this.width / 2 - 10;
      var coreY = this.y + this.height / 2 - 10;

      if (this.vulnerable) {
        // 可攻击状态：红色脉冲
        var pulse = Math.sin(this.vulnerableTimer * 8) * 3;
        ctx.fillStyle = '#e94560';
        ctx.fillRect(coreX - pulse, coreY - pulse, 20 + pulse * 2, 20 + pulse * 2);
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 2;
        ctx.strokeRect(coreX - pulse, coreY - pulse, 20 + pulse * 2, 20 + pulse * 2);
      } else {
        // 普通状态：暗红色
        ctx.fillStyle = '#8b0000';
        ctx.fillRect(coreX, coreY, 20, 20);
      }
    }

    // 子弹（齿轮）
    for (var i = 0; i < this.projectiles.length; i++) {
      var p = this.projectiles[i];
      ctx.fillStyle = '#b8860b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#daa520';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 血条
    this.renderHealthBar(ctx, this.x, this.y - 15, this.width);

    // 状态提示
    ctx.fillStyle = this.vulnerable ? '#e94560' : '#888';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.vulnerable ? '踩我！' : 'P' + this.phase, cx, this.y - 20);

    ctx.globalAlpha = 1;
  }

  drawGear(ctx, cx, cy, radius, teeth, angle) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = '#6a6a8e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a1 = (i / teeth) * Math.PI * 2;
      var a2 = ((i + 0.3) / teeth) * Math.PI * 2;
      var a3 = ((i + 0.5) / teeth) * Math.PI * 2;
      var a4 = ((i + 0.8) / teeth) * Math.PI * 2;
      var innerR = radius * 0.75;
      if (i === 0) ctx.moveTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
      ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
      ctx.lineTo(Math.cos(a3) * radius, Math.sin(a3) * radius);
      ctx.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}
