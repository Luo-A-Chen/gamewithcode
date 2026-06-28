# 自动化测试工作流 (Automated Testing Workflow)

> 每次开发完成后，按此文档执行自动化测试，验证功能正确性和无回归。

## 核心理念
测试即文档，测试即信心。每次改动后一键验证，发现问题即修复。

---

## 1. 测试流水线总览

```
代码改动完成
    │
    ▼
┌─────────────────┐
│ Phase 1: 单元测试 │  ← 快速反馈（< 10s）
│  Vitest + Mock   │
└────────┬────────┘
         │ PASS
         ▼
┌─────────────────┐
│ Phase 2: 冒烟测试 │  ← 核心流程验证（< 30s）
│  Playwright      │
└────────┬────────┘
         │ PASS
         ▼
┌─────────────────┐
│ Phase 3: 视觉回归 │  ← 截图对比（< 60s）
│  pixelmatch      │
└────────┬────────┘
         │ PASS
         ▼
┌─────────────────┐
│ Phase 4: 性能基准 │  ← FPS/内存检测（< 30s）
│  CDP Metrics     │
└────────┬────────┘
         │ PASS
         ▼
    ✅ 测试通过，可提交
```

---

## 2. 环境搭建

### 依赖安装
```bash
cd E:\games\platformer

# 初始化 npm（如果还没有）
npm init -y

# 测试框架
npm install -D vitest vitest-canvas-mock jsdom

# E2E 测试
npm install -D @playwright/test

# 视觉回归
npm install -D pixelmatch pngjs

# 开发服务器
npm install -D serve
```

### 项目配置
```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:visual": "playwright test tests/visual/",
    "test:perf": "node tests/performance/benchmark.mjs",
    "test:all": "npm run test && npm run test:e2e && npm run test:visual && npm run test:perf",
    "serve": "serve . -l 3000"
  }
}
```

### Vitest 配置
```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    globals: true,
    include: ['src/**/*.test.js', 'tests/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/**/*.test.js'],
    },
  },
});
```

### 测试环境初始化
```javascript
// tests/setup.js
import 'vitest-canvas-mock';

// Mock requestAnimationFrame
let frameId = 0;
const callbacks = new Map();

global.requestAnimationFrame = (cb) => {
  const id = ++frameId;
  callbacks.set(id, cb);
  return id;
};

global.cancelAnimationFrame = (id) => {
  callbacks.delete(id);
};

// 辅助函数：推进 N 帧
global.advanceFrames = (count, dt = 16.67) => {
  for (let i = 0; i < count; i++) {
    for (const [id, cb] of callbacks) {
      callbacks.delete(id);
      cb(performance.now() + dt * i);
    }
  }
};
```

### Playwright 配置
```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 960, height: 540 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npx serve . -l 3000',
    port: 3000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
});
```

---

## 3. Phase 1：单元测试

### 测试范围
| 模块 | 测试内容 | 优先级 |
|------|---------|--------|
| CollisionSystem | AABB 检测、重叠计算 | P0 |
| StateMachine | 状态转换、守卫条件 | P0 |
| Level | 瓦片查询、范围获取 | P0 |
| Player | 移动逻辑、跳跃计数 | P1 |
| Enemy | 巡逻行为 | P1 |
| SaveSystem | 序列化、校验、迁移 | P1 |
| EventBus | 订阅、触发、优先级 | P2 |

### 测试文件示例
```javascript
// tests/unit/CollisionSystem.test.js
import { describe, test, expect } from 'vitest';
import { CollisionSystem } from '../../src/core/CollisionSystem.js';

describe('CollisionSystem', () => {
  describe('AABB', () => {
    test('检测重叠矩形', () => {
      const a = { x: 0, y: 0, w: 10, h: 10 };
      const b = { x: 5, y: 5, w: 10, h: 10 };
      expect(CollisionSystem.aabb(a, b)).toBe(true);
    });

    test('不重叠返回 false', () => {
      const a = { x: 0, y: 0, w: 10, h: 10 };
      const b = { x: 20, y: 20, w: 10, h: 10 };
      expect(CollisionSystem.aabb(a, b)).toBe(false);
    });

    test('边缘接触不算重叠', () => {
      const a = { x: 0, y: 0, w: 10, h: 10 };
      const b = { x: 10, y: 0, w: 10, h: 10 };
      expect(CollisionSystem.aabb(a, b)).toBe(false);
    });

    test('包含关系算重叠', () => {
      const a = { x: 0, y: 0, w: 20, h: 20 };
      const b = { x: 5, y: 5, w: 5, h: 5 };
      expect(CollisionSystem.aabb(a, b)).toBe(true);
    });
  });

  describe('getOverlap', () => {
    test('计算正确的重叠量', () => {
      const a = { x: 0, y: 0, w: 10, h: 10 };
      const b = { x: 5, y: 5, w: 10, h: 10 };
      const overlap = CollisionSystem.prototype.getOverlap.call(null, a, b);
      expect(overlap.dx).toBe(5);
      expect(overlap.dy).toBe(5);
    });

    test('无重叠返回 null', () => {
      const a = { x: 0, y: 0, w: 10, h: 10 };
      const b = { x: 20, y: 20, w: 10, h: 10 };
      const overlap = CollisionSystem.prototype.getOverlap.call(null, a, b);
      expect(overlap).toBeNull();
    });
  });
});
```

