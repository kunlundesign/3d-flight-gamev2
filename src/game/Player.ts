import * as THREE from 'three';
import type { InputState } from '../core/InputHandler';
import gameConfig from '../GameConfig.json';

export class Player {
  private scene: THREE.Scene;
  private aircraft: THREE.Group;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private rotation: THREE.Euler;
  private health: number;
  private speed: number;
  private planetRadius: number;
  private leftGunOffset: THREE.Vector3 = new THREE.Vector3(6, -0.5, -7);
  private rightGunOffset: THREE.Vector3 = new THREE.Vector3(6, -0.5, 7);
  private bombBayOffset: THREE.Vector3 = new THREE.Vector3(0, -2, 0);

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.aircraft = new THREE.Group();
    this.position = new THREE.Vector3(0, gameConfig.planet.radius + 100, 0);
    this.velocity = new THREE.Vector3();
    this.rotation = new THREE.Euler();
    this.health = gameConfig.player.hp;
    this.speed = 0;
    this.planetRadius = gameConfig.planet.radius;

    this.createDefaultAircraft();
    this.scene.add(this.aircraft);
  }

  private createDefaultAircraft(): void {
    // Create a simple aircraft using basic geometries
    const fuselageGeometry = new THREE.CylinderGeometry(1, 2, 12, 8);
    const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
    const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;

    // Wings
    const wingGeometry = new THREE.BoxGeometry(16, 0.5, 4);
    const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    wings.position.z = -2;
    wings.castShadow = true;

    // 机翼机枪可视化
    const gunGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const gunMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
    
    const leftGun = new THREE.Mesh(gunGeometry, gunMaterial);
    leftGun.rotation.z = Math.PI / 2;
    leftGun.position.set(6, -0.5, -7);
    leftGun.castShadow = true;
    
    const rightGun = new THREE.Mesh(gunGeometry, gunMaterial);
    rightGun.rotation.z = Math.PI / 2;
    rightGun.position.set(6, -0.5, 7);
    rightGun.castShadow = true;

    // Tail
    const tailGeometry = new THREE.BoxGeometry(2, 4, 0.5);
    const tailMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.x = -5;
    tail.castShadow = true;

    // Propeller
    const propGeometry = new THREE.BoxGeometry(0.2, 6, 0.2);
    const propMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const propeller = new THREE.Mesh(propGeometry, propMaterial);
    propeller.position.x = 6;
    propeller.castShadow = true;

    this.aircraft.add(fuselage);
    this.aircraft.add(wings);
    this.aircraft.add(tail);
    this.aircraft.add(propeller);
    this.aircraft.add(leftGun);
    this.aircraft.add(rightGun);

    // Set initial position
    this.aircraft.position.copy(this.position);
  }

  public update(deltaTime: number, inputState: InputState): void {
    // Update speed based on input
    const targetSpeed = inputState.speed * gameConfig.player.maxSpeed;
    this.speed = THREE.MathUtils.lerp(this.speed, targetSpeed, deltaTime * 2);

    // Apply rotation from input
    this.rotation.x = inputState.pitch;
    this.rotation.y = inputState.yaw;

    // Calculate forward direction in local space
    const forward = new THREE.Vector3(1, 0, 0);
    forward.applyEuler(this.rotation);

    // Apply movement
    this.velocity.copy(forward).multiplyScalar(this.speed * deltaTime);
    this.position.add(this.velocity);

    // Apply gravity toward planet center
    const gravityDirection = this.position.clone().normalize().multiplyScalar(-1);
    const distanceFromSurface = this.position.length() - this.planetRadius;
    
    // Gravity strength increases as you get closer to the surface
    const gravityStrength = Math.max(0, 1 - distanceFromSurface / 1000) * 50;
    const gravity = gravityDirection.multiplyScalar(gravityStrength * deltaTime);
    this.velocity.add(gravity);

    // Prevent going underground
    const minDistance = this.planetRadius + 5;
    if (this.position.length() < minDistance) {
      this.position.normalize().multiplyScalar(minDistance);
      this.velocity.set(0, 0, 0);
    }

    // Update aircraft transform
    this.aircraft.position.copy(this.position);
    
    // Orient aircraft to face movement direction while staying tangent to planet surface
    const lookDirection = this.velocity.clone().normalize();
    
    if (lookDirection.length() > 0) {
      // Create a rotation that looks in the movement direction while maintaining up vector
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), lookDirection);
      
      // Apply input-based rotation on top
      const inputQuaternion = new THREE.Quaternion();
      inputQuaternion.setFromEuler(this.rotation);
      quaternion.multiply(inputQuaternion);
      
      this.aircraft.setRotationFromQuaternion(quaternion);
    }

    // Apply drag
    this.velocity.multiplyScalar(1 - gameConfig.player.drag * deltaTime);
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getForwardDirection(): THREE.Vector3 {
    const forward = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(this.aircraft.quaternion);
    return forward;
  }

  public getGunPositions(): THREE.Vector3[] {
    // 获取两翼机枪世界坐标
    const left = this.leftGunOffset.clone().applyQuaternion(this.aircraft.quaternion).add(this.aircraft.position);
    const right = this.rightGunOffset.clone().applyQuaternion(this.aircraft.quaternion).add(this.aircraft.position);
    return [left, right];
  }

  public getBombPosition(): THREE.Vector3 {
    // 获取炸弹投放点世界坐标
    return this.bombBayOffset.clone().applyQuaternion(this.aircraft.quaternion).add(this.aircraft.position);
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      // Handle death
    }
  }

  public getHealth(): number {
    return this.health;
  }

  public getSpeed(): number {
    return this.speed;
  }

  public getAltitude(): number {
    return this.position.length() - this.planetRadius;
  }

  public reset(): void {
    this.position.set(0, this.planetRadius + 100, 0);
    this.velocity.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.health = gameConfig.player.hp;
    this.speed = 0;
    this.aircraft.position.copy(this.position);
    this.aircraft.rotation.set(0, 0, 0);
  }

  public dispose(): void {
    this.scene.remove(this.aircraft);
    
    // Dispose of geometries and materials
    this.aircraft.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
}
