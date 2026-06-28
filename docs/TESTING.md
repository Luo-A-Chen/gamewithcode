# 测试规范 (Testing Specification)

## 核心理念
游戏逻辑与渲染分离，确保核心逻辑可测试。

---

## 1. 测试分层

### 测试金字塔
```
        ┌───────────┐
        │  E2E 测试  │  少量，验证完整流程
        ├───────────┤
        │  集成测试   │  中量，验证模块协作
        ├───────────┤
        │  单元测试   │  大量，验证独立逻辑
        └───────────┘
```

### 测试范围
| 层级 | 覆盖范围 | 工具 | 数量 |
|------|---------|------|------|
| 单元测试 | 纯函数、数学计算、状态转换 | Jest / Vitest | 大量 |
| 集成测试 | 模块间交互（碰撞+实体） | Jest + Mock | 中量 |
| E2E 测试 | 完整游戏流程 | Playwright / Puppeteer | 少量 |

### 可测试性设计原则
| 原则 | 做法 | 反例 |
|------|------|------|
| 逻辑与渲染分离 | `update()` 修改状态，`render()` 只读取状态 | 在 `update()` 里调用 `ctx.fillRect` |
| 依赖注入 | 通过参数传入 `input`、`dt` | 全局读取 `Date.now()` |
| 纯函数优先 | 碰撞计算、伤害公式写成纯函数 | 函数内部修改外部状态 |
| 可预测的随机性 | 通过 seed 控制随机数 | 直接用 `Math.random()` |

---

## 2. 单元测试

### 可测试的模块
| 模块 | 测试内容 | 示例 |
|------|---------|------|
| CollisionSystem | AABB 检测、重叠计算 | 两个矩形碰撞 |
| 状态机 | 状态转换、条件守卫 | Idle → Jump 转换 |
| 关卡数据 | 瓦片查询、范围获取 | getTile、getTilesInRange |
| 数学工具 | 向量运算、插值、缓动 | lerp、easeOut |
| 存档系统 | 序列化、反序列化、迁移 | 存档读写 |
| 难度计算 | 伤害公式、评价计算 | 评价等级判定 |

### 测试示例
```javascript
// collision.test.js
describe('CollisionSystem', () => {
  test('AABB detects overlapping rectangles', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    const b = { x: 5, y: 5, w: 10, h: 10 };
    expect(CollisionSystem.aabb(a, b)).toBe(true);
  });

  test('AABB rejects non-overlapping rectangles', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    const b = { x: 20, y: 20, w: 10, h: 10 };
    expect(CollisionSystem.aabb(a, b)).toBe(false);
  });

  test('AABB handles edge touching', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    const b = { x: 10, y: 0, w: 10, h: 10 };
    expect(CollisionSystem.aabb(a, b)).toBe(false);
  });
});

// state-machine.test.js
describe('Player StateMachine', () => {
  test('Idle -> Jump on jump input', () => {
    const player = createPlayer();
    player.grounded = true;
    player.handleInput({ jump: true });
    expect(player.state).toBe('Jump');
  });

  test('Jump -> Fall when vy > 0', () => {
    const player = createPlayer({ state: 'Jump', vy: 10 });
    player.update(0.016);
    expect(player.state).toBe('Fall');
  });

  test('Cannot double jump when jumpCount >= maxJumps', () => {
    const player = createPlayer({ jumpCount: 2, maxJumps: 2 });
    player.handleInput({ jump: true });
    expect(player.vy).toBe(0); // 没有跳跃
  });
});

// save-system.test.js
describe('SaveSystem', () => {
  test('roundtrip serialization', () => {
    const original = createDefaultSave();
    original.progress.score = 1234;
    const saved = serializeSave(original);
    const loaded = deserializeSave(saved);
    expect(loaded.progress.score).toBe(1234);
  });

  test('migrates v1 save to v2', () => {
    const v1Save = { version: 1, progress: {} };
    const migrated = migrateSave(v1Save);
    expect(migrated.version).toBe(2);
    expect(migrated.stats).toBeDefined();
  });

  test('checksum validation catches corruption', () => {
    const save = createDefaultSave();
    const saved = serializeSave(save);
    const corrupted = saved.replace('"score":0', '"score":999');
    expect(() => deserializeSave(corrupted)).toThrow('checksum');
  });
});
```

---

## 3. 集成测试

