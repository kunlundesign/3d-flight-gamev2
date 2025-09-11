import * as THREE from 'three';
import gameConfig from '../GameConfig.json';
import type { Target } from './WeaponSystem';

export class Tank implements Target {
  private scene: THREE.Scene;
  private tankGroup: THREE.Group;
  private position: THREE.Vector3;
  private health: number;
  private maxHealth: number;
  private isDestroyed: boolean = false;
  private patrolTarget: THREE.Vector3;
  private speed: number = 10;

  constructor(scene: THREE.Scene, position: THREE.Vector3) {
    this.scene = scene;
    this.position = position.clone();
    this.maxHealth = gameConfig.tanks.hp;
    this.health = this.maxHealth;
    this.tankGroup = new THREE.Group();
    this.patrolTarget = this.generatePatrolTarget();
    
    this.createTank();
    this.scene.add(this.tankGroup);
  }

  private createTank(): void {
    // Tank body (hull)
    const hullGeometry = new THREE.BoxGeometry(8, 3, 5);
    const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x2d4a2d });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 1.5;
    hull.castShadow = true;

    // Tank turret
    const turretGeometry = new THREE.BoxGeometry(4, 2, 4);
    const turretMaterial = new THREE.MeshLambertMaterial({ color: 0x1f331f });
    const turret = new THREE.Mesh(turretGeometry, turretMaterial);
    turret.position.y = 3.5;
    turret.castShadow = true;

    // Tank barrel
    const barrelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 6, 8);
    const barrelMaterial = new THREE.MeshLambertMaterial({ color: 0x0f1f0f });
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(3, 3.5, 0);
    barrel.castShadow = true;

    // Tank tracks (simplified as boxes)
    const trackGeometry = new THREE.BoxGeometry(9, 1, 2);
    const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
    
    const leftTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    leftTrack.position.set(0, 0.5, -2);
    leftTrack.castShadow = true;
    
    const rightTrack = new THREE.Mesh(trackGeometry, trackMaterial);
    rightTrack.position.set(0, 0.5, 2);
    rightTrack.castShadow = true;

    this.tankGroup.add(hull);
    this.tankGroup.add(turret);
    this.tankGroup.add(barrel);
    this.tankGroup.add(leftTrack);
    this.tankGroup.add(rightTrack);

    // Position the tank
    this.tankGroup.position.copy(this.position);
  }

  private generatePatrolTarget(): THREE.Vector3 {
    // Generate a random point near the current position for patrolling
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const offset = new THREE.Vector3(
      Math.cos(angle) * distance,
      0,
      Math.sin(angle) * distance
    );
    
    return this.position.clone().add(offset);
  }

  public update(deltaTime: number, playerPosition?: THREE.Vector3): void {
    if (this.isDestroyed) return;

    // Simple AI: move toward patrol target
    const direction = this.patrolTarget.clone().sub(this.position).normalize();
    const movement = direction.multiplyScalar(this.speed * deltaTime);
    
    this.position.add(movement);
    this.tankGroup.position.copy(this.position);

    // Check if reached patrol target
    if (this.position.distanceTo(this.patrolTarget) < 10) {
      this.patrolTarget = this.generatePatrolTarget();
    }

    // Rotate to face movement direction
    if (movement.length() > 0) {
      const angle = Math.atan2(direction.x, direction.z);
      this.tankGroup.rotation.y = angle;
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.isDestroyed) return false;

    this.health -= amount;
    
    if (this.health <= 0) {
      this.destroy();
      return true; // Tank destroyed
    }
    
    return false; // Tank still alive
  }

  private destroy(): void {
    this.isDestroyed = true;
    
    // Create explosion effect (simple scale animation)
    const originalScale = this.tankGroup.scale.clone();
    const destroyAnimation = () => {
      this.tankGroup.scale.multiplyScalar(1.1);
      if (this.tankGroup.scale.x < 2) {
        requestAnimationFrame(destroyAnimation);
      } else {
        // Remove from scene after animation
        this.dispose();
      }
    };
    
    // Change color to indicate destruction
    this.tankGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
        child.material.color.setHex(0x8B0000); // Dark red
      }
    });
    
    destroyAnimation();
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(this.tankGroup);
    return box;
  }

  public isAlive(): boolean {
    return !this.isDestroyed;
  }

  public dispose(): void {
    this.scene.remove(this.tankGroup);
    
    // Dispose geometries and materials
    this.tankGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
}
