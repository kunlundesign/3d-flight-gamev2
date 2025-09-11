import * as THREE from 'three';
import { SceneManager } from './core/SceneManager';
import { HomeScene } from './game/HomeScene';
import { PlayScene } from './game/PlayScene';

class Game {
  private sceneManager: SceneManager;
  private clock: THREE.Clock;
  private isRunning: boolean = false;

  constructor() {
    console.log('🎮 Game constructor called');
    this.sceneManager = SceneManager.getInstance();
    this.clock = new THREE.Clock();
    
    this.init();
  }

  private async init(): Promise<void> {
    try {
      console.log('🚀 Initializing game...');
      
      // 只注册并启动 PLAY 场景
      console.log('📦 Registering PlayScene...');
      this.sceneManager.registerScene('PLAY', new PlayScene());
      
      console.log('🎯 Switching to PlayScene...');
      await this.sceneManager.switchScene('PLAY');
      
      console.log('✅ Game initialized successfully!');
      console.log('🎮 Controls: Left Click = Shoot | Spacebar = Bomb | WASD = Fly');
      
      this.start();
    } catch (error) {
      console.error('❌ Game initialization failed:', error);
      this.showError(error as Error);
    }
  }

  private showError(error: Error): void {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255,0,0,0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: Arial;
      text-align: center;
      z-index: 9999;
      border: 2px solid white;
    `;
    errorDiv.innerHTML = `
      <h2>❌ Game Error</h2>
      <p>${error.message}</p>
      <p style="font-size: 12px;">Check console for details</p>
    `;
    document.body.appendChild(errorDiv);
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
