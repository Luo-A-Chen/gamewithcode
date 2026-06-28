import { State } from '../core/State.js';

export class MenuState extends State {
  constructor() {
    super();
    this.selectedIndex = 0;
    this.titleAlpha = 0;
    this.fadeIn = true;
    this.hoverIndex = -1;
    this.subMenu = null; // null = 主菜单, 'levels' = 关卡选择
    this.levelHoverIndex = -1;
  }

  enter(game) {
    this.selectedIndex = 0;
    this.titleAlpha = 0;
    this.fadeIn = true;
    this.hoverIndex = -1;
    this.subMenu = null;
    this.levelHoverIndex = -1;

    this.options = game.saveManager.hasSave()
      ? ['继续游戏', '选择关卡', '新游戏']
      : ['新游戏', '选择关卡'];
  }

  getOptionRect(game, index) {
    var w = game.width;
    var y = 260 + index * 55;
    return { x: w / 2 - 120, y: y - 22, w: 240, h: 40 };
  }

  getLevelRect(game, index) {
    var cols = 4;
    var boxW = 180;
    var boxH = 70;
    var gap = 16;
    var startX = (game.width - (cols * boxW + (cols - 1) * gap)) / 2;
    var startY = 160;
    var col = index % cols;
    var row = Math.floor(index / cols);
    return { x: startX + col * (boxW + gap), y: startY + row * (boxH + gap), w: boxW, h: boxH };
  }

  handleInput(game, input) {
    // ESC 返回主菜单
    if (input.isJustPressed('Escape')) {
      if (this.subMenu === 'levels') {
        this.subMenu = null;
        return;
      }
    }

    // ─── 关卡选择子菜单 ───
    if (this.subMenu === 'levels') {
      this.levelHoverIndex = -1;
      var levels = this.getLevelList();
      for (var i = 0; i < levels.length; i++) {
        var r = this.getLevelRect(game, i);
        if (input.isMouseInRect(r.x, r.y, r.w, r.h)) {
          this.levelHoverIndex = i;
        }
      }

      var clicked = this.levelHoverIndex >= 0 && input._mouseClickedThisFrame;
      if (clicked) {
        game.audio.playMenuConfirm();
        var sel = levels[this.levelHoverIndex];
        game.loadLevel(sel.id);
        game.stateMachine.changeState('playing');
      }
      return;
    }

    // ─── 主菜单 ───
    if (input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      game.audio.playMenuSelect();
    }
    if (input.isJustPressed('ArrowDown') || input.isJustPressed('KeyS')) {
      this.selectedIndex = Math.min(this.options.length - 1, this.selectedIndex + 1);
      game.audio.playMenuSelect();
    }

    this.hoverIndex = -1;
    for (var j = 0; j < this.options.length; j++) {
      var rect = this.getOptionRect(game, j);
      if (input.isMouseInRect(rect.x, rect.y, rect.w, rect.h)) {
        this.hoverIndex = j;
        if (this.selectedIndex !== j) game.audio.playMenuSelect();
        this.selectedIndex = j;
      }
    }

    var confirmed = input.isJustPressed('Space') || input.isJustPressed('Enter');
    var mainClicked = this.hoverIndex >= 0 && input._mouseClickedThisFrame;

    if (confirmed || mainClicked) {
      game.audio.playMenuConfirm();
      var opt = this.options[this.selectedIndex];

      if (opt === '继续游戏') {
        var save = game.saveManager.load();
        if (save) {
          game.loadLevel(save.progress.currentLevel || 'level1');
          game.score = save.progress.score || 0;
          if (game.player && save.progress.playerX) {
            game.player.x = save.progress.playerX;
            game.player.y = save.progress.playerY;
            game.player.hp = save.progress.playerHP;
          }
        }
        game.stateMachine.changeState('playing');
      } else if (opt === '选择关卡') {
        this.subMenu = 'levels';
      } else if (opt === '新游戏') {
        game.saveManager.deleteSave();
        game.loadLevel('level1');
        game.stateMachine.changeState('playing');
      }
    }
  }

  getLevelList() {
    return [
      { id: 'level1', name: '世界1', sub: '机械之心', year: '1843', color: '#e94560' },
      { id: 'level2', name: '世界2', sub: '电子黎明', year: '1943', color: '#4ecca3' },
      { id: 'level3', name: '世界3', sub: '语言摇篮', year: '1957', color: '#0f0' },
      { id: 'level4', name: '世界4', sub: '结构之光', year: '1972', color: '#f0f' },
      { id: 'level5', name: '世界5', sub: '面向对象城', year: '1983', color: '#4e88ff' },
      { id: 'level6', name: '世界6', sub: '互联纪元', year: '1989', color: '#8f0' },
      { id: 'level7', name: '世界7', sub: '智能纪元', year: '2023', color: '#e94560' },
    ];
  }

