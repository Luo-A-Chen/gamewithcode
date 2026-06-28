import { State } from '../core/State.js';

export class PlayingState extends State {
  enter(game) {
    if (!game.player) {
      game.loadLevel('level1');
    }
    this._wasGrounded = false;
    this._wasDead = false;
    this._activeNPC = null;
    this._wasJumping = false;
    this._introTimer = 3;

    // 根据当前关卡设置介绍和目标
    var levelName = game.levelManager.currentLevelName || 'level1';
    var levelInfo = {
      level1: { world: '世界 1', title: '机械之心', subtitle: '1843 · 巴贝奇差分机', desc: '推动齿轮到正确位置，验证差分法！', npc: '巴贝奇', boss: '差分法验证 0/4' },
      level2: { world: '世界 2', title: '电子黎明', subtitle: '1943 · ENIAC', desc: '踩开关开门，击败暴走的继电器！', npc: '图灵', boss: '踩头顶' },
      level3: { world: '世界 3', title: '语言摇篮', subtitle: '1957 · FORTRAN', desc: '收集打孔卡片，找到递归出口！', npc: 'Hopper', boss: '去EXIT' },
      level4: { world: '世界 4', title: '结构之光', subtitle: '1972 · C语言', desc: '用管道传送，打败野指针幽灵！', npc: 'Ritchie', boss: '踩硬直' },
      level5: { world: '世界 5', title: '面向对象城', subtitle: '1983 · C++', desc: '踩Class方块继承能力，击败内存泄漏！', npc: 'Stroustrup', boss: '踩缩小' },
      level6: { world: '世界 6', title: '互联纪元', subtitle: '1989 · WWW', desc: '用超链接传送，消灭XSS虫群！', npc: 'Berners-Lee', boss: '踩核心' },
      level7: { world: '世界 7', title: '智能纪元', subtitle: '2023 · AI', desc: '利用AI节点，击败最终Boss Bug King！', npc: 'AI研究者', boss: '最终战' },
    };
    var info = levelInfo[levelName] || { world: '', title: levelName, subtitle: '', desc: '', npc: 'NPC', boss: '击败Boss' };
    this._introData = { world: info.world, title: info.title, subtitle: info.subtitle, desc: info.desc };
    this._objectives = [
      { text: '与' + info.npc + '对话 (按 ↑)', done: false },
      { text: info.boss, done: false },
      { text: '向右找到 Boss', done: false },
      { text: '击败 Boss', done: false },
    ];
    this._levelName = levelName;
    game.audio.startBGM(levelName);
  }

  exit(game) {
    game.audio.stopBGM();
  }

  handleInput(game, input) {
    if (this._introTimer > 0) {
      if (input.isJumpJustPressed() || input.isJustPressed('Enter') || input._mouseClickedThisFrame) {
        this._introTimer = 0;
      }
      return;
    }

    if (this._activeNPC) {
      if (input.isJumpJustPressed()) {
        this._activeNPC.nextDialog();
        if (!this._activeNPC.isTalking) {
          this._activeNPC = null;
        }
      }
      return;
    }

    if (input.isPauseJustPressed()) {
      game.stateMachine.changeState('paused');
      return;
    }

    if (input.isJumpJustPressed() || input._mouseClickedThisFrame) {
      var entities = game.entities;
      for (var i = 0; i < entities.length; i++) {
        if (entities[i].isNPC && entities[i].showPrompt) {
          entities[i].startDialog();
          this._activeNPC = entities[i];
          return;
        }
      }
    }

    if (game.player && !game.player.dead) {
      game.player.handleInput(input);
    }
  }

