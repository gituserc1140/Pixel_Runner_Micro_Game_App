# Pixel Runner

A simple, mobile-friendly side-scrolling auto-runner built with plain HTML, CSS, and JavaScript — no external libraries.

## Controls

| Action | Keyboard | Mobile |
|--------|----------|--------|
| Jump   | `Space`  | Tap the screen |
| Slide  | `↓` (hold) | Swipe down |

- **Collect gold diamonds** to increase your score.
- **Avoid red obstacles** — colliding ends the run.
- Speed increases over time; how far can you get?

## File Structure

```
docs/
  index.html    — page shell, loads all scripts
  style.css     — responsive dark-theme styles
  player.js     — Player class: physics, jump, slide, draw
  obstacles.js  — Obstacle & Collectible classes, collision helper
  game.js       — Main game loop, input handling, screens
```

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**.
3. Under *Build and deployment* choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or your default branch)
   - **Folder:** `/docs`
4. Click **Save** and wait ~60 seconds.

Your game will be live at:

```
https://<your-username>.github.io/<your-repo>/
```

## Run locally

Just open `docs/index.html` in any modern browser — no server needed.  
(The root `index.html` also redirects to `docs/` for convenience.)

