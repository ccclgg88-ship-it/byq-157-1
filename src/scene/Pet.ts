import * as THREE from 'three';

export class Pet {
  public group: THREE.Group;
  private body: THREE.Mesh;
  private head: THREE.Mesh;
  private leftEar: THREE.Mesh;
  private rightEar: THREE.Mesh;
  private tail: THREE.Mesh;
  private mixer: THREE.AnimationMixer;
  private clock: THREE.Clock;

  private targetPosition: THREE.Vector3;
  private isMoving: boolean = false;
  private moveSpeed: number = 1.5;
  private idleTime: number = 0;
  private currentAnimation: string = 'idle';

  private yawnProgress: number = 0;
  private isYawning: boolean = false;

  constructor() {
    this.group = new THREE.Group();
    this.clock = new THREE.Clock();
    this.mixer = new THREE.AnimationMixer(this.group);
    this.targetPosition = new THREE.Vector3(0, 0, 0);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xffe4b5,
      roughness: 0.8,
    });

    this.body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), bodyMat);
    this.body.scale.set(1.2, 0.9, 1);
    this.body.position.y = 0.45;
    this.body.castShadow = true;
    this.group.add(this.body);

    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), bodyMat);
    this.head.position.set(0, 0.9, 0.4);
    this.head.castShadow = true;
    this.group.add(this.head);

    const earMat = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,
      roughness: 0.7,
    });

    const earGeo = new THREE.ConeGeometry(0.12, 0.3, 16);
    this.leftEar = new THREE.Mesh(earGeo, earMat);
    this.leftEar.position.set(-0.2, 1.15, 0.3);
    this.leftEar.rotation.z = Math.PI / 6;
    this.leftEar.rotation.x = -0.3;
    this.group.add(this.leftEar);

    this.rightEar = this.leftEar.clone();
    this.rightEar.position.set(0.2, 1.15, 0.3);
    this.rightEar.rotation.z = -Math.PI / 6;
    this.group.add(this.rightEar);

    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), eyeMat);
    leftEye.position.set(-0.12, 0.95, 0.7);
    this.group.add(leftEye);

    const rightEye = leftEye.clone();
    rightEye.position.set(0.12, 0.95, 0.7);
    this.group.add(rightEye);

    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), noseMat);
    nose.position.set(0, 0.85, 0.72);
    this.group.add(nose);

    const tailGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.4, 12);
    this.tail = new THREE.Mesh(tailGeo, bodyMat);
    this.tail.position.set(0, 0.5, -0.8);
    this.tail.rotation.x = Math.PI / 3;
    this.group.add(this.tail);

    const legMat = new THREE.MeshStandardMaterial({ color: 0xffe4b5, roughness: 0.8 });
    const legPositions = [
      [-0.3, 0.15, 0.3],
      [0.3, 0.15, 0.3],
      [-0.3, 0.15, -0.3],
      [0.3, 0.15, -0.3],
    ];

    legPositions.forEach((pos) => {
      const leg = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), legMat);
      leg.position.set(pos[0], pos[1], pos[2]);
      leg.castShadow = true;
      this.group.add(leg);
    });

    this.group.position.set(2, 0, 2);
    this.group.visible = true;
  }

  public update(deltaTime: number, furniturePositions: { x: number; z: number; furnitureId: string }[]): void {
    if (this.isYawning) {
      this.yawnProgress += deltaTime * 2;
      if (this.yawnProgress >= 1) {
        this.yawnProgress = 0;
        this.isYawning = false;
      } else {
        const t = Math.sin(this.yawnProgress * Math.PI);
        this.head.scale.y = 1 + t * 0.2;
        this.head.position.y = 0.9 + t * 0.1;
      }
      return;
    }

    const elapsed = this.clock.getElapsedTime();

    if (!this.isMoving) {
      this.idleTime += deltaTime;

      if (this.idleTime > 3) {
        this.idleTime = 0;
        if (furniturePositions.length > 0 && Math.random() > 0.5) {
          const randomFurniture = furniturePositions[Math.floor(Math.random() * furniturePositions.length)];
          this.targetPosition.set(randomFurniture.x, 0, randomFurniture.z + 1);
          this.currentAnimation = 'walking';
        } else {
          this.targetPosition.set(
            (Math.random() - 0.5) * 6,
            0,
            (Math.random() - 0.5) * 6
          );
          this.currentAnimation = 'walking';
        }
        this.isMoving = true;
      } else {
        this.group.position.y = Math.sin(elapsed * 3) * 0.02;
        this.tail.rotation.z = Math.sin(elapsed * 5) * 0.3;
        this.currentAnimation = 'idle';
      }
    } else {
      const currentPos = this.group.position;
      const direction = new THREE.Vector3()
        .subVectors(this.targetPosition, currentPos)
        .normalize();

      const distance = currentPos.distanceTo(this.targetPosition);

      if (distance > 0.1) {
        const moveAmount = this.moveSpeed * deltaTime;
        this.group.position.x += direction.x * moveAmount;
        this.group.position.z += direction.z * moveAmount;

        const angle = Math.atan2(direction.x, direction.z);
        this.group.rotation.y = angle;

        this.group.position.y = Math.sin(elapsed * 10) * 0.05 + 0.05;
        this.tail.rotation.z = Math.sin(elapsed * 8) * 0.5;
      } else {
        this.isMoving = false;
        this.idleTime = 0;
        this.currentAnimation = 'idle';
        this.group.position.y = 0;
      }
    }
  }

  public playYawn(): void {
    this.isYawning = true;
    this.yawnProgress = 0;
    this.isMoving = false;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }

  public getCurrentAnimation(): string {
    return this.currentAnimation;
  }

  public isOnBed(bedPosition: { x: number; z: number }, bedSize: { width: number; depth: number }): boolean {
    const dx = Math.abs(this.group.position.x - bedPosition.x);
    const dz = Math.abs(this.group.position.z - bedPosition.z);
    return dx < bedSize.width / 2 && dz < bedSize.depth / 2;
  }
}
