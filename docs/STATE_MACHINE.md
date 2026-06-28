# 状态机规范 (State Machine Specification)

> 参考：Robert Nystrom《Game Programming Patterns》State 章节

## 核心理念
用状态机替代 if/else 地狱。每个状态封装自己的行为和转换条件。

---

## 1. 玩家状态机

### 状态图
```
                    ┌──────────┐
         ┌─────────│   Idle   │◄─────────┐
         │         └────┬─────┘          │
         │              │ 按移动键        │
         │              ▼                │
         │         ┌──────────┐          │
         │         │   Run    │──────────┘ 松开按键
         │         └────┬─────┘
         │              │ 按跳跃键
         │              ▼
         │         ┌──────────┐
         └────────►│   Jump   │
                   └────┬─────┘
                        │ vy > 0
                        ▼
                   ┌──────────┐
                   │   Fall   │─────► 着地 ──► Idle/Run
                   └────┬─────┘
                        │ 接触敌人
                        ▼
                   ┌──────────┐
                   │   Hurt   │─────► 0.5s 后 ──► Idle
                   └──────────┘
                        
                   ┌──────────┐
                   │   Dead   │ (终态)
                   └──────────┘
```

### 状态定义

#### Idle
- **进入条件**：着地 + 水平速度为 0
- **行为**：播放 idle 动画，重置跳跃次数
- **退出条件**：按移动键 → Run，按跳跃键 → Jump，受伤 → Hurt

#### Run
- **进入条件**：着地 + 按移动键
- **行为**：播放 run 动画，根据朝向翻转精灵
- **退出条件**：松开按键 → Idle，按跳跃键 → Jump，离开地面 → Fall

#### Jump
- **进入条件**：按跳跃键（且有跳跃次数）
- **行为**：播放 jump 上升动画，应用跳跃速度
- **退出条件**：vy > 0 → Fall，受伤 → Hurt

#### Fall
- **进入条件**：vy > 0（下落中）
- **行为**：播放 fall 动画，可触发 Coyote Time
- **退出条件**：着地 → Idle/Run，受伤 → Hurt，掉出世界 → Dead

#### Hurt
- **进入条件**：接触敌人/陷阱
- **行为**：播放受伤动画，无敌闪烁，后退力
- **持续时间**：0.5s
- **退出条件**：计时结束 → Idle，血量为 0 → Dead

#### Dead
- **进入条件**：血量为 0 或掉出世界
- **行为**：播放死亡动画，停止输入响应
- **退出条件**：动画结束 → 场景切换到重生/GameOver

---

## 2. Boss 状态机（通用模板）

### 状态图
```
┌──────────┐    玩家进入区域    ┌──────────┐
│   Idle   │──────────────────►│  Intro   │
└──────────┘                   └────┬─────┘
                                    │ 动画结束
                                    ▼
                              ┌──────────┐
                   ┌──────────│  Attack  │◄─────────┐
                   │          └────┬─────┘          │
                   │               │ 攻击完成        │
                   │               ▼                │
                   │          ┌──────────┐          │
                   │          │  Cooldown│──────────┘
                   │          └────┬─────┘
                   │               │ 血量阈值
                   │               ▼
                   │          ┌──────────┐
                   └─────────►│  Phase2  │ (新攻击模式)
                              └────┬─────┘
                                   │ 血量归零
                                   ▼
                              ┌──────────┐
                              │   Death  │
                              └──────────┘
```

### Boss 状态定义

| 状态 | 行为 | 持续 |
|------|------|------|
| Idle | 不动，等待玩家触发 | 直到玩家进入区域 |
| Intro | 登场动画 + 震屏 | 1-2s |
| Attack | 执行当前攻击模式 | 攻击动作完成 |
| Cooldown | 原地休息，可被攻击 | 1-3s |
| Phase2 | 切换攻击模式，速度提升 | 直到死亡 |
| Death | 死亡动画 + 爆炸粒子 | 2-3s |

---

## 3. 游戏流程状态机

### 状态图
```
┌──────────┐    启动     ┌──────────┐   按开始    ┌──────────┐
│  Splash  │───────────►│  Menu    │───────────►│ Playing  │
└──────────┘            └──────────┘            └────┬─────┘
                                                     │
                              ┌──────────┐           │ ESC
                              │  Paused  │◄──────────┤
                              └──────────┘           │
                                                     │ 死亡
                              ┌──────────┐           │
                              │GameOver  │◄──────────┘
                              └──────────┘           │
                                                     │ 通关
                              ┌──────────┐           │
                              │LevelClear│◄──────────┘
                              └──────────┘
```

### 状态定义

| 状态 | 进入条件 | 行为 | 退出条件 |
|------|---------|------|---------|
| Splash | 游戏启动 | Logo 展示 2s | 计时结束 → Menu |
| Menu | Splash 结束 | 主菜单 UI | 按开始 → Playing |
| Playing | 从 Menu 进入 | 游戏主循环 | ESC → Paused / 死亡 → GameOver / 通关 → LevelClear |
| Paused | ESC 键 | 暂停菜单，游戏冻结 | ESC/继续 → Playing / 退出 → Menu |
| GameOver | 血量归零 | 死亡动画 + 结算 | 重试 → Playing / 退出 → Menu |
| LevelClear | 通关条件达成 | 通关动画 + 统计 | 继续 → Playing（下一关）|

---

## 4. 实现规范

### 状态转换条件表（带守卫）
```
| 当前状态 | 目标状态 | 触发条件 | 守卫条件 |
|---------|---------|---------|---------|
| Idle    | Jump    | 按跳跃键 | jumpCount < maxJumps |
| Idle    | Run     | 按移动键 | grounded == true |
| Jump    | Fall    | vy > 0  | — |
| Fall    | Idle    | 着地    | — |
| Hurt    | Idle    | 计时结束 | hp > 0 |
| Hurt    | Dead    | 计时结束 | hp <= 0 |
| Any     | Hurt    | 接触敌人 | invincible == false |
```
守卫条件防止非法转换（如空中起跳、无敌时受伤）。

### 状态基类
```javascript
class State {
  enter(entity) {}      // 进入状态时调用
  update(entity, dt) {} // 每帧更新
  exit(entity) {}       // 退出状态时调用
  handleInput(entity, input) {} // 处理输入

  // 守卫条件：返回 true 才允许转换
  canTransitionTo(newState, entity) { return true; }
}
```

### 状态机组件
```javascript
class StateMachine {
  constructor(entity, initialState) {
    this.entity = entity;
    this.current = initialState;
    this.current.enter(entity);
  }

  changeState(newState) {
    // 守卫条件检查
    if (!this.current.canTransitionTo(newState, this.entity)) {
      return false; // 转换被拒绝
    }
    this.current.exit(this.entity);
    this.current = newState;
    this.current.enter(this.entity);
    return true;
  }

  update(dt) {
    this.current.update(this.entity, dt);
  }

  handleInput(input) {
    this.current.handleInput(this.entity, input);
  }
}
```

### 状态转换规则
1. **单向数据流**：状态只能通过 `changeState()` 转换
2. **不允许外部直接修改状态**：只能触发事件，由状态机判断是否转换
3. **转换时必须调用 exit/enter**：确保清理旧状态、初始化新状态
4. **避免循环转换**：A → B → A 的循环会导致 enter 无限触发，用条件守卫
