import { Entity } from './Entity.js';

/**
 * 齿轮令牌（可推动、可投掷、不可重叠）
 */
export class GearToken extends Entity {
  constructor(x, y, value) {
    super(x, y, 28, 28);
    this.value = value;
    this.solid = true;
    this.gearAngle = 0;
    this.inSlot = false;    // 是否在槽位中
    this.slotId = null;     // 所在槽位ID
    this.thrown = false;    // 是否被投掷中
    this.throwVx = 0;
    this.throwVy = 0;
  }

  update(dt) {
    // 重力
    this.vy += 980 * dt;

    // 投掷弧线
    if (this.thrown) {
      this.x += this.throwVx * dt;
      this.y += this.throwVy * dt;
      this.throwVy += 980 * dt;

      // 落地后停止投掷
      if (this.y >= 448) {
        this.y = 448;
        this.thrown = false;
        this.throwVx = 0;
        this.throwVy = 0;
        this.vy = 0;
      }
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.85;
      if (Math.abs(this.vx) < 1) this.vx = 0;
    }

    // 地面碰撞
    if (this.y >= 448) {
      this.y = 448;
      this.vy = 0;
    }

    this.gearAngle += (this.thrown ? 5 : this.vx * 0.01) * dt;
  }

  push(dir) {
    if (!this.inSlot && !this.thrown) {
      this.vx = dir * 150;
    }
  }

  /**
   * 从槽位弹出（放错时）
   */
  ejectFromSlot() {
    this.inSlot = false;
    this.slotId = null;
    this.vy = -200; // 弹起
    this.vx = (Math.random() - 0.5) * 100;
  }

  render(ctx) {
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    ctx.fillStyle = this.inSlot ? '#4ecca3' : '#b8860b';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.gearAngle);

    // 齿轮形状
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var a2 = ((i + 0.3) / 8) * Math.PI * 2;
      var a3 = ((i + 0.5) / 8) * Math.PI * 2;
      var a4 = ((i + 0.8) / 8) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
      ctx.lineTo(Math.cos(a2) * 14, Math.sin(a2) * 14);
      ctx.lineTo(Math.cos(a3) * 14, Math.sin(a3) * 14);
      ctx.lineTo(Math.cos(a4) * 8, Math.sin(a4) * 8);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.inSlot ? '#fff' : '#daa520';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 数值
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.value, cx, cy + 4);
  }
}

/**
 * 齿轮槽位（差分机的位置）
 */
export class GearSlot extends Entity {
  constructor(x, y, slotId, expectedValue, label) {
    super(x, y, 32, 32);
    this.solid = false;
    this.slotId = slotId;
    this.expectedValue = expectedValue;
    this.label = label || '';
    this.filled = false;
    this.filledToken = null;
    this.pulseTimer = 0;
  }

  update(dt) {
    this.pulseTimer += dt;
  }

  /**
   * 检查齿轮是否进入此槽位
   */
  checkPlacement(tokens) {
    if (this.filled) return false;

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.inSlot || t.thrown) continue;

      var dx = Math.abs((t.x + t.width / 2) - (this.x + this.width / 2));
      var dy = Math.abs((t.y + t.height / 2) - (this.y + this.height / 2));

      if (dx < 18 && dy < 18) {
        // 检查值是否正确
        if (t.value === this.expectedValue) {
          // 正确：固定
          t.x = this.x + 2;
          t.y = this.y + 2;
          t.vx = 0; t.vy = 0;
          t.inSlot = true;
          t.slotId = this.slotId;
          this.filled = true;
          this.filledToken = t;
          return { correct: true, value: t.value };
        } else {
          // 错误：弹开，不固定
          t.vx = (t.x < this.x ? -1 : 1) * 200;
          t.vy = -150;
          return { correct: false, value: t.value, expected: this.expectedValue };
        }
      }
    }
    return null;
  }

  /**
   * 弹出齿轮（重置时用）
   */
  ejectToken() {
    if (this.filledToken) {
      this.filledToken.ejectFromSlot();
      this.filled = false;
      this.filledToken = null;
    }
  }

  render(ctx) {
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    // 槽位背景
    ctx.fillStyle = this.filled ? 'rgba(78, 204, 163, 0.2)' : 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 边框
    ctx.strokeStyle = this.filled ? '#4ecca3' : 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // 标签
    ctx.fillStyle = '#ffd700';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, cx, cy - 4);
    ctx.fillText('=' + this.expectedValue, cx, cy + 8);
  }
}

