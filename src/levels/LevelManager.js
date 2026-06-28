import { Level } from './Level.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';
import { LanguageFragment } from '../entities/LanguageFragment.js';
import { BugLog } from '../entities/BugLog.js';
import { PushableBox } from '../entities/PushableBox.js';
import { DifferentialEngine } from '../entities/DifferentialEngine.js';
import { Babbage } from '../entities/Babbage.js';
import { GearToken, GearSlot, DifferentialMachine } from '../entities/GearPuzzle.js';
import { Switch } from '../entities/Switch.js';
import { Door } from '../entities/Door.js';
import { RelayBoss } from '../entities/RelayBoss.js';
import { Turing } from '../entities/Turing.js';
import { PunchCard } from '../entities/PunchCard.js';
import { Hopper } from '../entities/Hopper.js';
import { RecursionBoss } from '../entities/RecursionBoss.js';
import { Ritchie } from '../entities/Ritchie.js';
import { PointerBoss } from '../entities/PointerBoss.js';
import { ClassBlock } from '../entities/ClassBlock.js';
import { Stroustrup } from '../entities/Stroustrup.js';
import { MemoryLeakBoss } from '../entities/MemoryLeakBoss.js';
import { Hyperlink } from '../entities/Hyperlink.js';
import { BernersLee } from '../entities/BernersLee.js';
import { XSSBoss } from '../entities/XSSBoss.js';
import { AINode } from '../entities/AINode.js';
import { AINPC } from '../entities/AINPC.js';
import { BugKingBoss } from '../entities/BugKingBoss.js';

export class LevelManager {
  constructor() {
    this.current = null;
    this.currentLevelName = null;
  }

  load(name) {
    this.currentLevelName = name;
    var data = this.getLevelData(name);
    this.current = new Level(data);
    return this.current;
  }

