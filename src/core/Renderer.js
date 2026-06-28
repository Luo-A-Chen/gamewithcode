/**
 * Renderer - 绘制管理器
 * 负责清屏、绘制关卡
 */
export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear(canvas) {
    this.ctx.fillStyle = '#0f3460';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawLevel(level) {
    if (!level) return;
    level.render(this.ctx);
  }
}
