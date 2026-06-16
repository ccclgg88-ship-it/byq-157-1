import * as THREE from 'three';
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT } from '@/store/types';

export class Room {
  public group: THREE.Group;
  private wallMaterial: THREE.MeshStandardMaterial;
  private floorMaterial: THREE.MeshStandardMaterial;
  private ceilingMaterial: THREE.MeshStandardMaterial;
  private windowStars: THREE.Points | null = null;
  public starsMaterial: THREE.PointsMaterial | null = null;

  constructor() {
    this.group = new THREE.Group();

    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.85,
      metalness: 0.05,
      side: THREE.FrontSide,
    });

    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5c4,
      roughness: 0.9,
      metalness: 0.05,
    });

    this.ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0,
    });

    this.createRoom();
  }

  private createRoom() {
    const wallThickness = 0.3;
    const cornerRadius = 1.0;

    const floorGeo = new THREE.BoxGeometry(ROOM_WIDTH + wallThickness * 2, 0.2, ROOM_DEPTH + wallThickness * 2);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.position.y = -0.1;
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

    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM_WIDTH, wallThickness, ROOM_DEPTH),
      this.ceilingMaterial
    );
    ceiling.position.set(0, ROOM_HEIGHT - wallThickness / 2, 0);
    ceiling.receiveShadow = true;
    this.group.add(ceiling);

    this.createCorners(cornerRadius, ROOM_HEIGHT, wallThickness);
    this.createDoor();
    this.createWindow();
    this.createCarpet();
    this.createBaseboard();
  }

  private createCorners(radius: number, height: number, wallThickness: number) {
    const cornerMat = this.wallMaterial.clone();

    const corners = [
      { x: -ROOM_WIDTH / 2 + radius, z: -ROOM_DEPTH / 2 + radius, rotY: Math.PI },
      { x: ROOM_WIDTH / 2 - radius, z: -ROOM_DEPTH / 2 + radius, rotY: Math.PI / 2 },
    ];

    corners.forEach(({ x, z, rotY }) => {
      const cornerGeo = new THREE.CylinderGeometry(radius, radius, height, 16, 1, true, 0, Math.PI / 2);
      const corner = new THREE.Mesh(cornerGeo, cornerMat);
      corner.position.set(x, height / 2, z);
      corner.rotation.y = rotY;
      corner.receiveShadow = true;
      corner.castShadow = true;
      this.group.add(corner);
    });
  }

  private createBaseboard() {
    const baseboardHeight = 0.12;
    const baseboardDepth = 0.03;
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
    });

    const backBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM_WIDTH, baseboardHeight, baseboardDepth),
      baseboardMat
    );
    backBaseboard.position.set(0, baseboardHeight / 2, -ROOM_DEPTH / 2 + 0.15);
    this.group.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardDepth, baseboardHeight, ROOM_DEPTH),
      baseboardMat
    );
    leftBaseboard.position.set(-ROOM_WIDTH / 2 + 0.15, baseboardHeight / 2, 0);
    this.group.add(leftBaseboard);

    const rightBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardDepth, baseboardHeight, ROOM_DEPTH),
      baseboardMat
    );
    rightBaseboard.position.set(ROOM_WIDTH / 2 - 0.15, baseboardHeight / 2, 0);
    this.group.add(rightBaseboard);
  }

  private createDoor() {
    const doorWidth = 1.8;
    const doorHeight = 2.4;
    const doorX = ROOM_WIDTH / 2 - 1.5;
    const doorZ = -ROOM_DEPTH / 2 + 0.15;

    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 });

    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, doorHeight, 0.2),
      doorFrameMat
    );
    leftFrame.position.set(doorX - doorWidth / 2 + 0.06, doorHeight / 2, doorZ);
    leftFrame.castShadow = true;
    this.group.add(leftFrame);

    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, doorHeight, 0.2),
      doorFrameMat
    );
    rightFrame.position.set(doorX + doorWidth / 2 - 0.06, doorHeight / 2, doorZ);
    rightFrame.castShadow = true;
    this.group.add(rightFrame);

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth + 0.04, 0.12, 0.2),
      doorFrameMat
    );
    topFrame.position.set(doorX, doorHeight - 0.06, doorZ);
    topFrame.castShadow = true;
    this.group.add(topFrame);

    const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - 0.18, doorHeight - 0.2, 0.08),
      doorMat
    );
    door.position.set(doorX, (doorHeight - 0.2) / 2, doorZ + 0.06);
    door.castShadow = true;
    door.receiveShadow = true;
    this.group.add(door);

    const doorKnobGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const doorKnobMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.2,
    });
    const doorKnob = new THREE.Mesh(doorKnobGeo, doorKnobMat);
    doorKnob.position.set(doorX - doorWidth / 2 + 0.35, doorHeight / 2, doorZ + 0.12);
    this.group.add(doorKnob);

    const panelWidth = (doorWidth - 0.4) / 2;
    const panelHeight = (doorHeight - 0.5) / 2;
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xa0522d,
      roughness: 0.55,
    });

    const panelPositions = [
      { x: doorX - panelWidth / 2 - 0.1, y: doorHeight / 2 + panelHeight / 2 + 0.1 },
      { x: doorX + panelWidth / 2 + 0.1, y: doorHeight / 2 + panelHeight / 2 + 0.1 },
      { x: doorX - panelWidth / 2 - 0.1, y: doorHeight / 2 - panelHeight / 2 - 0.1 },
      { x: doorX + panelWidth / 2 + 0.1, y: doorHeight / 2 - panelHeight / 2 - 0.1 },
    ];

    panelPositions.forEach(({ x, y }) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelWidth, panelHeight, 0.03),
        panelMat
      );
      panel.position.set(x, y, doorZ + 0.1);
      this.group.add(panel);
    });
  }

  private createWindow() {
    const windowWidth = 2.5;
    const windowHeight = 1.8;
    const windowX = -3;
    const windowY = 2.2;
    const windowZ = -ROOM_DEPTH / 2 + 0.15;

    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
    });

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + 0.2, 0.12, 0.18),
      windowFrameMat
    );
    topFrame.position.set(windowX, windowY + windowHeight / 2, windowZ);
    this.group.add(topFrame);

    const bottomFrame = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + 0.2, 0.12, 0.18),
      windowFrameMat
    );
    bottomFrame.position.set(windowX, windowY - windowHeight / 2, windowZ);
    this.group.add(bottomFrame);

    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, windowHeight, 0.18),
      windowFrameMat
    );
    leftFrame.position.set(windowX - windowWidth / 2, windowY, windowZ);
    this.group.add(leftFrame);

    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, windowHeight, 0.18),
      windowFrameMat
    );
    rightFrame.position.set(windowX + windowWidth / 2, windowY, windowZ);
    this.group.add(rightFrame);

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0xb0e0e6,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.3,
    });
    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(windowWidth - 0.2, windowHeight - 0.2),
      windowGlassMat
    );
    windowGlass.position.set(windowX, windowY, windowZ + 0.05);
    this.group.add(windowGlass);

    const crossBarH = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth - 0.2, 0.06, 0.1),
      windowFrameMat
    );
    crossBarH.position.set(windowX, windowY, windowZ + 0.08);
    this.group.add(crossBarH);

    const crossBarV = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, windowHeight - 0.2, 0.1),
      windowFrameMat
    );
    crossBarV.position.set(windowX, windowY, windowZ + 0.08);
    this.group.add(crossBarV);

    const starsGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];
    for (let i = 0; i < 40; i++) {
      starPositions.push(
        windowX - windowWidth / 2 + 0.3 + Math.random() * (windowWidth - 0.6),
        windowY - windowHeight / 2 + 0.3 + Math.random() * (windowHeight - 0.6),
        windowZ + 0.03
      );
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffaa,
      size: 0.08,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    });
    this.starsMaterial = starsMaterial;
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.windowStars = stars;
    this.group.add(stars);

    const windowsillMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
    });
    const windowsill = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + 0.4, 0.08, 0.35),
      windowsillMat
    );
    windowsill.position.set(windowX, windowY - windowHeight / 2 - 0.04, windowZ + 0.12);
    windowsill.castShadow = true;
    this.group.add(windowsill);

    const smallPlant = this.createSmallPlant();
    smallPlant.position.set(windowX + 0.6, windowY - windowHeight / 2 + 0.06, windowZ + 0.18);
    this.group.add(smallPlant);
  }

  private createSmallPlant(): THREE.Group {
    const group = new THREE.Group();

    const potMat = new THREE.MeshStandardMaterial({ color: 0xe74c3c, roughness: 0.8 });
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.06, 0.15, 16),
      potMat
    );
    pot.position.y = 0.075;
    pot.castShadow = true;
    group.add(pot);

    const soilMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.03, 16),
      soilMat
    );
    soil.position.y = 0.15;
    group.add(soil);

    const leafColors = [0x27ae60, 0x2ecc71, 0x58d68d];
    for (let i = 0; i < 5; i++) {
      const leafMat = new THREE.MeshStandardMaterial({
        color: leafColors[i % leafColors.length],
        roughness: 0.8,
        side: THREE.DoubleSide,
      });
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        leafMat
      );
      leaf.scale.set(0.6 + Math.random() * 0.4, 1, 0.5 + Math.random() * 0.3);
      leaf.position.set(
        (Math.random() - 0.5) * 0.1,
        0.2 + i * 0.05,
        (Math.random() - 0.5) * 0.1
      );
      leaf.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
      leaf.castShadow = true;
      group.add(leaf);
    }

    return group;
  }

  private createCarpet() {
    const carpetWidth = 5;
    const carpetHeight = 4;
    const radius = 0.6;

    const carpetShape = new THREE.Shape();
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
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 2,
    });

    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,
      roughness: 0.95,
    });
    const carpet = new THREE.Mesh(carpetGeometry, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.005, 1.5);
    carpet.receiveShadow = true;
    this.group.add(carpet);

    const patternShape = new THREE.Shape();
    const heartSize = 0.3;
    patternShape.moveTo(0, heartSize * 0.5);
    patternShape.bezierCurveTo(0, heartSize * 0.5, -heartSize * 0.5, 0, -heartSize * 0.5, -heartSize * 0.2);
    patternShape.bezierCurveTo(-heartSize * 0.5, -heartSize * 0.5, -heartSize * 0.25, -heartSize * 0.5, 0, -heartSize * 0.25);
    patternShape.bezierCurveTo(heartSize * 0.25, -heartSize * 0.5, heartSize * 0.5, -heartSize * 0.5, heartSize * 0.5, -heartSize * 0.2);
    patternShape.bezierCurveTo(heartSize * 0.5, 0, 0, heartSize * 0.5, 0, heartSize * 0.5);

    const patternGeo = new THREE.ExtrudeGeometry(patternShape, { depth: 0.01, bevelEnabled: false });
    const patternMat = new THREE.MeshStandardMaterial({
      color: 0xff91a3,
      roughness: 0.9,
    });

    const patternPositions = [
      { x: -1.2, z: 0.5 },
      { x: 1.2, z: 0.5 },
      { x: 0, z: 2.5 },
      { x: -0.8, z: 2.2 },
      { x: 0.8, z: 2.2 },
    ];

    patternPositions.forEach(({ x, z }) => {
      const pattern = new THREE.Mesh(patternGeo, patternMat);
      pattern.rotation.x = -Math.PI / 2;
      pattern.position.set(x, 0.065, z);
      this.group.add(pattern);
    });
  }

  public updateDayNight(isNight: boolean): void {
    if (this.starsMaterial) {
      this.starsMaterial.opacity = isNight ? 0.9 : 0;
    }
  }
}
