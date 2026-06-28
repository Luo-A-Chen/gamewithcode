import { Entity } from './Entity.js';

/**
 * Boss - Boss 基类
 * 管理阶段、血量、攻击模式
 */
export class Boss extends Entity {
  constructor(x, y, width, height, hp = 10) {
    super(x, y, width, height);
    this.hp = hp;
    this.maxHp = hp;
    this.phase = 1;
    this.alive = true;
    this.defeated = false;
    this.attackTimer = 0;
    this.attackCooldown = 2;
    this.isAttacking = false;
    this.hitFlash = 0;
    this.introTimer = 0;
    this.isIntro = true;
  }

  takeDamage(amount) {
    if (this.isIntro) return;

    this.hp -= amount;
    this.hitFlash = 0.15;

    // 阶段切换
    const hpPercent = this.hp / this.maxHp;
    if (hpPercent <= 0.33 && this.phase < 3) {
      this.phase = 3;
      this.onPhaseChange(3);
    } else if (hpPercent <= 0.66 && this.phase < 2) {
      this.phase = 2;
      this.onPhaseChange(2);
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.defeated = true;
      this.onDefeat();
    }
  }

  onPhaseChange(newPhase) {
    // 子类重写
  }

  onDefeat() {
    // 子类重写
  }

  update(dt) {
    if (this.isIntro) {
      this.introTimer += dt;
      if (this.introTimer > 1.5) {
        this.isIntro = false;
      }
      return;
    }

    if (!this.alive) return;

    // 受击闪烁
    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
    }

    // 攻击逻辑
    this.attackTimer += dt;
    if (this.attackTimer >= this.attackCooldown) {
      this.attack();
      this.attackTimer = 0;
    }

    this.updateBoss(dt);
  }

  attack() {
    // 子类重写
  }

  updateBoss(dt) {
    // 子类重写
  }

  render(ctx) {
    // 子类重写
  }

  /**
   * 绘制血条
   */
  renderHealthBar(ctx, x, y, width) {
    const barHeight = 6;
    const hpPercent = this.hp / this.maxHp;

    // 背景
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, barHeight);

    // 血量
    let barColor;
    if (hpPercent > 0.66) barColor = '#4ecca3';
    else if (hpPercent > 0.33) barColor = '#ffd700';
    else barColor = '#e94560';

    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, width * hpPercent, barHeight);

    // 边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, barHeight);
  }
}
