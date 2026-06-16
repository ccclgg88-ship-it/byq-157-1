import * as THREE from 'three';

export interface Collidable {
  instanceId: string;
  position: { x: number; y: number; z: number };
  size: { width: number; depth: number; height: number };
  rotation: number;
}

export class CollisionDetector {
  public static checkCollision(
    item1: Collidable,
    item2: Collidable,
    tolerance: number = 0.05
  ): boolean {
    const box1 = this.getOrientedBoundingBox(item1);
    const box2 = this.getOrientedBoundingBox(item2);

    return this.intersects(box1, box2, tolerance);
  }

  private static getOrientedBoundingBox(item: Collidable): {
    minX: number; maxX: number;
    minZ: number; maxZ: number;
  } {
    const { x, z } = item.position;
    const { width, depth } = item.size;
    const rotation = item.rotation;

    const cos = Math.abs(Math.cos(rotation));
    const sin = Math.abs(Math.sin(rotation));

    const halfWidth = (width * cos + depth * sin) / 2;
    const halfDepth = (width * sin + depth * cos) / 2;

    return {
      minX: x - halfWidth,
      maxX: x + halfWidth,
      minZ: z - halfDepth,
      maxZ: z + halfDepth,
    };
  }

  private static intersects(
    box1: { minX: number; maxX: number; minZ: number; maxZ: number },
    box2: { minX: number; maxX: number; minZ: number; maxZ: number },
    tolerance: number
  ): boolean {
    return !(
      box1.maxX - tolerance < box2.minX ||
      box1.minX + tolerance > box2.maxX ||
      box1.maxZ - tolerance < box2.minZ ||
      box1.minZ + tolerance > box2.maxZ
    );
  }

  public static checkAllCollisions(
    newItem: Collidable,
    existingItems: Collidable[],
    excludeInstanceId?: string
  ): Collidable | null {
    for (const existing of existingItems) {
      if (existing.instanceId === excludeInstanceId) continue;
      if (this.checkCollision(newItem, existing)) {
        return existing;
      }
    }
    return null;
  }

  public static createAABBFromObject3D(
    obj: THREE.Object3D,
    size: { width: number; depth: number; height: number }
  ): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromCenterAndSize(
      new THREE.Vector3(obj.position.x, obj.position.y + size.height / 2, obj.position.z),
      new THREE.Vector3(size.width, size.height, size.depth)
    );
    return box;
  }
}
