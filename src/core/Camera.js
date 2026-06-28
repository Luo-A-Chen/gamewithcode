/**
 * Camera - 2D 跟随相机
 * 平滑跟随目标实体，限制在关卡边界内
 */
export class Camera {
  constructor(viewWidth, viewHeight) {
    this.x = 0;
    this.y = 0;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.target = null;
    this.smoothing = 0.1; // 0 = 瞬移, 1 = 不动
    this.bounds = null;   // { x, y, w, h }
  }

  follow(entity) {
    this.target = entity;
  }

  setBounds(x, y, w, h) {
    this.bounds = { x, y, w, h };
  }

  update() {
    if (!this.target) return;

    // 目标位置：让 target 居中
    let tx = this.target.x - this.viewWidth / 2 + this.target.width / 2;
    let ty = this.target.y - this.viewHeight / 2 + this.target.height / 2;

    // 平滑插值
    this.x += (tx - this.x) * this.smoothing;
    this.y += (ty - this.y) * this.smoothing;

    // 限制在关卡边界内
    if (this.bounds) {
      this.x = Math.max(this.bounds.x, Math.min(this.x, this.bounds.x + this.bounds.w - this.viewWidth));
      this.y = Math.max(this.bounds.y, Math.min(this.y, this.bounds.y + this.bounds.h - this.viewHeight));
    }
  }

  applyTransform(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }
}
