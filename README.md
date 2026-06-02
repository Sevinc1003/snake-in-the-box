# 🐍 Snake in the Box

A modern, responsive, and feature-rich twist on the classic Snake game, introducing unique mechanics like Teleport Portals and Level Gateways. Built to run flawlessly across both desktop and mobile devices.

🎮 **Play the game live here:** [https://sevinc1003.github.io/snake-in-the-box/](https://sevinc1003.github.io/snake-in-the-box/)

## 🗺️ Game Overview & Sketch
In **Snake in the Box**, players navigate a highly customizable snake through a series of increasingly difficult rooms (Levels 1 to 5). Unlike traditional snake games, moving through designated edge tiles acts as a wormhole, warping the player across map coordinates while testing their reflexes against strategic obstacles.

* **Room Portals (Teleport):** On specific levels, enter the purple cells at the edges of the map to instantly warp to the opposite side.
* **Next-Level Gateway:** Accumulate 60 points to open the blue portal. Entering it transitions you safely to the next stage.
* **Gold Food:** Spawns briefly once you reach 30 points, offering a high-score bonus (+30 points) if you can catch it in time.
* **Design Menu (Customization):**
    * *Snake Skin:* Classic, Neon Blue, Lava.
    * *Map Environment:* Retro, Cyber, Desert.
    * *Food Shape:* Square, Circle.
* **Full Mobile Support:** Clean user interface free of bulky on-screen buttons. Control the snake smoothly using natural touch gestures.
* **Smart Spawning Algorithm:** Bug-free coordinate generation ensures that normal food, gold items, and portals never spawn inside walls or overlap with each other.
Here is the structural design concept created in Excalidraw:
![Snake in the Box Architecture Sketch](/sketch.png)

---
## 🕹️ Controls & Navigation Mechanics
* **💻 On Desktop:** Use the standard keyboard arrow keys:
  * ⬆️ **Arrow Up / ⬇️ Arrow Down / ⬅️ Arrow Left / ➡️ Arrow Right** to instantly change directions.
* **📱 On Mobile:** Swipe anywhere on the screen in your desired direction (Up, Down, Left, Right) utilizing smooth touch gestures.
* **Entity - The Snake:** The player-controlled entity that continuously moves forward on the grid based on these inputs.
---
## 💥 Collision Logic & Interaction Constraints
* **Obstacle Matrix:** Level-specific static walls are arranged in challenging layouts. Hitting a wall or the outer bounds triggers a crash.
* **Self-Biting:** Colliding with the snake's own expanding tail triggers an immediate collision event.
* **Room Portals (Teleports):** Linked pairs of purple coordinates located on the grid edges. Stepping into one instantly triggers an interaction that shifts the snake's head to the corresponding exit portal.
---
## 🏆 Scoring Dynamics & Lose Conditions
* **Normal Food:** A standard collectible that awards **+10 points** and expands the snake. Spawns randomly on clear tiles.
* **Gold Food:** A rare, high-value item that spawns briefly once the player crosses a 30-point threshold. Awards **+30 points**.
* **Lose Condition:** The game loop terminates instantly if any collision condition (wall, tail, or non-portal boundary) returns true.
* **Next-Level Gateway:** Accumulate **60 points** to open the blue portal. Entering it transitions you safely to the next stage.
---
## 🎨 User Interface Overlays & Personalization Menu
* **Start Screen Overlay:** An initial landing layout hosting game options and the core "Play" trigger.
* **Game Over Overlay:** Displays the final summary stats and score breakdown immediately upon termination.
* **Design Menu (Customization):**
  * *Snake Skin:* Classic, Neon Blue, Lava.
  * *Map Environment:* Retro, Cyber, Desert.
  * *Food Shape:* Square, Circle.
---
## 🔄 State Reset Pipeline & Technical Specification
* **In-Memory Restart:** The application is completely restartable without refreshing the page. Clicking "Play Again" flushes the active `setInterval` loops, clears the coordinate matrices, and resets points back to zero dynamically.
* **Architecture:** Built using a pure functional/procedural JavaScript structure rather than OOP for lightweight canvas performance.
* **Development History:** Detailed iteration logs are systematically maintained inside the [AI_DIARY.md](AI_DIARY.md) file.