  getLevelData(name) {
    // ─── 世界1：机械之心（差分机）───
    // 设计理念：
    // - 地面平坦，不需要复杂跳跃
    // - 推齿轮到指定位置（体现差分机的齿轮计算）
    // - 敌人少且位置合理（不会在台阶下被困）
    // - 收集物沿路线分布，引导玩家前进
    if (name === 'level1') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'gear',
        tiles: this.makeGearMap(),
        entities: [
          // NPC：巴贝奇
          new Babbage(140, 436),

          // 差分法齿轮谜题：f(0)=1, f(1)=3, f(2)=7, f(3)=13
          // 齿轮（散落，需要推/扔到正确槽位）
          new GearToken(220, 448, 1),
          new GearToken(380, 448, 13),
          new GearToken(520, 448, 7),
          new GearToken(680, 448, 3),

          // 槽位（带标签说明）
          new GearSlot(300, 444, 0, 1, 'f(0)'),
          new GearSlot(420, 444, 1, 3, 'f(1)'),
          new GearSlot(540, 444, 2, 7, 'f(2)'),
          new GearSlot(660, 444, 3, 13, 'f(3)'),

          // 差分机（谜题完成后自动计算）
          new DifferentialMachine(820, 380),

          // 敌人
          new Enemy(800, 448, 60),

          // 金币
          new Collectible(200, 460),
          new Collectible(450, 460),
          new Collectible(650, 460),

          // 语言碎片
          new LanguageFragment(350, 456, 'w1_f1', 1),
          new LanguageFragment(580, 456, 'w1_f2', 1),
          new LanguageFragment(750, 456, 'w1_f3', 1),

          // Bug 日志
          new BugLog(480, 460, '1843_babbage'),

          // Boss（谜题完成后激活）
          new DifferentialEngine(880, 400),
        ],
      };
    }

    // ─── 世界2：电子黎明 ───
    if (name === 'level2') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'tube',
        tiles: this.makeFlatMap(),
        entities: [
          new Turing(120, 436),
          new Switch(300, 464, 'A'),
          new Door(450, 368, 112, 'A'),
          new Switch(600, 464, 'B'),
          new Door(750, 368, 112, 'B'),
          new Enemy(500, 448, 50),
          new Collectible(200, 460), new Collectible(400, 460), new Collectible(650, 460),
          new LanguageFragment(350, 456, 'w2_f1', 2),
          new LanguageFragment(550, 456, 'w2_f2', 2),
          new LanguageFragment(800, 456, 'w2_f3', 2),
          new BugLog(500, 460, '1945_eniac'),
          new RelayBoss(880, 408),
        ],
      };
    }

    // ─── 世界3：语言摇篮 ───
    if (name === 'level3') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'green',
        tiles: this.makeFlatMap(),
        entities: [
          new Hopper(120, 436),
          new Enemy(400, 448, 60),
          new PunchCard(250, 460, 'c1', 'PRINT'),
          new PunchCard(450, 460, 'c2', 'IF'),
          new PunchCard(650, 460, 'c3', 'LOOP'),
          new LanguageFragment(300, 456, 'w3_f1', 3),
          new LanguageFragment(550, 456, 'w3_f2', 3),
          new LanguageFragment(750, 456, 'w3_f3', 3),
          new BugLog(500, 460, '1957_fortran'),
          new RecursionBoss(860, 416),
        ],
      };
    }

    // ─── 世界4：结构之光 ───
    if (name === 'level4') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'green',
        tiles: this.makeFlatMap(),
        entities: [
          new Ritchie(120, 436),
          new PipePortal(300, 448, 'A', 'B'),
          new PipePortal(600, 448, 'B', 'A'),
          new Enemy(450, 448, 50),
          new Collectible(200, 460), new Collectible(500, 460), new Collectible(700, 460),
          new LanguageFragment(350, 456, 'w4_f1', 4),
          new LanguageFragment(550, 456, 'w4_f2', 4),
          new LanguageFragment(750, 456, 'w4_f3', 4),
          new BugLog(480, 460, '1972_c'),
          new PointerBoss(860, 424),
        ],
      };
    }

    // ─── 世界5：面向对象城 ───
    if (name === 'level5') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'city',
        tiles: this.makeFlatMap(),
        entities: [
          new Stroustrup(120, 436),
          new ClassBlock(350, 448, 'doubleJump'),
          new Enemy(500, 448, 60),
          new Collectible(250, 460), new Collectible(600, 460), new Collectible(750, 460),
          new LanguageFragment(380, 440, 'w5_f1', 5),
          new LanguageFragment(580, 456, 'w5_f2', 5),
          new LanguageFragment(780, 456, 'w5_f3', 5),
          new BugLog(520, 460, '1985_cpp'),
          new MemoryLeakBoss(860, 416),
        ],
      };
    }

    // ─── 世界6：互联纪元 ───
    if (name === 'level6') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'web',
        tiles: this.makeFlatMap(),
        entities: [
          new BernersLee(120, 436),
          new Hyperlink(350, 464, 600, 300),
          new Enemy(450, 448, 50),
          new Collectible(200, 460), new Collectible(500, 460), new Collectible(700, 460),
          new LanguageFragment(350, 456, 'w6_f1', 6),
          new LanguageFragment(620, 280, 'w6_f2', 6),
          new LanguageFragment(780, 456, 'w6_f3', 6),
          new BugLog(480, 460, '1995_js'),
          new XSSBoss(860, 408),
        ],
      };
    }

    // ─── 世界7：智能纪元 ───
    if (name === 'level7') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'ai',
        tiles: this.makeFlatMap(),
        entities: [
          new AINPC(120, 436),
          new AINode(350, 448),
          new AINode(550, 448),
          new Enemy(450, 448, 50),
          new Collectible(250, 460), new Collectible(600, 460), new Collectible(750, 460),
          new LanguageFragment(380, 456, 'w7_f1', 7),
          new LanguageFragment(580, 456, 'w7_f2', 7),
          new LanguageFragment(780, 456, 'w7_f3', 7),
          new BugLog(500, 460, '2023_ai'),
          new BugKingBoss(860, 400),
        ],
      };
    }
  }

  // 世界1专用地图：机械风，有齿轮装饰平台
  makeGearMap() {
    // 17行 x 30列，地面全覆盖
    // 中间有两个矮平台（高度2格，玩家能跳上去）
    return [
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];
  }

  // 通用平坦地图
  makeFlatMap() {
    var map = [];
    for (var row = 0; row < 17; row++) {
      var line = [];
      for (var col = 0; col < 30; col++) {
        if (row >= 15) line.push(1);
        else if (row === 0) line.push(1);
        else if (col === 0 || col === 29) line.push(1);
        else line.push(0);
      }
      map.push(line);
    }
    return map;
  }

  generateLevel(tileData) {
    return tileData;
  }
}
