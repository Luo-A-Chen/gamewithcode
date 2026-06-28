import { Entity } from './Entity.js';

/**
 * Player - 玩家角色
 * 参考 GAME_FEEL.md 实现手感参数
 */
export class Player extends Entity {
  constructor(x, y) {
    super(x, y, 28, 44); // 碰撞箱比精灵小（收紧）
    this.spriteWidth = 32;
    this.spriteHeight = 48;

    // 移动参数（参考 GAME_FEEL.md）
    this.maxSpeed = 200;
    this.accelGround = 1200;
    this.accelAir = 800;
    this.decelGround = 1600;
    this.turnAccel = 2000;

    // 跳跃参数
    this.jumpForce = -450;
    this.gravity = 980;
    this.shortHopMultiplier = 2.5;
    this.maxFallSpeed = 600;
    this.doubleJumpForce = -380;
    this.maxJumps = 2;
    this.jumpCount = 0;
    this.jumpPressed = false;

    // Coyote Time & Jump Buffering
    this.coyoteTime = 0.1;      // 100ms
    this.coyoteTimer = 0;
    this.jumpBufferTime = 0.1;  // 100ms
    this.jumpBufferTimer = 0;

    // Corner Correction
    this.cornerCorrection = 4;

    // 生命值
    this.hp = 3;
    this.maxHp = 3;
    this.invincible = false;
    this.invincibleTimer = 0;

    // Squash & Stretch
    this.scaleX = 1;
    this.scaleY = 1;

    // 视觉
    this.color = '#e94560';
    this.facingRight = true;
  }

  handleInput(input) {
    // 水平移动输入
    let inputDir = 0;
    if (input.left) inputDir -= 1;
    if (input.right) inputDir += 1;

    // 记录朝向
    if (inputDir > 0) this.facingRight = true;
    if (inputDir < 0) this.facingRight = false;

    // 跳跃缓冲：按下跳跃键时记录
    if (input.isJustPressed('Space') || input.isJustPressed('ArrowUp') || input.isJustPressed('KeyW')) {
      this.jumpBufferTimer = this.jumpBufferTime;
    }

    // 跳跃执行
    if (this.jumpBufferTimer > 0) {
      const canJump = this.jumpCount < this.maxJumps || this.coyoteTimer > 0;
      if (canJump) {
        const force = this.jumpCount === 0 ? this.jumpForce : this.doubleJumpForce;
        this.vy = force;
        this.jumpCount++;
        this.grounded = false;
        this.jumpBufferTimer = 0;
        this.coyoteTimer = 0;

        // 起跳形变
        this.scaleX = 0.85;
        this.scaleY = 1.2;
      }
    }

    // 变量高度跳跃：松开时增大重力
    var isJumpHeld = input.isPressed('Space') || input.isPressed('ArrowUp') || input.isPressed('KeyW');
    this._isJumpHeld = isJumpHeld;

    // 投掷（Shift 或 E 键）
    if (input.isJustPressed('ShiftLeft') || input.isJustPressed('ShiftRight') || input.isJustPressed('KeyE')) {
      this._throwPressed = true;
    }

    // 存储输入方向供 update 使用
    this._inputDir = inputDir;
  }

  /**
   * 尝试投掷附近的箱子/齿轮
   */
  tryThrow(entities) {
    if (!this._throwPressed) return null;
    this._throwPressed = false;

    // 找最近的可投掷物体
    var nearest = null;
    var nearestDist = 60; // 投掷范围

    for (var i = 0; i < entities.length; i++) {
      var e = entities[i];
      if ((e.constructor.name === 'GearToken' || e.constructor.name === 'PushableBox') && !e.inSlot) {
        var dx = (e.x + e.width / 2) - (this.x + this.width / 2);
        var dy = (e.y + e.height / 2) - (this.y + this.height / 2);
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = e;
        }
      }
    }

