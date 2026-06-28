# 事件系统规范 (Event System Specification)

> 参考：Robert Nystrom《Game Programming Patterns》Observer + Event Queue 章节

## 核心理念
实体间不直接引用，通过事件解耦。A 不需要知道 B 的存在，只需要发出事件。

---

## 1. 事件总线设计

### 全局事件总线
```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  // 订阅事件（priority 越小越先执行）
  on(event, callback, context = null, priority = 0) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const list = this.listeners.get(event);
    list.push({ callback, context, priority });
    // 按优先级排序
    list.sort((a, b) => a.priority - b.priority);

    // 返回取消订阅函数
    return () => this.off(event, callback);
  }

  // 取消订阅
  off(event, callback) {
    const list = this.listeners.get(event);
    if (list) {
      const idx = list.findIndex(l => l.callback === callback);
      if (idx !== -1) list.splice(idx, 1);
    }
  }

  // 触发事件（按优先级顺序执行）
  emit(event, data = {}) {
    const list = this.listeners.get(event);
    if (list) {
      for (const { callback, context } of list) {
        callback.call(context, data);
      }
    }
  }

  // 一次性订阅
  once(event, callback, context = null) {
    const wrapper = (data) => {
      callback.call(context, data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  // 清除所有监听
  clear() {
    this.listeners.clear();
  }
}

// 全局单例
export const eventBus = new EventBus();
```

---

## 2. 事件类型清单

### 玩家事件
| 事件名 | 触发时机 | 数据 |
|--------|---------|------|
| `player:jump` | 玩家跳跃 | `{ x, y, isDoubleJump }` |
| `player:land` | 玩家着地 | `{ x, y, velocity }` |
| `player:hurt` | 玩家受伤 | `{ damage, source, hp }` |
| `player:die` | 玩家死亡 | `{ cause, x, y }` |
| `player:respawn` | 玩家重生 | `{ x, y, checkpoint }` |
| `player:collect` | 收集物品 | `{ type, value, total }` |

### 敌人事件
| 事件名 | 触发时机 | 数据 |
|--------|---------|------|
| `enemy:spawn` | 敌人生成 | `{ type, x, y }` |
| `enemy:death` | 敌人死亡 | `{ type, x, y, killedBy }` |
| `enemy:hurt` | 敌人受伤 | `{ type, hp, damage }` |
| `boss:phase` | Boss 阶段切换 | `{ bossId, phase }` |
| `boss:death` | Boss 死亡 | `{ bossId, worldId }` |

### 关卡事件
| 事件名 | 触发时机 | 数据 |
|--------|---------|------|
| `level:start` | 关卡开始 | `{ worldId, levelId }` |
| `level:complete` | 关卡通关 | `{ worldId, levelId, time, stars }` |
| `level:checkpoint` | 到达检查点 | `{ checkpointId, x, y }` |
| `level:transition` | 关卡切换 | `{ from, to }` |
| `world:unlock` | 世界解锁 | `{ worldId }` |

### 游戏流程事件
| 事件名 | 触发时机 | 数据 |
|--------|---------|------|
| `game:pause` | 游戏暂停 | `{}` |
| `game:resume` | 游戏恢复 | `{}` |
| `game:over` | 游戏结束 | `{ score, time }` |
| `game:save` | 存档 | `{ slotId }` |
| `game:load` | 读档 | `{ slotId }` |

### UI 事件
| 事件名 | 触发时机 | 数据 |
|--------|---------|------|
| `ui:menuOpen` | 菜单打开 | `{ menuId }` |
| `ui:menuClose` | 菜单关闭 | `{ menuId }` |
| `ui:buttonClick` | 按钮点击 | `{ buttonId }` |
| `ui:sliderChange` | 滑块变化 | `{ sliderId, value }` |
| `ui:notification` | 显示通知 | `{ type, message, duration }` |

---

## 3. 事件使用示例

### 玩家收集金币
```javascript
// Player.js - 碰撞时触发事件
onCollide(other) {
  if (other instanceof Collectible && !other.collected) {
    other.collected = true;
    other.dead = true;
    
    // 发出事件，不关心谁在监听
    eventBus.emit('player:collect', {
      type: 'coin',
      value: 10,
      total: this.coins
    });
  }
}

// ScoreManager.js - 监听收集事件
eventBus.on('player:collect', (data) => {
  if (data.type === 'coin') {
    this.score += data.value;
    this.coins = data.total;
  }
});

// AudioManager.js - 监听收集事件播放音效
eventBus.on('player:collect', (data) => {
  audioManager.playSFX('collect', { pitch: 1 + data.total * 0.01 });
});

// ParticleSystem.js - 监听收集事件生成粒子
eventBus.on('player:collect', (data) => {
  particleSystem.emit('coins', data.x, data.y, 8);
});

// UIManager.js - 监听收集事件更新显示
eventBus.on('player:collect', (data) => {
  this.updateCoinDisplay(data.total);
  this.showFloatingText(`+${data.value}`, data.x, data.y);
});
```

