/**
 * ParticleSystem - 粒子系统
 * 管理所有粒子效果（落地尘土、收集星星、受伤碎片等）
 */
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500;
  }

  /**
   * 生成粒子
   * @param {string} type - 粒子类型
   * @param {number} x - 生成位置 X
   * @param {number} y - 生成位置 Y
   * @param {object} options - 额外参数
   */
  emit(type, x, y, options = {}) {
    const config = ParticleSystem.TYPES[type] || ParticleSystem.TYPES.default;
    const count = options.count !== undefined ? options.count : config.count;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift(); // 移除最旧的
      }

      const angle = config.angleMin + Math.random() * (config.angleMax - config.angleMin);
      const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
      const life = config.lifeMin + Math.random() * (config.lifeMax - config.lifeMin);
      const size = config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size,
        color: options.color !== undefined ? options.color : config.color,
        gravity: config.gravity,
        fadeOut: config.fadeOut,
        shrink: config.shrink,
      });
    }
  }

  /**
   * 更新所有粒子
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.vy += (p.gravity || 0) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 渲染所有粒子
   */
  render(ctx) {
    for (var _i=0; _i < this.particles.length; _i++) { var p = this.particles[_i];
      const progress = 1 - (p.life / p.maxLife);
      let alpha = p.fadeOut ? (1 - progress) : 1;
      let size = p.shrink ? p.size * (1 - progress * 0.5) : p.size;

      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * 清除所有粒子
   */
  clear() {
    this.particles = [];
  }
}

// 粒子类型配置
ParticleSystem.TYPES = {
  // 落地尘土
  land_dust: {
    count: 4,
    color: '#8b7355',
    angleMin: -Math.PI * 0.8,
    angleMax: -Math.PI * 0.2,
    speedMin: 30,
    speedMax: 80,
    lifeMin: 0.2,
    lifeMax: 0.4,
    sizeMin: 2,
    sizeMax: 4,
    gravity: 100,
    fadeOut: true,
    shrink: true,
  },
  // 起跳尘土
  jump_dust: {
    count: 3,
    color: '#8b7355',
    angleMin: Math.PI * 0.2,
    angleMax: Math.PI * 0.8,
    speedMin: 20,
    speedMax: 60,
    lifeMin: 0.15,
    lifeMax: 0.3,
    sizeMin: 2,
    sizeMax: 3,
    gravity: 200,
    fadeOut: true,
    shrink: true,
  },
  // 收集金币星星
  collect_stars: {
    count: 8,
    color: '#ffd700',
    angleMin: 0,
    angleMax: Math.PI * 2,
    speedMin: 50,
    speedMax: 120,
    lifeMin: 0.3,
    lifeMax: 0.6,
    sizeMin: 2,
    sizeMax: 5,
    gravity: -50,
    fadeOut: true,
    shrink: true,
  },
  // 收集碎片
  fragment_collect: {
    count: 12,
    color: '#ffd700',
    angleMin: 0,
    angleMax: Math.PI * 2,
    speedMin: 80,
    speedMax: 180,
    lifeMin: 0.4,
    lifeMax: 0.8,
    sizeMin: 3,
    sizeMax: 6,
    gravity: -30,
    fadeOut: true,
    shrink: true,
  },
  // 敌人死亡碎片
  enemy_death: {
    count: 6,
    color: '#ff6b6b',
    angleMin: -Math.PI * 0.8,
    angleMax: -Math.PI * 0.2,
    speedMin: 60,
    speedMax: 150,
    lifeMin: 0.3,
    lifeMax: 0.5,
    sizeMin: 3,
    sizeMax: 5,
    gravity: 300,
    fadeOut: true,
    shrink: false,
  },
  // 受伤
  hurt: {
    count: 5,
    color: '#e94560',
    angleMin: -Math.PI * 0.7,
    angleMax: -Math.PI * 0.3,
    speedMin: 80,
    speedMax: 150,
    lifeMin: 0.2,
    lifeMax: 0.4,
    sizeMin: 2,
    sizeMax: 4,
    gravity: 200,
    fadeOut: true,
    shrink: true,
  },
  // 默认
  default: {
    count: 5,
    color: '#fff',
    angleMin: 0,
    angleMax: Math.PI * 2,
    speedMin: 30,
    speedMax: 80,
    lifeMin: 0.2,
    lifeMax: 0.5,
    sizeMin: 2,
    sizeMax: 4,
    gravity: 0,
    fadeOut: true,
    shrink: true,
  },
};
