# 性能优化规范 (Performance Specification)

## 核心理念
60fps 是底线。在低端设备上也要保证流畅体验。

---

## 1. 性能目标

### 帧率目标
| 设备 | 目标帧率 | 最低可接受 |
|------|---------|-----------|
| 桌面浏览器 | 60 FPS | 30 FPS |
| 移动浏览器 | 60 FPS | 30 FPS |
| 低端设备 | 30 FPS | 20 FPS |

### 内存目标
| 项目 | 上限 |
|------|------|
| 总内存占用 | < 100MB |
| 单张纹理 | < 2MB |
| 音频缓冲 | < 50MB |
| 对象池上限 | < 1000 对象 |

### 加载目标
| 项目 | 目标 |
|------|------|
| 首屏加载 | < 3s |
| 关卡切换 | < 1s |
| 资源预加载 | 显示进度条 |

### 帧预算（60fps = 16.67ms/帧）
| 阶段 | 预算 | 说明 |
|------|------|------|
| 输入处理 | 1ms | 读取键盘状态 |
| 逻辑更新 | 5ms | 实体更新、AI、状态机 |
| 碰撞检测 | 3ms | 空间分区 + AABB |
| 渲染 | 6ms | 清屏 + 绘制 + UI |
| 音频 | 1ms | 音效触发 |
| **总计** | **16ms** | 留 0.67ms 余量 |

如果任一阶段超预算，优先优化该阶段。

---

## 2. 渲染优化

### 脏矩形渲染
```javascript
// 只重绘变化区域
class DirtyRenderer {
  constructor(canvas) {
    this.dirtyRects = [];
  }

  markDirty(x, y, w, h) {
    this.dirtyRects.push({ x, y, w, h });
  }

  render() {
    if (this.dirtyRects.length === 0) return;
    
    // 合并脏矩形
    const bounds = this.mergeRects(this.dirtyRects);
    
    // 只清除并重绘脏区域
    ctx.clearRect(bounds.x, bounds.y, bounds.w, bounds.h);
    // 重绘该区域内的所有对象
    this.redrawRegion(bounds);
    
    this.dirtyRects = [];
  }
}
```

### 离屏 Canvas 预渲染
```javascript
// 静态地形预渲染到离屏画布
class TileRenderer {
  constructor(level) {
    this.offscreen = document.createElement('canvas');
    this.offscreen.width = level.width;
    this.offscreen.height = level.height;
    this.ctx = this.offscreen.getContext('2d');
    this.prerender(level);
  }

  prerender(level) {
    // 一次性绘制所有瓦片到离屏画布
    for (let row = 0; row < level.tiles.length; row++) {
      for (let col = 0; col < level.tiles[0].length; col++) {
        // 绘制瓦片...
      }
    }
  }

  render(ctx, camera) {
    // 只绘制相机可见区域
    ctx.drawImage(
      this.offscreen,
      camera.x, camera.y, camera.viewWidth, camera.viewHeight,
      camera.x, camera.y, camera.viewWidth, camera.viewHeight
    );
  }
}
```

### 绘制调用优化
| 优化项 | 说明 |
|--------|------|
| 批量绘制 | 相同样式的矩形一起绘制 |
| 减少状态切换 | 按 fillStyle 分组绘制 |
| 避免浮点坐标 | 使用 Math.round() 取整 |
| 使用 `willReadFrequently` | 频繁读取像素时启用 |
| 禁用抗锯齿 | 像素风游戏 `imageSmoothingEnabled = false` |

---

## 3. 碰撞检测优化

### 空间分区（网格法）
```javascript
class SpatialGrid {
  constructor(cellSize = 128) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  clear() {
    this.cells.clear();
  }

  insert(entity) {
    const cellX = Math.floor(entity.x / this.cellSize);
    const cellY = Math.floor(entity.y / this.cellSize);
    const key = `${cellX},${cellY}`;
    
    if (!this.cells.has(key)) {
      this.cells.set(key, []);
    }
    this.cells.get(key).push(entity);
  }

  getNearby(entity) {
    const results = [];
    const cellX = Math.floor(entity.x / this.cellSize);
    const cellY = Math.floor(entity.y / this.cellSize);
    
    // 检查周围 9 个格子
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cellX + dx},${cellY + dy}`;
        const cell = this.cells.get(key);
        if (cell) results.push(...cell);
      }
    }
    return results;
  }
}
```

### 碰撞检测分层
```
宽相检测（Broad Phase）
  └── 网格法筛选附近实体
      └── 窄相检测（Narrow Phase）
          └── AABB 精确碰撞
```

---

## 4. 对象池

### 通用对象池
```javascript
class ObjectPool {
  constructor(factory, reset, initialSize = 50) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    this.active = [];
    
