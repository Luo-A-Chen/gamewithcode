/**
 * Level - 关卡数据
 * 管理瓦片地图、生成点、实体列表
 */
export class Level {
  constructor(data) {
    this.tileSize = 32;
    this.tiles = data.tiles;
    this.spawn = data.spawn;
    this.entities = data.entities || [];
    this.theme = data.theme || 'gear'; // 'gear' = 机械, 'tube' = 电子
    this.width = this.tiles[0].length * this.tileSize;
    this.height = this.tiles.length * this.tileSize;
  }

  /**
   * 获取指定位置的瓦片类型
   */
  getTile(col, row) {
    if (row < 0 || row >= this.tiles.length) return 0;
    if (col < 0 || col >= this.tiles[0].length) return 0;
    return this.tiles[row][col];
  }

  /**
   * 获取指定像素范围内的所有瓦片（用于碰撞检测）
   */
  getTilesInRange(px, py, pw, ph) {
    const result = [];
    const startCol = Math.floor(px / this.tileSize);
    const endCol = Math.floor((px + pw) / this.tileSize);
    const startRow = Math.floor(py / this.tileSize);
    const endRow = Math.floor((py + ph) / this.tileSize);

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const type = this.getTile(col, row);
        if (type > 0 && type !== 3) { // 3 是装饰，无碰撞
          result.push({
            x: col * this.tileSize,
            y: row * this.tileSize,
            w: this.tileSize,
            h: this.tileSize,
            type,
            solid: type === 1,         // 类型1：完全实心
            oneWay: type === 2,        // 类型2：单向平台（仅从上方阻挡）
          });
        }
      }
    }
    return result;
  }

  /**
   * 绘制关卡
   */
  render(ctx) {
    var themes = {
      gear: {
        1: '#1a1a3e', 2: '#2d1b4e', 3: '#3a3a5c',
        border1: 'rgba(233, 69, 96, 0.3)', border2: 'rgba(78, 204, 163, 0.3)', border3: 'rgba(255, 255, 255, 0.05)',
      },
      tube: {
        1: '#0a1a0a', 2: '#1a2a1a', 3: '#2a3a2a',
        border1: 'rgba(0, 255, 100, 0.2)', border2: 'rgba(0, 200, 255, 0.2)', border3: 'rgba(0, 255, 0, 0.05)',
      },
      green: {
        1: '#0a0a1a', 2: '#1a1a2a', 3: '#0a1a0a',
        border1: 'rgba(0, 255, 0, 0.2)', border2: 'rgba(0, 200, 0, 0.2)', border3: 'rgba(0, 255, 0, 0.05)',
      },
      city: {
        1: '#1a1a2a', 2: '#2a1a3a', 3: '#3a2a1a',
        border1: 'rgba(100, 200, 255, 0.2)', border2: 'rgba(200, 100, 255, 0.2)', border3: 'rgba(255, 200, 100, 0.05)',
      },
      web: {
        1: '#0a0a2a', 2: '#1a1a4a', 3: '#2a0a3a',
        border1: 'rgba(78, 136, 255, 0.2)', border2: 'rgba(200, 100, 255, 0.2)', border3: 'rgba(100, 200, 255, 0.05)',
      },
      ai: {
        1: '#0a0a1a', 2: '#1a0a2a', 3: '#0a1a2a',
        border1: 'rgba(78, 204, 163, 0.2)', border2: 'rgba(100, 100, 255, 0.2)', border3: 'rgba(78, 204, 163, 0.05)',
      },
    };

    var t = themes[this.theme] || themes.gear;
    var colors = { 1: t[1], 2: t[2], 3: t[3] };
    var borderColors = { 1: t.border1, 2: t.border2, 3: t.border3 };

    for (let row = 0; row < this.tiles.length; row++) {
      for (let col = 0; col < this.tiles[0].length; col++) {
        const type = this.tiles[row][col];
        if (type > 0) {
          const x = col * this.tileSize;
          const y = row * this.tileSize;

          // 填充
          ctx.fillStyle = colors[type] || '#333';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);

          // 边框
          ctx.strokeStyle = borderColors[type] || 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1);

          // 装饰瓦片：画小齿轮
          if (type === 3) {
            this.drawMiniGear(ctx, x + this.tileSize / 2, y + this.tileSize / 2, 10);
          }
        }
      }
    }
  }

  /**
   * 绘制装饰小齿轮
   */
  drawMiniGear(ctx, cx, cy, radius) {
    ctx.save();
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    // 齿
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * radius * 0.5, cy + Math.sin(a) * radius * 0.5);
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
      ctx.stroke();
    }
    ctx.restore();
  }
}
