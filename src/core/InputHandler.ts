import * as THREE from 'three';

export interface InputState {
  pitch: number;
  yaw: number;
  speed: number;
  shoot: boolean;
  mouseX: number;
  mouseY: number;
}

export class InputHandler {
  private static instance: InputHandler;
  private inputState: InputState = {
    pitch: 0,
    yaw: 0,
    speed: 0.5,
    shoot: false,
    mouseX: 0,
    mouseY: 0
  };

  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();
  private canvas: HTMLCanvasElement;
  private isPointerLocked = false;
  private isTouchDevice = false;
  private touches: Touch[] = [];

  private constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.isTouchDevice = 'ontouchstart' in window;
    
    this.setupEventListeners();
  }

  public static getInstance(canvas: HTMLCanvasElement): InputHandler {
    if (!InputHandler.instance) {
      InputHandler.instance = new InputHandler(canvas);
    }
    return InputHandler.instance;
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener('click', this.requestPointerLock.bind(this));
    document.addEventListener('pointerlockchange', this.onPointerLockChange.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    document.addEventListener('wheel', this.onWheel.bind(this));

    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));

    // Touch events (mobile)
    if (this.isTouchDevice) {
      this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
      this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
    }
  }

  private requestPointerLock(): void {
    if (!this.isTouchDevice && !this.isPointerLocked) {
      this.canvas.requestPointerLock();
    }
  }

  private onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.canvas;
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isPointerLocked) {
      const sensitivity = 0.002;
      this.inputState.yaw -= event.movementX * sensitivity;
      this.inputState.pitch -= event.movementY * sensitivity;
      
      // Clamp pitch
      this.inputState.pitch = THREE.MathUtils.clamp(this.inputState.pitch, -Math.PI / 2, Math.PI / 2);
    } else {
      // Store mouse position for UI interactions
      this.inputState.mouseX = event.clientX;
      this.inputState.mouseY = event.clientY;
    }
  }

  private onMouseDown(event: MouseEvent): void {
    this.mouseButtons.add(event.button);
    if (event.button === 0) { // Left click
      this.inputState.shoot = true;
    }
  }

  private onMouseUp(event: MouseEvent): void {
    this.mouseButtons.delete(event.button);
    if (event.button === 0) { // Left click
      this.inputState.shoot = false;
    }
  }

  private onWheel(event: WheelEvent): void {
    if (this.isPointerLocked) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      this.inputState.speed = THREE.MathUtils.clamp(this.inputState.speed + delta, 0, 1);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys.add(event.code);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.code);
  }

  // Touch events for mobile
  private onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    this.touches = Array.from(event.touches);
    
    // Single tap to shoot
    if (this.touches.length === 1) {
      this.inputState.shoot = true;
    }
  }

  private onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const newTouches = Array.from(event.touches);
    
    if (newTouches.length === 1 && this.touches.length === 1) {
      // Single finger drag for pitch/yaw
      const sensitivity = 0.005;
      const deltaX = newTouches[0].clientX - this.touches[0].clientX;
      const deltaY = newTouches[0].clientY - this.touches[0].clientY;
      
      this.inputState.yaw -= deltaX * sensitivity;
      this.inputState.pitch -= deltaY * sensitivity;
      this.inputState.pitch = THREE.MathUtils.clamp(this.inputState.pitch, -Math.PI / 2, Math.PI / 2);
    } else if (newTouches.length === 2 && this.touches.length === 2) {
      // Two finger drag for speed
      const oldDistance = Math.hypot(
        this.touches[1].clientX - this.touches[0].clientX,
        this.touches[1].clientY - this.touches[0].clientY
      );
      const newDistance = Math.hypot(
        newTouches[1].clientX - newTouches[0].clientX,
        newTouches[1].clientY - newTouches[0].clientY
      );
      
      const delta = (newDistance - oldDistance) * 0.001;
      this.inputState.speed = THREE.MathUtils.clamp(this.inputState.speed + delta, 0, 1);
    }
    
    this.touches = newTouches;
  }

  private onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.touches = Array.from(event.touches);
    
    if (this.touches.length === 0) {
      this.inputState.shoot = false;
    }
  }

  public getInputState(): InputState {
    return { ...this.inputState };
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key);
  }

  public isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  public isPointerLockActive(): boolean {
    return this.isPointerLocked;
  }

  public update(): void {
    // Reset frame-based inputs
    // (currently none, but could be used for single-frame inputs)
  }
}