  update(game, dt) {
    if (this.fadeIn) {
      this.titleAlpha = Math.min(1, this.titleAlpha + dt * 2);
      if (this.titleAlpha >= 1) this.fadeIn = false;
    }
  }

  render(game) {
    var ctx = game.ctx;
    var w = game.width;
    var h = game.height;

    ctx.fillStyle = '#0f3460';
    ctx.fillRect(0, 0, w, h);
    this.drawGears(ctx, w, h, game.lastTime);

    if (this.subMenu === 'levels') {
      this.renderLevelSelect(ctx, game);
      return;
    }

    // 标题
    ctx.save();
    ctx.globalAlpha = this.titleAlpha;
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 48px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('代码编年史', w / 2, 140);
    ctx.fillStyle = '#aaa';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText('Code Chronicle', w / 2, 175);
    ctx.restore();

    // 菜单选项
    for (var i = 0; i < this.options.length; i++) {
      var y = 260 + i * 55;
      var selected = i === this.selectedIndex;
      var hovered = i === this.hoverIndex;

      if (hovered) {
        var r = this.getOptionRect(game, i);
        ctx.fillStyle = 'rgba(233, 69, 96, 0.15)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      if (selected) {
        ctx.fillStyle = '#e94560';
        ctx.fillRect(w / 2 - 130, y - 20, 6, 28);
      }
      ctx.fillStyle = selected ? '#fff' : '#888';
      ctx.font = (selected ? 'bold ' : '') + '22px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(this.options[i], w / 2, y);
    }

    ctx.fillStyle = '#555';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓/鼠标选择  Space/Enter/点击 确认', w / 2, h - 40);
    ctx.fillStyle = '#333';
    ctx.font = '11px "Segoe UI", sans-serif';
    ctx.fillText('v0.2 - 7个世界', w / 2, h - 15);
  }

  renderLevelSelect(ctx, game) {
    var w = game.width;
    var h = game.height;
    var levels = this.getLevelList();

    // 标题
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 32px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('选择关卡', w / 2, 100);

    ctx.fillStyle = '#888';
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText('点击进入对应世界  ESC返回', w / 2, 130);

    // 关卡卡片
    for (var i = 0; i < levels.length; i++) {
      var lv = levels[i];
      var r = this.getLevelRect(game, i);
      var hovered = i === this.levelHoverIndex;

      // 卡片背景
      ctx.fillStyle = hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // 边框
      ctx.strokeStyle = hovered ? lv.color : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = hovered ? 2 : 1;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      // 世界名
      ctx.fillStyle = lv.color;
      ctx.font = 'bold 16px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lv.name, r.x + r.w / 2, r.y + 24);

      // 副标题
      ctx.fillStyle = '#aaa';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillText(lv.sub, r.x + r.w / 2, r.y + 44);

      // 年份
      ctx.fillStyle = '#666';
      ctx.font = '10px "Segoe UI", sans-serif';
      ctx.fillText(lv.year, r.x + r.w / 2, r.y + 60);
    }
  }

  drawGears(ctx, w, h, time) {
    var gears = [
      { x: 120, y: 100, r: 60, speed: 0.3 },
      { x: w - 100, y: 80, r: 45, speed: -0.4 },
      { x: 80, y: h - 80, r: 35, speed: 0.5 },
      { x: w - 140, y: h - 100, r: 55, speed: -0.25 },
    ];
    ctx.strokeStyle = 'rgba(233, 69, 96, 0.15)';
    ctx.lineWidth = 2;
    for (var i = 0; i < gears.length; i++) {
      this.drawGear(ctx, gears[i].x, gears[i].y, gears[i].r, 8, (time || 0) * 0.001 * gears[i].speed);
    }
  }

  drawGear(ctx, x, y, radius, teeth, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    for (var i = 0; i < teeth; i++) {
      var a1 = (i / teeth) * Math.PI * 2;
      var a2 = ((i + 0.3) / teeth) * Math.PI * 2;
      var a3 = ((i + 0.5) / teeth) * Math.PI * 2;
      var a4 = ((i + 0.8) / teeth) * Math.PI * 2;
      var innerR = radius * 0.75;
      if (i === 0) ctx.moveTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
      ctx.lineTo(Math.cos(a2) * radius, Math.sin(a2) * radius);
      ctx.lineTo(Math.cos(a3) * radius, Math.sin(a3) * radius);
      ctx.lineTo(Math.cos(a4) * innerR, Math.sin(a4) * innerR);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}