/**
 * 差分机（完成谜题后激活）
 */
export class DifferentialMachine extends Entity {
  constructor(x, y) {
    super(x, y, 96, 80);
    this.solid = false;
    this.activated = false;
    this.gearAngle = 0;
    this.outputValues = [];
    this.outputTimer = 0;
    this.outputIndex = 0;
    this.showingTable = false;
    this.complete = false;
  }

  /**
   * 激活差分机，开始自动计算
   */
  activate(diff0, diff1, diff2Constant) {
    this.activated = true;
    this.outputValues = [];

    // 用差分法自动生成值
    // f(0) = diff0
    // 一阶差分从 diff1 开始，每次增加 diff2Constant
    var current = diff0;
    var firstDiff = diff1;
    this.outputValues.push(current);

    for (var i = 1; i < 6; i++) {
      current += firstDiff;
      this.outputValues.push(current);
      firstDiff += diff2Constant;
    }

    this.showingTable = true;
    this.outputIndex = 0;
    this.outputTimer = 0;
  }

  update(dt) {
    if (this.activated) {
      this.gearAngle += 3 * dt;

      if (this.showingTable) {
        this.outputTimer += dt;
        if (this.outputTimer > 0.8) {
          this.outputTimer = 0;
          this.outputIndex++;
          if (this.outputIndex >= this.outputValues.length) {
            this.showingTable = false;
            this.complete = true;
          }
        }
      }
    }
  }

  render(ctx) {
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    // 主体（未激活时半透明）
    ctx.globalAlpha = this.activated ? 1 : 0.4;
    ctx.fillStyle = this.activated ? '#2a1a0a' : '#1a1a2a';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 边框
    ctx.strokeStyle = this.activated ? '#daa520' : '#444';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // 齿轮装饰（激活时才转动）
    if (this.activated) {
      this.drawGear(ctx, cx, cy - 10, 20, 8, this.gearAngle);
      this.drawGear(ctx, cx - 30, cy + 10, 12, 6, -this.gearAngle * 1.5);
      this.drawGear(ctx, cx + 30, cy + 10, 14, 7, this.gearAngle * 0.8);
    } else {
      this.drawGear(ctx, cx, cy - 10, 20, 8, 0);
      this.drawGear(ctx, cx - 30, cy + 10, 12, 6, 0);
      this.drawGear(ctx, cx + 30, cy + 10, 14, 7, 0);
    }

    // 标题
    ctx.fillStyle = this.activated ? '#daa520' : '#666';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DIFFERENCE', cx, this.y - 8);
    ctx.fillText('ENGINE', cx, this.y + this.height + 14);

    if (!this.activated) {
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText('等待验证...', cx, cy + 4);
    }
    ctx.globalAlpha = 1;

    // 自动计算输出
    if (this.showingTable && this.outputIndex < this.outputValues.length) {
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x + 5, this.y + this.height + 20, this.width - 10, 25);

      ctx.fillStyle = '#4ecca3';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('f(' + this.outputIndex + ') = ' + this.outputValues[this.outputIndex], cx, this.y + this.height + 37);
    }

    // 完成提示
    if (this.complete) {
      ctx.fillStyle = '#4ecca3';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('计算完成！', cx, this.y + this.height + 37);
    }
  }

  drawGear(ctx, x, y, r, teeth, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a1 = (i / teeth) * Math.PI * 2;
      var a2 = ((i + 0.3) / teeth) * Math.PI * 2;
      var a3 = ((i + 0.5) / teeth) * Math.PI * 2;
      var a4 = ((i + 0.8) / teeth) * Math.PI * 2;
      var ir = r * 0.7;
      if (i === 0) ctx.moveTo(Math.cos(a1) * ir, Math.sin(a1) * ir);
      ctx.lineTo(Math.cos(a2) * r, Math.sin(a2) * r);
      ctx.lineTo(Math.cos(a3) * r, Math.sin(a3) * r);
      ctx.lineTo(Math.cos(a4) * ir, Math.sin(a4) * ir);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}
