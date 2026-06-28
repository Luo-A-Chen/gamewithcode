import { Entity } from './Entity.js';

/**
 * GearPuzzle - 差分法齿轮谜题
 *
 * 玩家把带数值的齿轮推到对应位置
 * 全部正确后验证差分法，启动机关
 *
 * 差分法：f(x)=x²+x+1
 *   f(0)=1, f(1)=3, f(2)=7, f(3)=13
 *   一阶差分：2, 4, 6
 *   二阶差分：2, 2（恒定）
 */

/**
 * 齿轮（可推动，带数值）
 */
export class GearToken extends Entity {
  constructor(x, y, value) {
    super(x, y, 32, 32);
    this.value = value;
    this.solid = true;
    this.gearAngle = 0;
    this.placed = false; // 是否已放入正确位置
    this.targetSlot = null; // 正确的目标槽位ID
  }

  update(dt) {
    if (!this.placed) {
      // 重力
      this.vy += 980 * dt;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vx *= 0.85;
      if (Math.abs(this.vx) < 1) this.vx = 0;
      this.gearAngle += this.vx * 0.01 * dt;
    }
  }

  push(dir) {
    if (!this.placed) {
      this.vx = dir * 150;
    }
  }

  render(ctx) {
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    // 齿轮主体
    ctx.fillStyle = this.placed ? '#4ecca3' : '#b8860b';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.gearAngle);

    // 齿轮齿
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = (i / 8) * Math.PI * 2;
      var a2 = ((i + 0.3) / 8) * Math.PI * 2;
      var a3 = ((i + 0.5) / 8) * Math.PI * 2;
      var a4 = ((i + 0.8) / 8) * Math.PI * 2;
      if (i === 0) ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
      ctx.lineTo(Math.cos(a2) * 16, Math.sin(a2) * 16);
      ctx.lineTo(Math.cos(a3) * 16, Math.sin(a3) * 16);
      ctx.lineTo(Math.cos(a4) * 10, Math.sin(a4) * 10);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = this.placed ? '#fff' : '#daa520';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // 数值
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.value, cx, cy + 5);
  }
}

/**
 * 齿轮槽位（目标位置）
 */
export class GearSlot extends Entity {
  constructor(x, y, slotId, expectedValue) {
    super(x, y, 36, 36);
    this.solid = false;
    this.slotId = slotId;
    this.expectedValue = expectedValue;
    this.filled = false;
    this.filledValue = null;
    this.pulseTimer = 0;
  }

  update(dt) {
    this.pulseTimer += dt;
  }

  /**
   * 检查是否有齿轮放入
   */
  checkPlacement(tokens) {
    if (this.filled) return;

    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.placed) continue;

      var dx = Math.abs((t.x + t.width / 2) - (this.x + this.width / 2));
      var dy = Math.abs((t.y + t.height / 2) - (this.y + this.height / 2));

      if (dx < 20 && dy < 20) {
        // 齿轮进入槽位
        t.x = this.x + 2;
        t.y = this.y + 2;
        t.vx = 0;
        t.vy = 0;
        t.placed = true;
        t.targetSlot = this.slotId;
        this.filled = true;
        this.filledValue = t.value;
        break;
      }
    }
  }

  render(ctx) {
    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    // 槽位背景
    ctx.fillStyle = this.filled
      ? (this.filledValue === this.expectedValue ? 'rgba(78, 204, 163, 0.3)' : 'rgba(233, 69, 96, 0.3)')
      : 'rgba(255, 255, 255, 0.1)';

    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 边框
    ctx.strokeStyle = this.filled
      ? (this.filledValue === this.expectedValue ? '#4ecca3' : '#e94560')
      : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // 槽位标签
    if (!this.filled) {
      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('f(' + this.slotId + ')', cx, cy - 2);
      ctx.fillText('=' + this.expectedValue, cx, cy + 12);
    } else {
      // 已填充时显示对错
      var correct = this.filledValue === this.expectedValue;
      ctx.fillStyle = correct ? '#4ecca3' : '#e94560';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(correct ? '✓' : '✗', cx, cy + 6);
    }
  }
}

/**
 * 差分法验证器
 * 检查所有槽位是否正确，验证差分法
 */
export class DifferentialVerifier {
  constructor(slots) {
    this.slots = slots;
    this.verified = false;
    this.showResult = false;
    this.resultTimer = 0;
  }

  /**
   * 检查是否所有槽位都正确填充
   */
  check() {
    for (var i = 0; i < this.slots.length; i++) {
      if (!this.slots[i].filled || this.slots[i].filledValue !== this.slots[i].expectedValue) {
        return false;
      }
    }
    return true;
  }

  /**
   * 验证差分法
   * 返回 { success, steps }
   */
  verify() {
    if (!this.check()) return { success: false, steps: [] };

    // 提取值
    var values = [];
    for (var i = 0; i < this.slots.length; i++) {
      values.push(this.slots[i].expectedValue);
    }

    // 计算一阶差分
    var diff1 = [];
    for (var j = 0; j < values.length - 1; j++) {
      diff1.push(values[j + 1] - values[j]);
    }

    // 计算二阶差分
    var diff2 = [];
    for (var k = 0; k < diff1.length - 1; k++) {
      diff2.push(diff1[k + 1] - diff1[k]);
    }

    // 验证二阶差分是否恒定
    var constant = true;
    for (var m = 1; m < diff2.length; m++) {
      if (diff2[m] !== diff2[0]) {
        constant = false;
        break;
      }
    }

    this.verified = constant;
    this.showResult = true;
    this.resultTimer = 3;

    return {
      success: constant,
      values: values,
      diff1: diff1,
      diff2: diff2,
      constantValue: diff2[0],
    };
  }

  /**
   * 渲染验证结果
   */
  renderResult(ctx, x, y) {
    if (!this.showResult) return;

    ctx.globalAlpha = Math.min(1, this.resultTimer);

    // 结果面板
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - 10, y - 10, 280, 120);
    ctx.strokeStyle = this.verified ? '#4ecca3' : '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 10, y - 10, 280, 120);

    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    var values = [];
    for (var i = 0; i < this.slots.length; i++) {
      values.push(this.slots[i].expectedValue);
    }

    ctx.fillText('f(x) 值:    ' + values.join(', '), x + 5, y + 15);

    var diff1 = [];
    for (var j = 0; j < values.length - 1; j++) {
      diff1.push(values[j + 1] - values[j]);
    }
    ctx.fillText('一阶差分:   ' + diff1.join(', '), x + 5, y + 35);

    var diff2 = [];
    for (var k = 0; k < diff1.length - 1; k++) {
      diff2.push(diff1[k + 1] - diff1[k]);
    }
    ctx.fillText('二阶差分:   ' + diff2.join(', '), x + 5, y + 55);

    ctx.fillStyle = this.verified ? '#4ecca3' : '#e94560';
    ctx.font = 'bold 14px sans-serif';
    if (this.verified) {
      ctx.fillText('✓ 二阶差分恒定！差分法验证成功！', x + 5, y + 85);
      ctx.fillText('机关启动！', x + 5, y + 105);
    } else {
      ctx.fillText('✗ 差分法验证失败，请重新放置齿轮', x + 5, y + 85);
    }

    ctx.globalAlpha = 1;
  }
}
