# 音频系统规范 (Audio Design Specification)

## 核心理念
音频是游戏手感的另一半。好的音效让同样的操作感觉完全不同。

---

## 1. 音频分类与音量层级

### 分类
| 类别 | 代码 | 说明 | 默认音量 |
|------|------|------|---------|
| BGM | `bgm` | 背景音乐 | 0.5 |
| SFX | `sfx` | 游戏音效 | 0.8 |
| UI | `ui` | 菜单/界面音效 | 0.6 |
| Ambient | `ambient` | 环境音 | 0.3 |

### 音量总线
```
Master
├── BGM    (0.0 - 1.0)
├── SFX    (0.0 - 1.0)
├── UI     (0.0 - 1.0)
└── Ambient (0.0 - 1.0)
```

### 用户设置
- 主音量滑块：控制 Master
- 分类音量滑块：分别控制 BGM / SFX / UI / Ambient
- 静音开关：全局静音

---

## 2. 音效清单

### 玩家音效
| 事件 | 音效名 | 触发时机 | 说明 |
|------|--------|---------|------|
| 起跳 | `sfx_jump` | 按跳跃键 | 短促清脆 |
| 二段跳 | `sfx_double_jump` | 二段跳触发 | 比一段跳更高亢 |
| 落地 | `sfx_land` | 着地瞬间 | 根据下落速度调整音量 |
| 受伤 | `sfx_hurt` | 被击中 | 短促痛苦声 |
| 死亡 | `sfx_death` | 血量归零 | 拉长的失败音 |
| 滑墙 | `sfx_wall_slide` | 贴墙滑行 | 持续摩擦声 |

### 收集物音效
| 事件 | 音效名 | 触发时机 | 说明 |
|------|--------|---------|------|
| 收集金币 | `sfx_collect` | 接触金币 | 叮叮声，上升音调 |
| 收集碎片 | `sfx_fragment` | 接触语言碎片 | 更华丽的叮叮声 |
| 收集 Bug 日志 | `sfx_buglog` | 接触 Bug 日志 | 电脑提示音风格 |
| 1UP | `sfx_1up` | 获得额外生命 | 经典上升音阶 |

### 敌人音效
| 事件 | 音效名 | 触发时机 | 说明 |
|------|--------|---------|------|
| 敌人死亡 | `sfx_enemy_death` | 踩死敌人 | 咯吱/爆炸声 |
| Boss 登场 | `sfx_boss_intro` | Boss 战开始 | 低沉的轰鸣 |
| Boss 被击 | `sfx_boss_hit` | 攻击 Boss | 沉闷撞击声 |
| Boss 死亡 | `sfx_boss_death` | Boss 战结束 | 长爆炸 + 胜利音 |

### 环境音效
| 事件 | 音效名 | 触发时机 | 说明 |
|------|--------|---------|------|
| 门打开 | `sfx_door_open` | 机关触发 | 金属摩擦声 |
| 检查点 | `sfx_checkpoint` | 到达检查点 | 存档确认音 |
| 关卡传送 | `sfx_warp` | 进入传送门 | 嗡嗡声 + 闪回 |

### UI 音效
| 事件 | 音效名 | 触发时机 | 说明 |
|------|--------|---------|------|
| 菜单选择 | `ui_select` | 光标移动 | 短促点击 |
| 菜单确认 | `ui_confirm` | 按下确认 | 清脆的确认音 |
| 菜单返回 | `ui_back` | 按下返回 | 低沉的返回音 |
| 暂停 | `ui_pause` | 打开暂停菜单 | 下降音调 |

---

## 3. 背景音乐设计

### 音乐状态机
```
┌──────┐  进入世界  ┌──────┐  触发Boss  ┌──────┐
│ Menu │──────────►│Explor│───────────►│ Boss │
└──────┘           └──────┘            └──────┘
                       │                   │
                       │ 离开Boss区域       │ Boss死亡
                       ▼                   ▼
                   ┌──────┐           ┌──────┐
                   │Explor│           │Victory│
                   └──────┘           └──────┘
```

### 音乐过渡规则
| 切换 | 过渡方式 | 时长 |
|------|---------|------|
| Menu → Explor | 交叉淡入淡出 | 1.5s |
| Explor → Boss | 快速切换 + 短暂静默 | 0.3s |
| Boss → Victory | Boss 音乐停止 → 胜利音效 | 0s |
| 任何 → Menu | 淡出当前 → 淡入 Menu | 2.0s |