    // 预创建
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.factory();
    }
    this.active.push(obj);
    return obj;
  }

  release(obj) {
    const idx = this.active.indexOf(obj);
    if (idx !== -1) {
      this.active.splice(idx, 1);
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    while (this.active.length > 0) {
      this.release(this.active[0]);
    }
  }
}
```

### 池化对象类型
| 对象 | 初始池大小 | 最大池大小 |
|------|-----------|-----------|
| 粒子 | 200 | 500 |
| 子弹 | 50 | 100 |
| 弹出文字 | 20 | 50 |
| 敌人 | 30 | 60 |

---

## 5. 帧率监控

### FPS 计数器
```javascript
class FPSCounter {
  constructor() {
    this.frames = 0;
    this.fps = 0;
    this.lastTime = 0;
    this.history = [];
  }

  update(timestamp) {
    this.frames++;
    if (timestamp - this.lastTime >= 1000) {
      this.fps = this.frames;
      this.frames = 0;
      this.lastTime = timestamp;
      this.history.push(this.fps);
      if (this.history.length > 60) this.history.shift();
    }
  }

  get average() {
    if (this.history.length === 0) return 0;
    return this.history.reduce((a, b) => a + b) / this.history.length;
  }

  get min() {
    return Math.min(...this.history);
  }
}
```

### 性能降级策略
| FPS 范围 | 策略 |
|----------|------|
| > 50 | 正常渲染 |
| 30-50 | 关闭粒子效果 |
| 20-30 | 降低渲染分辨率 |
| < 20 | 关闭所有特效 + 最低分辨率 |

---

## 6. 内存管理

### GC 优化
| 原则 | 说明 |
|------|------|
| 避免每帧创建对象 | 复用临时对象 |
| 使用对象池 | 频繁创建/销毁的对象池化 |
| 避免闭包 | 事件回调使用绑定方法 |
| 预分配数组 | `new Array(maxSize)` |
| 清空而非重建 | `arr.length = 0` 而非 `arr = []` |

### 内存监控
```javascript
class MemoryMonitor {
  constructor() {
    this.samples = [];
  }

  sample() {
    if (performance.memory) {
      this.samples.push(performance.memory.usedJSHeapSize);
      if (this.samples.length > 100) this.samples.shift();
    }
  }

  get trend() {
    if (this.samples.length < 2) return 'stable';
    const last = this.samples.slice(-10);
    const first = this.samples.slice(0, 10);
    const avgLast = last.reduce((a, b) => a + b) / last.length;
    const avgFirst = first.reduce((a, b) => a + b) / first.length;
    
    if (avgLast > avgFirst * 1.2) return 'increasing';
    if (avgLast < avgFirst * 0.8) return 'decreasing';
    return 'stable';
  }
}
```

---

## 7. 资源加载优化

### 并行加载
```javascript
async function loadAssets(manifest) {
  const promises = [];
  
  for (const [key, asset] of Object.entries(manifest.images)) {
    promises.push(loadImage(asset.src).then(img => ({ key, img })));
  }
  
  for (const [key, asset] of Object.entries(manifest.sounds)) {
    promises.push(loadAudio(asset.src).then(buf => ({ key, buf })));
  }
  
  return Promise.all(promises);
}
```

### 按需加载
- 主菜单：只加载菜单资源
- 世界1：加载世界1的瓦片、精灵、音效
- 世界2：卸载世界1资源，加载世界2资源

### 资源缓存
```javascript
class AssetCache {
  constructor(maxSize = 50 * 1024 * 1024) { // 50MB
    this.cache = new Map();
    this.maxSize = maxSize;
    this.currentSize = 0;
  }

  set(key, asset, size) {
    // LRU 淘汰
    while (this.currentSize + size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }
    
    this.cache.set(key, { asset, size });
    this.currentSize += size;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (entry) {
      // 移到末尾（LRU）
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
    return entry?.asset;
  }

  delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
    }
  }
}
```

---

## 8. 调试工具

### 开发模式性能面板
```
┌─────────────────────────────────────────┐
│ FPS: 58   Avg: 59   Min: 45           │
│ Objects: 156   Particles: 89           │
│ Memory: 45MB   Trend: stable           │
│ Draw Calls: 234   Collision Checks: 89 │
└─────────────────────────────────────────┘
```

### 性能分析工具
| 工具 | 用途 |
|------|------|
| Chrome DevTools Performance | 帧率分析 |
| Chrome DevTools Memory | 内存分析 |
| FPSCounter | 运行时帧率 |
| 自定义 Profiler | 函数耗时统计 |

### Profiler 实现
```javascript
class Profiler {
  constructor() {
    this.timers = {};
  }

  start(name) {
    this.timers[name] = performance.now();
  }

  end(name) {
    const elapsed = performance.now() - this.timers[name];
    console.log(`${name}: ${elapsed.toFixed(2)}ms`);
    return elapsed;
  }
}
```
