/**
 * InputManager - 输入管理器
 * 键盘 + 鼠标，支持单次触发检测
 */
export class InputManager {
  constructor() {
    // 键盘
    this.keys = new Set();
    this.justPressedKeys = new Set();
    this._prevKeys = new Set();

    // 鼠标
    this.mouseX = 0;
    this.mouseY = 0;
    this._mouseClickedThisFrame = false;
    this._mouseDownLastFrame = false;
    this._mouseDown = false;

    // 键盘事件
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });

    // 鼠标事件
    window.addEventListener('mousemove', (e) => {
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      }
    });

    window.addEventListener('mousedown', (e) => {
      this._mouseDown = true;
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
        this.mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
      }
    });

    window.addEventListener('mouseup', (e) => {
      this._mouseDown = false;
    });
  }

  /**
   * 每帧开头调用
   */
  update() {
    // 键盘单次触发
    this.justPressedKeys.clear();
    var self = this;
    this.keys.forEach(function(key) {
      if (!self._prevKeys.has(key)) {
        self.justPressedKeys.add(key);
      }
    });
    this._prevKeys = new Set(this.keys);

    // 鼠标单次触发：当前帧按下 且 上一帧未按下
    this._mouseClickedThisFrame = this._mouseDown && !this._mouseDownLastFrame;
    this._mouseDownLastFrame = this._mouseDown;
  }

  /**
   * 鼠标是否在矩形区域内
   */
  isMouseInRect(x, y, w, h) {
    return (
      this.mouseX >= x &&
      this.mouseX <= x + w &&
      this.mouseY >= y &&
      this.mouseY <= y + h
    );
  }

  /**
   * 当前帧是否点击了指定矩形区域
   */
  isRectClicked(x, y, w, h) {
    return this._mouseClickedThisFrame && this.isMouseInRect(x, y, w, h);
  }

  isPressed(code) { return this.keys.has(code); }
  isJustPressed(code) { return this.justPressedKeys.has(code); }

  get left()  { return this.isPressed('ArrowLeft')  || this.isPressed('KeyA'); }
  get right() { return this.isPressed('ArrowRight') || this.isPressed('KeyD'); }
  get up()    { return this.isPressed('ArrowUp')    || this.isPressed('KeyW'); }
  get down()  { return this.isPressed('ArrowDown')  || this.isPressed('KeyS'); }
  get jump()  { return this.isPressed('Space')      || this.isPressed('ArrowUp'); }
}
