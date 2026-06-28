import { Entity } from './Entity.js';

/**
 * RewardItem - 通关奖励道具
 * 击败 Boss 后掉落，代表该时代的里程碑
 */
export class RewardItem extends Entity {
  constructor(x, y, worldId, name, desc) {
    super(x, y, 24, 24);
    this.solid = false;
    this.worldId = worldId;
    this.name = name;
    this.desc = desc;
    this.collected = false;
    this.bobTimer = 0;
    this.baseY = y;
    this.glowTimer = 0;
  }

  update(dt) {
    if (this.collected) return;
    this.bobTimer += 3 * dt;
    this.y = this.baseY + Math.sin(this.bobTimer) * 6;
    this.glowTimer += dt;
  }

  onCollide(other) {
    if (other.constructor.name === 'Player' && !this.collected) {
      this.collected = true;
      this.dead = true;
    }
  }

  render(ctx) {
    if (this.collected) return;

    var cx = this.x + this.width / 2;
    var cy = this.y + this.height / 2;

    // 光晕
    var glow = Math.sin(this.glowTimer * 3) * 0.2 + 0.6;
    ctx.fillStyle = 'rgba(255, 215, 0, ' + glow * 0.3 + ')';
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fill();

    // 道具图标
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

    // 道具名
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.name.substring(0, 3), cx, cy + 3);

    // 浮动标签
    ctx.fillStyle = '#ffd700';
    ctx.font = '10px monospace';
    ctx.fillText(this.name, cx, this.y - 10);
  }
}

/**
 * 各世界奖励定义
 */
RewardItem.WORLD_REWARDS = {
  1: { name: '齿轮之心', desc: '巴贝奇差分机的核心齿轮，代表机械计算的起点' },
  2: { name: '真空管', desc: 'ENIAC的18000个真空管之一，电子计算的象征' },
  3: { name: '打孔卡片', desc: 'FORTRAN程序的载体，高级语言的诞生' },
  4: { name: 'C语言手册', desc: 'Dennis Ritchie创造的系统编程语言' },
  5: { name: '类蓝图', desc: '面向对象编程的核心概念：封装、继承、多态' },
  6: { name: '超链接', desc: 'Tim Berners-Lee发明的万维网核心' },
  7: { name: '神经元', desc: '深度学习的基本单元，AI时代的起点' },
};