```javascript
// tests/unit/StateMachine.test.js
import { describe, test, expect, vi } from 'vitest';
import { StateMachine } from '../../src/core/StateMachine.js';
import { State } from '../../src/core/State.js';

// 测试用状态
class IdleState extends State {
  canTransitionTo(newState, entity) {
    return entity.grounded; // 只有在地面才能转换
  }
}
class JumpState extends State {}
class FallState extends State {}

describe('StateMachine', () => {
  test('初始化时进入初始状态', () => {
    const entity = { grounded: true };
    const sm = new StateMachine(entity, new IdleState());
    expect(sm.current).toBeInstanceOf(IdleState);
  });

  test('守卫条件阻止非法转换', () => {
    const entity = { grounded: false };
    const sm = new StateMachine(entity, new IdleState());
    const result = sm.changeState(new JumpState());
    expect(result).toBe(false);
    expect(sm.current).toBeInstanceOf(IdleState); // 未改变
  });

  test('守卫条件允许合法转换', () => {
    const entity = { grounded: true };
    const sm = new StateMachine(entity, new IdleState());
    const result = sm.changeState(new JumpState());
    expect(result).toBe(true);
    expect(sm.current).toBeInstanceOf(JumpState);
  });

  test('转换时调用 exit 和 enter', () => {
    const entity = { grounded: true };
    const idle = new IdleState();
    const jump = new JumpState();
    idle.exit = vi.fn();
    jump.enter = vi.fn();

    const sm = new StateMachine(entity, idle);
    sm.changeState(jump);

    expect(idle.exit).toHaveBeenCalledWith(entity);
    expect(jump.enter).toHaveBeenCalledWith(entity);
  });
});
```

```javascript
// tests/unit/EventBus.test.js
import { describe, test, expect, vi } from 'vitest';
import { EventBus } from '../../src/core/EventBus.js';

describe('EventBus', () => {
  test('订阅和触发', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test', handler);
    bus.emit('test', { value: 42 });
    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  test('取消订阅', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsub = bus.on('test', handler);
    unsub();
    bus.emit('test');
    expect(handler).not.toHaveBeenCalled();
  });

  test('优先级排序执行', () => {
    const bus = new EventBus();
    const order = [];
    bus.on('test', () => order.push('low'), null, 10);
    bus.on('test', () => order.push('high'), null, 1);
    bus.on('test', () => order.push('mid'), null, 5);
    bus.emit('test');
    expect(order).toEqual(['high', 'mid', 'low']);
  });

  test('once 只触发一次', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.once('test', handler);
    bus.emit('test');
    bus.emit('test');
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
```

### 运行单元测试
```bash
npm run test          # 运行一次
npm run test:watch    # 监听模式
```

---

## 4. Phase 2：冒烟测试（E2E）

### 测试场景
| 场景 | 验证内容 | 优先级 |
|------|---------|--------|
| 游戏启动 | Canvas 渲染、无控制台错误 | P0 |
| 主菜单 | 菜单显示、按键响应 | P0 |
| 玩家移动 | 按键后位置变化 | P0 |
| 跳跃 | 空格键后 Y 变化 | P0 |
| 碰撞 | 玩家不穿墙 | P1 |
| 收集物品 | 接触后物品消失 | P1 |
| 敌人行为 | 敌人在移动 | P1 |
| 暂停菜单 | ESC 暂停/恢复 | P2 |

