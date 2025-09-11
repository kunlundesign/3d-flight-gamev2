import * as THREE from 'three';
import type { Scene } from '../core/SceneManager';
import { SceneManager } from '../core/SceneManager';
import { InputHandler } from '../core/InputHandler';
import { PlanetTerrain } from '../core/PlanetTerrain';
import { Player } from '../game/Player';
import { Tank } from '../game/Tank';
import { WeaponSystem, type Target } from '../game/WeaponSystem';

export class PlayScene implements Scene {
  private sceneManager: SceneManager;
  private scene: THREE.Scene;
  private inputHandler: InputHandler;
  private planetTerrain: PlanetTerrain;
  private player: Player;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private directionalLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private tanks: Tank[] = [];
  private weaponSystem!: WeaponSystem;
  private score: number = 0;
  private kills: number = 0;

  constructor() {
    this.sceneManager = SceneManager.getInstance();
    this.scene = new THREE.Scene();
    this.camera = this.sceneManager.getCamera();
    this.renderer = this.sceneManager.getRenderer();
    this.inputHandler = InputHandler.getInstance(this.renderer.domElement);
    this.planetTerrain = new PlanetTerrain(this.scene);
    this.player = new Player(this.scene);
  }

  async init(): Promise<void> {
    console.log('🎯 PlayScene init started...');
    
    // Set up lighting
    console.log('💡 Setting up lighting...');
    this.setupLighting();
    
    // Set up camera
    console.log('📷 Setting up camera...');
    this.setupCamera();
    
    // Set scene background
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 1000, 8000);

    // Initialize weapon system
    console.log('🔫 Initializing weapon system...');
    this.weaponSystem = new WeaponSystem(this.scene, this.camera);

    // Spawn initial tanks
    console.log('🚗 Spawning tanks...');
    this.spawnTanks(10);

    // Create HUD
    console.log('📊 Creating HUD...');
    this.createHUD();
    
