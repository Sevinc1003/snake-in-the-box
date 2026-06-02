### 2026-05-12 - Food Spawning Inside Obstacles and Teleport Tiles

**What I asked the AI:** Help me create a random food generation function for my grid-based snake game that works dynamically across different levels.

**What it gave me:** A standard random coordinate generator using `Math.floor(Math.random() * tileCount)` that only checked if the food coordinates overlapped with the snake's body array.

**What was wrong:** The function completely ignored the static obstacles (`walls`) and the custom purple teleport squares. As a result, food frequently spawned inside walls or directly on top of portals, making it impossible for the player to reach it and level up.

**How I fixed it:** I modified the `generateNormalFood()` and `generateGoldFood()` functions by adding `.some()` validation loops. Now, the loop keeps generating new coordinates until it verifies that the food is not on the snake, not inside a wall, and not on top of a teleport tile.

**Time lost:** ~20 minutes

---

### 2026-05-15 - Instant Self-Collision Death on Rapid Keypresses

**What I asked the AI:** Write a keydown event listener to control the snake's movement using the keyboard arrow keys and prevent it from reversing directly into itself.

**What it gave me:** An event listener that directly modified the active `direction` object (e.g., changing `direction.x` or `direction.y` instantly inside the switch case based on the current heading).

**What was wrong:** If a player pressed two arrow keys rapidly within a single game tick (for example, pressing ArrowRight and then ArrowDown immediately while moving Left), the active direction shifted to Right before the game executed the next frame. This caused the snake to turn 180 degrees into its own neck, triggering an immediate and unfair game over.

**How I fixed it:** I introduced a buffer variable called `nextDirection`. The keyboard listener now only updates `nextDirection`, and the actual `direction` variable is safely synchronized only once per frame at the very beginning of the `update()` loop.

**Time lost:** ~35 minutes

---

### 2026-05-18 - Overlapping Game Loops and Unintended Speed Multiplication

**What I asked the AI:** Create a dynamic game initiation function that restarts the canvas and applies a faster interval speed as the player advances to higher levels.

**What it gave me:** A `startLevel()` function that calculated the new speed based on the level number and triggered a new `setInterval(update, speed)`.

**What was wrong:** The code never stopped the active timers from the previous levels. Every time a new room loaded or the player hit "PLAY AGAIN", a brand new interval layer was created. The game loops overlapped, causing the snake to move progressively at an uncontrollable, chaotic speed.

**How I fixed it:** I added a strict `clearInterval(gameInterval);` check at the absolute beginning of the `startLevel()` function to safely terminate any active intervals before spawning a new one.

**Time lost:** ~15 minutes

---

### 2026-05-22 - Menu Overlay Layout Distortion on Small Screens

**What I asked the AI:** Write an absolute-positioned CSS layout for the game's start and customization menu screens to overlay neatly on top of the HTML5 canvas.

**What it gave me:** CSS style blocks for the `.overlay` class that utilized fluid percentage units (`width: 90%; height: 90%;`) and flexible auto margins.

**What was wrong:** Because the `<canvas>` element has hardcoded fixed dimensions (400x400px), using relative percentage layouts on the overlay caused massive layout shifts. On smaller screens, the customization grid text squished together, and the "BACK" button drifted completely out of the container border.

**How I fixed it:** I hardcoded the `.overlay` dimensions to match the canvas dimensions exactly (`width: 400px; height: 400px;`) and refactored the alignment using a structured flexbox container with exact pixel gaps.

**Time lost:** ~25 minutes

---

### 2026-05-28 - Boundary Collision Glitches During Teleportation

**What I asked the AI:** Add cross-boundary teleportation mechanics for levels 3, 4, and 5 so the snake can enter a portal on one edge and seamlessly appear on the opposite side of the map.

**What it gave me:** A logic snippet inside the boundary check that automatically shifted the head coordinates if it crossed index 0 or index 19.

**What was wrong:** The boundary checks were executing *after* the obstacle collision conditions. If a map configuration placed a wall right next to a boundary target line, the snake would clip into the wall block and trigger a ghost game over without correctly passing through the portal system.

**How I fixed it:** I rearranged the order of execution inside the `update()` function. The system now searches for an active teleport matchup using `teleports.find()` first, updates the potential head placement, and only runs wall/self-collision checks on the finalized target coordinates.

**Time lost:** ~40 minutes