### 测试文件示例
```javascript
// tests/e2e/smoke.test.js
import { test, expect } from '@playwright/test';

test.describe('冒烟测试', () => {
  test('游戏启动无错误', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // 无 JavaScript 错误
    expect(errors).toEqual([]);

    // Canvas 存在且有内容
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();
  });

  test('Canvas 有像素输出', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const hasPixels = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      // 检查是否有非零像素（不全是背景色）
      let nonZero = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 0 || data[i+1] !== 0 || data[i+2] !== 0) {
          nonZero++;
        }
      }
      return nonZero > 100; // 至少 100 个非零像素
    });
    expect(hasPixels).toBe(true);
  });

  test('玩家响应键盘输入', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 获取初始位置
    const posBefore = await page.evaluate(() => {
      return { x: window.game.player.x, y: window.game.player.y };
    });

    // 按右键 500ms
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowRight');

    // 位置应改变
    const posAfter = await page.evaluate(() => {
      return { x: window.game.player.x, y: window.game.player.y };
    });

    expect(posAfter.x).toBeGreaterThan(posBefore.x);
  });

  test('跳跃使玩家 Y 变化', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const posBefore = await page.evaluate(() => window.game.player.y);

    // 按跳跃键
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);

    const posDuring = await page.evaluate(() => window.game.player.y);

    // 跳跃中 Y 应该变小（向上）
    expect(posDuring).toBeLessThan(posBefore);
  });

  test('FPS 在合理范围', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const fps = await page.evaluate(() => {
      return window.game?.fps ?? window.__fps ?? 0;
    });

    // 无头浏览器可能比实际低，但应 > 20
    expect(fps).toBeGreaterThan(20);
  });
});
```

### 运行 E2E 测试
```bash
npm run test:e2e      # 运行所有 E2E 测试
npx playwright test --ui  # 可视化模式调试
```

---

## 5. Phase 3：视觉回归测试

### 原理
```
基准图像（golden）  vs  当前截图（actual）  →  差异图（diff）
     ↑                      ↑                     ↑
  tests/visual/         测试时自动截图        pixelmatch 计算
  baselines/                                    差异百分比
```

### 测试文件示例
```javascript
// tests/visual/visual.test.js
import { test, expect } from '@playwright/test';
import { compareScreenshots } from '../helpers/screenshot.js';

test.describe('视觉回归', () => {
  test('主菜单截图对比', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    const screenshot = await page.locator('#gameCanvas').screenshot();
    const diff = await compareScreenshots('main-menu', screenshot);

    expect(diff.mismatchPercentage).toBeLessThan(0.5); // 容差 0.5%
  });

  test('游戏中截图对比', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 模拟开始游戏
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);

    const screenshot = await page.locator('#gameCanvas').screenshot();
    const diff = await compareScreenshots('gameplay', screenshot);

    expect(diff.mismatchPercentage).toBeLessThan(1.0); // 容差 1%
  });
});
```

### 截图对比工具
```javascript
// tests/helpers/screenshot.js
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const BASELINES_DIR = 'tests/visual/baselines';
const ACTUALS_DIR = 'tests/visual/actuals';
const DIFFS_DIR = 'tests/visual/diffs';

export async function compareScreenshots(name, actualBuffer) {
  // 确保目录存在
  [BASELINES_DIR, ACTUALS_DIR, DIFFS_DIR].forEach(dir => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  });

  const actualPath = join(ACTUALS_DIR, `${name}.png`);
  const baselinePath = join(BASELINES_DIR, `${name}.png`);
  const diffPath = join(DIFFS_DIR, `${name}.png`);

  // 保存当前截图
  writeFileSync(actualPath, actualBuffer);

  // 如果没有基准图，当前截图成为基准
  if (!existsSync(baselinePath)) {
    writeFileSync(baselinePath, actualBuffer);
    return { mismatchPercentage: 0, isNew: true };
  }

  // 读取并比较
  const actual = PNG.sync.read(actualBuffer);
  const baseline = PNG.sync.read(readFileSync(baselinePath));

  const { width, height } = actual;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    actual.data, baseline.data, diff.data,
    width, height,
    { threshold: 0.1 } // 像素差异阈值
  );

  // 保存差异图
  writeFileSync(diffPath, PNG.sync.write(diff));

  const mismatchPercentage = (mismatchedPixels / (width * height)) * 100;

  return {
    mismatchPercentage,
    mismatchedPixels,
    totalPixels: width * height,
    diffPath,
  };
}
```

### 更新基准图
```bash
# 当视觉变更是预期的，更新基准图
rm tests/visual/baselines/*.png
npm run test:visual  # 重新生成基准
```

---

## 6. Phase 4：性能基准测试