### Boss 阶段切换
```javascript
// Boss.js - 血量变化时触发
update(dt) {
  // ... 更新逻辑
  
  const newPhase = this.calculatePhase();
  if (newPhase !== this.currentPhase) {
    this.currentPhase = newPhase;
    eventBus.emit('boss:phase', {
      bossId: this.id,
      phase: newPhase,
      hp: this.hp,
      maxHp: this.maxHp
    });
  }
}

// Camera.js - 监听 Boss 阶段切换，震屏
eventBus.on('boss:phase', (data) => {
  if (data.phase === 2) {
    this.shake(10, 0.5);
  }
});

// AudioManager.js - 监听 Boss 阶段切换，切换音乐
eventBus.on('boss:phase', (data) => {
  if (data.phase === 2) {
    audioManager.addMusicLayer('boss_intense');
  }
});

// BossUI.js - 监听 Boss 阶段切换，更新血条
eventBus.on('boss:phase', (data) => {
  this.bossHealthBar.setPhase(data.phase);
  this.bossHealthBar.animateHP(data.hp, data.maxHp);
});
```

---

## 4. 事件队列（延迟处理）

### 使用场景
- 需要在下一帧处理的事件
- 需要排序的事件
- 需要批量处理的事件

### 实现
```javascript
class EventQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  enqueue(event, data, delay = 0) {
    this.queue.push({ event, data, delay, time: 0 });
  }

  update(dt) {
    // 更新延迟
    for (const item of this.queue) {
      item.time += dt;
    }

    // 处理到期事件
    const toProcess = this.queue.filter(item => item.time >= item.delay);
    this.queue = this.queue.filter(item => item.time < item.delay);

    // 按优先级排序
    toProcess.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // 触发事件
    for (const { event, data } of toProcess) {
      eventBus.emit(event, data);
    }
  }
}
```

---

## 5. 事件命名规范

### 命名格式
```
{模块}:{动作}
```

### 规则
1. **模块名**：小写，单词间用下划线（如 `player`, `boss`, `level`）
2. **动作名**：小写，单词间用下划线（如 `collect`, `phase_change`）
3. **冒号分隔**：模块和动作用冒号分隔
4. **过去时**：已完成的动作用过去时（`died` 而非 `die`）
5. **进行时**：持续状态用进行时（`hurting`）

### 示例
```
player:jump          ✓
player:collect       ✓
boss:phase_change    ✓
level:complete       ✓
enemy:died           ✓
game:paused          ✓
```

---

## 6. 事件解耦规则

### 允许
- 实体发出事件，不关心谁监听
- 系统监听事件，不关心谁发出
- 一个事件被多个监听者处理

### 禁止
- 实体直接调用其他实体的方法
- 实体持有其他实体的引用（除了碰撞检测）
- 监听者修改发出事件的实体状态

### 例外
- **碰撞系统**：需要直接访问实体位置和碰撞体
- **相机**：需要直接访问跟随目标的位置
- **渲染器**：需要直接访问实体的渲染属性

---

## 7. 事件优先级与执行顺序

### 优先级定义
| 优先级 | 系统 | 说明 |
|--------|------|------|
| 0 (最高) | 存档系统 | 先保存状态，再触发其他反应 |
| 1 | 游戏逻辑 | 分数、生命值更新 |
| 2 | 视觉反馈 | 粒子、动画 |
| 3 | 音频系统 | 播放音效 |
| 4 (最低) | UI 更新 | 最后更新显示 |

### 使用示例
```javascript
// 存档系统：最高优先级
eventBus.on('player:collect', saveProgress, null, 0);

// 游戏逻辑：高优先级
eventBus.on('player:collect', updateScore, null, 1);

// 粒子系统：中优先级
eventBus.on('player:collect', spawnParticles, null, 2);

// 音频系统：低优先级
eventBus.on('player:collect', playCollectSound, null, 3);

// UI 更新：最低优先级
eventBus.on('player:collect', updateHUD, null, 4);
```

### 规则
1. 存档必须在逻辑更新前执行（防止保存过时数据）
2. 音频在视觉反馈后执行（音画同步）
3. UI 最后更新（确保显示最新状态）
4. 同优先级按订阅顺序执行

---

## 8. 调试工具

### 事件日志
```javascript
class EventLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  log(event, data) {
    this.logs.push({
      time: performance.now(),
      event,
      data: JSON.parse(JSON.stringify(data))
    });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  print() {
    console.table(this.logs);
  }

  clear() {
    this.logs = [];
  }
}

// 开发模式下启用
if (process.env.NODE_ENV === 'development') {
  const logger = new EventLogger();
  const originalEmit = eventBus.emit.bind(eventBus);
  eventBus.emit = (event, data) => {
    logger.log(event, data);
    originalEmit(event, data);
  };
}
```

### 事件可视化
```
┌─────────────────────────────────────────┐
│ Event Log                               │
├─────────────────────────────────────────┤
│ 10:30:01.234  player:jump    {y: 400}  │
│ 10:30:01.456  player:land    {y: 448}  │
│ 10:30:02.123  player:collect {type:coin}│
│ 10:30:02.124  ui:notification          │
│ 10:30:03.456  enemy:death    {type:patrol}│
└─────────────────────────────────────────┘
```
