# 资源管理规范 (Asset Pipeline Specification)

## 核心理念
资源与代码分离。所有美术/音频资源通过清单管理，运行时预加载。

---

## 1. 资源目录结构

```
assets/
├── images/
│   ├── sprites/
│   │   ├── player.png          # 玩家精灵图集
│   │   ├── enemy_basic.png     # 基础敌人
│   │   ├── boss_world1.png     # 世界1 Boss
│   │   └── collectibles.png    # 收集物图集
│   ├── tiles/
│   │   ├── world1_tiles.png    # 世界1瓦片集
│   │   ├── world2_tiles.png    # 世界2瓦片集
│   │   └── ...
│   ├── ui/
│   │   ├── buttons.png         # 按钮图集
│   │   ├── icons.png           # 图标集
│   │   └── hud.png             # HUD 元素
│   ├── effects/
│   │   ├── particles.png       # 粒子图集
│   │   └── hits.png            # 命中特效
│   └── backgrounds/
│       ├── world1_bg.png       # 世界1背景（视差层）
│       └── ...
├── sounds/
│   ├── sfx/
│   │   ├── jump.ogg
│   │   ├── land.ogg
│   │   ├── collect.ogg
│   │   ├── hurt.ogg
│   │   ├── enemy_death.ogg
│   │   └── boss_hit.ogg
│   ├── music/
│   │   ├── world1_bgm.ogg
│   │   ├── world1_boss.ogg
│   │   ├── menu_bgm.ogg
│   │   └── ...
│   └── ui/
│       ├── menu_select.ogg
│       ├── menu_confirm.ogg
│       └── menu_back.ogg
└── fonts/
    ├── pixel_font.woff2
    └── ui_font.woff2
```

---

## 2. 资源清单格式 (asset-manifest.json)

```json
{
  "version": 1,
  "images": {
    "player": {
      "src": "assets/images/sprites/player.png",
      "frameWidth": 32,
      "frameHeight": 48,
      "animations": {
        "idle":    { "frames": [0, 1, 2, 3], "fps": 8, "loop": true },
        "run":     { "frames": [4, 5, 6, 7, 8, 9], "fps": 12, "loop": true },
        "jump":    { "frames": [10, 11], "fps": 10, "loop": false },
        "fall":    { "frames": [12, 13], "fps": 8, "loop": true },
        "hurt":    { "frames": [14, 15], "fps": 6, "loop": false },
        "dead":    { "frames": [16, 17, 18], "fps": 6, "loop": false }
      }
    },
    "enemy_basic": {
      "src": "assets/images/sprites/enemy_basic.png",
      "frameWidth": 32,
      "frameHeight": 32,
      "animations": {
        "walk":    { "frames": [0, 1, 2, 3], "fps": 8, "loop": true },
        "hurt":    { "frames": [4, 5], "fps": 6, "loop": false },
        "death":   { "frames": [6, 7, 8], "fps": 8, "loop": false }
      }
    },
    "tiles_world1": {
      "src": "assets/images/tiles/world1_tiles.png",
      "frameWidth": 32,
      "frameHeight": 32
    }
  },
  "sounds": {
    "jump":         { "src": "assets/sounds/sfx/jump.ogg", "volume": 0.6 },
    "land":         { "src": "assets/sounds/sfx/land.ogg", "volume": 0.4 },
    "collect":      { "src": "assets/sounds/sfx/collect.ogg", "volume": 0.8 },
    "hurt":         { "src": "assets/sounds/sfx/hurt.ogg", "volume": 0.7 },
    "enemy_death":  { "src": "assets/sounds/sfx/enemy_death.ogg", "volume": 0.5 },
    "boss_hit":     { "src": "assets/sounds/sfx/boss_hit.ogg", "volume": 0.9 },
    "bgm_world1":   { "src": "assets/sounds/music/world1_bgm.ogg", "volume": 0.5, "loop": true },
    "bgm_boss1":    { "src": "assets/sounds/music/world1_boss.ogg", "volume": 0.6, "loop": true },
    "menu_bgm":     { "src": "assets/sounds/music/menu_bgm.ogg", "volume": 0.4, "loop": true }
  },
  "fonts": {
    "pixel":  { "src": "assets/fonts/pixel_font.woff2" },
    "ui":     { "src": "assets/fonts/ui_font.woff2" }
  }
}
```

