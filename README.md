# 🚀 Space Invaders Game

A classic Space Invaders-style game built with vanilla JavaScript, HTML5 Canvas, and CSS. Features retro-style graphics, sound effects, power-ups, and explosion animations.

![Space Invaders](https://img.shields.io/badge/Game-Space%20Invaders-green) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow) ![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## 🎮 Features

- **Classic Gameplay**: Defend Earth from invading aliens
- **Power-Up System**: Activate enhanced bullets at 100+ score
- **Sound Effects**: Immersive audio feedback using Web Audio API
- **Explosion Animations**: Particle-based explosion effects when enemies are destroyed
- **Retro Styling**: Classic arcade-style visuals with neon green theme
- **Score System**: Track your progress as you eliminate enemies

## 🎯 How to Play

1. **Movement**: Use `←` and `→` arrow keys to move your ship left and right
2. **Shooting**: Press `SPACEBAR` to fire bullets at enemies
3. **Objective**: Destroy all enemy invaders before they reach the bottom
4. **Power-Up**: Reach 100+ points to activate the power-up mode
   - Bullets do 3x damage
   - Bullets glow cyan
   - Ship glows with power-up effect

## 🚀 Getting Started

### Prerequisites

- Node.js (for running the local server)
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. Clone or download this repository
2. Navigate to the project directory

### Running the Game

Start the local server:

```bash
node server.js
```

The game will be available at `http://localhost:8000`

Alternatively, you can open `index.html` directly in your browser (some features may require a local server).

## 🎨 Game Features

### Power-Up System
- **Activation**: Automatically activates when your score exceeds 100
- **Enhanced Bullets**: 
  - 3x damage (normal bullets do 1 damage)
  - Cyan color with glow effect
  - Larger size
- **Visual Feedback**: Player ship glows cyan when power-up is active

### Sound Effects
All sounds are generated using the Web Audio API (no external files needed):
- **Player Shoot**: Laser beep sound
- **Power-Up Shoot**: Enhanced dual-tone sound
- **Enemy Shoot**: Lower-pitched enemy laser
- **Explosion**: Multi-layered explosion sound
- **Power-Up Activation**: Ascending tone sequence
- **Game Over**: Descending sad tones

### Explosion Animations
- Particle-based explosion effects
- Colorful particles (orange/yellow/red)
- Gravity physics
- Fade-out animation

## 📁 Project Structure

```
Game/
├── index.html      # Main HTML file
├── game.js         # Game logic and mechanics
├── style.css       # Styling and visual effects
├── server.js       # Simple HTTP server
└── README.md       # This file
```

## 🎮 Game Controls

| Action | Control |
|--------|---------|
| Move Left | `←` Arrow Key |
| Move Right | `→` Arrow Key |
| Shoot | `SPACEBAR` |
| Start Game | Click "START GAME" button |
| Restart | Click "PLAY AGAIN" button |

## 🏆 Scoring

- **Enemy Destroyed**: +10 points
- **Power-Up Activation**: At 100+ points

## 🛠️ Technologies Used

- **HTML5**: Canvas API for rendering
- **JavaScript (ES6+)**: Game logic and mechanics
- **CSS3**: Styling and animations
- **Web Audio API**: Sound generation
- **Node.js**: Local development server

## 🎨 Customization

You can customize the game by modifying:

- **Game Speed**: Adjust `speed` values in `game.js`
- **Enemy Count**: Modify `rows` and `cols` in `initEnemies()`
- **Sound Volume**: Change `masterVolume` in `SoundManager` class
- **Colors**: Update color values in CSS and game.js
- **Power-Up Threshold**: Change the score threshold (currently 100)

## 📝 License

This project is open source and available for educational purposes.

## 🎯 Future Enhancements

Potential features to add:
- Multiple levels with increasing difficulty
- Different enemy types
- Boss battles
- High score persistence
- Mobile touch controls
- Additional power-up types

## 👨‍💻 Development

Built with vanilla JavaScript - no frameworks or dependencies required!

---

**Enjoy the game!** 🎮👾

