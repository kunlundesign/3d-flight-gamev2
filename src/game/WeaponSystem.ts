import * as THREE from 'three';
import gameConfig from '../GameConfig.json';

export interface Target {
  getPosition(): THREE.Vector3;
  getBoundingBox(): THREE.Box3;
  takeDamage(amount: number): boolean;
  isAlive(): boolean;
}

export class WeaponSystem {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private lastShotTime: number = 0;
  private fireRate: number;
  private damage: number;
  private bulletSpeed: number;
  private raycaster: THREE.Raycaster;
  private crosshair!: HTMLElement;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
    this.fireRate = gameConfig.weapons.rate;
    this.damage = gameConfig.weapons.damage;
    this.bulletSpeed = gameConfig.weapons.bulletSpeed;
    this.raycaster = new THREE.Raycaster();
    
    this.createCrosshair();
  }

  private createCrosshair(): void {
    this.crosshair = document.createElement('div');
    this.crosshair.id = 'crosshair';
    this.crosshair.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid #ff0000;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.8;
    `;
    document.body.appendChild(this.crosshair);
  }

  public shoot(targets: Target[]): { hit: boolean; target?: Target } {
    const currentTime = Date.now();
    const timeSinceLastShot = currentTime - this.lastShotTime;
    const shotInterval = 1000 / this.fireRate; // Convert rate to milliseconds

    if (timeSinceLastShot < shotInterval) {
      return { hit: false }; // Rate limiting
    }

    this.lastShotTime = currentTime;

    // Create muzzle flash effect
    this.createMuzzleFlash();

    // Perform raycast from camera center
    this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    
    // Check for hits on targets
    let closestTarget: Target | null = null;
    let closestDistance = Infinity;

    for (const target of targets) {
      if (!target.isAlive()) continue;

      const targetPosition = target.getPosition();
      const boundingBox = target.getBoundingBox();

      // Simple distance check first (optimization)
      const distance = this.camera.position.distanceTo(targetPosition);
      if (distance > 2000) continue; // Max range

      // Check if ray intersects with target's bounding box
      const ray = this.raycaster.ray;
      const intersection = ray.intersectBox(boundingBox, new THREE.Vector3());
      
      if (intersection && distance < closestDistance) {
        closestTarget = target;
        closestDistance = distance;
      }
    }

    if (closestTarget) {
      // Apply damage
      closestTarget.takeDamage(this.damage);
      
      // Create hit effect
      this.createHitEffect(closestTarget.getPosition());
      
      return { hit: true, target: closestTarget };
    }

    // Create bullet trail effect even if we missed
    this.createBulletTrail();

    return { hit: false };
  }

  private createMuzzleFlash(): void {
    // Create a bright flash at the camera position
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 50%, rgba(255, 255, 0, 0.3) 0%, transparent 30%);
      pointer-events: none;
      z-index: 999;
    `;
    
    document.body.appendChild(flash);
    
    // Remove flash after short duration
    setTimeout(() => {
      document.body.removeChild(flash);
    }, 50);
  }

  private createHitEffect(position: THREE.Vector3): void {
    // Create explosion particles
    const particleCount = 20;
    const particles = new THREE.Group();

    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.2, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5)
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.copy(position);
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5
      ));
      
      particles.add(particle);
    }

    this.scene.add(particles);

    // Animate particles
    const startTime = Date.now();
    const animateParticles = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 1000; // 1 second animation

      if (progress < 1) {
        particles.children.forEach((particle, index) => {
          particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2
          ));
          
          if (particle instanceof THREE.Mesh && particle.material instanceof THREE.MeshBasicMaterial) {
            particle.material.opacity = 1 - progress;
          }
        });
        
        requestAnimationFrame(animateParticles);
      } else {
        // Clean up
        this.scene.remove(particles);
        particles.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          }
        });
      }
    };

    animateParticles();
  }

  private createBulletTrail(): void {
    // Create a visual bullet trail
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, opacity: 0.8, transparent: true });
    
    const startPoint = this.camera.position.clone();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.camera.quaternion);
    const endPoint = startPoint.clone().add(direction.multiplyScalar(1000));
    
    trailGeometry.setFromPoints([startPoint, endPoint]);
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    
    this.scene.add(trail);
    
    // Remove trail after short duration
    setTimeout(() => {
      this.scene.remove(trail);
      trailGeometry.dispose();
      trailMaterial.dispose();
    }, 100);
  }

  public updateCrosshair(visible: boolean): void {
    this.crosshair.style.display = visible ? 'block' : 'none';
  }

  public dispose(): void {
    if (this.crosshair && this.crosshair.parentNode) {
      this.crosshair.parentNode.removeChild(this.crosshair);
    }
  }
}
