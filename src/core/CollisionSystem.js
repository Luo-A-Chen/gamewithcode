export class CollisionSystem {
  static aabb(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  resolve(entities, level) {
    var i, j, a, b;
    for (i = 0; i < entities.length; i++) {
      if (!entities[i].solid) continue;
      this.resolveTileCollisions(entities[i], level);
    }

    for (i = 0; i < entities.length; i++) {
      for (j = i + 1; j < entities.length; j++) {
        a = entities[i];
        b = entities[j];
        if (CollisionSystem.aabb(a.getBounds(), b.getBounds())) {
          if (a.constructor.name === 'Player' && (b.constructor.name === 'PushableBox' || b.constructor.name === 'GearToken')) {
            this.resolvePush(a, b);
          } else if (b.constructor.name === 'Player' && (a.constructor.name === 'PushableBox' || a.constructor.name === 'GearToken')) {
            this.resolvePush(b, a);
          } else {
            if (a.onCollide) a.onCollide(b);
            if (b.onCollide) b.onCollide(a);
          }
        }
      }
    }
  }

  resolveTileCollisions(entity, level) {
    var tiles = level.getTilesInRange(entity.x, entity.y, entity.width, entity.height);
    var i, tile, overlap, entityBottom, prevBottom;

    for (i = 0; i < tiles.length; i++) {
      tile = tiles[i];

      if (tile.oneWay) {
        if (entity.vy >= 0) {
          entityBottom = entity.y + entity.height;
          prevBottom = entityBottom - entity.vy * (1 / 60);
          if (prevBottom <= tile.y + 4) {
            entity.y = tile.y - entity.height;
            entity.vy = 0;
            entity.grounded = true;
          }
        }
        continue;
      }

      if (!tile.solid) continue;

      overlap = this.getOverlap(entity.getBounds(), tile);
      if (!overlap) continue;

      if (overlap.dx < overlap.dy) {
        if (entity.x < tile.x) {
          entity.x -= overlap.dx;
        } else {
          entity.x += overlap.dx;
        }
        entity.vx = 0;
      } else {
        if (entity.y < tile.y) {
          entity.y -= overlap.dy;
          entity.vy = 0;
          entity.grounded = true;
        } else {
          entity.y += overlap.dy;
          entity.vy = 0;
        }
      }
    }
  }

  getOverlap(a, b) {
    var dx = Math.min(a.x + a.w - b.x, b.x + b.w - a.x);
    var dy = Math.min(a.y + a.h - b.y, b.y + b.h - a.y);
    if (dx <= 0 || dy <= 0) return null;
    return { dx: dx, dy: dy };
  }

  resolvePush(player, box) {
    var overlap = this.getOverlap(player.getBounds(), box.getBounds());
    if (!overlap) return;

    if (overlap.dx < overlap.dy) {
      var dir = player.x < box.x ? 1 : -1;
      box.push(dir);
      player.x -= dir * overlap.dx;
      player.vx = 0;
    } else {
      if (player.y < box.y) {
        player.y -= overlap.dy;
        player.vy = 0;
        player.grounded = true;
      } else {
        player.y += overlap.dy;
        player.vy = 0;
      }
    }
  }
}
