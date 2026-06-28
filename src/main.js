import { Game } from './core/Game.js';

try {
  var canvas = document.getElementById('gameCanvas');
  if (!canvas) throw new Error('Canvas element not found');
  var game = new Game(canvas);
  game.start();
} catch (e) {
  console.error('INIT ERROR:', e);
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#e94560';
  ctx.font = '13px monospace';
  ctx.textAlign = 'left';
  var lines = (e.stack || e.message).split('\n').slice(0, 12);
  for (var i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].substring(0, 90), 20, 30 + i * 18);
  }
}