    console.log('✅ PlayScene initialized successfully!');
    console.log('🎮 Weapons ready: Left Click = Shoot | Spacebar = Bomb');
  }

  private setupLighting(): void {
    // Ambient light for general illumination
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(this.ambientLight);

    // Directional light (sun)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1000, 1000, 1000);
    this.directionalLight.castShadow = true;
    
    // Configure shadow map
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 5000;
    this.directionalLight.shadow.camera.left = -2000;
    this.directionalLight.shadow.camera.right = 2000;
    this.directionalLight.shadow.camera.top = 2000;
    this.directionalLight.shadow.camera.bottom = -2000;
    
    this.scene.add(this.directionalLight);
  }

  private setupCamera(): void {
    // Position camera behind and above the player
    const playerPos = this.player.getPosition();
    this.camera.position.copy(playerPos);
    this.camera.position.add(new THREE.Vector3(-50, 20, 0));
    this.camera.lookAt(playerPos);
  }

  private spawnTanks(count: number): void {
    for (let i = 0; i < count; i++) {
      const position = this.planetTerrain.getRandomSurfacePosition();
      
      // Make sure tank is not too close to player
      const playerPos = this.player.getPosition();
      if (position.distanceTo(playerPos) < 200) {
        continue; // Skip this spawn
      }

      const tank = new Tank(this.scene, position);
      this.tanks.push(tank);
    }
  }

  private createHUD(): void {
    const hudContainer = document.createElement('div');
    hudContainer.id = 'game-hud';
    hudContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: 'Arial', sans-serif;
      color: white;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;

    // Score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'score-display';
    scoreDisplay.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      font-size: 24px;
    `;
    scoreDisplay.textContent = 'Score: 0';

    // Kills display
    const killsDisplay = document.createElement('div');
    killsDisplay.id = 'kills-display';
    killsDisplay.style.cssText = `
      position: absolute;
      top: 60px;
      left: 20px;
      font-size: 20px;
    `;
    killsDisplay.textContent = 'Kills: 0/15';

    // Health display
    const healthDisplay = document.createElement('div');
    healthDisplay.id = 'health-display';
    healthDisplay.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 24px;
    `;
    healthDisplay.textContent = 'Health: 100';

    // Speed display
    const speedDisplay = document.createElement('div');
    speedDisplay.id = 'speed-display';
    speedDisplay.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 20px;
      font-size: 18px;
    `;
    speedDisplay.textContent = 'Speed: 0 km/h';

    // Altitude display
    const altitudeDisplay = document.createElement('div');
    altitudeDisplay.id = 'altitude-display';
    altitudeDisplay.style.cssText = `
      position: absolute;
      bottom: 50px;
      left: 20px;
      font-size: 18px;
    `;
    altitudeDisplay.textContent = 'Altitude: 0 m';

    // Controls display
    const controlsDisplay = document.createElement('div');
    controlsDisplay.id = 'controls-display';
    controlsDisplay.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 14px;
      background: rgba(0,0,0,0.5);
      padding: 10px;
      border-radius: 5px;
      max-width: 300px;
    `;
    controlsDisplay.innerHTML = `
      <strong>飞行控制:</strong><br>
      WASD/方向键: 俯仰偏航<br>
      鼠标移动: 视角控制<br>
      Shift/Ctrl: 油门控制<br>
      <strong>武器:</strong><br>
      左键: 机翼机枪射击<br>
      空格: 投掷炸弹<br>
      点击屏幕锁定鼠标
    `;

    hudContainer.appendChild(scoreDisplay);
    hudContainer.appendChild(killsDisplay);
    hudContainer.appendChild(healthDisplay);
    hudContainer.appendChild(speedDisplay);
    hudContainer.appendChild(altitudeDisplay);
    hudContainer.appendChild(controlsDisplay);

    document.body.appendChild(hudContainer);
  }

  private updateHUD(): void {
    const scoreElement = document.getElementById('score-display');
    const killsElement = document.getElementById('kills-display');
    const healthElement = document.getElementById('health-display');
    const speedElement = document.getElementById('speed-display');
    const altitudeElement = document.getElementById('altitude-display');

    if (scoreElement) scoreElement.textContent = `Score: ${this.score}`;
    if (killsElement) killsElement.textContent = `Kills: ${this.kills}/15`;
    if (healthElement) healthElement.textContent = `Health: ${Math.round(this.player.getHealth())}`;
    if (speedElement) speedElement.textContent = `Speed: ${Math.round(this.player.getSpeed())} km/h`;
    if (altitudeElement) altitudeElement.textContent = `Altitude: ${Math.round(this.player.getAltitude())} m`;
  }

  update(deltaTime: number): void {
    // Update input
    this.inputHandler.update();
    
    // Get input state
    const inputState = this.inputHandler.getInputState();
    
    // Update player
    this.player.update(deltaTime, inputState);
    
    // Handle shooting
    if (inputState.shoot) {
      console.log('🎯 Shoot input detected');
      const targets: Target[] = this.tanks.filter(tank => tank.isAlive());
      // 获取飞机两翼机枪发射点和方向
      const gunPositions = this.player.getGunPositions();
      const forward = this.player.getForwardDirection();
      let hitAny = false;
      for (const gunPos of gunPositions) {
        const shootResult = this.weaponSystem.shoot(targets, gunPos, forward);
        if (shootResult.hit && shootResult.target) {
          hitAny = true;
        }
      }
      if (hitAny) {
        console.log('🎯 Hit target!');
        // Add score
        this.score += 100;
        this.kills++;
        // Remove destroyed tanks
        this.tanks = this.tanks.filter(tank => tank.isAlive());
        // Spawn new tank if needed
        if (this.tanks.length < 5) {
          this.spawnTanks(1);
        }
      }
    }

    // Handle bombing
    if (inputState.bomb) {
      console.log('💣 Bomb input detected');
      const bombPosition = this.player.getBombPosition();
      const playerVelocity = this.player.getForwardDirection().multiplyScalar(this.player.getSpeed());
      playerVelocity.y = -5; // 向下初始速度
      
      if (this.weaponSystem.dropBomb(bombPosition, playerVelocity)) {
        console.log('💣 Bomb dropped successfully!');
      }
    }

    // Update bombs
    const targets: Target[] = this.tanks.filter(tank => tank.isAlive());
    this.weaponSystem.updateBombs(deltaTime, targets);
    
    // Remove destroyed tanks after bomb explosions
    const aliveCountBefore = this.tanks.filter(tank => tank.isAlive()).length;
    this.tanks = this.tanks.filter(tank => tank.isAlive());
    const aliveCountAfter = this.tanks.length;
    
    if (aliveCountBefore > aliveCountAfter) {
      this.score += (aliveCountBefore - aliveCountAfter) * 150; // 炸弹击毁得分更高
      this.kills += (aliveCountBefore - aliveCountAfter);
      
      // Spawn new tanks if needed
      if (this.tanks.length < 5) {
        this.spawnTanks(Math.min(3, 10 - this.tanks.length));
      }
    }
    
    // Update tanks
    const playerPos = this.player.getPosition();
    this.tanks.forEach(tank => {
      tank.update(deltaTime, playerPos);
    });
    
    // Update camera to follow player
    this.updateCamera();
    
    // Update HUD
    this.updateHUD();
    
    // Update crosshair visibility
    this.weaponSystem.updateCrosshair(this.inputHandler.isPointerLockActive());
  }

  private updateCamera(): void {
    const playerPos = this.player.getPosition();
    const playerForward = this.player.getForwardDirection();
    
    // Third-person camera following the player
    const cameraOffset = playerForward.clone().multiplyScalar(-100);
    cameraOffset.add(new THREE.Vector3(0, 30, 0)); // Slight upward offset
    
    const targetCameraPos = playerPos.clone().add(cameraOffset);
    
    // Smooth camera movement
    this.camera.position.lerp(targetCameraPos, 0.1);
    this.camera.lookAt(playerPos);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    // Remove HUD
    const hudElement = document.getElementById('game-hud');
    if (hudElement) {
      hudElement.remove();
    }

    // Clean up tanks
    this.tanks.forEach(tank => tank.dispose());
    this.tanks = [];

    // Clean up weapon system
    this.weaponSystem.dispose();

    // Clean up resources
    this.planetTerrain.dispose();
    this.player.dispose();
    
    // Remove lights
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.directionalLight);
    
    // Clear scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }
}