### 测试场景
| 场景 | 验证内容 |
|------|---------|
| 玩家移动 + 碰撞 | 移动后不穿墙 |
| 敌人接触 + 伤害 | 受伤后进入无敌状态 |
| 收集物接触 | 收集后物品消失、分数增加 |
| Boss 战流程 | Boss 死亡后关卡完成 |
| 关卡加载 | 所有实体正确初始化 |

### 测试示例
```javascript
describe('Game Integration', () => {
  test('player collects coin and score increases', () => {
    const game = createTestGame();
    const coin = new Collectible(100, 400);
    game.entities.push(coin);
    game.player.x = 100;
    game.player.y = 400;

    game.update(0.016);

    expect(coin.dead).toBe(true);
    expect(game.score).toBeGreaterThan(0);
  });

  test('player dies when falling off world', () => {
    const game = createTestGame();
    game.player.y = 2500; // 超出世界底部

    game.update(0.016);

    expect(game.player.dead).toBe(true);
  });
});
```

---

## 4. E2E 测试

### 测试流程
```javascript
// 使用 Playwright
describe('Game E2E', () => {
  test('game loads and player can move', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 等待游戏加载
    await page.waitForSelector('#gameCanvas');
    
    // 按右键移动
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);
    
    // 验证游戏在运行（FPS > 0）
    const fps = await page.evaluate(() => window.game.fps);
    expect(fps).toBeGreaterThan(0);
  });

  test('complete level 1', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#gameCanvas');
    
    // 模拟通关操作（自动化测试）
    // ... 移动、跳跃到终点
    
    // 验证通关
    const levelComplete = await page.evaluate(() => 
      window.game.state === 'LevelComplete'
    );
    expect(levelComplete).toBe(true);
  });
});
```

---

## 5. 测试配置

### 测试框架配置 (Vitest)
```javascript
// vitest.config.js
export default {
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.test.js',
        'assets/',
      ],
    },
  },
};
```

### 项目结构
```
src/
├── core/
│   ├── Game.js
│   ├── Game.test.js          # Game 单元测试
│   ├── CollisionSystem.js
│   └── CollisionSystem.test.js
├── entities/
│   ├── Player.js
│   └── Player.test.js
└── ...

tests/
├── integration/
│   └── game-integration.test.js
└── e2e/
    └── game-flow.test.js
```

---

## 6. 测试检查清单

### 每次提交前
- [ ] 所有单元测试通过
- [ ] 新增代码有对应测试
- [ ] 无控制台错误

### 每个功能完成后
- [ ] 集成测试通过
- [ ] 手动测试核心流程
- [ ] 性能无明显下降

### 每个版本发布前
- [ ] E2E 测试通过
- [ ] 全平台测试（Chrome/Firefox/Safari）
- [ ] 性能基准测试
- [ ] 存档兼容性测试

---

## 7. 测试数据工厂

### 创建测试用实体
```javascript
// test-helpers.js
export function createPlayer(overrides = {}) {
  return new Player(
    overrides.x ?? 100,
    overrides.y ?? 400,
    overrides.state ?? 'Idle',
    overrides.hp ?? 3
  );
}

export function createEnemy(overrides = {}) {
  return new Enemy(
    overrides.x ?? 300,
    overrides.y ?? 448,
    overrides.patrolRange ?? 80
  );
}

export function createTestLevel() {
  return new Level({
    tiles: [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1],
    ],
    spawn: { x: 64, y: 96 },
  });
}
```

---

## 8. Mock 策略

### 需要 Mock 的模块
| 模块 | Mock 方式 | 原因 |
|------|---------|------|
| Canvas API | jsdom 内置 | 无真实渲染 |
| Audio API | Mock AudioContext | 无声音播放 |
| localStorage | jsdom 内置 | 隔离存储 |
| requestAnimationFrame | 手动控制时间 | 精确控制帧 |
| Image | Mock 加载 | 无真实图片 |

### Mock 示例
```javascript
// Mock requestAnimationFrame
let currentTime = 0;
global.requestAnimationFrame = (cb) => {
  currentTime += 16.67; // 60fps
  return setTimeout(() => cb(currentTime), 0);
};

// Mock Image
class MockImage {
  constructor() {
    this.complete = true;
    this.width = 32;
    this.height = 32;
  }
}
global.Image = MockImage;
```
