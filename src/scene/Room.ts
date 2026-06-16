import * as THREE from 'three';
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT } from '@/store/types';

export class Room {
  public group: THREE.Group;
  private wallMaterial: THREE.MeshStandardMaterial;
  private floorMaterial: THREE.MeshStandardMaterial;
  private ceilingMaterial: THREE.MeshStandardMaterial;
  private windowStars: THREE.Points | null = null;
  private windowGlassMaterial: THREE.MeshStandardMaterial | null = null;

  private readonly DOOR_WIDTH = 1.6;
  private readonly DOOR_HEIGHT = 2.4;
  private readonly DOOR_POS_X = ROOM_WIDTH / 2 - 1.5;
  private readonly DOOR_POS_Z = -ROOM_DEPTH / 2;

  private readonly WINDOW_WIDTH = 2.4;
  private readonly WINDOW_HEIGHT = 1.6;
  private readonly WINDOW_CENTER_X = -2.5;
  private readonly WINDOW_CENTER_Y = 2.2;
  private readonly WINDOW_CENTER_Z = -ROOM_DEPTH / 2;

  constructor() {
    this.group = new THREE.Group();

    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff0f5,
      roughness: 0.88,
      metalness: 0.03,
      side: THREE.FrontSide,
    });

    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d5c4,
      roughness: 0.92,
      metalness: 0.03,
    });

    this.ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.96,
      metalness: 0,
    });

    this.createRoom();
  }

  private createRoom() {
    const wallThickness = 0.3;
    const cornerRadius = 0.8;

    const floorGeo = new THREE.BoxGeometry(ROOM_WIDTH + wallThickness * 2, 0.2, ROOM_DEPTH + wallThickness * 2);
    const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    this.group.add(floor);

    this.createBackWallWithDoorAndWindow(wallThickness);
    this.createLeftWall(wallThickness);
    this.createRightWall(wallThickness);

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

  private createBackWallWithDoorAndWindow(wallThickness: number) {
    const wallZ = -ROOM_DEPTH / 2 + wallThickness / 2;

    const doorLeft = this.DOOR_POS_X - this.DOOR_WIDTH / 2;
    const doorRight = this.DOOR_POS_X + this.DOOR_WIDTH / 2;
    const doorTop = this.DOOR_HEIGHT;

    const winLeft = this.WINDOW_CENTER_X - this.WINDOW_WIDTH / 2;
    const winRight = this.WINDOW_CENTER_X + this.WINDOW_WIDTH / 2;
    const winBottom = this.WINDOW_CENTER_Y - this.WINDOW_HEIGHT / 2;
    const winTop = this.WINDOW_CENTER_Y + this.WINDOW_HEIGHT / 2;

    const xSegments: Array<[number, number]> = [];
    let cursor = -ROOM_WIDTH / 2;
    const cuts = [doorLeft, doorRight, winLeft, winRight].sort((a, b) => a - b);

    for (const cut of cuts) {
      if (cut > cursor) {
        xSegments.push([cursor, cut]);
      }
      cursor = cut;
    }
    if (cursor < ROOM_WIDTH / 2) {
      xSegments.push([cursor, ROOM_WIDTH / 2]);
    }

    xSegments.forEach(([xStart, xEnd]) => {
      const segWidth = xEnd - xStart;
      if (segWidth <= 0) return;
      const xCenter = (xStart + xEnd) / 2;

      const inDoorRange = xEnd <= doorRight && xStart >= doorLeft;
      const inWinRange = xEnd <= winRight && xStart >= winLeft;

      if (inDoorRange) {
        if (doorTop < ROOM_HEIGHT) {
          const aboveH = ROOM_HEIGHT - doorTop;
          const seg = new THREE.Mesh(
            new THREE.BoxGeometry(segWidth, aboveH, wallThickness),
            this.wallMaterial
          );
          seg.position.set(xCenter, doorTop + aboveH / 2, wallZ);
          seg.receiveShadow = true;
          seg.castShadow = true;
          this.group.add(seg);
        }
      } else if (inWinRange) {
        if (winBottom > 0) {
          const belowH = winBottom;
          const seg = new THREE.Mesh(
            new THREE.BoxGeometry(segWidth, belowH, wallThickness),
            this.wallMaterial
          );
          seg.position.set(xCenter, belowH / 2, wallZ);
          seg.receiveShadow = true;
          seg.castShadow = true;
          this.group.add(seg);
        }
        if (winTop < ROOM_HEIGHT) {
          const aboveH = ROOM_HEIGHT - winTop;
          const seg = new THREE.Mesh(
            new THREE.BoxGeometry(segWidth, aboveH, wallThickness),
            this.wallMaterial
          );
          seg.position.set(xCenter, winTop + aboveH / 2, wallZ);
          seg.receiveShadow = true;
          seg.castShadow = true;
          this.group.add(seg);
        }
      } else {
        const overlapsDoor = !(xEnd <= doorLeft || xStart >= doorRight);
        const overlapsWin = !(xEnd <= winLeft || xStart >= winRight);

        if (!overlapsDoor && !overlapsWin) {
          const seg = new THREE.Mesh(
            new THREE.BoxGeometry(segWidth, ROOM_HEIGHT, wallThickness),
            this.wallMaterial
          );
          seg.position.set(xCenter, ROOM_HEIGHT / 2, wallZ);
          seg.receiveShadow = true;
          seg.castShadow = true;
          this.group.add(seg);
        } else if (overlapsDoor) {
          const effDoorLeft = Math.max(doorLeft, xStart);
          const effDoorRight = Math.min(doorRight, xEnd);

          const leftPartW = effDoorLeft - xStart;
          if (leftPartW > 0) {
            const seg = new THREE.Mesh(
              new THREE.BoxGeometry(leftPartW, ROOM_HEIGHT, wallThickness),
              this.wallMaterial
            );
            seg.position.set(xStart + leftPartW / 2, ROOM_HEIGHT / 2, wallZ);
            seg.receiveShadow = true;
            seg.castShadow = true;
            this.group.add(seg);
          }

          if (doorTop < ROOM_HEIGHT) {
            const aboveW = effDoorRight - effDoorLeft;
            const aboveH = ROOM_HEIGHT - doorTop;
            if (aboveW > 0) {
              const seg = new THREE.Mesh(
                new THREE.BoxGeometry(aboveW, aboveH, wallThickness),
                this.wallMaterial
              );
              seg.position.set((effDoorLeft + effDoorRight) / 2, doorTop + aboveH / 2, wallZ);
              seg.receiveShadow = true;
              seg.castShadow = true;
              this.group.add(seg);
            }
          }

          const rightPartW = xEnd - effDoorRight;
          if (rightPartW > 0) {
            const seg = new THREE.Mesh(
              new THREE.BoxGeometry(rightPartW, ROOM_HEIGHT, wallThickness),
              this.wallMaterial
            );
            seg.position.set(effDoorRight + rightPartW / 2, ROOM_HEIGHT / 2, wallZ);
            seg.receiveShadow = true;
            seg.castShadow = true;
            this.group.add(seg);
          }
        } else if (overlapsWin) {
          const effWinLeft = Math.max(winLeft, xStart);
          const effWinRight = Math.min(winRight, xEnd);

          const leftPartW = effWinLeft - xStart;
          if (leftPartW > 0) {
            const seg = new THREE.Mesh(
              new THREE.BoxGeometry(leftPartW, ROOM_HEIGHT, wallThickness),
              this.wallMaterial
            );
            seg.position.set(xStart + leftPartW / 2, ROOM_HEIGHT / 2, wallZ);
            seg.receiveShadow = true;
            seg.castShadow = true;
            this.group.add(seg);
          }

          const midW = effWinRight - effWinLeft;
          if (midW > 0) {
            if (winBottom > 0) {
              const seg = new THREE.Mesh(
                new THREE.BoxGeometry(midW, winBottom, wallThickness),
                this.wallMaterial
              );
              seg.position.set((effWinLeft + effWinRight) / 2, winBottom / 2, wallZ);
              seg.receiveShadow = true;
              seg.castShadow = true;
              this.group.add(seg);
            }
            if (winTop < ROOM_HEIGHT) {
              const aboveH = ROOM_HEIGHT - winTop;
              const seg = new THREE.Mesh(
                new THREE.BoxGeometry(midW, aboveH, wallThickness),
                this.wallMaterial
              );
              seg.position.set((effWinLeft + effWinRight) / 2, winTop + aboveH / 2, wallZ);
              seg.receiveShadow = true;
              seg.castShadow = true;
              this.group.add(seg);
            }
          }

          const rightPartW = xEnd - effWinRight;
          if (rightPartW > 0) {
            const seg = new THREE.Mesh(
              new THREE.BoxGeometry(rightPartW, ROOM_HEIGHT, wallThickness),
              this.wallMaterial
            );
            seg.position.set(effWinRight + rightPartW / 2, ROOM_HEIGHT / 2, wallZ);
            seg.receiveShadow = true;
            seg.castShadow = true;
            this.group.add(seg);
          }
        }
      }
    });
  }

  private createLeftWall(wallThickness: number) {
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, ROOM_HEIGHT, ROOM_DEPTH),
      this.wallMaterial
    );
    leftWall.position.set(-ROOM_WIDTH / 2 + wallThickness / 2, ROOM_HEIGHT / 2, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    this.group.add(leftWall);
  }

  private createRightWall(wallThickness: number) {
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, ROOM_HEIGHT, ROOM_DEPTH),
      this.wallMaterial
    );
    rightWall.position.set(ROOM_WIDTH / 2 - wallThickness / 2, ROOM_HEIGHT / 2, 0);
    rightWall.receiveShadow = true;
    rightWall.castShadow = true;
    this.group.add(rightWall);
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
    const baseboardHeight = 0.1;
    const baseboardDepth = 0.025;
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.82,
    });

    const backBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(ROOM_WIDTH, baseboardHeight, baseboardDepth),
      baseboardMat
    );
    backBaseboard.position.set(0, baseboardHeight / 2, -ROOM_DEPTH / 2 + 0.16);
    this.group.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardDepth, baseboardHeight, ROOM_DEPTH),
      baseboardMat
    );
    leftBaseboard.position.set(-ROOM_WIDTH / 2 + 0.16, baseboardHeight / 2, 0);
    this.group.add(leftBaseboard);

    const rightBaseboard = new THREE.Mesh(
      new THREE.BoxGeometry(baseboardDepth, baseboardHeight, ROOM_DEPTH),
      baseboardMat
    );
    rightBaseboard.position.set(ROOM_WIDTH / 2 - 0.16, baseboardHeight / 2, 0);
    this.group.add(rightBaseboard);
  }

  private createDoor() {
    const doorWidth = this.DOOR_WIDTH;
    const doorHeight = this.DOOR_HEIGHT;
    const wallThickness = 0.3;
    const doorX = this.DOOR_POS_X;
    const doorZ = -ROOM_DEPTH / 2 + wallThickness / 2;

    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.72 });

    const frameT = 0.1;
    const frameD = wallThickness + 0.1;

    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameT, doorHeight, frameD),
      doorFrameMat
    );
    leftFrame.position.set(doorX - doorWidth / 2 + frameT / 2, doorHeight / 2, doorZ);
    leftFrame.castShadow = true;
    this.group.add(leftFrame);

    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameT, doorHeight, frameD),
      doorFrameMat
    );
    rightFrame.position.set(doorX + doorWidth / 2 - frameT / 2, doorHeight / 2, doorZ);
    rightFrame.castShadow = true;
    this.group.add(rightFrame);

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth, frameT, frameD),
      doorFrameMat
    );
    topFrame.position.set(doorX, doorHeight - frameT / 2, doorZ);
    topFrame.castShadow = true;
    this.group.add(topFrame);

    const doorMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.62 });
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth - frameT * 2, doorHeight - frameT - 0.01, 0.06),
      doorMat
    );
    door.position.set(doorX, (doorHeight - frameT - 0.01) / 2, doorZ + wallThickness / 2 + 0.03);
    door.castShadow = true;
    door.receiveShadow = true;
    this.group.add(door);

    const knobGeo = new THREE.SphereGeometry(0.055, 16, 16);
    const knobMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.18,
    });
    const knob = new THREE.Mesh(knobGeo, knobMat);
    knob.position.set(doorX - doorWidth / 2 + 0.32, doorHeight / 2, doorZ + wallThickness / 2 + 0.11);
    this.group.add(knob);

    const panelW = (doorWidth - frameT * 2 - 0.35) / 2;
    const panelH = (doorHeight - frameT - 0.45) / 2;
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xa0522d,
      roughness: 0.58,
    });

    const panelPts = [
      { x: doorX - panelW / 2 - 0.1, y: panelH / 2 + 0.14 },
      { x: doorX + panelW / 2 + 0.1, y: panelH / 2 + 0.14 },
      { x: doorX - panelW / 2 - 0.1, y: doorHeight / 2 + panelH / 2 + 0.04 },
      { x: doorX + panelW / 2 + 0.1, y: doorHeight / 2 + panelH / 2 + 0.04 },
    ];

    panelPts.forEach(({ x, y }) => {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW, panelH, 0.018),
        panelMat
      );
      panel.position.set(x, y, doorZ + wallThickness / 2 + 0.07);
      this.group.add(panel);
    });
  }

  private createWindow() {
    const windowWidth = this.WINDOW_WIDTH;
    const windowHeight = this.WINDOW_HEIGHT;
    const windowX = this.WINDOW_CENTER_X;
    const windowY = this.WINDOW_CENTER_Y;
    const wallThickness = 0.3;
    const windowZ = -ROOM_DEPTH / 2 + wallThickness / 2;

    const windowFrameMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.32,
    });

    const frameT = 0.1;
    const frameD = wallThickness + 0.1;

    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + frameT * 2, frameT, frameD),
      windowFrameMat
    );
    topFrame.position.set(windowX, windowY + windowHeight / 2 + frameT / 2, windowZ);
    this.group.add(topFrame);

    const bottomFrame = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + frameT * 2, frameT, frameD),
      windowFrameMat
    );
    bottomFrame.position.set(windowX, windowY - windowHeight / 2 - frameT / 2, windowZ);
    this.group.add(bottomFrame);

    const leftFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameT, windowHeight + frameT * 2, frameD),
      windowFrameMat
    );
    leftFrame.position.set(windowX - windowWidth / 2 - frameT / 2, windowY, windowZ);
    this.group.add(leftFrame);

    const rightFrame = new THREE.Mesh(
      new THREE.BoxGeometry(frameT, windowHeight + frameT * 2, frameD),
      windowFrameMat
    );
    rightFrame.position.set(windowX + windowWidth / 2 + frameT / 2, windowY, windowZ);
    this.group.add(rightFrame);

    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0xb0e0e6,
      transparent: true,
      opacity: 0.6,
      roughness: 0.06,
      metalness: 0.38,
    });
    this.windowGlassMaterial = windowGlassMat;
    const windowGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(windowWidth, windowHeight),
      windowGlassMat
    );
    windowGlass.position.set(windowX, windowY, windowZ + wallThickness / 2 + 0.005);
    this.group.add(windowGlass);

    const crossH = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth, 0.055, 0.07),
      windowFrameMat
    );
    crossH.position.set(windowX, windowY, windowZ + wallThickness / 2 + 0.045);
    this.group.add(crossH);

    const crossV = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, windowHeight, 0.07),
      windowFrameMat
    );
    crossV.position.set(windowX, windowY, windowZ + wallThickness / 2 + 0.045);
    this.group.add(crossV);

    const starsGeo = new THREE.BufferGeometry();
    const starPts: number[] = [];
    for (let i = 0; i < 28; i++) {
      starPts.push(
        windowX - windowWidth / 2 + 0.3 + Math.random() * (windowWidth - 0.6),
        windowY - windowHeight / 2 + 0.3 + Math.random() * (windowHeight - 0.6),
        windowZ + wallThickness / 2 + 0.015
      );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPts, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffffaa,
      size: 0.075,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starsGeo, starsMat);
    this.windowStars = stars;
    this.group.add(stars);

    const sillMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
    });
    const sill = new THREE.Mesh(
      new THREE.BoxGeometry(windowWidth + 0.45, 0.07, 0.32),
      sillMat
    );
    sill.position.set(windowX, windowY - windowHeight / 2 - frameT - 0.035, windowZ + wallThickness / 2 + 0.11);
    sill.castShadow = true;
    this.group.add(sill);
  }

  private createCarpet() {
    const w = 5;
    const h = 4;
    const r = 0.55;

    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
    });

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffb6c1,
      roughness: 0.96,
    });
    const carpet = new THREE.Mesh(geo, mat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.004, 1.5);
    carpet.receiveShadow = true;
    this.group.add(carpet);

    const heartS = 0.28;
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, heartS * 0.5);
    heartShape.bezierCurveTo(0, heartS * 0.5, -heartS * 0.5, 0, -heartS * 0.5, -heartS * 0.2);
    heartShape.bezierCurveTo(-heartS * 0.5, -heartS * 0.5, -heartS * 0.25, -heartS * 0.5, 0, -heartS * 0.25);
    heartShape.bezierCurveTo(heartS * 0.25, -heartS * 0.5, heartS * 0.5, -heartS * 0.5, heartS * 0.5, -heartS * 0.2);
    heartShape.bezierCurveTo(heartS * 0.5, 0, 0, heartS * 0.5, 0, heartS * 0.5);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.01, bevelEnabled: false });
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xff91a3,
      roughness: 0.92,
    });

    const heartPts = [
      { x: -1.1, z: 0.4 },
      { x: 1.1, z: 0.4 },
      { x: 0, z: 2.4 },
      { x: -0.7, z: 2.1 },
      { x: 0.7, z: 2.1 },
    ];

    heartPts.forEach(({ x, z }) => {
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.rotation.x = -Math.PI / 2;
      heart.position.set(x, 0.055, z);
      this.group.add(heart);
    });
  }

  public updateNightMode(isNight: boolean, progress: number = 1) {
    if (this.windowStars) {
      const mat = this.windowStars.material as THREE.PointsMaterial;
      mat.opacity = isNight ? progress * 0.95 : (1 - progress) * 0.95;
    }
    if (this.windowGlassMaterial) {
      this.windowGlassMaterial.opacity = isNight
        ? 0.25 + (1 - progress) * 0.35
        : 0.6;
      this.windowGlassMaterial.color.set(isNight ? 0x2c3e6b : 0xb0e0e6);
      this.windowGlassMaterial.needsUpdate = true;
    }
  }
}
