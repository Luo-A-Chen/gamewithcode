/**
 * TouchController - 虚拟摇杆和触控按键
 * 左半屏：方向控制
 * 右半屏：跳跃、暂停
 */
export class TouchController {
  constructor(canvas) {
    this.canvas = canvas;
    this.active = false;

    // 虚拟按键状态
    this.left = false;
    this.right = false;
    this.jump = false;
    this.pause = false;
    this.jumpJustPressed = false;
    this.pauseJustPressed = false;

    // 触控点追踪
    this.touches = {};
    this._prevJump = false;
    this._prevPause = false;

    // 检测是否为触屏设备
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (this.isTouchDevice) {
      this.bindEvents();
    }
  }

  bindEvents() {
    var self = this;
    var canvas = this.canvas;

    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      self.active = true;
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        self.touches[t.identifier] = self.getTouchZone(t);
      }
      self.updateState();
    }, { passive: false });

    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        self.touches[t.identifier] = self.getTouchZone(t);
      }
      self.updateState();
    }, { passive: false });

    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        delete self.touches[t.identifier];
      }
      self.updateState();
    }, { passive: false });

    canvas.addEventListener('touchcancel', function(e) {
      self.touches = {};
      self.updateState();
    });
  }

  getTouchZone(touch) {
    var rect = this.canvas.getBoundingClientRect();
    var x = (touch.clientX - rect.left) / rect.width;
    var y = (touch.clientY - rect.top) / rect.height;

    // 右上角：暂停按钮
    if (x > 0.85 && y < 0.15) return 'pause';

    // 右半屏下半部分：跳跃
    if (x > 0.5 && y > 0.5) return 'jump';

    // 左半屏：方向控制
    if (x < 0.3) return 'left';
    if (x >= 0.3 && x <= 0.5) return 'right';

    return 'other';
  }

  updateState() {
    this.left = false;
    this.right = false;
    this.jump = false;
    this.pause = false;

    var keys = Object.keys(this.touches);
    for (var i = 0; i < keys.length; i++) {
      var zone = this.touches[keys[i]];
      if (zone === 'left') this.left = true;
      if (zone === 'right') this.right = true;
      if (zone === 'jump') this.jump = true;
      if (zone === 'pause') this.pause = true;
    }

    // 单次触发检测
    this.jumpJustPressed = this.jump && !this._prevJump;
    this.pauseJustPressed = this.pause && !this._prevPause;
    this._prevJump = this.jump;
    this._prevPause = this.pause;
  }

  /**
   * 渲染虚拟按键
   */
  render(ctx, width, height) {
    if (!this.active) return;

    ctx.globalAlpha = 0.25;

    // ── 左半屏方向键 ──
    // 左箭头
    ctx.fillStyle = this.left ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
    this.drawRoundRect(ctx, 15, height - 90, 60, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀', 45, height - 58);

    // 右箭头
    ctx.fillStyle = this.right ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
    this.drawRoundRect(ctx, 85, height - 90, 60, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('▶', 115, height - 58);

    // ── 右半屏跳跃键 ──
    ctx.fillStyle = this.jump ? 'rgba(78,204,163,0.5)' : 'rgba(78,204,163,0.2)';
    this.drawRoundRect(ctx, width - 90, height - 100, 70, 70, 35);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('跳', width - 55, height - 55);

    // ── 暂停按钮 ──
    ctx.fillStyle = this.pause ? 'rgba(233,69,96,0.5)' : 'rgba(233,69,96,0.2)';
    this.drawRoundRect(ctx, width - 55, 10, 45, 30, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('⏸', width - 33, 30);

    ctx.globalAlpha = 1;
  }

  drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
