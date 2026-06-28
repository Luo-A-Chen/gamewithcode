/**
 * UIManager - UI 管理器
 * 统一管理 HUD、通知、对话框等 UI 元素
 */
export class UIManager {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 3;
  }

  /**
   * 显示通知
   */
  showNotification(text, type = 'info', duration = 2) {
    this.notifications.push({
      text,
      type,
      duration,
      timer: 0,
      alpha: 0,
    });

    // 限制数量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }
  }

  /**
   * 更新通知
   */
  update(dt) {
    for (let i = this.notifications.length - 1; i >= 0; i--) {
      const n = this.notifications[i];
      n.timer += dt;

      // 淡入
      if (n.timer < 0.3) {
        n.alpha = n.timer / 0.3;
      }
      // 淡出
      else if (n.timer > n.duration - 0.3) {
        n.alpha = Math.max(0, (n.duration - n.timer) / 0.3);
      } else {
        n.alpha = 1;
      }

      if (n.timer >= n.duration) {
        this.notifications.splice(i, 1);
      }
    }
  }

  /**
   * 渲染 HUD
   */
  renderHUD(ctx, game) {
    const { width, player, score } = game;
    if (!player) return;

    // ─── 顶部栏 ───
    const barY = 12;
    const barPadding = 16;

    // 生命值（左上）
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    let hpText = '';
    for (let i = 0; i < player.maxHp; i++) {
      hpText += i < player.hp ? '♥' : '♡';
    }
    ctx.fillText(hpText, barPadding, barY + 16);

    // 分数（右上）
    ctx.fillStyle = '#ffd700';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`🪙 ${score}`, width - barPadding, barY + 16);

    // ─── 通知 ───
    this.renderNotifications(ctx, game);
  }

  /**
   * 渲染通知
   */
  renderNotifications(ctx, game) {
    const { width } = game;
    const startY = 60;

    for (let i = 0; i < this.notifications.length; i++) {
      const n = this.notifications[i];
      const y = startY + i * 35;

      ctx.globalAlpha = Math.max(0, n.alpha);

      // 背景
      const colors = {
        info: 'rgba(78, 204, 163, 0.8)',
        collect: 'rgba(255, 215, 0, 0.8)',
        warning: 'rgba(233, 69, 96, 0.8)',
      };

      ctx.fillStyle = colors[n.type] || colors.info;
      const textWidth = ctx.measureText(n.text).width;
      const boxWidth = textWidth + 24;
      const boxX = width / 2 - boxWidth / 2;

      ctx.fillRect(boxX, y, boxWidth, 26);

      // 文字
      ctx.fillStyle = '#fff';
      ctx.font = '13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n.text, width / 2, y + 17);

      ctx.globalAlpha = 1;
    }
  }
}
