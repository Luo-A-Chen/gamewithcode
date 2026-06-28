import { Entity } from './Entity.js';

export class Boss extends Entity {
  constructor(x, y, width, height, hp) {
    super(x, y, width, height);
    this.hp = hp || 10;
    this.maxHp = this.hp;
    this.phase = 1;
    this.alive = true;
    this.defeated = false;
    this.attackTimer = 0;
    this.attackCooldown = 2;
    this.isAttacking = false;
    this.hitFlash = 0;
    this.introTimer = 0;
    this.isIntro = true;
    this.dormant = true;  // 休眠状态：不可见、不可交互
    this.dormantMessage = '完成挑战后 Boss 才会出现';
  }

  /**
   * 激活 Boss
   */
  activate() {
    this.dormant = false;
    this.isIntro = true;
    this.introTimer = 1.5;
  }

  takeDamage(amount) {
    if (this.isIntro || this.dormant) return;

    this.hp -= amount;
    this.hitFlash = 0.15;

    var hpPercent = this.hp / this.maxHp;
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

  onPhaseChange(newPhase) {}
  onDefeat() {}

  update(dt) {
    if (this.dormant) return;

    if (this.isIntro) {
      this.introTimer += dt;
      if (this.introTimer > 1.5) {
        this.isIntro = false;
      }
      return;
    }

    if (!this.alive) return;

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
    }

    this.attackTimer += dt;
    if (this.attackTimer >= this.attackCooldown) {
      this.attack();
      this.attackTimer = 0;
    }

    this.updateBoss(dt);
  }

  attack() {}
  updateBoss(dt) {}

  render(ctx) {
    if (this.dormant) {
      // 休眠状态：显示提示
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('???', this.x + this.width / 2, this.y + this.height / 2);
      ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
      ctx.font = '10px monospace';
      ctx.fillText(this.dormantMessage, this.x + this.width / 2, this.y + this.height + 16);
      return;
    }
  }

  renderHealthBar(ctx, x, y, width) {
    if (this.dormant) return;

    var barHeight = 6;
    var hpPercent = this.hp / this.maxHp;

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, barHeight);

    var barColor;
    if (hpPercent > 0.66) barColor = '#4ecca3';
    else if (hpPercent > 0.33) barColor = '#ffd700';
    else barColor = '#e94560';

    ctx.fillStyle = barColor;
    ctx.fillRect(x, y, width * hpPercent, barHeight);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, barHeight);
  }
}