### 各世界音乐风格
| 世界 | BGM 风格 | Boss 风格 |
|------|---------|----------|
| 1. 机械之心 | 蒸汽朋克风琴、齿轮节奏 | 紧张的机械打击乐 |
| 2. 电子黎明 | 电子管风琴、嗡嗡声 | 快节奏电子脉冲 |
| 3. 语言摇篮 | 打字机节奏、黑底绿字氛围 | 递归回声效果 |
| 4. 结构之光 | C 语言编译音、管道回响 | 指针跳跃节奏 |
| 5. 面向对象城 | 城市电子乐、类层次结构 | 内存膨胀低频 |
| 6. 互联纪元 | 网页加载声、超链接叮咚 | 数据包风暴 |
| 7. 智能纪元 | 神经网络脉冲、深度学习 | 最终决战交响 |

---

## 4. 自适应音乐系统

### 水平分层（Horizontal Layering）
```
探索层：  [intro] → [loop_A] → [loop_A] → [loop_A] → ...
                    ↓ 进入战斗
战斗层：              [loop_B] → [loop_B] → [loop_B] → ...
```

### 垂直分层（Vertical Layering）
```
基础层：  ████████████████████████████████ (持续)
打击层：  ░░░░░░████░░░░████░░░░████░░░░ (节奏)
旋律层：  ░░░░░░░░░░████░░░░░░░░░░████░░ (间歇)
高潮层：  ░░░░░░░░░░░░░░░░░░░░████████░░ (仅Boss低血量)
```

### 实现接口
```javascript
class AudioManager {
  // 播放 BGM
  playBGM(key, { fadeIn = 1.0 } = {}) {}
  
  // 切换 BGM（交叉淡入淡出）
  crossfadeBGM(newKey, { duration = 1.5 } = {}) {}
  
  // 添加/移除音乐层
  addMusicLayer(key) {}
  removeMusicLayer(key) {}
  
  // 播放一次性音效
  playSFX(key, { volume = 1.0, pitch = 1.0 } = {}) {}
  
  // 设置音量
  setVolume(category, value) {} // category: 'master'|'bgm'|'sfx'|'ui'
  
  // 静音
  mute() {}
  unmute() {}
}
```

---

## 5. 音频格式规范

| 类型 | 格式 | 说明 |
|------|------|------|
| 音乐 | OGG Vorbis | 循环无缝、体积小 |
| 音效 | OGG Vorbis | 统一格式 |
| UI 音效 | MP3 (备选) | 兼容性备选 |

### 音频参数
| 参数 | 音乐 | 音效 |
|------|------|------|
| 采样率 | 44100 Hz | 22050 Hz |
| 比特率 | 128 kbps | 96 kbps |
| 声道 | 立体声 | 单声道 |

### 循环音乐标记
```
LOOP_START=12345    # 循环起始采样点
LOOP_END=67890      # 循环结束采样点
```

---

## 7. 音频上下文管理

### Web Audio API 注意事项
```javascript
class AudioManager {
  constructor() {
    this.ctx = null; // AudioContext，需要用户交互后才能创建
  }

  // 必须在用户交互（点击/按键）后调用
  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // 恢复上下文（移动端浏览器可能自动挂起）
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
}
```

### 音效实例池
```
同一音效可能同时播放多次（如连续收集金币），需要音效池：
- 每个音效最多同时 4 个实例
- 超出时复用最早的实例（改 pitch 避免听感重复）
```

```javascript
class SFXPool {
  constructor(maxInstances = 4) {
    this.pool = [];
    this.maxInstances = maxInstances;
  }

  play(buffer, options = {}) {
    if (this.pool.length >= this.maxInstances) {
      // 停止最早的
      this.pool[0].stop();
      this.pool.shift();
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = options.pitch ?? 1.0;
    source.connect(this.ctx.destination);
    source.start();
    this.pool.push(source);
  }
}
```

---

## 8. 参考资源

| 资源 | 说明 |
|------|------|
| 《Game Sound》Karen Collins | 游戏音频设计权威教材 |
| 《A Composer's Guide to Game Music》Winifred Phillips | 游戏音乐作曲指南 |
| GDC: "Adaptive Music in Games" | 自适应音乐技术演讲 |
| Web Audio API (MDN) | 浏览器音频 API 文档 |

---

## 6. 空间音效（2D 简化版）

根据声源与玩家的距离调整音量：

```javascript
function getSpatialVolume(sourceX, playerX, maxDistance = 500) {
  const dist = Math.abs(sourceX - playerX);
  if (dist > maxDistance) return 0;
  return 1 - (dist / maxDistance); // 线性衰减
}
```

| 距离 | 音量 | 声像（左右） |
|------|------|-------------|
| 0-100px | 100% | 根据左右位置调整 |
| 100-300px | 60-100% | 微弱偏移 |
| 300-500px | 0-60% | 强偏移 |
| >500px | 0% | 静音 |
