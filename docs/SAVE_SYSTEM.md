# 存档系统规范 (Save System Specification)

## 核心理念
不丢失玩家的任何进度。存档自动、可靠、可迁移。

---

## 1. 存档数据结构

### 完整存档格式
```json
{
  "version": 2,
  "timestamp": "2024-01-15T10:30:00Z",
  "playTime": 3600,
  "settings": {
    "masterVolume": 0.8,
    "bgmVolume": 0.5,
    "sfxVolume": 0.8,
    "uiVolume": 0.6,
    "fullscreen": false,
    "colorblindMode": "none",
    "fontSize": "normal",
    "keyBindings": {
      "left": ["ArrowLeft", "KeyA"],
      "right": ["ArrowRight", "KeyD"],
      "jump": ["Space", "ArrowUp", "KeyW"],
      "pause": ["Escape"]
    }
  },
  "progress": {
    "currentWorld": 1,
    "currentLevel": 2,
    "checkpointId": "w1_l2_cp1",
    "lives": 3,
    "score": 1250,
    "coins": 45
  },
  "collectibles": {
    "fragments": ["w1_f1", "w1_f2", "w2_f1"],
    "bugLogs": ["1962_mariner", "1990_att"],
    "unlockedWorlds": [1, 2]
  },
  "stats": {
    "totalDeaths": 23,
    "totalJumps": 1456,
    "totalCoinsCollected": 230,
    "enemiesDefeated": 89,
    "bossesDefeated": ["boss_w1"],
    "bestTimes": {
      "w1_l1": 45.2,
      "w1_l2": 67.8
    }
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `version` | number | 存档格式版本号，用于迁移 |
| `timestamp` | string | ISO 8601 时间戳 |
| `playTime` | number | 总游戏时间（秒）|
| `settings` | object | 用户设置（跨存档共享）|
| `progress` | object | 当前进度 |
| `collectibles` | object | 收集物记录 |
| `stats` | object | 统计数据 |

---

## 2. 存储方案

### Web 端（localStorage）
```javascript
const SAVE_KEY = 'codechronicle_save';
const SETTINGS_KEY = 'codechronicle_settings';

// 设置单独存储（不随存档变化，全局共享）
// 原因：音量、按键绑定等设置不应因切换存档而改变

// 保存
function saveGame(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// 读取
function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

// 设置单独存储（不随存档变化）
function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
```

### 存储容量
- localStorage 限制：~5MB
- 预估存档大小：< 10KB
- 可用空间：绰绰有余

---

## 3. 自动存档

### 触发时机
| 事件 | 存档内容 | 说明 |
|------|---------|------|
| 收集物品 | 进度 + 收集物 | 立即保存 |
| 到达检查点 | 进度 + 检查点 | 检查点位置 |
| 击败 Boss | 进度 + 收集物 + 统计 | Boss 击败状态 |
| 通关关卡 | 进度 + 最佳时间 | 关卡完成 |
| 退出游戏 | 全部 | 退出前自动保存 |

### 存档流程
```
1. 收集物品/到达检查点
2. 显示存档图标（右上角闪烁 1s）
3. 序列化当前状态
4. 写入 localStorage
5. 完成
```

---

## 4. 检查点系统

### 检查点放置规则
- 每个关卡至少 2 个检查点
- Boss 战前放置检查点
- 长平台跳跃段后放置检查点
- 检查点用视觉标记（发光的旗帜/齿轮）

### 检查点数据
```json
{
  "id": "w1_l2_cp1",
  "world": 1,
  "level": 2,
  "index": 1,
  "position": { "x": 500, "y": 400 },
  "activated": false
}
```

### 重生逻辑
```javascript
function respawn(player, checkpoint) {
  player.x = checkpoint.position.x;
  player.y = checkpoint.position.y;
  player.vx = 0;
  player.vy = 0;
  player.hp = player.maxHp;
  player.invincible = true; // 无敌 2s
  player.invincibleTimer = 2.0;
}
```

---

## 5. 存档槽位

### 槽位设计
```
┌─────────────────────────────────────────────────┐
│                                                 │
│                   存档选择                      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 存档 1          世界3-1  ⭐⭐           │   │
│  │ 游戏时间: 2:15:30    收集: 8/21         │   │
│  │ 最后保存: 2024-01-15 10:30             │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 存档 2          [空]                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 存档 3          [空]                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [返回]                                        │
└─────────────────────────────────────────────────┘
```

### 槽位管理
- 3 个存档槽位
- 每个槽位独立存储
- 支持覆盖写入（需确认）
- 支持删除存档（需确认）

---

## 6. 存档版本迁移

### 版本号规则
- 存档格式变更时递增 `version` 字段
- 每个版本需要对应的迁移函数

### 迁移链
```javascript
const migrations = {
  1: (data) => {
    // v1 → v2: 添加 stats 字段
    data.stats = { totalDeaths: 0, totalJumps: 0 };
    data.version = 2;
    return data;
  },
  2: (data) => {
    // v2 → v3: 未来迁移
    data.version = 3;
    return data;
  }
};

function migrateSave(data) {
  let current = data;
  while (migrations[current.version]) {
    current = migrations[current.version](current);
  }
  return current;
}
```

---

## 7. 数据完整性

### 校验机制
```javascript
// 保存时计算校验和
function saveGame(data) {
  data.checksum = calculateChecksum(data);
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

// 读取时验证
function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  
  const data = JSON.parse(raw);
  const expected = calculateChecksum(data);
  
  if (data.checksum !== expected) {
    console.error('存档数据损坏');
    return null; // 返回 null，触发新游戏
  }
  
  return data;
}

function calculateChecksum(data) {
  // 简单的字符串哈希
  const str = JSON.stringify(data, (key, val) => {
    if (key === 'checksum') return undefined;
    return val;
  });
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}
```

### 损坏恢复
- 校验失败时提示"存档损坏"
- 提供"从自动备份恢复"选项
- 自动备份：每次保存前，将旧存档复制到 `_backup` 键

---

## 8. 最佳时间记录

### 记录格式
```json
{
  "bestTimes": {
    "w1_l1": { "time": 45.2, "date": "2024-01-10" },
    "w1_l2": { "time": 67.8, "date": "2024-01-12" }
  }
}
```

### 记录规则
- 仅在通关时记录
- 只保存最佳时间（更短的时间覆盖）
- 每个关卡独立记录
- 显示"新纪录"动画
