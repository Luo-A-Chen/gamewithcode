# 项目开发规范

## 项目概述
《代码编年史》— 2D 平台跳跃游戏，主题为编程历史。

## 核心参考文档
开发前必须先阅读：
- `docs/GAME_DESIGN.md` — 游戏设计规范（世界观、关卡、角色、机制、开发阶段）

### 精细规范文档（按需阅读）
- `docs/ARCHITECTURE.md` — 技术架构设计（模块、碰撞、物理）
- `docs/GAME_FEEL.md` — 游戏手感（移动参数、跳跃、形变、震屏、粒子）
- `docs/STATE_MACHINE.md` — 状态机（玩家状态、Boss状态、游戏流程）
- `docs/ASSET_PIPELINE.md` — 资源管理（精灵图、瓦片集、资源清单、加载器）
- `docs/AUDIO_DESIGN.md` — 音频系统（音效清单、音乐状态机、自适应音乐）
- `docs/UI_UX.md` — UI/UX 设计（HUD、菜单、无障碍、响应式布局）
- `docs/SAVE_SYSTEM.md` — 存档系统（数据结构、检查点、版本迁移）
- `docs/DIFFICULTY.md` — 难度与进度（难度曲线、Boss设计、生命系统、评价）
- `docs/PERFORMANCE.md` — 性能优化（渲染优化、对象池、空间分区、帧率监控）
- `docs/TESTING.md` — 测试规范（单元测试、集成测试、E2E测试）
- `docs/EVENT_SYSTEM.md` — 事件系统（事件总线、事件类型、解耦规则）
- `docs/AUTO_TESTING.md` — 自动化测试工作流（测试流水线、CI/CD、一键测试）

## 技术约束
- 纯 HTML5 Canvas + ES Modules，不引入任何第三方库
- 所有文件使用 ES Module（`import/export`）
- 瓦片大小固定 32px
- 画布尺寸 960×540
- 物理使用 delta time 保证帧率无关
- 目标帧率 60fps，最低可接受 30fps

## 代码规范
- 每个类一个文件，文件名与类名一致
- 实体继承自 `Entity` 基类
- 碰撞逻辑统一在 `CollisionSystem` 中处理
- 关卡数据在 `LevelManager` 中管理
- 常量定义在 `utils/constants.js`
- 实体间通过事件总线通信，不直接引用
- 游戏逻辑与渲染分离，确保可测试

## 开发流程
1. 读取 `docs/GAME_DESIGN.md` 确认当前开发阶段
2. 根据需要阅读对应的精细规范文档
3. 确认需要修改/新增的文件
4. 实现功能（遵循手感规范、状态机规范等）
5. 验证浏览器可运行
6. 更新 GAME_DESIGN.md 中的开发状态

## 当前阶段
→ 阶段1：世界1（机械之心）完整实现

## 目录结构
```
E:\games\platformer\
├── index.html
├── CLAUDE.md
├── src/
│   ├── main.js
│   ├── core/         # Game, InputManager, Camera, CollisionSystem, Renderer
│   ├── entities/     # Entity, Player, Enemy, Collectible
│   ├── levels/       # Level, LevelManager
│   ├── ui/           # (预留)
│   └── utils/        # constants
├── assets/           # images, sounds, fonts
├── tests/            # 自动化测试
│   ├── unit/         # 单元测试
│   ├── e2e/          # E2E 测试
│   ├── visual/       # 视觉回归测试
│   ├── performance/  # 性能基准测试
│   └── helpers/      # 测试工具
└── docs/
    ├── GAME_DESIGN.md      # 游戏设计规范
    ├── ARCHITECTURE.md     # 技术架构
    ├── GAME_FEEL.md        # 游戏手感
    ├── STATE_MACHINE.md    # 状态机
    ├── ASSET_PIPELINE.md   # 资源管理
    ├── AUDIO_DESIGN.md     # 音频系统
    ├── UI_UX.md            # UI/UX设计
    ├── SAVE_SYSTEM.md      # 存档系统
    ├── DIFFICULTY.md       # 难度与进度
    ├── PERFORMANCE.md      # 性能优化
    ├── TESTING.md          # 测试规范
    ├── EVENT_SYSTEM.md     # 事件系统
    └── AUTO_TESTING.md     # 自动化测试工作流
```
