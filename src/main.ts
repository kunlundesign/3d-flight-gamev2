import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { HomeScene } from './game/HomeScene';
import { PlayScene } from './game/PlayScene';

class Game {
  private sceneManager: SceneManager;
  private clock: THREE.Clock;
  private isRunning: boolean = false;

  constructor() {
    this.sceneManager = SceneManager.getInstance();
    this.clock = new THREE.Clock();
    
    this.init();
  }

  private async init(): Promise<void> {
    // Register scenes
    this.sceneManager.registerScene('HOME', new HomeScene());
    this.sceneManager.registerScene('PLAY', new PlayScene());
    
    // Start with home scene
    await this.sceneManager.switchScene('HOME');
    
    // Start game loop
    this.start();
  }

  private start(): void {
    this.isRunning = true;
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();
    
    // Update current scene
    this.sceneManager.update(deltaTime);
    
    // Render current scene
    this.sceneManager.render();
    
    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  public stop(): void {
    this.isRunning = false;
  }
}

// Initialize game when page loads
window.addEventListener('load', () => {
  new Game();
});

// Add some basic styles
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background: #000;
    font-family: Arial, sans-serif;
  }
  
  canvas {
    display: block;
  }
  
  * {
    box-sizing: border-box;
  }
`;
document.head.appendChild(style);
