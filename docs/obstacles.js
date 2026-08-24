// ============================================================
// obstacles.js — Obstacle and Collectible spawning & drawing
// ============================================================

// ── Obstacle ────────────────────────────────────────────────

class Obstacle {
  /**
   * @param {number} canvasW  - canvas logical width
   * @param {string} type     - "low" (jump over) | "high" (slide under) | "tall"
   */
  constructor(canvasW, type) {
    this.type   = type;
    this.active = true;

    // Dimensions and position depend on type
    if (type === "low") {
      // Short block on the ground — player must jump over
      this.w = 30 + Math.random() * 20;
      this.h = 50 + Math.random() * 30;
      this.y = GROUND_Y - this.h;
    } else if (type === "high") {
      // Tall thin block — player must slide under the gap
      this.w = 20;
      const slideClearance = SLIDE_H + 8;
      this.h = GROUND_Y - slideClearance;  // leave enough room for slide
      this.y = 0;               // starts at top
    } else {
      // "tall" — medium cactus-style
      this.w = 28;
      this.h = 90 + Math.random() * 30;
      this.y = GROUND_Y - this.h;
    }

    this.x = canvasW + 10;
  }

  update(dt, speed) {
    this.x -= speed * dt;
    if (this.x + this.w < 0) this.active = false;
  }

  draw(ctx) {
    ctx.fillStyle = this.type === "high" ? "#7c3aed" : "#ef4444";
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Decorative highlight strip
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(this.x + 2, this.y + 2, 4, this.h - 4);
  }

  getBounds() {
    // Tighter hitbox than visual
    return { x: this.x + 2, y: this.y, w: this.w - 4, h: this.h };
  }
}

// ── Collectible (coin / star) ────────────────────────────────

class Collectible {
  constructor(canvasW) {
    this.active  = true;
    this.w       = 20;
    this.h       = 20;
    this.x       = canvasW + 10;
    // Float at various heights above ground
    this.y       = GROUND_Y - 80 - Math.random() * 120;
    this.score   = 10;
    this._t      = 0;  // used for bobbing animation
  }

  update(dt, speed) {
    this.x  -= speed * dt;
    this._t += dt;
    if (this.x + this.w < 0) this.active = false;
  }

  draw(ctx) {
    // Gold diamond shape
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 + Math.sin(this._t * 4) * 4;  // bob
    const r  = this.w / 2;

    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.moveTo(cx,     cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx,     cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.moveTo(cx,         cy - r);
    ctx.lineTo(cx + r * 0.5, cy - r * 0.2);
    ctx.lineTo(cx,         cy - r * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  getBounds() {
    return { x: this.x + 3, y: this.y + 3, w: this.w - 6, h: this.h - 6 };
  }
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Returns true when two AABB rectangles overlap.
 */
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * Randomly pick an obstacle type with weighted probability.
 */
function randomObstacleType() {
  const r = Math.random();
  if (r < 0.55) return "low";
  if (r < 0.80) return "tall";
  return "high";
}
