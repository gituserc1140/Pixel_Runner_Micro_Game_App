// ============================================================
// game.js — Main game loop, rendering, input handling
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");

// ── Constants ────────────────────────────────────────────────
const W = canvas.width;   // 960
const H = canvas.height;  // 540

const BASE_SPEED      = 320;   // pixels per second at start
const MAX_SPEED       = 780;   // speed cap
const SPEED_INCREMENT = 18;    // speed added per second of play
const GROUND_LINE     = GROUND_Y;  // imported from player.js (= 440)

// ── Game state ────────────────────────────────────────────────
let state;   // "title" | "playing" | "dead"
let score, hiScore, speed;
let obstacles, collectibles;
let player;
let bgOffset;
let spawnTimer, spawnInterval;
let lastTime;

function initGame() {
  state         = "title";
  hiScore       = 0;
}

function startGame() {
  state         = "playing";
  score         = 0;
  speed         = BASE_SPEED;
  obstacles     = [];
  collectibles  = [];
  bgOffset      = 0;
  spawnTimer    = 0;
  spawnInterval = 1.6;  // seconds between spawns (decreases with speed)
  lastTime      = null;

  player = new Player();
}

// ── Input ─────────────────────────────────────────────────────

let slideKeyHeld = false;

// Keyboard
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.key === " ") {
    e.preventDefault();
    handleJump();
  }
  if (e.code === "ArrowDown") {
    e.preventDefault();
    if (!slideKeyHeld) { slideKeyHeld = true; handleSlideStart(); }
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    slideKeyHeld = false;
    handleSlideEnd();
  }
});

// Touch / swipe
let touchStartY = null;
const SWIPE_THRESHOLD = 30;  // pixels

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  touchStartY = e.touches[0].clientY;
  // A simple tap (no vertical travel) → jump; resolved in touchend
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  if (touchStartY !== null) {
    const dy = (e.changedTouches[0].clientY) - touchStartY;
    if (dy > SWIPE_THRESHOLD) {
      handleSlideStart();
      setTimeout(handleSlideEnd, 500);
    } else if (Math.abs(dy) < SWIPE_THRESHOLD) {
      handleJump();
    }
    touchStartY = null;
  }
}, { passive: false });

function handleJump() {
  if (state === "title") { startGame(); return; }
  if (state === "dead")  { startGame(); return; }
  player.jump();
}

function handleSlideStart() {
  if (state !== "playing") return;
  player.startSlide();
}

function handleSlideEnd() {
  if (state !== "playing") return;
  player.endSlide();
}

// ── Background ────────────────────────────────────────────────

// Simple parallax layers: far mountains, mid hills, ground
function drawBackground() {
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#0f172a");
  sky.addColorStop(1, "#1e293b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars (static, layered via small rects)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 40; i++) {
    const sx = ((i * 137 + bgOffset * 0.05) % W);
    const sy = (i * 53) % (GROUND_LINE - 80);
    ctx.fillRect(sx, sy, 2, 2);
  }

  // Far hills (slow parallax)
  ctx.fillStyle = "#1e3a5f";
  for (let i = 0; i < 5; i++) {
    const hx = ((i * 210 - bgOffset * 0.15) % (W + 210)) - 10;
    ctx.beginPath();
    ctx.ellipse(hx, GROUND_LINE, 130, 80, 0, Math.PI, 0);
    ctx.fill();
  }

  // Mid hills (medium parallax)
  ctx.fillStyle = "#164e63";
  for (let i = 0; i < 7; i++) {
    const hx = ((i * 160 - bgOffset * 0.35) % (W + 160)) - 10;
    ctx.beginPath();
    ctx.ellipse(hx, GROUND_LINE, 90, 55, 0, Math.PI, 0);
    ctx.fill();
  }

  // Ground
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, GROUND_LINE, W, H - GROUND_LINE);

  // Ground highlight stripe
  ctx.fillStyle = "#475569";
  ctx.fillRect(0, GROUND_LINE, W, 4);

  // Moving ground dashes
  ctx.fillStyle = "#64748b";
  for (let i = 0; i < 10; i++) {
    const dx = ((i * 110 - bgOffset) % (W + 110)) - 10;
    ctx.fillRect(dx, GROUND_LINE + 12, 60, 4);
  }
}

// ── HUD ───────────────────────────────────────────────────────

function drawHUD() {
  ctx.fillStyle = "#f9fafb";
  ctx.font      = "bold 28px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 20, 40);

  ctx.textAlign = "right";
  ctx.fillStyle = "#94a3b8";
  ctx.font      = "20px Arial, sans-serif";
  ctx.fillText(`Best: ${hiScore}`, W - 20, 40);

  // Speed indicator
  const pct = (speed - BASE_SPEED) / (MAX_SPEED - BASE_SPEED);
  ctx.textAlign = "center";
  ctx.fillStyle = pct > 0.7 ? "#f87171" : "#22d3ee";
  ctx.font      = "16px Arial, sans-serif";
  ctx.fillText(`Speed ×${(speed / BASE_SPEED).toFixed(1)}`, W / 2, 28);
}