    if (nearest) {
      // 投掷方向：面向方向，弧线
      var dir = this.facingRight ? 1 : -1;
      nearest.thrown = true;
      nearest.throwVx = dir * 300; // 水平速度（3-4格距离）
      nearest.throwVy = -350;      // 向上抛
      nearest.inSlot = false;
      if (nearest.slotId) {
        // 从槽位弹出
        nearest.slotId = null;
      }
      return nearest;
    }
    return null;
  }

  update(dt) {
    const inputDir = this._inputDir || 0;

    // 水平加速度
    let accel;
    if (!this.grounded) {
      accel = this.accelAir;
    } else if (inputDir !== 0 && Math.sign(this.vx) !== inputDir && this.vx !== 0) {
      accel = this.turnAccel; // 转向
    } else if (inputDir !== 0) {
      accel = this.accelGround;
    } else {
      accel = this.decelGround; // 减速
    }

    if (inputDir !== 0) {
      this.vx += inputDir * accel * dt;
      this.vx = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.vx));
    } else {
      // 减速到 0
      if (this.vx > 0) {
        this.vx = Math.max(0, this.vx - accel * dt);
      } else if (this.vx < 0) {
        this.vx = Math.min(0, this.vx + accel * dt);
      }
    }

    // 重力
    this.vy += this.gravity * dt;

    // 变量高度跳跃
    if (!this._isJumpHeld && this.vy < 0) {
      this.vy += this.gravity * (this.shortHopMultiplier - 1) * dt;
    }

    // 终端速度
    if (this.vy > this.maxFallSpeed) {
      this.vy = this.maxFallSpeed;
    }

    // 移动
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Coyote Time（在 grounded 被重置前处理）
    const wasGrounded = this.grounded;
    if (wasGrounded) {
      this.jumpCount = 0;
      this.coyoteTimer = this.coyoteTime;
    }
    // grounded 在下面被重置为 false，coyoteTimer 继续倒计时
    this.coyoteTimer -= dt;

    // 跳跃缓冲倒计时
    this.jumpBufferTimer -= dt;

    // 无敌时间
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // Squash & Stretch 恢复
    this.scaleX += (1 - this.scaleX) * 0.2;
    this.scaleY += (1 - this.scaleY) * 0.2;

    // 落地形变
    if (this.grounded && Math.abs(this.vy) < 10) {
      // 轻微压缩
    }

    // 防止掉出世界底部
    if (this.y > 2000) {
      this.hp = 0;
      this.dead = true;
    }

    // 重置 grounded（碰撞系统会在下帧重新设置）
    this.grounded = false;

    // 重置输入
    this._inputDir = 0;
  }

  /**
   * 受到伤害
   */
  takeDamage(amount, knockbackX = 0) {
    if (this.invincible || this.dead) return;

    this.hp -= amount;
    this.invincible = true;
    this.invincibleTimer = 1.5;

    // 击退
    if (knockbackX !== 0) {
      this.vx = knockbackX;
      this.vy = -200;
    }

    // 受伤形变
    this.scaleX = 1.3;
    this.scaleY = 0.7;

    if (this.hp <= 0) {
      this.dead = true;
    }
  }

  render(ctx) {
    // 无敌闪烁
    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      return;
    }

    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-cx, -cy);

    // 身体
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 眼睛（指示朝向）
    ctx.fillStyle = '#fff';
    const eyeX = this.facingRight
      ? this.x + this.width * 0.6
      : this.x + this.width * 0.2;
    ctx.fillRect(eyeX, this.y + 8, 5, 5);

    // 跳跃指示条
    if (this.jumpCount > 0) {
      ctx.fillStyle = this.jumpCount >= this.maxJumps ? '#ff0' : '#0f0';
      const barWidth = (1 - this.jumpCount / this.maxJumps) * this.width;
      ctx.fillRect(this.x, this.y - 6, barWidth, 3);
    }

    ctx.restore();
  }
}
