import * as THREE from 'three';
import type { Scene } from '../core/SceneManager';
import { SceneManager } from '../core/SceneManager';

export class HomeScene implements Scene {
  private sceneManager: SceneManager;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private aircraft: THREE.Group;

  constructor() {
    this.sceneManager = SceneManager.getInstance();
    this.scene = new THREE.Scene();
    this.camera = this.sceneManager.getCamera();
    this.renderer = this.sceneManager.getRenderer();
    this.aircraft = new THREE.Group();
  }

  async init(): Promise<void> {
    // Set up scene
    this.scene.background = new THREE.Color(0x222222);
    
    // Set up lighting
    this.setupLighting();
    
    // Create preview aircraft
    this.createPreviewAircraft();
    
    // Set up camera
    this.camera.position.set(30, 10, 30);
    this.camera.lookAt(0, 0, 0);
    
    // Create UI
    this.createUI();
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Point lights for dramatic effect
    const light1 = new THREE.PointLight(0xffffff, 1, 100);
    light1.position.set(20, 20, 20);
    this.scene.add(light1);

    const light2 = new THREE.PointLight(0x4080ff, 0.5, 100);
    light2.position.set(-20, 10, -20);
    this.scene.add(light2);
  }

  private createPreviewAircraft(): void {
    // Create the same aircraft as in Player class
    const fuselageGeometry = new THREE.CylinderGeometry(1, 2, 12, 8);
    const fuselageMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;

    const wingGeometry = new THREE.BoxGeometry(16, 0.5, 4);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.z = -2;

    const tailGeometry = new THREE.BoxGeometry(2, 4, 0.5);
    const tailMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.x = -5;

    const propGeometry = new THREE.BoxGeometry(0.2, 6, 0.2);
    const propMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const propeller = new THREE.Mesh(propGeometry, propMaterial);
    propeller.position.x = 6;

    this.aircraft.add(fuselage);
    this.aircraft.add(wings);
    this.aircraft.add(tail);
    this.aircraft.add(propeller);

    this.scene.add(this.aircraft);
  }

  private createUI(): void {
    // Create overlay UI container
    const uiContainer = document.createElement('div');
    uiContainer.id = 'home-ui';
    uiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: 'Arial', sans-serif;
      color: white;
    `;

    // Title
    const title = document.createElement('h1');
    title.textContent = 'Sky Warriors';
    title.style.cssText = `
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 48px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      margin: 0;
      pointer-events: none;
    `;

    // Start button
    const startButton = document.createElement('button');
    startButton.textContent = 'START MISSION';
    startButton.style.cssText = `
      position: absolute;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      padding: 15px 30px;
      font-size: 24px;
      font-weight: bold;
      background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
      border: none;
      border-radius: 10px;
      color: white;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
    `;

    startButton.addEventListener('mouseenter', () => {
      startButton.style.transform = 'translateX(-50%) scale(1.05)';
      startButton.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
    });

    startButton.addEventListener('mouseleave', () => {
      startButton.style.transform = 'translateX(-50%) scale(1)';
      startButton.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
    });

    startButton.addEventListener('click', () => {
      this.startGame();
    });

    // Instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = `
      <div style="position: absolute; bottom: 200px; left: 50%; transform: translateX(-50%); text-align: center;">
        <p style="margin: 5px 0; font-size: 16px; opacity: 0.8;">
          🖱️ Mouse: Pitch & Yaw | 🎯 Left Click: Shoot | 📏 Scroll: Speed
        </p>
        <p style="margin: 5px 0; font-size: 16px; opacity: 0.8;">
          📱 Touch: Drag to steer | 👆 Tap to shoot | 👐 Pinch for speed
        </p>
      </div>
    `;

    uiContainer.appendChild(title);
    uiContainer.appendChild(startButton);
    uiContainer.appendChild(instructions);
    document.body.appendChild(uiContainer);
  }

  private startGame(): void {
    // Remove UI
    const uiElement = document.getElementById('home-ui');
    if (uiElement) {
      uiElement.remove();
    }
    
    // Switch to play scene
    this.sceneManager.switchScene('PLAY');
  }

  update(deltaTime: number): void {
    // Rotate the aircraft for visual appeal
    this.aircraft.rotation.y += deltaTime * 0.5;
    
    // Gentle bobbing motion
    this.aircraft.position.y = Math.sin(Date.now() * 0.001) * 2;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    // Remove UI if it exists
    const uiElement = document.getElementById('home-ui');
    if (uiElement) {
      uiElement.remove();
    }

    // Clean up aircraft
    this.aircraft.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });

    // Clear scene
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }
}
