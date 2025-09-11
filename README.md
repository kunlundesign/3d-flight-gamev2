# Sky Warriors - 3D Flight Combat Game

A 3D flight combat game built with Three.js, TypeScript, and Vite, featuring spherical terrain, dynamic weather, and intense aerial combat.

## 🎮 Game Features

### Core Gameplay
- **Spherical Planet**: Fly around a fully 3D spherical world with procedural terrain
- **Flight Physics**: Realistic aircraft movement with gravity, drag, and momentum
- **Combat System**: Destroy ground-based tanks and anti-aircraft vehicles
- **Progressive Levels**: Three challenging levels with different weather conditions

### Controls
- **Desktop**:
  - Mouse: Pitch and Yaw control
  - Scroll Wheel: Speed adjustment
  - Left Click: Shoot weapons
  - Click canvas to enable pointer lock

- **Mobile/Touch**:
  - One finger drag: Pitch and Yaw
  - Two finger pinch/drag: Speed control
  - Tap: Shoot weapons

### Visual Features
- Dynamic lighting and shadows
- Procedural terrain with forests
- Weapon effects and explosions
- Real-time HUD with score, health, and flight data

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone and navigate to the project
cd Gaming3

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173/`

### Building for Production
```bash
npm run build
```

## 🎯 Gameplay Objectives

1. **Destroy Targets**: Eliminate 15 tanks per level to progress
2. **Survive**: Avoid enemy fire and terrain collisions
3. **Score Points**: 
   - Regular tank kill: +100 points
   - AA tank kill: +200 points
   - Combo bonuses available

## 🏗️ Technical Architecture

### Project Structure
```
src/
├── assets/          # Game assets (textures, models, audio)
├── core/           # Core game systems
│   ├── SceneManager.ts    # Scene management and transitions
│   ├── InputHandler.ts    # Mouse, keyboard, and touch input
│   └── PlanetTerrain.ts   # Spherical world generation
├── game/           # Game-specific classes
│   ├── Player.ts          # Player aircraft control
│   ├── Tank.ts           # Enemy tank AI and behavior
│   ├── WeaponSystem.ts   # Combat and shooting mechanics
│   ├── HomeScene.ts      # Main menu scene
│   └── PlayScene.ts      # Gameplay scene
├── systems/        # Game systems (future expansion)
├── utils/          # Utility functions
├── GameConfig.json # Game configuration and balancing
└── main.ts        # Application entry point
```

### Key Technologies
- **Three.js**: 3D graphics and rendering
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **WebGL**: Hardware-accelerated graphics

## 🎨 Game Configuration

Game balance and settings can be modified in `src/GameConfig.json`:
- Planet size and terrain settings
- Player aircraft performance
- Weapon damage and fire rate
- Enemy spawn rates and behavior
- Scoring system parameters

## 🔧 Development Features

### Hot Reload
The development server supports hot module replacement for instant updates during development.

### TypeScript
Full TypeScript support with strict type checking for robust development.

### Performance Optimized
- Instanced rendering for trees and particles
- LOD (Level of Detail) system for terrain
- Efficient collision detection
- Memory management for disposable objects

## 🎮 Future Enhancements

Planned features for future versions:
- Multiple aircraft models with different characteristics
- GLB model upload system for custom aircraft
- Weather system (rain, clouds, dynamic lighting)
- Anti-aircraft tanks with active targeting
- Multiplayer support
- Sound effects and music
- Achievement system

## 🐛 Troubleshooting

### Common Issues
1. **Black screen**: Check browser console for WebGL support
2. **Poor performance**: Try reducing browser zoom or closing other tabs
3. **Controls not working**: Ensure you've clicked on the canvas to enable pointer lock

### Browser Compatibility
- Chrome/Edge: Recommended
- Firefox: Supported
- Safari: Supported (with minor limitations)
- Mobile browsers: Touch controls available

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

---

**Have fun flying and destroying tanks! 🛩️💥**