---

## 3. 资源加载器规范

### 加载流程
```
1. 解析 asset-manifest.json
2. 计算总资源数量
3. 并行加载所有资源
4. 每个资源加载完成 → 更新进度条
5. 全部完成 → 触发 onComplete 回调
6. 任一失败 → 重试 3 次 → 失败则 onError
```

### 加载器接口
```javascript
class AssetLoader {
  // 加载资源清单
  async loadManifest(manifestPath) {}

  // 获取已加载的资源
  getImage(key) {}    // 返回 Image 对象
  getSound(key) {}    // 返回 AudioBuffer
  getFont(key) {}     // 返回 FontFace

  // 预加载指定世界的所有资源
  async preloadWorld(worldId) {}

  // 释放指定世界的资源
  unloadWorld(worldId) {}

  // 加载进度
  get progress() {}   // 0.0 - 1.0
  get loaded() {}     // 已加载数量
  get total() {}      // 总数量
}
```

### 图片格式选择
| 格式 | 适用场景 | 说明 |
|------|---------|------|
| PNG-32 | 精灵图、瓦片集 | 支持透明，无损压缩 |
| WebP | 背景图、大图 | 体积比 PNG 小 25-35%，需检测支持 |
| JPEG | 照片类背景 | 无透明需求时使用，体积最小 |

```javascript
// 检测 WebP 支持
function supportsWebP() {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}
```

---

## 4. 精灵图集规范

### 制作要求
| 项目 | 规范 |
|------|------|
| 格式 | PNG-32（支持透明） |
| 排列 | 水平等宽排列（每帧相同尺寸） |
| 帧尺寸 | 必须是 2 的幂次（16, 32, 48, 64） |
| 命名 | `{entity}_{action}_{direction}.png` |
| 边距 | 帧间无间距，边缘 1px 透明 padding |

### 动画帧序列定义
```
动画名称:
  frames: [帧索引数组]
  fps: 播放帧率
  loop: 是否循环
  events: { 帧号: "事件名" }  # 可选，触发音效/特效
```

示例：
```
player_attack:
  frames: [20, 21, 22, 23, 24]
  fps: 15
  loop: false
  events: { 22: "sword_swing" }  # 第22帧播放挥剑音效
```

---

## 5. 瓦片集规范

### 瓦片 ID 编码
| ID | 含义 | 碰撞 |
|----|------|------|
| 0  | 空气 | 无 |
| 1  | 实心地面 | 四面阻挡 |
| 2  | 单向平台 | 仅顶部阻挡 |
| 3  | 尖刺 | 伤害区域 |
| 4  | 梯子 | 可攀爬 |
| 5-9 | 装饰瓦片 | 无碰撞 |
| 10+ | 特殊瓦片 | 按世界定义 |

### 瓦片集布局
```
┌─────┬─────┬─────┬─────┬─────┐
│  0  │  1  │  2  │  3  │  4  │  行0: 基础瓦片
├─────┼─────┼─────┼─────┼─────┤
│  5  │  6  │  7  │  8  │  9  │  行1: 装饰瓦片
├─────┼─────┼─────┼─────┼─────┤
│ 10  │ 11  │ 12  │ 13  │ 14  │  行2: 特殊瓦片
└─────┴─────┴─────┴─────┴─────┘
```

---

## 6. 背景视差层规范

每个世界最多 3 层背景：

| 层 | 滚动系数 | 内容 |
|----|---------|------|
| 远景 | 0.1 | 天空、远景山脉 |
| 中景 | 0.4 | 建筑、树木 |
| 近景 | 0.7 | 灌木、装饰 |

```javascript
// 绘制时
ctx.drawImage(bg_far, -camera.x * 0.1, 0);
ctx.drawImage(bg_mid, -camera.x * 0.4, 0);
ctx.drawImage(bg_near, -camera.x * 0.7, 0);
```