  update(game, dt) {
    if (!game.player) return;

    if (this._introTimer > 0) {
      this._introTimer -= dt;
      return;
    }

    var entities = game.entities;
    var i, entity;
    var levelName = game.levelManager.currentLevelName || 'level1';

    for (i = 0; i < entities.length; i++) {
      entities[i].update(dt);
    }

    for (i = 0; i < entities.length; i++) {
      if (entities[i].isNPC) {
        entities[i].checkPlayerNearby(game.player);
        // 标记对话目标完成
        if (entities[i].dialogIndex > 0 && this._objectives.length > 0) {
          this._objectives[0].done = true;
        }
      }
    }

    game.collision.resolve(entities, game.levelManager.current);

    // 开关/门联动
    for (i = 0; i < entities.length; i++) {
      if (entities[i].constructor.name === 'Switch' && entities[i].activated && !entities[i]._doorOpened) {
        entities[i]._doorOpened = true;
        for (var j = 0; j < entities.length; j++) {
          if (entities[j].constructor.name === 'Door' && entities[j].switchId === entities[i].switchId) {
            entities[j].activate();
          }
        }
        game.audio.playCollect();
        game.ui.showNotification('电路 ' + entities[i].switchId + ' 已连通', 'info', 1.5);
      }
    }

    // 齿轮谜题（世界1）
    if (levelName === 'level1' && !this._puzzleSolved) {
      var slots = [];
      var tokens = [];
      for (i = 0; i < entities.length; i++) {
        if (entities[i].constructor.name === 'GearSlot') slots.push(entities[i]);
        if (entities[i].constructor.name === 'GearToken') tokens.push(entities[i]);
      }
      // 检查齿轮是否被推入槽位
      for (i = 0; i < slots.length; i++) {
        slots[i].checkPlacement(tokens);
      }
      // 检查是否全部正确
      var allCorrect = true;
      for (i = 0; i < slots.length; i++) {
        if (!slots[i].filled || slots[i].filledValue !== slots[i].expectedValue) {
          allCorrect = false;
          break;
        }
      }
      if (allCorrect && slots.length > 0) {
        this._puzzleSolved = true;
        game.ui.showNotification('差分法验证成功！二阶差分恒定！Boss 已激活！', 'collect', 4);
        game.audio.playFragment();
        // 标记目标完成
        if (this._objectives.length > 1) {
          this._objectives[1].done = true;
          this._objectives[1].text = '差分法验证 ✓';
        }
      }
    }

    game.camera.update();
    game.particles.update(dt);
    game.ui.update(dt);

    game.entities = entities.filter(function(e) { return !e.dead; });
    entities = game.entities;

    var player = game.player;
    if (player) {
      if (player.grounded && !this._wasGrounded && player.vy >= 0) {
        game.particles.emit('land_dust', player.x + player.width / 2, player.y + player.height);
        game.audio.playLand();
      }
      if (!player.grounded && this._wasGrounded && player.vy < -100) {
        game.particles.emit('jump_dust', player.x + player.width / 2, player.y + player.height);
        if (player.jumpCount <= 1) { game.audio.playJump(); } else { game.audio.playDoubleJump(); }
      }
      if (player.invincible && player.invincibleTimer > 1.4) {
        game.particles.emit('hurt', player.x + player.width / 2, player.y + player.height / 2);
        game.audio.playHurt();
      }
      this._wasGrounded = player.grounded;

      for (i = 0; i < entities.length; i++) {
        entity = entities[i];
        if (entity.collected && !entity._particleEmitted) {
          entity._particleEmitted = true;
          if (entity.constructor.name === 'Collectible') {
            game.particles.emit('collect_stars', entity.x + entity.width / 2, entity.y + entity.height / 2);
            game.score += 10;
            game.ui.showNotification('+10 金币', 'collect', 1.5);
            game.audio.playCollect();
          } else if (entity.constructor.name === 'LanguageFragment') {
            game.particles.emit('fragment_collect', entity.x + entity.width / 2, entity.y + entity.height / 2);
            game.ui.showNotification('获得语言碎片！', 'collect', 2);
            game.audio.playFragment();
          } else if (entity.constructor.name === 'BugLog') {
            game.ui.showNotification('发现 Bug 日志！', 'info', 2);
            game.audio.playFragment();
          }
          game.saveManager.save(game);
        }
      }
    }

    for (i = 0; i < entities.length; i++) {
      if (entities[i].constructor.name === 'Enemy' && entities[i].dead && !entities[i]._deathSoundPlayed) {
        entities[i]._deathSoundPlayed = true;
        game.audio.playEnemyDeath();
      }
    }

    for (i = 0; i < entities.length; i++) {
      entity = entities[i];
      var bossNames = ['DifferentialEngine', 'RelayBoss', 'RecursionBoss', 'PointerBoss', 'MemoryLeakBoss', 'XSSBoss', 'BugKingBoss'];
      var isBoss = bossNames.indexOf(entity.constructor.name) >= 0;
      if (isBoss && entity.alive) {
        // Boss 子弹伤害玩家
        for (var j = entity.projectiles.length - 1; j >= 0; j--) {
          var p = entity.projectiles[j];
          var dx = (player.x + player.width / 2) - p.x;
          var dy = (player.y + player.height / 2) - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < p.radius + 15) {
            player.takeDamage(1, dx > 0 ? 200 : -200);
            entity.projectiles.splice(j, 1);
          }
        }
        // 玩家踩 Boss 头顶造成伤害
        if (entity.checkStomp(player)) {
          entity.takeDamage(1);
          player.vy = -400;
          game.particles.emit('enemy_death', entity.x + entity.width / 2, entity.y);
          game.audio.playBossHit();
        }
        // 接触 Boss 身体受伤
        if (player.y + player.height > entity.y + 10 && player.y < entity.y + entity.height - 10) {
          if (player.x + player.width > entity.x + 5 && player.x < entity.x + entity.width - 5) {
            var kb = player.x < entity.x ? -200 : 200;
            player.takeDamage(1, kb);
          }
        }
        // Boss 被击败
        if (entity.defeated && !entity._rewardGiven) {
          entity._rewardGiven = true;
          game.score += 500;
          game.ui.showNotification('Boss 击败！+500分', 'collect', 3);
          game.particles.emit('fragment_collect', entity.x + entity.width / 2, entity.y + entity.height / 2, { count: 20 });
          // 保存当前关卡名，通关后切换到下一关
          var currentLevel = game.levelManager.currentLevelName || 'level1';
          setTimeout(function() {
            if (game.stateMachine.currentStateName === 'playing') {
              game.stateMachine.changeState('levelclear');
            }
          }, 2000);
        }
      }
    }

