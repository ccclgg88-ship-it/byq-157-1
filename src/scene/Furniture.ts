import * as THREE from 'three';
import { FURNITURE_DATA } from '@/data/furniture';
import type { FurnitureItem } from '@/store/types';

export class FurnitureFactory {
  private cache: Map<string, THREE.Group> = new Map();

  public createFurniture(furnitureId: string): THREE.Group {
    const cached = this.cache.get(furnitureId);
    if (cached) {
      return cached.clone() as THREE.Group;
    }

    const furnitureData = FURNITURE_DATA.find((f) => f.id === furnitureId);
    if (!furnitureData) {
      throw new Error(`Furniture not found: ${furnitureId}`);
    }

    const group = this.createFurnitureMesh(furnitureData);
    group.userData.furnitureId = furnitureId;
    group.userData.isFurniture = true;
    group.userData.size = furnitureData.size;

    this.cache.set(furnitureId, group);
    return group.clone() as THREE.Group;
  }

  private createFurnitureMesh(data: FurnitureItem): THREE.Group {
    const group = new THREE.Group();
    const color = new THREE.Color(data.color);

    switch (data.id) {
      case 'round-bed':
        return this.createRoundBed(color);
      case 'sleeping-pad':
        return this.createSleepingPad(color);
      case 'cat-tree':
        return this.createCatTree(color);
      case 'food-bowl':
        return this.createFoodBowl(color);
      case 'water-fountain':
        return this.createWaterFountain(color);
      case 'ball-toy':
        return this.createBallToy(color);
      case 'mouse-toy':
        return this.createMouseToy(color);
      case 'star-light':
        return this.createStarLight(color);
      case 'heart-rug':
        return this.createHeartRug(color);
      case 'plant-pot':
        return this.createPlantPot(color);
      case 'bookshelf':
        return this.createBookshelf(color);
      case 'cushion':
        return this.createCushion(color);
      case 'treat-jar':
        return this.createTreatJar(color);
      case 'tunnel':
        return this.createTunnel(color);
      case 'moon-light':
        return this.createMoonLight(color);
      case 'feather-toy':
        return this.createFeatherToy(color);
      default:
        return this.createGenericBox(color, data.size.width, data.size.height, data.size.depth);
    }
  }

  private createRoundBed(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const bedGeo = new THREE.CylinderGeometry(1, 1, 0.4, 32);
    const bedMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const bed = new THREE.Mesh(bedGeo, bedMat);
    bed.position.y = 0.2;
    bed.castShadow = true;
    bed.receiveShadow = true;
    group.add(bed);

    const pillowGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(0, 0.47, -0.5);
    pillow.rotation.x = Math.PI / 6;
    pillow.castShadow = true;
    group.add(pillow);

    const blanketGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.1, 32);
    const blanketMat = new THREE.MeshStandardMaterial({ color: 0xe6e6fa, roughness: 0.6 });
    const blanket = new THREE.Mesh(blanketGeo, blanketMat);
    blanket.position.set(0, 0.45, 0.2);
    blanket.castShadow = true;
    group.add(blanket);

