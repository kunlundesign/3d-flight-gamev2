import * as THREE from 'three';

export class Bomb {
  private scene: THREE.Scene;
  private mesh: THREE.Mesh;
  private velocity: THREE.Vector3;
  private gravity: number = -20;
  private explosionRadius: number = 15;
  private damage: number = 150;
  private life: number = 10; // 炸弹存活时间（秒）
  private exploded: boolean = false;

  constructor(scene: THREE.Scene, position: THREE.Vector3, velocity: THREE.Vector3) {
    this.scene = scene;
    this.velocity = velocity.clone();
    
    // 创建炸弹外观
    const geometry = new THREE.SphereGeometry(0.5, 8, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0x333333 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;
    
    this.scene.add(this.mesh);
  }

  public update(deltaTime: number): boolean {
    if (this.exploded) return false;
    
    this.life -= deltaTime;
    if (this.life <= 0) {
      this.explode();
      return false;
    }
    
    // 应用重力
    this.velocity.y += this.gravity * deltaTime;
    
    // 更新位置
    this.mesh.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // 检查是否撞击地面
    if (this.mesh.position.y <= 0) {
      this.explode();
      return false;
    }
    
    return true;
  }

  public explode(): void {
    if (this.exploded) return;
    this.exploded = true;
    
    // 创建爆炸特效
    this.createExplosion();
    
    // 移除炸弹
    this.scene.remove(this.mesh);
  }

  private createExplosion(): void {
    // 创建爆炸球体
    const explosionGeometry = new THREE.SphereGeometry(this.explosionRadius, 16, 16);
    const explosionMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff4400, 
      transparent: true, 
      opacity: 0.8 
    });
    const explosionMesh = new THREE.Mesh(explosionGeometry, explosionMaterial);
    explosionMesh.position.copy(this.mesh.position);
    this.scene.add(explosionMesh);
    
    // 爆炸粒子效果
    const particleCount = 30;
    const particles = new THREE.Group();
    
    for (let i = 0; i < particleCount; i++) {
      const particleGeometry = new THREE.SphereGeometry(0.3, 4, 4);
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5)
      });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.copy(this.mesh.position);
      particle.position.add(new THREE.Vector3(
        (Math.random() - 0.5) * this.explosionRadius,
        (Math.random() - 0.5) * this.explosionRadius,
        (Math.random() - 0.5) * this.explosionRadius
      ));
      
      particles.add(particle);
    }
    
    this.scene.add(particles);
    
    // 爆炸动画
    const startTime = Date.now();
    const animateExplosion = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / 1000; // 1 秒动画
      
      if (progress < 1) {
        // 缩放爆炸球体
        explosionMesh.scale.setScalar(1 + progress * 2);
        explosionMaterial.opacity = 0.8 * (1 - progress);
        
        // 动画粒子
        particles.children.forEach((particle) => {
          if (particle instanceof THREE.Mesh && particle.material instanceof THREE.MeshBasicMaterial) {
            particle.material.opacity = 1 - progress;
          }
        });
        
        requestAnimationFrame(animateExplosion);
      } else {
        // 清理爆炸效果
        this.scene.remove(explosionMesh);
        this.scene.remove(particles);
        explosionGeometry.dispose();
        explosionMaterial.dispose();
        
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
    
    animateExplosion();
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public getExplosionRadius(): number {
    return this.explosionRadius;
  }

  public getDamage(): number {
    return this.damage;
  }

  public dispose(): void {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    }
  }
}