    if (game.player.dead) {
      game.stateMachine.changeState('gameover');
    }
  }

  render(game) {
    var ctx = game.ctx;
    var canvas = game.canvas;
    var renderer = game.renderer;
    var camera = game.camera;
    var entities = game.entities;
    var levelManager = game.levelManager;

    renderer.clear(canvas);
    ctx.save();
    camera.applyTransform(ctx);
    renderer.drawLevel(levelManager.current);

    for (var i = 0; i < entities.length; i++) {
      entities[i].render(ctx);
    }

    game.particles.render(ctx);
    ctx.restore();

    game.ui.renderHUD(ctx, game);
    this.renderObjectives(ctx, game);
    this.renderGearPuzzleUI(ctx, game);
    this.renderGuideArrow(ctx, game);

    if (this._activeNPC) {
      this._activeNPC.renderDialog(ctx, game.width, game.height);
    }
    if (this._introTimer > 0) {
      this.renderIntro(ctx, game);
    }

    // 暂停提示（非触屏时显示）
    if (!game.touch.active) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('ESC 暂停', game.width - 16, game.height - 12);
    }

    // 触屏虚拟按键
    game.touch.render(ctx, game.width, game.height);
  }

  renderIntro(ctx, game) {
    var width = game.width;
    var height = game.height;
    var alpha = Math.min(1, this._introTimer);

    ctx.fillStyle = 'rgba(15, 52, 96, ' + (alpha * 0.9) + ')';
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = '#e94560';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this._introData.world, width / 2, height / 2 - 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px "Segoe UI", sans-serif';
    ctx.fillText(this._introData.title, width / 2, height / 2 - 10);

    ctx.fillStyle = '#aaa';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.fillText(this._introData.subtitle, width / 2, height / 2 + 25);

    ctx.fillStyle = '#888';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(this._introData.desc, width / 2, height / 2 + 60);

    ctx.fillStyle = '#555';
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText('按任意键跳过', width / 2, height / 2 + 110);

    ctx.globalAlpha = 1;
  }

  renderObjectives(ctx, game) {
    if (this._introTimer > 0) return;
    this.updateObjectives(game);

    var x = 16;
    var y = game.height - 20;
    ctx.textAlign = 'left';
    ctx.font = '12px "Segoe UI", sans-serif';

    for (var i = this._objectives.length - 1; i >= 0; i--) {
      var obj = this._objectives[i];
      ctx.fillStyle = obj.done ? 'rgba(78, 204, 163, 0.6)' : 'rgba(255, 255, 255, 0.4)';
      var prefix = obj.done ? '✓ ' : '○ ';
      ctx.fillText(prefix + obj.text, x, y);
      y -= 18;
    }
  }

  renderGuideArrow(ctx, game) {
    if (this._introTimer > 0 || !game.player) return;

    var width = game.width;
    var height = game.height;
    var player = game.player;

    // 找到 Boss 位置
    var bossX = 0;
    var entities = game.entities;
    var bossNames = ['DifferentialEngine', 'RelayBoss', 'RecursionBoss', 'PointerBoss', 'MemoryLeakBoss', 'XSSBoss', 'BugKingBoss'];
    for (var i = 0; i < entities.length; i++) {
      if (bossNames.indexOf(entities[i].constructor.name) >= 0) {
        bossX = entities[i].x;
        break;
      }
    }
    if (bossX === 0) return;

    var diff = bossX - player.x;
    if (Math.abs(diff) < 50) return;

    var arrow = diff > 0 ? '→' : '←';
    var distance = Math.abs(diff);
    var label = distance > 100 ? 'Boss ' + Math.round(distance / 32) + ' 格' : 'Boss 近在咫尺！';

    var ax = width - 40;
    var ay = height / 2;
    var pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 28px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(arrow, 0, 8);
    ctx.restore();

    ctx.fillStyle = '#e94560';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, ax, ay + 28);
  }

  /**
   * 渲染齿轮谜题 UI（世界1专用）
   */
  renderGearPuzzleUI(ctx, game) {
    if (game.levelManager.currentLevelName !== 'level1') return;
    if (this._introTimer > 0) return;

    var entities = game.entities;
    var slots = [];
    for (var i = 0; i < entities.length; i++) {
      if (entities[i].constructor.name === 'GearSlot') slots.push(entities[i]);
    }
    if (slots.length === 0) return;

    // 显示差分法公式
    var x = game.width / 2;
    var y = 50;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - 180, y - 25, 360, 55);
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 180, y - 25, 360, 55);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('差分法：f(x) = x² + x + 1', x, y - 5);

    // 显示各槽位状态
    var status = '';
    for (var j = 0; j < slots.length; j++) {
      var s = slots[j];
      if (s.filled && s.filledValue === s.expectedValue) {
        status += 'f(' + s.slotId + ')=' + s.expectedValue + ' ✓  ';
      } else if (s.filled) {
        status += 'f(' + s.slotId + ')≠' + s.expectedValue + ' ✗  ';
      } else {
        status += 'f(' + s.slotId + ')=?   ';
      }
    }
    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';
    ctx.fillText(status.trim(), x, y + 15);
  }

  updateObjectives(game) {
    if (this._objectives.length === 0) return;

    var entities = game.entities;
    var i;
    var levelName = game.levelManager.currentLevelName || 'level1';

    // 碎片统计
    var collectedFragments = 0;
    for (i = 0; i < entities.length; i++) {
      if (entities[i].constructor.name === 'LanguageFragment' && entities[i].collected) collectedFragments++;
    }

    // 到达Boss区域
    if (game.player && game.player.x > 750) this._objectives[2].done = true;

    // 每关独特目标
    if (levelName === 'level1') {
      var gearsPlaced = 0;
      for (i = 0; i < entities.length; i++) {
        if (entities[i].constructor.name === 'GearSlot' && entities[i].filled &&
            entities[i].filledValue === entities[i].expectedValue) {
          gearsPlaced++;
        }
      }
      if (!this._puzzleSolved) {
        this._objectives[1].text = '差分法验证 ' + gearsPlaced + '/4';
      }
      if (gearsPlaced >= 4) this._objectives[1].done = true;
    } else if (levelName === 'level2') {
      var switchesOn = 0;
      for (i = 0; i < entities.length; i++) {
        if (entities[i].constructor.name === 'Switch' && entities[i].activated) switchesOn++;
      }
      this._objectives[1].text = '踩开关连通电路 ' + switchesOn + '/2';
      if (switchesOn >= 2) this._objectives[1].done = true;
    } else if (levelName === 'level3') {
      var cards = 0;
      for (i = 0; i < entities.length; i++) {
        if (entities[i].constructor.name === 'PunchCard' && entities[i].collected) cards++;
      }
      this._objectives[1].text = '收集打孔卡片 ' + cards + '/3';
      if (cards >= 3) this._objectives[1].done = true;
    } else if (levelName === 'level5') {
      var hasAbility = false;
      for (i = 0; i < entities.length; i++) {
        if (entities[i].constructor.name === 'ClassBlock' && entities[i].used) hasAbility = true;
      }
      this._objectives[1].text = hasAbility ? '获得继承能力 ✓' : '踩Class方块获得能力';
      if (hasAbility) this._objectives[1].done = true;
    } else {
      this._objectives[1].text = '收集语言碎片 ' + collectedFragments + '/3';
      if (collectedFragments >= 3) this._objectives[1].done = true;
    }

    // Boss状态（通用）
    var bossNames = ['DifferentialEngine', 'RelayBoss', 'RecursionBoss', 'PointerBoss', 'MemoryLeakBoss', 'XSSBoss', 'BugKingBoss'];
    for (i = 0; i < entities.length; i++) {
      var name = entities[i].constructor.name;
      if (bossNames.indexOf(name) >= 0) {
        if (entities[i].defeated) {
          this._objectives[3].done = true;
          this._objectives[3].text = '击败 Boss ✓';
        } else {
          this._objectives[3].text = '击败 Boss (' + (entities[i].maxHp - entities[i].hp) + '/' + entities[i].maxHp + ')';
        }
      }
    }
  }
}