### 测试脚本
```javascript
// tests/performance/benchmark.mjs
import { chromium } from 'playwright';

const THRESHOLDS = {
  minFPS: 30,
  maxMemoryMB: 100,
  maxLoadTimeMs: 3000,
};

async function runBenchmark() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 960, height: 540 },
  });
  const page = await context.newPage();

  console.log('🎮 性能基准测试开始...\n');

  // 1. 加载时间
  const loadStart = Date.now();
  await page.goto('http://localhost:3000');
  await page.waitForSelector('#gameCanvas');
  const loadTime = Date.now() - loadStart;
  console.log(`⏱  加载时间: ${loadTime}ms (阈值: ${THRESHOLDS.maxLoadTimeMs}ms)`);

  // 2. 等待游戏运行
  await page.waitForTimeout(3000);

  // 3. FPS 测量
  const fps = await page.evaluate(() => {
    return new Promise(resolve => {
      let frames = 0;
      const start = performance.now();
      function count() {
        frames++;
        if (performance.now() - start >= 1000) {
          resolve(frames);
        } else {
          requestAnimationFrame(count);
        }
      }
      requestAnimationFrame(count);
    });
  });
  console.log(`🎯 FPS: ${fps} (阈值: >${THRESHOLDS.minFPS})`);

  // 4. 内存使用
  const memory = await page.evaluate(() => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize / 1024 / 1024,
        totalJSHeapSize: performance.memory.totalJSHeapSize / 1024 / 1024,
      };
    }
    return null;
  });
  if (memory) {
    console.log(`💾 内存: ${memory.usedJSHeapSize.toFixed(1)}MB (阈值: <${THRESHOLDS.maxMemoryMB}MB)`);
  }

  // 5. 长时间运行内存泄漏检测
  console.log('\n🔍 内存泄漏检测 (10秒)...');
  const memoryBefore = await page.evaluate(() =>
    performance.memory ? performance.memory.usedJSHeapSize : 0
  );

  // 模拟游戏操作
  for (let i = 0; i < 100; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
    await page.keyboard.press('Space');
    await page.waitForTimeout(50);
  }

  const memoryAfter = await page.evaluate(() =>
    performance.memory ? performance.memory.usedJSHeapSize : 0
  );

  if (memoryBefore && memoryAfter) {
    const leakMB = (memoryAfter - memoryBefore) / 1024 / 1024;
    console.log(`  操作前: ${(memoryBefore / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  操作后: ${(memoryAfter / 1024 / 1024).toFixed(1)}MB`);
    console.log(`  变化: ${leakMB > 0 ? '+' : ''}${leakMB.toFixed(1)}MB`);
    if (leakMB > 10) {
      console.log('  ⚠️  警告: 内存增长超过 10MB，可能存在泄漏');
    } else {
      console.log('  ✅ 内存稳定');
    }
  }

  // 6. 汇总
  console.log('\n📊 汇总:');
  const results = {
    loadTime: { value: loadTime, pass: loadTime < THRESHOLDS.maxLoadTimeMs },
    fps: { value: fps, pass: fps > THRESHOLDS.minFPS },
    memory: memory ? {
      value: memory.usedJSHeapSize,
      pass: memory.usedJSHeapSize < THRESHOLDS.maxMemoryMB
    } : null,
  };

  let allPass = true;
  for (const [key, result] of Object.entries(results)) {
    if (result) {
      const status = result.pass ? '✅' : '❌';
      console.log(`  ${status} ${key}: ${result.value.toFixed?.(1) ?? result.value}`);
      if (!result.pass) allPass = false;
    }
  }

  await browser.close();

  if (!allPass) {
    console.log('\n❌ 性能测试未通过');
    process.exit(1);
  } else {
    console.log('\n✅ 性能测试通过');
  }
}

runBenchmark().catch(err => {
  console.error('测试失败:', err);
  process.exit(1);
});
```

### 运行性能测试
```bash
# 先启动服务器（另一个终端）
npx serve . -l 3000

# 运行性能测试
npm run test:perf
```

---

## 7. CI/CD 集成（GitHub Actions）

### 工作流配置
```yaml
# .github/workflows/test.yml
name: Game Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: 单元测试
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run test
      - name: 上传覆盖率
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e-tests:
    name: E2E 冒烟测试
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - name: 上传失败截图
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-screenshots
          path: test-results/

  visual-tests:
    name: 视觉回归测试
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:visual
      - name: 上传差异图
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: tests/visual/diffs/

  perf-tests:
    name: 性能基准测试
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: 启动服务器
        run: npx serve . -l 3000 &
      - name: 等待服务器就绪
        run: sleep 3
      - run: npm run test:perf
```

---

## 8. 一键测试脚本

### 本地开发一键测试
```bash
#!/bin/bash
# scripts/test-all.sh

echo "=============================="
echo "  🎮 游戏自动化测试套件"
echo "=============================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

FAILED=0

# Phase 1: 单元测试
echo -e "\n📝 Phase 1: 单元测试..."
if npm run test; then
  echo -e "${GREEN}✅ 单元测试通过${NC}"
else
  echo -e "${RED}❌ 单元测试失败${NC}"
  FAILED=1
fi

# Phase 2: E2E 测试
echo -e "\n🖥️  Phase 2: E2E 冒烟测试..."
if npm run test:e2e; then
  echo -e "${GREEN}✅ E2E 测试通过${NC}"
else
  echo -e "${RED}❌ E2E 测试失败${NC}"
  FAILED=1
fi

# Phase 3: 视觉回归
echo -e "\n👁️  Phase 3: 视觉回归测试..."
if npm run test:visual; then
  echo -e "${GREEN}✅ 视觉测试通过${NC}"
else
  echo -e "${RED}❌ 视觉测试失败${NC}"
  FAILED=1
fi

# Phase 4: 性能基准
echo -e "\n⚡ Phase 4: 性能基准测试..."
if npm run test:perf; then
  echo -e "${GREEN}✅ 性能测试通过${NC}"
else
  echo -e "${RED}❌ 性能测试失败${NC}"
  FAILED=1
fi

# 汇总
echo -e "\n=============================="
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 所有测试通过！${NC}"
  exit 0
else
  echo -e "${RED}💥 存在失败的测试${NC}"
  exit 1
fi
```

### Windows 版本
```batch
@echo off
REM scripts/test-all.bat

echo ==============================
echo   Game Auto Test Suite
echo ==============================

echo.
echo Phase 1: Unit Tests...
call npm run test
if errorlevel 1 goto :fail

echo.
echo Phase 2: E2E Tests...
call npm run test:e2e
if errorlevel 1 goto :fail

echo.
echo Phase 3: Visual Regression...
call npm run test:visual
if errorlevel 1 goto :fail

echo.
echo Phase 4: Performance...
call npm run test:perf
if errorlevel 1 goto :fail

echo.
echo ==============================
echo   All tests passed!
echo ==============================
exit /b 0

:fail
echo.
echo ==============================
echo   Some tests failed!
echo ==============================
exit /b 1
```

---

## 9. 测试检查清单

### 每次功能开发完成后
```
□ 单元测试通过 (npm run test)
□ 无新增控制台错误
□ E2E 冒烟测试通过 (npm run test:e2e)
□ 视觉回归无意外变化 (npm run test:visual)
□ 性能基准达标 (npm run test:perf)
```

### 每个世界开发完成后
```
□ 新增实体有对应单元测试
□ 新增关卡可正常加载
□ Boss 行为符合设计
□ 收集物可正常收集
□ 无内存泄漏（长时间运行测试）
□ 截图基准已更新
```

### 提交前最终检查
```
□ 所有测试套件通过
□ 测试覆盖率 > 60%（核心模块 > 80%）
□ 无 lint 错误
□ 文档已更新（如需要）
```

---

## 10. 测试目录结构

```
tests/
├── setup.js                    # 测试环境初始化
├── unit/                       # 单元测试
│   ├── CollisionSystem.test.js
│   ├── StateMachine.test.js
│   ├── EventBus.test.js
│   ├── Player.test.js
│   └── SaveSystem.test.js
├── e2e/                        # E2E 测试
│   └── smoke.test.js
├── visual/                     # 视觉回归
│   ├── visual.test.js
│   ├── baselines/              # 基准截图（提交到 git）
│   ├── actuals/                # 当前截图（gitignore）
│   └── diffs/                  # 差异图（gitignore）
├── performance/                # 性能基准
│   └── benchmark.mjs
├── helpers/                    # 测试工具
│   └── screenshot.js
└── fixtures/                   # 测试数据
    └── test-level.json
```

---

## 11. 参考资源

| 资源 | 说明 |
|------|------|
| [Vitest 文档](https://vitest.dev/) | 单元测试框架 |
| [Playwright 文档](https://playwright.dev/) | E2E 测试框架 |
| [pixelmatch](https://github.com/mapbox/pixelmatch) | 像素级截图对比 |
| [GameCI](https://game.ci/) | 游戏 CI/CD 最佳实践 |
| [MDN Canvas 测试](https://developer.mozilla.org/) | Canvas API 测试技巧 |