// ── Screens ───────────────────────────────────────────────────

function drawTitleScreen() {
  drawBackground();

  // Semi-transparent panel
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 240, H / 2 - 130, 480, 260, 18);
  ctx.fill();

  ctx.textAlign = "center";
  ctx.fillStyle = "#22d3ee";
  ctx.font      = "bold 64px Arial, sans-serif";
  ctx.fillText("PIXEL RUNNER", W / 2, H / 2 - 50);

  ctx.fillStyle = "#f9fafb";
  ctx.font      = "26px Arial, sans-serif";
  ctx.fillText("Tap / Press SPACE to start", W / 2, H / 2 + 20);

  ctx.fillStyle = "#94a3b8";
  ctx.font      = "20px Arial, sans-serif";
  ctx.fillText("Jump: SPACE / Tap", W / 2, H / 2 + 60);
  ctx.fillText("Slide: ↓ / Swipe Down", W / 2, H / 2 + 90);
}

function drawDeadScreen() {
  // Dim overlay
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ef4444";
  ctx.font      = "bold 60px Arial, sans-serif";
  ctx.fillText("GAME OVER", W / 2, H / 2 - 60);

  ctx.fillStyle = "#f9fafb";
  ctx.font      = "30px Arial, sans-serif";
  ctx.fillText(`Score: ${score}`, W / 2, H / 2);

  if (score >= hiScore) {
    ctx.fillStyle = "#fbbf24";
    ctx.font      = "22px Arial, sans-serif";
    ctx.fillText("🏆 New Best!", W / 2, H / 2 + 38);
  }

  // Restart button
  const bx = W / 2 - 110, by = H / 2 + 70, bw = 220, bh = 50;
  ctx.fillStyle = "#22d3ee";
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.font      = "bold 24px Arial, sans-serif";
  ctx.fillText("PLAY AGAIN", W / 2, by + 33);
}

// Click / tap on "Play Again" button
canvas.addEventListener("pointerdown", (e) => {
  if (state !== "dead") return;
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / rect.width;
  const scaleY = H / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top)  * scaleY;
  const bx = W / 2 - 110, by = H / 2 + 70, bw = 220, bh = 50;
  if (cx > bx && cx < bx + bw && cy > by && cy < by + bh) {
    startGame();
  }
});

// ── Main loop ─────────────────────────────────────────────────

function gameLoop(ts) {
  const dt = lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (state === "title") {
    drawTitleScreen();
    requestAnimationFrame(gameLoop);
    return;
  }

  if (state === "dead") {
    drawDeadScreen();
    requestAnimationFrame(gameLoop);
    return;
  }

  // ── Update ───────────────────────────────────────────────

  // Increase speed over time
  speed = Math.min(MAX_SPEED, speed + SPEED_INCREMENT * dt);

  // Scroll background offset
  bgOffset = (bgOffset + speed * dt) % (W + 210);

  // Score from distance run
  score += Math.round(speed * dt * 0.05);

  // Spawn obstacles and collectibles
  spawnTimer += dt;
  // Spawn interval shrinks as speed grows
  spawnInterval = Math.max(0.8, 1.6 - (speed - BASE_SPEED) / 600);

  if (spawnTimer >= spawnInterval) {
    spawnTimer = 0;
    if (Math.random() < 0.7) {
      obstacles.push(new Obstacle(W, randomObstacleType()));
    } else {
      collectibles.push(new Collectible(W));
    }
  }

  // Update entities
  player.update(dt);
  obstacles.forEach(o => o.update(dt, speed));
  collectibles.forEach(c => c.update(dt, speed));

  // Remove off-screen entities
  obstacles    = obstacles.filter(o => o.active);
  collectibles = collectibles.filter(c => c.active);

  // Collision detection
  const pb = player.getBounds();

  for (const obs of obstacles) {
    if (rectsOverlap(pb, obs.getBounds())) {
      player.dead = true;
      state = "dead";
      if (score > hiScore) hiScore = score;
      break;
    }
  }

  for (const col of collectibles) {
    if (col.active && rectsOverlap(pb, col.getBounds())) {
      score += col.score;
      col.active = false;
    }
  }

  // ── Draw ─────────────────────────────────────────────────
  drawBackground();
  obstacles.forEach(o => o.draw(ctx));
  collectibles.forEach(c => c.draw(ctx));
  player.draw(ctx);
  drawHUD();

  requestAnimationFrame(gameLoop);
}

// ── Boot ──────────────────────────────────────────────────────

initGame();
requestAnimationFrame(gameLoop);

