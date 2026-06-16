import * as THREE from 'three';
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT } from '@/store/types';

export class Room {
  public group: THREE.Group;
  private wallMaterial: THREE.MeshStandardMaterial;
  private floorMaterial: THREE.MeshStandardMaterial;

  constructor() {
    this.group = new THREE.Group();
    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5c4,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.createRoom();
  }

  private createRoundedBox(
    width: number,
    height: number,
    depth: number,
    radius: number,
    smoothness: number
  ): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    const w = width;
    const h = height;
    const r = radius;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }

  private createRoom() {
    const wallThickness = 0.2;
    const cornerRadius = 0.8;

    const floorGeo = new THREE.BoxGeometry(ROOM_WIDTH, 0.1, ROOM_DEPTH);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    this.group.add(floor);

    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM_WIDTH, ROOM_HEIGHT, wallThickness),
      this.wallMaterial
    );
    backWall.position.set(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2 + wallThickness / 2);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    this.group.add(backWall);

    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, ROOM_HEIGHT, ROOM_DEPTH),
      this.wallMaterial
    );
    leftWall.position.set(-ROOM_WIDTH / 2 + wallThickness / 2, ROOM_HEIGHT / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    this.group.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, ROOM_HEIGHT, ROOM_DEPTH),
      this.wallMaterial
    );
    rightWall.position.set(ROOM_WIDTH / 2 - wallThickness / 2, ROOM_HEIGHT / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    this.group.add(rightWall);

    this.createDoor();
    this.createWindow();
    this.createCarpet();
  }

  private createDoor() {
    const doorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 2.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
    );
    doorFrame.position.set(ROOM_WIDTH / 2 - 0.15, 1.1, 0);
    doorFrame.castShadow = true;
    this.group.add(doorFrame);

    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 })
    );
    door.position.set(ROOM_WIDTH / 2 - 0.14, 1, 0);
    door.castShadow = true;
    this.group.add(door);

    const doorKnob = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 })
    );
    doorKnob.position.set(ROOM_WIDTH / 2 - 0.1, 1, 0.7);
    this.group.add(doorKnob);
  }

  private createWindow() {
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.5, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
    );
    windowFrame.position.set(-3, 2, -ROOM_DEPTH / 2 + 0.15);
    this.group.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.3),
      new THREE.MeshStandardMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      })
    );
    windowGlass.position.set(-3, 2, -ROOM_DEPTH / 2 + 0.11);
    this.group.add(windowGlass);

    const starsGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 20; i++) {
      starPositions.push(
        -3.9 + Math.random() * 1.8,
        1.35 + Math.random() * 1.3,
        -ROOM_DEPTH / 2 + 0.105
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.name = 'windowStars';
    (starsMaterial as any).visible = false;
    this.group.add(stars);

    const crossBar1 = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.05, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    crossBar1.position.set(-3, 2, -ROOM_DEPTH / 2 + 0.16);
    this.group.add(crossBar1);

    const crossBar2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.5, 0.12),
      new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    crossBar2.position.set(-3, 2, -ROOM_DEPTH / 2 + 0.16);
    this.group.add(crossBar2);
  }

  private createCarpet() {
    const carpetShape = new THREE.Shape();
    const carpetWidth = 4;
    const carpetHeight = 3;
    const radius = 0.3;

    carpetShape.moveTo(-carpetWidth / 2 + radius, -carpetHeight / 2);
    carpetShape.lineTo(carpetWidth / 2 - radius, -carpetHeight / 2);
    carpetShape.quadraticCurveTo(carpetWidth / 2, -carpetHeight / 2, carpetWidth / 2, -carpetHeight / 2 + radius);
    carpetShape.lineTo(carpetWidth / 2, carpetHeight / 2 - radius);
    carpetShape.quadraticCurveTo(carpetWidth / 2, carpetHeight / 2, carpetWidth / 2 - radius, carpetHeight / 2);
    carpetShape.lineTo(-carpetWidth / 2 + radius, carpetHeight / 2);
    carpetShape.quadraticCurveTo(-carpetWidth / 2, carpetHeight / 2, -carpetWidth / 2, carpetHeight / 2 - radius);
    carpetShape.lineTo(-carpetWidth / 2, -carpetHeight / 2 + radius);
    carpetShape.quadraticCurveTo(-carpetWidth / 2, -carpetHeight / 2, -carpetWidth / 2 + radius, -carpetHeight / 2);

    const carpetGeometry = new THREE.ExtrudeGeometry(carpetShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
    });

    const carpet = new THREE.Mesh(
      carpetGeometry,
      new THREE.MeshStandardMaterial({
        color: 0xffb6c1,
        roughness: 0.9,
      })
    );
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.01, 1);
    carpet.receiveShadow = true;
    this.group.add(carpet);
  }

  public setNightMode(isNight: boolean) {
    const stars = this.group.getObjectByName('windowStars');
    if (stars) {
      (stars as any).visible = isNight;
    }

    if (isNight) {
      this.wallMaterial.color.setHex(0x3d3d5c);
      this.floorMaterial.color.setHex(0x5c4a3d);
    } else {
      this.wallMaterial.color.setHex(0xfff0f5);
      this.floorMaterial.color.setHex(0xe8d5c4);
    }
  }
}