    return group;
  }

  private createSleepingPad(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const padGeo = new THREE.BoxGeometry(1.5, 0.15, 1);
    const padMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = 0.075;
    pad.castShadow = true;
    pad.receiveShadow = true;
    group.add(pad);

    const borderGeo = new THREE.TorusGeometry(0.6, 0.08, 8, 16, Math.PI);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xffdab9, roughness: 0.8 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.rotation.x = -Math.PI / 2;
    border.position.set(0, 0.15, 0);
    border.castShadow = true;
    group.add(border);

    return group;
  }

  private createCatTree(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.1, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.05;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.5, 12);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.9 });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.y = 1.35;
    post.castShadow = true;
    group.add(post);

    const platform1Geo = new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16);
    const platform1Mat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.7 });
    const platform1 = new THREE.Mesh(platform1Geo, platform1Mat);
    platform1.position.y = 1;
    platform1.castShadow = true;
    group.add(platform1);

    const platform2Geo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
    const platform2Mat = new THREE.MeshStandardMaterial({ color: 0xb0e0e6, roughness: 0.7 });
    const platform2 = new THREE.Mesh(platform2Geo, platform2Mat);
    platform2.position.y = 2.3;
    platform2.castShadow = true;
    group.add(platform2);

    const ballGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: 0xff69b4, roughness: 0.5 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.set(0.4, 2.5, 0);
    ball.castShadow = true;
    group.add(ball);

    return group;
  }

  private createFoodBowl(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const bowlGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.12, 32);
    const bowlMat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.y = 0.06;
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    group.add(bowl);

    const innerGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.05, 32);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.position.y = 0.12;
    group.add(inner);

    return group;
  }

  private createWaterFountain(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const baseGeo = new THREE.BoxGeometry(0.6, 0.3, 0.4);
    const baseMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.15;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    const topGeo = new THREE.BoxGeometry(0.4, 0.2, 0.3);
    const topMat = new THREE.MeshStandardMaterial({ color: 0xadd8e6, transparent: true, opacity: 0.7, roughness: 0.2 });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 0.4;
    top.castShadow = true;
    group.add(top);

    const dropGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const dropMat = new THREE.MeshBasicMaterial({ color: 0x87ceeb });
    const drop = new THREE.Mesh(dropGeo, dropMat);
    drop.position.set(0, 0.35, 0.16);
    group.add(drop);

    return group;
  }

  private createBallToy(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const ballGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    ball.position.y = 0.2;
    ball.castShadow = true;
    group.add(ball);

    const lineGeo = new THREE.TorusGeometry(0.15, 0.02, 8, 16);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.y = 0.2;
    line.rotation.x = Math.PI / 2;
    group.add(line);

    return group;
  }

  private createMouseToy(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const bodyGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.scale.set(1.5, 1, 1);
    body.position.y = 0.075;
    body.castShadow = true;
    group.add(body);

    const earGeo = new THREE.ConeGeometry(0.04, 0.08, 8);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.7 });
    const ear1 = new THREE.Mesh(earGeo, earMat);
    ear1.position.set(-0.1, 0.15, 0.05);
    ear1.rotation.z = Math.PI / 6;
    group.add(ear1);

    const ear2 = ear1.clone();
    ear2.position.set(-0.1, 0.15, -0.05);
    ear2.rotation.z = -Math.PI / 6;
    group.add(ear2);

    const noseGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xff69b4 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(-0.15, 0.08, 0);
    group.add(nose);

    const tailGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 8);
    const tailMat = new THREE.MeshStandardMaterial({ color: 0x696969 });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    tail.position.set(0.15, 0.08, 0);
    tail.rotation.z = Math.PI / 3;
    group.add(tail);

    return group;
  }

  private createStarLight(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const starShape = new THREE.Shape();
    const outerRadius = 0.25;
    const innerRadius = 0.12;
    const points = 5;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) starShape.moveTo(x, y);
      else starShape.lineTo(x, y);
    }
    starShape.closePath();

    const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 };
    const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const starMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0,
      roughness: 0.3,
    });
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.y = 0.3;
    star.castShadow = true;
    group.add(star);
    group.userData.emissiveMaterial = starMat;

    const light = new THREE.PointLight(0xffd700, 0, 3);
    light.position.y = 0.3;
    group.add(light);
    group.userData.pointLight = light;

    const standGeo = new THREE.CylinderGeometry(0.03, 0.05, 0.2, 12);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 0.1;
    stand.castShadow = true;
    group.add(stand);

    const baseGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.05, 16);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.025;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    return group;
  }

  private createHeartRug(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x, y + 0.5);
    heartShape.bezierCurveTo(x, y + 0.5, x - 0.5, y, x - 0.5, y - 0.2);
    heartShape.bezierCurveTo(x - 0.5, y - 0.5, x - 0.25, y - 0.5, x, y - 0.25);
    heartShape.bezierCurveTo(x + 0.25, y - 0.5, x + 0.5, y - 0.5, x + 0.5, y - 0.2);
    heartShape.bezierCurveTo(x + 0.5, y, x, y + 0.5, x, y + 0.5);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01,
    });
    heartGeo.scale(2, 2, 1);
    const heartMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.rotation.x = -Math.PI / 2;
    heart.position.set(0, 0.01, 0);
    heart.receiveShadow = true;
    group.add(heart);

    return group;
  }

  private createPlantPot(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const potGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.3, 16);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.8 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.15;
    pot.castShadow = true;
    pot.receiveShadow = true;
    group.add(pot);

    const soilGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 16);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 0.32;
    group.add(soil);

    const leafGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const leafMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.position.y = 0.7;
    leaves.scale.set(1.2, 1.5, 1.2);
    leaves.castShadow = true;
    group.add(leaves);

    for (let i = 0; i < 5; i++) {
      const leaf2 = new THREE.Mesh(leafGeo, leafMat);
      const angle = (i / 5) * Math.PI * 2;
      leaf2.position.set(Math.cos(angle) * 0.15, 0.8, Math.sin(angle) * 0.15);
      leaf2.scale.set(0.6, 0.8, 0.6);
      leaf2.castShadow = true;
      group.add(leaf2);
    }

    return group;
  }

  private createBookshelf(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const sideGeo = new THREE.BoxGeometry(0.1, 1.8, 0.4);
    const sideMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const leftSide = new THREE.Mesh(sideGeo, sideMat);
    leftSide.position.set(-0.7, 0.9, 0);
    leftSide.castShadow = true;
    group.add(leftSide);
    const rightSide = leftSide.clone();
    rightSide.position.set(0.7, 0.9, 0);
    group.add(rightSide);

    for (let i = 0; i < 4; i++) {
      const shelfGeo = new THREE.BoxGeometry(1.3, 0.05, 0.38);
      const shelfMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
      const shelf = new THREE.Mesh(shelfGeo, shelfMat);
      shelf.position.set(0, 0.4 + i * 0.45, 0);
      shelf.castShadow = true;
      group.add(shelf);

      if (i < 3) {
        for (let j = 0; j < 4; j++) {
          const bookGeo = new THREE.BoxGeometry(0.15, 0.3, 0.25);
          const bookColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.6);
          const bookMat = new THREE.MeshStandardMaterial({ color: bookColor, roughness: 0.8 });
          const book = new THREE.Mesh(bookGeo, bookMat);
          book.position.set(-0.4 + j * 0.3, 0.6 + i * 0.45, 0);
          book.castShadow = true;
          group.add(book);
        }
      }
    }

    const backGeo = new THREE.BoxGeometry(1.5, 1.8, 0.05);
    const backMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.set(0, 0.9, -0.17);
    back.castShadow = true;
    group.add(back);

    return group;
  }

  private createCushion(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const cushionGeo = new THREE.BoxGeometry(1, 0.2, 1);
    const cushionMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.y = 0.1;
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    group.add(cushion);

    const stitchGeo = new THREE.TorusGeometry(0.35, 0.02, 8, 32);
    const stitchMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
    const stitch = new THREE.Mesh(stitchGeo, stitchMat);
    stitch.rotation.x = -Math.PI / 2;
    stitch.position.y = 0.21;
    group.add(stitch);

    return group;
  }

  private createTreatJar(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const jarGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.5, 16);
    const jarMat = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.7,
      roughness: 0.2,
    });
    const jar = new THREE.Mesh(jarGeo, jarMat);
    jar.position.y = 0.25;
    jar.castShadow = true;
    group.add(jar);

    const lidGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 16);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.6 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.55;
    lid.castShadow = true;
    group.add(lid);

    for (let i = 0; i < 8; i++) {
      const cookieGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const cookieMat = new THREE.MeshStandardMaterial({ color: 0xd2691e, roughness: 0.8 });
      const cookie = new THREE.Mesh(cookieGeo, cookieMat);
      const angle = (i / 8) * Math.PI * 2;
      cookie.position.set(Math.cos(angle) * 0.1, 0.1, Math.sin(angle) * 0.1);
      cookie.castShadow = true;
      group.add(cookie);
    }

    return group;
  }

  private createTunnel(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const tunnelGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
    const tunnelMat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat);
    tunnel.rotation.z = Math.PI / 2;
    tunnel.position.set(0, 0.3, 0);
    tunnel.castShadow = true;
    tunnel.receiveShadow = true;
    group.add(tunnel);

    const holeGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.52, 16);
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const hole = new THREE.Mesh(holeGeo, holeMat);
    hole.rotation.z = Math.PI / 2;
    hole.position.set(0, 0.3, 0);
    group.add(hole);

    for (let i = 0; i < 6; i++) {
      const stripeAngle = (i / 6) * Math.PI;
      const stripeGeo = new THREE.TorusGeometry(0.3, 0.02, 8, 32);
      const stripeColor = new THREE.Color().setHSL((i / 6), 0.8, 0.7);
      const stripeMat = new THREE.MeshStandardMaterial({ color: stripeColor, roughness: 0.7 });
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(-0.6 + i * 0.25, 0.3, 0);
      stripe.rotation.y = Math.PI / 2;
      group.add(stripe);
    }

    return group;
  }

  private createMoonLight(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const moonGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const moonMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0,
      roughness: 0.5,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.y = 0.4;
    moon.castShadow = true;
    group.add(moon);
    group.userData.emissiveMaterial = moonMat;

    const light = new THREE.PointLight(0xf0e68c, 0, 3);
    light.position.y = 0.4;
    group.add(light);
    group.userData.pointLight = light;

    const standGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.3, 12);
    const standMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.4 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = 0.15;
    stand.castShadow = true;
    group.add(stand);

    const baseGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.05, 16);
    const base = new THREE.Mesh(baseGeo, standMat);
    base.position.y = 0.025;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    return group;
  }

  private createFeatherToy(color: THREE.Color): THREE.Group {
    const group = new THREE.Group();

    const stickGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.7 });
    const stick = new THREE.Mesh(stickGeo, stickMat);
    stick.position.y = 0.5;
    stick.castShadow = true;
    group.add(stick);

    for (let i = 0; i < 5; i++) {
      const featherGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const featherMat = new THREE.MeshStandardMaterial({ color, roughness: 0.6 });
      const feather = new THREE.Mesh(featherGeo, featherMat);
      const angle = (i / 5) * Math.PI * 2;
      feather.position.set(Math.cos(angle) * 0.05, 1.05, Math.sin(angle) * 0.05);
      feather.scale.set(0.5, 2, 0.5);
      feather.rotation.x = Math.PI / 4;
      feather.castShadow = true;
      group.add(feather);
    }

    const stringGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.15, 8);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.y = 1.1;
    group.add(string);

    return group;
  }

  private createGenericBox(
    color: THREE.Color,
    width: number,
    height: number,
    depth: number
  ): THREE.Group {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  public setLightEnabled(group: THREE.Group, enabled: boolean): void {
    const pointLight = group.userData.pointLight as THREE.PointLight;
    const emissiveMaterial = group.userData.emissiveMaterial as THREE.MeshStandardMaterial;

    if (pointLight) {
      pointLight.intensity = enabled ? 1 : 0;
    }
    if (emissiveMaterial) {
      emissiveMaterial.emissiveIntensity = enabled ? 0.8 : 0;
    }
  }

  public getSize(furnitureId: string): { width: number; depth: number; height: number } {
    const data = FURNITURE_DATA.find((f) => f.id === furnitureId);
    return data?.size || { width: 1, depth: 1, height: 1 };
  }
}
