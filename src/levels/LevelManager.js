import { Level } from './Level.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';
import { LanguageFragment } from '../entities/LanguageFragment.js';
import { BugLog } from '../entities/BugLog.js';
import { PushableBox } from '../entities/PushableBox.js';
import { DifferentialEngine } from '../entities/DifferentialEngine.js';
import { Babbage } from '../entities/Babbage.js';
import { Switch } from '../entities/Switch.js';
import { Door } from '../entities/Door.js';
import { RelayBoss } from '../entities/RelayBoss.js';
import { Turing } from '../entities/Turing.js';
import { PunchCard } from '../entities/PunchCard.js';
import { Hopper } from '../entities/Hopper.js';
import { RecursionBoss } from '../entities/RecursionBoss.js';
import { PipePortal } from '../entities/PipePortal.js';
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
  }

  load(name) {
    this.currentLevelName = name;
    var data = this.getLevelData(name);
    this.current = new Level(data);
    return this.current;
  }

  getLevelData(name) {
    if (name === 'level1') {
      return {
        spawn: { x: 64, y: 400 },
        theme: 'gear',
        tiles: this.generateLevel1(),
        entities: [
          // NPC：巴贝奇（地面层 row15=y480, NPC高44, 站在y=436）
          new Babbage(120, 436),

          // 敌人（地面上）
          new Enemy(380, 448, 60),
          new Enemy(620, 448, 40),

          // 金币（引导路线，都在地面上或平台上）
          new Collectible(200, 460),
          new Collectible(300, 460),
          new Collectible(450, 460),
          new Collectible(550, 460),
          new Collectible(650, 460),
          new Collectible(750, 460),

          // 语言碎片（3个，都在能到达的地方）
          new LanguageFragment(250, 456, 'w1_f1', 1),
          new LanguageFragment(500, 400, 'w1_f2', 1),
          new LanguageFragment(700, 248, 'w1_f3', 1),

          // Bug 日志（地面上显眼位置）
          new BugLog(550, 460, '1943_colossus'),

          // Boss：差分机（地面层，row15=y480, Boss高80, 站在y=400）
          new DifferentialEngine(840, 400),
        ],
      };
    }

    if (name === 'level2') {
      return {
        spawn: { x: 64, y: 400 },
        theme: 'tube',
        tiles: this.generateLevel2(),
        entities: [
          // NPC：图灵
          new Turing(120, 436),

          // 开关和门（3组）
          new Switch(300, 464, 'A'),
          new Door(400, 368, 112, 'A'),

          new Switch(550, 464, 'B'),
          new Door(650, 368, 112, 'B'),

          // 敌人
          new Enemy(250, 448, 50),
          new Enemy(500, 448, 40),
          new Enemy(700, 448, 60),

          // 金币
          new Collectible(200, 460),
          new Collectible(350, 460),
          new Collectible(500, 460),
          new Collectible(600, 460),
          new Collectible(750, 460),

          // 语言碎片
          new LanguageFragment(350, 340, 'w2_f1', 2),
          new LanguageFragment(600, 340, 'w2_f2', 2),
          new LanguageFragment(800, 460, 'w2_f3', 2),

          // Bug 日志
          new BugLog(450, 460, '1945_eniac'),

          // Boss
          new RelayBoss(850, 408),
        ],
      };
    }

    // ─── 世界3：语言摇篮 ───
    if (name === 'level3') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'green',
        tiles: this.generateGenericLevel(),
        entities: [
          new Hopper(120, 436),
          new Enemy(300, 448, 50), new Enemy(550, 448, 40),
          new PunchCard(200, 460, 'c1', 'PRINT'), new PunchCard(350, 460, 'c2', 'IF'),
          new PunchCard(500, 460, 'c3', 'LOOP'), new PunchCard(650, 460, 'c4', 'GOTO'),
          new LanguageFragment(300, 456, 'w3_f1', 3), new LanguageFragment(550, 400, 'w3_f2', 3),
          new LanguageFragment(750, 460, 'w3_f3', 3),
          new BugLog(450, 460, '1957_fortran'),
          new RecursionBoss(840, 416),
        ],
      };
    }

    // ─── 世界4：结构之光 ───
    if (name === 'level4') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'green',
        tiles: this.generateGenericLevel(),
        entities: [
          new Ritchie(120, 436),
          new PipePortal(250, 448, 'A', 'B'), new PipePortal(500, 320, 'B', 'A'),
          new Enemy(350, 448, 60), new Enemy(600, 448, 50),
          new Collectible(200, 460), new Collectible(400, 460), new Collectible(600, 460),
          new LanguageFragment(300, 456, 'w4_f1', 4), new LanguageFragment(500, 300, 'w4_f2', 4),
          new LanguageFragment(750, 460, 'w4_f3', 4),
          new BugLog(450, 460, '1972_c'),
          new PointerBoss(840, 424),
        ],
      };
    }

    // ─── 世界5：面向对象城 ───
    if (name === 'level5') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'city',
        tiles: this.generateGenericLevel(),
        entities: [
          new Stroustrup(120, 436),
          new ClassBlock(300, 448, 'doubleJump'),
          new Enemy(400, 448, 50), new Enemy(600, 448, 60),
          new Collectible(200, 460), new Collectible(450, 460), new Collectible(700, 460),
          new LanguageFragment(350, 420, 'w5_f1', 5), new LanguageFragment(550, 400, 'w5_f2', 5),
          new LanguageFragment(750, 460, 'w5_f3', 5),
          new BugLog(500, 460, '1985_cpp'),
          new MemoryLeakBoss(840, 416),
        ],
      };
    }

    // ─── 世界6：互联纪元 ───
    if (name === 'level6') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'web',
        tiles: this.generateGenericLevel(),
        entities: [
          new BernersLee(120, 436),
          new Hyperlink(250, 464, 500, 300),
          new Enemy(350, 448, 50), new Enemy(650, 448, 40),
          new Collectible(200, 460), new Collectible(400, 460), new Collectible(700, 460),
          new LanguageFragment(300, 456, 'w6_f1', 6), new LanguageFragment(500, 280, 'w6_f2', 6),
          new LanguageFragment(750, 460, 'w6_f3', 6),
          new BugLog(450, 460, '1995_js'),
          new XSSBoss(840, 408),
        ],
      };
    }

    // ─── 世界7：智能纪元 ───
    if (name === 'level7') {
      return {
        spawn: { x: 64, y: 400 }, theme: 'ai',
        tiles: this.generateGenericLevel(),
        entities: [
          new AINPC(120, 436),
          new AINode(300, 440), new AINode(500, 400), new AINode(700, 440),
          new Enemy(400, 448, 50), new Enemy(600, 448, 60),
          new Collectible(200, 460), new Collectible(450, 460), new Collectible(700, 460),
          new LanguageFragment(350, 456, 'w7_f1', 7), new LanguageFragment(550, 380, 'w7_f2', 7),
          new LanguageFragment(750, 460, 'w7_f3', 7),
          new BugLog(500, 460, '2023_ai'),
          new BugKingBoss(840, 400),
        ],
      };
    }
  }

  /**
   * 世界1关卡 - 简单线性，从左到右
   *
   * 地图 30列 x 17行 (960x544)
   *
   * 设计思路：
   * - 从左到右线性推进
   * - 平台都在能跳到的范围内
   * - Boss 在最右边
   * - 没有坑，不会掉下去
   */
  generateLevel1() {
    var map = [];
    for (var row = 0; row < 17; row++) {
      var line = [];
      for (var col = 0; col < 30; col++) {

        // ─── 地面层（全覆盖）───
        if (row === 15) {
          line.push(1);
        }
        else if (row === 16) {
          line.push(1);
        }
        // ─── 几个跳跃平台（可选收集路线）───
        // 平台1：中间
        else if (row === 12 && col >= 10 && col <= 13) {
          line.push(1);
        }
        // 平台2：中右
        else if (row === 11 && col >= 18 && col <= 21) {
          line.push(1);
        }
        // ─── 天花板 ───
        else if (row === 0) {
          line.push(1);
        }
        // ─── 左墙 ───
        else if (col === 0 && row >= 1 && row <= 14) {
          line.push(1);
        }
        // ─── 右墙 ───
        else if (col === 29 && row >= 1 && row <= 14) {
          line.push(1);
        }
        else {
          line.push(0);
        }
      }
      map.push(line);
    }
    return map;
  }

  /**
   * 世界2关卡 - 电子黎明
   * 电路风格，有开关和门机制
   */
  generateLevel2() {
    var map = [];
    for (var row = 0; row < 17; row++) {
      var line = [];
      for (var col = 0; col < 30; col++) {

        // 地面
        if (row === 15 || row === 16) {
          line.push(1);
        }
        // 门的位置（会被Door实体覆盖，这里留空）
        // 开关上方的平台
        else if (row === 14 && col >= 9 && col <= 10) {
          line.push(1);
        }
        else if (row === 14 && col >= 17 && col <= 18) {
          line.push(1);
        }
        // Boss 区域地面
        else if (row === 14 && col >= 25 && col <= 29) {
          line.push(1);
        }
        // 天花板
        else if (row === 0) {
          line.push(1);
        }
        // 墙壁
        else if (col === 0 && row >= 1 && row <= 14) {
          line.push(1);
        }
        else if (col === 29 && row >= 1 && row <= 14) {
          line.push(1);
        }
        else {
          line.push(0);
        }
      }
      map.push(line);
    }
    return map;
  }

  /**
   * 通用关卡地图 - 世界3-7共用
   * 简单地面 + 几个平台
   */
  generateGenericLevel() {
    var map = [];
    for (var row = 0; row < 17; row++) {
      var line = [];
      for (var col = 0; col < 30; col++) {
        if (row === 15 || row === 16) {
          line.push(1);
        }
        else if (row === 12 && col >= 10 && col <= 13) {
          line.push(1);
        }
        else if (row === 11 && col >= 18 && col <= 21) {
          line.push(1);
        }
        else if (row === 0) {
          line.push(1);
        }
        else if (col === 0 && row >= 1 && row <= 14) {
          line.push(1);
        }
        else if (col === 29 && row >= 1 && row <= 14) {
          line.push(1);
        }
        else {
          line.push(0);
        }
      }
      map.push(line);
    }
    return map;
  }
}
