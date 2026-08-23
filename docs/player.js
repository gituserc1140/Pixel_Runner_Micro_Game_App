// ============================================================
// player.js — Player character: drawing, physics, jump, slide
// ============================================================

const PLAYER_X = 120;           // fixed horizontal position
const GROUND_Y = 440;           // y-coordinate of the ground surface (canvas height = 540)
const PLAYER_W = 40;            // normal width
const PLAYER_H = 60;            // normal height
const SLIDE_H  = 28;            // height while sliding
const GRAVITY  = 1600;          // pixels per second² downward acceleration
const JUMP_VEL = -720;          // initial upward velocity when jumping (negative = up)

class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x       = PLAYER_X;
    this.y       = GROUND_Y - PLAYER_H;   // sit on the ground
    this.vy      = 0;                      // vertical velocity
    this.w       = PLAYER_W;
    this.h       = PLAYER_H;
    this.sliding = false;
    this.onGround = true;
    this.dead    = false;
  }

  // ── Input actions ───────────────────────────────────────────

  jump() {
    if (this.onGround && !this.sliding && !this.dead) {
      this.vy = JUMP_VEL;
      this.onGround = false;
    }
  }

  startSlide() {
    if (this.onGround && !this.dead) {
      this.sliding = true;
      this.h = SLIDE_H;
      this.y = GROUND_Y - SLIDE_H;  // re-anchor to ground
    }
  }

  endSlide() {
    if (this.sliding) {
      this.sliding = false;
      this.h = PLAYER_H;
      this.y = GROUND_Y - PLAYER_H;
    }
  }

  // ── Update physics ──────────────────────────────────────────

  update(dt) {
    if (this.dead) return;

    if (!this.sliding) {
      // Apply gravity
      this.vy += GRAVITY * dt;
      this.y  += this.vy * dt;

      // Land on ground
      const groundTop = GROUND_Y - this.h;
      if (this.y >= groundTop) {
        this.y       = groundTop;
        this.vy      = 0;
        this.onGround = true;
      } else {
        this.onGround = false;
      }
    }
  }

  // ── Drawing ─────────────────────────────────────────────────

  draw(ctx) {
    const x = this.x, y = this.y, w = this.w, h = this.h;

    if (this.dead) {
      // Draw tumbling X when dead
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
      ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
      ctx.stroke();
      return;
    }

    // Body (cyan block)
    ctx.fillStyle = "#22d3ee";
    ctx.fillRect(x, y, w, h);

    if (!this.sliding) {
      // Head
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(x + 4, y - 18, 32, 18);

      // Eye
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(x + 20, y - 14, 8, 8);
    }

    // Shoes (darker strip at bottom)
    ctx.fillStyle = "#0e7490";
    ctx.fillRect(x, y + h - 8, w, 8);
  }

  // ── Axis-aligned bounding box for collision ─────────────────

  getBounds() {
    return { x: this.x + 4, y: this.y, w: this.w - 8, h: this.h };
  }
}
