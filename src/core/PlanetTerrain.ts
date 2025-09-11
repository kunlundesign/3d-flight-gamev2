import * as THREE from 'three';
import gameConfig from '../GameConfig.json';

export class PlanetTerrain {
  private scene: THREE.Scene;
  private planet!: THREE.Mesh;
  private radius: number;
  private material!: THREE.MeshLambertMaterial;
  private geometry!: THREE.SphereGeometry;
  private trees: THREE.InstancedMesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.radius = gameConfig.planet.radius;
    this.createPlanet();
    this.generateTrees();
  }

  private createPlanet(): void {
    // Create sphere geometry with enough detail for displacement
    this.geometry = new THREE.SphereGeometry(this.radius, 128, 64);
    
    // Apply noise displacement to vertices
    this.applyTerrainNoise();
    
    // Create material
    this.material = new THREE.MeshLambertMaterial({
      color: 0x4a7c59, // Forest green
      wireframe: false
    });

    // Create mesh
    this.planet = new THREE.Mesh(this.geometry, this.material);
    this.planet.receiveShadow = true;
    this.planet.name = 'planet';
    
    this.scene.add(this.planet);
  }

  private applyTerrainNoise(): void {
    const positions = this.geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);
      
      // Get normalized position (direction from center)
      const normal = vertex.clone().normalize();
      
      // Apply multiple octaves of noise
      const noise1 = this.noise3D(normal.x * 0.01, normal.y * 0.01, normal.z * 0.01) * 200;
      const noise2 = this.noise3D(normal.x * 0.02, normal.y * 0.02, normal.z * 0.02) * 100;
      const noise3 = this.noise3D(normal.x * 0.04, normal.y * 0.04, normal.z * 0.04) * 50;
      
      const displacement = noise1 + noise2 + noise3;
      
      // Apply displacement along normal
      vertex.addScaledVector(normal, displacement);
      
      positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    positions.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  private noise3D(x: number, y: number, z: number): number {
    // Simple 3D noise implementation (could be replaced with proper Perlin noise)
    return (Math.sin(x * 4) + Math.sin(y * 7) + Math.sin(z * 5)) / 3;
  }

  private generateTrees(): void {
    const treeCount = 5000;
    const treeGeometry = this.createTreeGeometry();
    const treeMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
    
    const instancedTrees = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
    instancedTrees.castShadow = true;
    
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    for (let i = 0; i < treeCount; i++) {
      // Generate random position on sphere surface
      position.randomDirection().multiplyScalar(this.radius);
      
      // Get height at this position (sample the displaced geometry)
      const heightOffset = this.getHeightAtPosition(position);
      position.normalize().multiplyScalar(this.radius + heightOffset + 5);
      
      // Orient tree to face outward from planet
      const up = position.clone().normalize();
      quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
      
      // Random scale
      const treeScale = 0.8 + Math.random() * 0.4;
      scale.set(treeScale, treeScale, treeScale);
      
      matrix.compose(position, quaternion, scale);
      instancedTrees.setMatrixAt(i, matrix);
    }

    instancedTrees.instanceMatrix.needsUpdate = true;
    this.trees.push(instancedTrees);
    this.scene.add(instancedTrees);
  }

  private createTreeGeometry(): THREE.BufferGeometry {
    // Simple tree geometry (trunk + cone for leaves)
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 8, 8);
    const trunk = new THREE.Mesh(trunkGeometry);
    trunk.position.y = 4;
    treeGroup.add(trunk);
    
    // Leaves (cone)
    const leavesGeometry = new THREE.ConeGeometry(3, 8, 8);
    const leaves = new THREE.Mesh(leavesGeometry);
    leaves.position.y = 10;
    treeGroup.add(leaves);
    
    // Merge geometries - simplified approach
    const geometries: THREE.BufferGeometry[] = [];
    
    treeGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        const geometry = child.geometry.clone();
        geometry.applyMatrix4(child.matrix);
        geometries.push(geometry);
      }
    });
    
    // Simple merge by combining the first geometry (for now)
    return geometries[0] || new THREE.BufferGeometry();
  }

  private getHeightAtPosition(position: THREE.Vector3): number {
    // Simple approximation - in a real implementation, you'd sample the actual geometry
    const normal = position.clone().normalize();
    const noise1 = this.noise3D(normal.x * 0.01, normal.y * 0.01, normal.z * 0.01) * 200;
    const noise2 = this.noise3D(normal.x * 0.02, normal.y * 0.02, normal.z * 0.02) * 100;
    const noise3 = this.noise3D(normal.x * 0.04, normal.y * 0.04, normal.z * 0.04) * 50;
    
    return noise1 + noise2 + noise3;
  }

  public getHeightAtWorldPosition(worldPosition: THREE.Vector3): number {
    const distanceFromCenter = worldPosition.length();
    return distanceFromCenter - this.radius;
  }

  public getNormalAtPosition(position: THREE.Vector3): THREE.Vector3 {
    // For a sphere, the normal is just the normalized position vector from center
    return position.clone().normalize();
  }

  public isValidSpawnPosition(position: THREE.Vector3, maxSlope: number = 30): boolean {
    const normal = this.getNormalAtPosition(position);
    const up = new THREE.Vector3(0, 1, 0);
    const angle = Math.acos(normal.dot(up)) * (180 / Math.PI);
    
    return angle <= maxSlope;
  }

  public getRandomSurfacePosition(): THREE.Vector3 {
    const position = new THREE.Vector3().randomDirection();
    const heightOffset = this.getHeightAtPosition(position);
    position.multiplyScalar(this.radius + heightOffset + 1);
    
    return position;
  }

  public dispose(): void {
    this.scene.remove(this.planet);
    this.trees.forEach(tree => {
      this.scene.remove(tree);
      tree.geometry.dispose();
      if (tree.material instanceof THREE.Material) {
        tree.material.dispose();
      }
    });
    
    this.geometry.dispose();
    this.material.dispose();
  }
}
