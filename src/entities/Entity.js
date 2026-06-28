/**
 * Entity - 所有游戏实体的基类
 * 提供位置、速度、尺寸、碰撞体等通用属性
 */
export class Entity {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;
    this.solid = true;
    this.grounded = false;
    this.dead = false;
    this.facingRight = true;
  }

  update(dt) {
    // 子类重写
  }

  render(ctx) {
    // 子类重写
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      w: this.width,
      h: this.height,
    };
  }

  onCollide(other) {
    // 子类重写
  }
}
