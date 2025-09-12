import * as THREE from 'three';
import gameConfig from '../GameConfig.json';
import { Bomb } from './Bomb';

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
  private lastBombTime: number = 0;
  private fireRate: number;
  private bombRate: number = 1; // 每秒1颗炸弹
  private damage: number;
  private bulletSpeed: number;
  private raycaster: THREE.Raycaster;
  private crosshair!: HTMLElement;
  private bombSight!: HTMLElement;
  private bombs: Bomb[] = [];
  private activeBullets: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];
  private shellCasings: { mesh: THREE.Mesh; velocity: THREE.Vector3; life: number }[] = [];
  private tracerParticles: { mesh: THREE.Mesh; life: number }[] = [];
  private noseFireRate: number = 16; // 机头机枪射速（每秒）提升
  private lastNoseShotTime: number = 0;
  private heatLevel: number = 0; // 枪口热量（0-1）
  private firstShotFired: boolean = false; // 是否已经产生首发强化弹道

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    console.log('🔫 WeaponSystem constructor called');
    this.scene = scene;
    this.camera = camera;
    this.fireRate = gameConfig.weapons.rate;
    this.damage = gameConfig.weapons.damage;
    this.bulletSpeed = gameConfig.weapons.bulletSpeed;
    this.raycaster = new THREE.Raycaster();
    
    console.log('🎯 Creating crosshair...');
    this.createCrosshair();
    console.log('💣 Creating bomb sight...');
    this.createBombSight();
    console.log('✅ WeaponSystem initialized');
  }

  private createCrosshair(): void {
    this.crosshair = document.createElement('div');
    this.crosshair.id = 'crosshair';
    this.crosshair.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      width: 30px;
      height: 30px;
      margin: -15px 0 0 -15px;
      border: 3px solid #ff0000;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.9;
      box-shadow: 0 0 10px rgba(255,0,0,0.5);
    `;
    document.body.appendChild(this.crosshair);
    console.log('🔴 Red crosshair created');
  }

  private createBombSight(): void {
    this.bombSight = document.createElement('div');
    this.bombSight.id = 'bombsight';
    this.bombSight.style.cssText = `
      position: fixed;
      top: 65%;
      left: 50%;
      width: 40px;
      height: 40px;
      margin: -20px 0 0 -20px;
      border: 3px solid #ffaa00;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.8;
      box-shadow: 0 0 15px rgba(255,170,0,0.6);
    `;
    document.body.appendChild(this.bombSight);
    console.log('🟠 Orange bomb sight created');
  }

  public shoot(targets: Target[], origin?: THREE.Vector3, direction?: THREE.Vector3): { hit: boolean; target?: Target } {
    const currentTime = Date.now();
    const timeSinceLastShot = currentTime - this.lastShotTime;
    const shotInterval = 1000 / this.fireRate; // Convert rate to milliseconds

    if (timeSinceLastShot < shotInterval) {
      return { hit: false }; // Rate limiting
    }

  this.lastShotTime = currentTime;
  console.log('🔫 Shooting!');
  this.heatLevel = Math.min(1, this.heatLevel + 0.08);

    // Create muzzle flash effect + particles/shells
    this.createMuzzleFlash();
    if (origin && direction) {
      this.spawnMuzzleParticles(origin, direction.clone().normalize());
      this.spawnShellCasing(origin, direction.clone().normalize());
    }

    // Perform raycast from custom origin/direction or camera center
    if (origin && direction) {
      this.raycaster.set(origin, direction);
    } else {
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    }

    // Check for hits on targets
    let closestTarget: Target | null = null;
    let closestDistance = Infinity;

    for (const target of targets) {
      if (!target.isAlive()) continue;

      const targetPosition = target.getPosition();
      const boundingBox = target.getBoundingBox();

      // Simple distance check first (optimization)
      const distance = (origin ?? this.camera.position).distanceTo(targetPosition);
      if (distance > 2000) continue; // Max range

      // Check if ray intersects with target's bounding box
      const ray = this.raycaster.ray;
      const intersection = ray.intersectBox(boundingBox, new THREE.Vector3());

      if (intersection && distance < closestDistance) {
        closestTarget = target;
        closestDistance = distance;
      }
    }

    if (!this.firstShotFired) {
      this.firstShotFired = true;
      this.createBulletTrail(origin, direction, true);
    }

    if (closestTarget) {
      // Apply damage
      closestTarget.takeDamage(this.damage);

      // Create hit effect
      this.createHitEffect(closestTarget.getPosition());

      return { hit: true, target: closestTarget };
    }

    // Create bullet trail effect even if we missed
  this.createBulletTrail(origin, direction);

    return { hit: false };
  }

  // 机头机枪发射实体子弹（黄色）
  public shootNoseGun(origin: THREE.Vector3, direction: THREE.Vector3): void {
    const currentTime = Date.now();
    const interval = 1000 / this.noseFireRate;
    if (currentTime - this.lastNoseShotTime < interval) return;
    this.lastNoseShotTime = currentTime;

  // 子弹模型（放大 + 更高细分）
  const geo = new THREE.SphereGeometry(0.5, 14, 14);
  const mat = new THREE.MeshBasicMaterial({ color: 0xFFF066 });
    const bullet = new THREE.Mesh(geo, mat);
    bullet.position.copy(origin);
  // 初速提升一点
  const velocity = direction.clone().normalize().multiplyScalar(this.bulletSpeed * 1.05);
    this.scene.add(bullet);
  this.activeBullets.push({ mesh: bullet, velocity, life: 2.2 }); // 更长寿命
  this.spawnMuzzleParticles(origin, direction.clone().normalize());
  this.spawnShellCasing(origin, direction.clone().normalize());
  this.createBulletTrail(origin, direction, false, 1200);
  }

  public updateBullets(deltaTime: number, targets: Target[]): void {
    this.heatLevel = Math.max(0, this.heatLevel - deltaTime * 0.25);
    for (let i = this.activeBullets.length - 1; i >= 0; i--) {
      const b = this.activeBullets[i];
      // 移动
      b.mesh.position.add(b.velocity.clone().multiplyScalar(deltaTime));
      b.life -= deltaTime;
      // 断续 tracer 粒子
      if (Math.random() < 0.5) {
        const tracerGeo = new THREE.SphereGeometry(0.18, 6, 6);
        const tracerMat = new THREE.MeshBasicMaterial({ color: 0xFFF566, transparent: true, opacity: 0.8 });
        const tracer = new THREE.Mesh(tracerGeo, tracerMat);
        tracer.position.copy(b.mesh.position);
        this.scene.add(tracer);
        this.tracerParticles.push({ mesh: tracer, life: 0.25 });
      }
      let hit = false;
      if (b.life > 0) {
        for (const t of targets) {
          if (!t.isAlive()) continue;
            const dist = t.getPosition().distanceTo(b.mesh.position);
            if (dist < 10) { // 碰撞范围
              t.takeDamage(this.damage * 0.5); // 机头机枪单发伤害较低
              this.createHitEffect(t.getPosition());
              hit = true;
              break;
            }
        }
      }
      if (b.life <= 0 || hit) {
        this.scene.remove(b.mesh);
        if (b.mesh.geometry) b.mesh.geometry.dispose();
        if (Array.isArray(b.mesh.material)) {
          b.mesh.material.forEach((m: THREE.Material) => m.dispose());
        } else if (b.mesh.material) {
          (b.mesh.material as THREE.Material).dispose();
        }
        this.activeBullets.splice(i, 1);
      } else {
        if (b.mesh.material instanceof THREE.MeshBasicMaterial) {
          const pulse = (Math.sin(performance.now()*0.02) + 1) * 0.5; // 0-1
          const heat = this.heatLevel;
          b.mesh.material.color.setHSL(0.13 + heat*0.05, 1, 0.45 + pulse*0.25);
        }
      }
    }
  }

  // --- 新增: 弹壳 ---
  private updateShellCasings(deltaTime: number): void {
    const gravity = new THREE.Vector3(0, -9.8, 0);
    for (let i = this.shellCasings.length - 1; i >= 0; i--) {
      const s = this.shellCasings[i];
      s.velocity.add(gravity.clone().multiplyScalar(deltaTime * 2));
      s.mesh.position.add(s.velocity.clone().multiplyScalar(deltaTime));
      s.life -= deltaTime;
      if (s.mesh.position.y < -50) s.life = 0; // 地面以下直接销毁
      if (s.life <= 0) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        if (s.mesh.material instanceof THREE.Material) s.mesh.material.dispose();
        this.shellCasings.splice(i,1);
      }
    }
  }

  // --- 新增: tracer 粒子 ---
  private updateTracerParticles(deltaTime: number): void {
    for (let i = this.tracerParticles.length - 1; i >= 0; i--) {
      const p = this.tracerParticles[i];
      p.life -= deltaTime;
      if (p.mesh.material instanceof THREE.MeshBasicMaterial) {
        p.mesh.material.opacity = Math.max(0, p.life / 0.25);
      }
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        if (p.mesh.material instanceof THREE.Material) p.mesh.material.dispose();
        this.tracerParticles.splice(i,1);
      }
    }
  }

  // helper for shell spawn
  private spawnShellCasing(origin: THREE.Vector3, forward: THREE.Vector3): void {
    const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
    const shell = new THREE.Mesh(geo, mat);
    shell.position.copy(origin);
    const up = new THREE.Vector3(0,1,0);
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();
    const velocity = right.multiplyScalar(40 + Math.random()*20)
      .add(new THREE.Vector3(0, 30 + Math.random()*10, 0))
      .add(forward.clone().multiplyScalar(5));
    this.scene.add(shell);
    this.shellCasings.push({ mesh: shell, velocity, life: 2.5 });
  }

  private spawnMuzzleParticles(origin: THREE.Vector3, forward: THREE.Vector3): void {
    const particleCount = 6;
    for (let i=0;i<particleCount;i++) {
      const geo = new THREE.SphereGeometry(0.4 + Math.random()*0.25, 6, 6);
      const mat = new THREE.MeshBasicMaterial({ color: 0xFFEE66, transparent: true, opacity: 0.95 });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(origin);
      const spread = forward.clone().multiplyScalar(5 + Math.random()*5).add(new THREE.Vector3(
        (Math.random()-0.5)*4,
        (Math.random()-0.5)*2,
        (Math.random()-0.5)*4
      ));
      const startTime = Date.now();
      const life = 140 + Math.random()*80;
      const animate = () => {
        const t = Date.now() - startTime;
        if (t < life) {
          p.position.add(spread.clone().multiplyScalar(0.02));
          if (p.material instanceof THREE.MeshBasicMaterial) p.material.opacity = 0.95 * (1 - t/life);
          requestAnimationFrame(animate);
        } else {
          this.scene.remove(p);
          p.geometry.dispose();
          if (p.material instanceof THREE.Material) p.material.dispose();
        }
      };
      this.scene.add(p);
      animate();
    }
  }

  // 外部循环调用后处理
  public postUpdate(deltaTime: number): void {
    this.updateShellCasings(deltaTime);
    this.updateTracerParticles(deltaTime);
  }

  public dropBomb(position: THREE.Vector3, velocity: THREE.Vector3): boolean {
    const currentTime = Date.now();
    const timeSinceLastBomb = currentTime - this.lastBombTime;
    const bombInterval = 1000 / this.bombRate;

    if (timeSinceLastBomb < bombInterval) {
      return false; // Rate limiting
    }

    this.lastBombTime = currentTime;
    console.log('💣 Dropping bomb!');

    // 创建炸弹
    const bomb = new Bomb(this.scene, position, velocity);
    this.bombs.push(bomb);

    return true;
  }

  public updateBombs(deltaTime: number, targets: Target[]): void {
    this.bombs = this.bombs.filter(bomb => {
      const stillAlive = bomb.update(deltaTime);
      
      if (!stillAlive) {
        // 检查爆炸范围内的目标
        const bombPos = bomb.getPosition();
        const explosionRadius = bomb.getExplosionRadius();
        const damage = bomb.getDamage();
        
        targets.forEach(target => {
          if (!target.isAlive()) return;
          
          const distance = target.getPosition().distanceTo(bombPos);
          if (distance <= explosionRadius) {
            target.takeDamage(damage);
          }
        });
        
        bomb.dispose();
        return false;
      }
      
      return true;
    });
  }

  private createMuzzleFlash(): void {
    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:999;`+
      `background:radial-gradient(circle at 50% 50%,rgba(255,255,200,0.35)0%,rgba(255,255,0,0.15)10%,transparent 40%);`+
      `mix-blend-mode:screen;opacity:0.9;transition:opacity .12s ease-out;`;
    document.body.appendChild(flash);
    requestAnimationFrame(()=> flash.style.opacity='0');
    setTimeout(()=> flash.remove(),160);
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
        particles.children.forEach((particle: THREE.Object3D) => {
          particle.position.add(new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2
          ));
          if ((particle as THREE.Mesh).material && (particle as THREE.Mesh).material instanceof THREE.MeshBasicMaterial) {
            ((particle as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 1 - progress;
          }
        });
        
        requestAnimationFrame(animateParticles);
      } else {
        // Clean up
        this.scene.remove(particles);
        particles.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const mat = child.material;
            if (Array.isArray(mat)) {
              mat.forEach(m => m.dispose());
            } else if (mat instanceof THREE.Material) {
              mat.dispose();
            }
          }
        });
      }
    };

    animateParticles();
  }

  private createBulletTrail(origin?: THREE.Vector3, direction?: THREE.Vector3, strong: boolean = false, customLength?: number): void {
    const startPoint = origin ? origin.clone() : this.camera.position.clone();
    const dir = (direction ? direction.clone() : new THREE.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion)).normalize();
    const totalLength = customLength ?? 1050;
    const segmentLength = strong ? 140 : 90;
    const gap = strong ? 25 : 45;
    const group = new THREE.Group();
    for (let traveled = 0; traveled < totalLength; traveled += segmentLength + gap) {
      const segStart = startPoint.clone().add(dir.clone().multiplyScalar(traveled));
      const segEnd = segStart.clone().add(dir.clone().multiplyScalar(segmentLength));
      const geo = new THREE.BufferGeometry().setFromPoints([segStart, segEnd]);
      const mat = new THREE.LineBasicMaterial({ color: strong ? 0xFFFCAA : 0xFFE866, transparent: true, opacity: strong ? 1 : 0.85, linewidth: 2 });
      const line = new THREE.Line(geo, mat);
      group.add(line);
    }
    this.scene.add(group);
    const start = Date.now();
    const duration = strong ? 320 : 220;
    const fade = () => {
      const t = (Date.now() - start) / duration;
      if (t < 1) {
        group.children.forEach((obj: THREE.Object3D) => {
          const line = obj as THREE.Line;
          if (line.material instanceof THREE.LineBasicMaterial) {
            const base = strong ? 1 : 0.85;
            line.material.opacity = base * (1 - t);
          }
        });
        requestAnimationFrame(fade);
      } else {
        this.scene.remove(group);
        group.children.forEach((obj: THREE.Object3D) => {
          const line = obj as THREE.Line;
          (line.geometry as THREE.BufferGeometry).dispose();
          if (line.material instanceof THREE.Material) line.material.dispose();
        });
      }
    };
    fade();
  }

  public updateCrosshair(visible: boolean): void {
    this.crosshair.style.display = visible ? 'block' : 'none';
    this.bombSight.style.display = visible ? 'block' : 'none';
  }

  // 提供给外部用于摄像机抖动等视觉反馈
  public getHeatLevel(): number {
    return this.heatLevel;
  }

  public dispose(): void {
    if (this.crosshair && this.crosshair.parentNode) {
      this.crosshair.parentNode.removeChild(this.crosshair);
    }
    if (this.bombSight && this.bombSight.parentNode) {
      this.bombSight.parentNode.removeChild(this.bombSight);
    }
    
    // 清理所有炸弹
    this.bombs.forEach(bomb => bomb.dispose());
    this.bombs = [];

    // 清理子弹
    this.activeBullets.forEach(b => {
      this.scene.remove(b.mesh);
      b.mesh.geometry.dispose();
      const mat = b.mesh.material;
      if (Array.isArray(mat)) {
        mat.forEach((m: THREE.Material) => m.dispose());
      } else (mat as THREE.Material).dispose();
    });
    this.activeBullets = [];

    // 清理弹壳
    this.shellCasings.forEach(s => {
      this.scene.remove(s.mesh);
      s.mesh.geometry.dispose();
      if (s.mesh.material instanceof THREE.Material) s.mesh.material.dispose();
    });
    this.shellCasings = [];

    // 清理 tracer 粒子
    this.tracerParticles.forEach(p => {
      this.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      if (p.mesh.material instanceof THREE.Material) p.mesh.material.dispose();
    });
    this.tracerParticles = [];
  }
}
