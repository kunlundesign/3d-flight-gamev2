import * as THREE from 'three';

export type SceneType = 'HOME' | 'PLAY';

export interface Scene {
  init(): Promise<void>;
  update(deltaTime: number): void;
  render(): void;
  dispose(): void;
}

export class SceneManager {
  private static instance: SceneManager;
  private currentScene: Scene | null = null;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scenes: Map<SceneType, Scene> = new Map();

  private constructor() {
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87CEEB, 1); // Sky blue
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    // Add canvas to DOM
    document.body.appendChild(this.renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public registerScene(type: SceneType, scene: Scene): void {
    this.scenes.set(type, scene);
  }

  public async switchScene(type: SceneType): Promise<void> {
    if (this.currentScene) {
      this.currentScene.dispose();
    }

    const scene = this.scenes.get(type);
    if (scene) {
      this.currentScene = scene;
      await scene.init();
    } else {
      console.error(`Scene ${type} not found`);
    }
  }

  public update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  public render(): void {
    if (this.currentScene) {
      this.currentScene.render();
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
