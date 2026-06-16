import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Room } from './Room';
import { FurnitureFactory } from './Furniture';
import { Pet } from './Pet';
import { LightingSystem } from './Lighting';
import { GridHelper } from './helpers/GridHelper';
import { CollisionDetector } from './helpers/CollisionDetector';
import type { FurnitureInstance, DayTime } from '@/store/types';
import { snapPosition, snapRotation } from '@/utils/snap';
import { FURNITURE_DATA } from '@/data/furniture';

export interface SceneCallbacks {
  onSelectFurniture: (instanceId: string | null) => void;
  onFurnitureMoved: (instanceId: string, position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) => void;
  onCollision: (hasCollision: boolean) => void;
}

export class SceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private orbitControls: OrbitControls;
  private transformControls: TransformControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  private room: Room;
  private furnitureFactory: FurnitureFactory;
  private pet: Pet;
  private lighting: LightingSystem;
  private gridHelper: GridHelper;

  private furnitureMap: Map<string, THREE.Group> = new Map();
  private selectedFurniture: THREE.Group | null = null;
  private ghostFurniture: THREE.Group | null = null;
  private currentDraggedFurnitureId: string | null = null;

  private callbacks: SceneCallbacks;
  private clock: THREE.Clock;
  private animationFrameId: number | null = null;

  private groundPlane: THREE.Mesh;

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfff0f5);
    this.scene.fog = new THREE.Fog(0xfff0f5, 10, 30);

    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(12, 12, 12);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.minDistance = 5;
    this.orbitControls.maxDistance = 25;
    this.orbitControls.maxPolarAngle = Math.PI / 2.2;
    this.orbitControls.target.set(0, 1, 0);

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.orbitControls.enabled = !event.value;
    });
    this.transformControls.addEventListener('objectChange', () => {
      this.handleTransformChange();
    });
    this.scene.add(this.transformControls);

    this.room = new Room();
    this.scene.add(this.room.group);

    this.furnitureFactory = new FurnitureFactory();
    this.pet = new Pet();
    this.scene.add(this.pet.group);

    this.lighting = new LightingSystem();
    this.scene.add(this.lighting.group);

    this.gridHelper = new GridHelper();
    this.scene.add(this.gridHelper.group);

    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshBasicMaterial({ visible: false });
    this.groundPlane = new THREE.Mesh(groundGeo, groundMat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.scene.add(this.groundPlane);

    this.setupEventListeners();
    this.animate();
  }

  private setupEventListeners(): void {
    const canvas = this.renderer.domElement;

    canvas.addEventListener('click', this.handleClick.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('dragover', this.handleDragOver.bind(this));
    canvas.addEventListener('drop', this.handleDrop.bind(this));
    canvas.addEventListener('dragleave', this.handleDragLeave.bind(this));

    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.currentDraggedFurnitureId) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const furnitureMeshes: THREE.Object3D[] = [];
    this.furnitureMap.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          furnitureMeshes.push(child);
        }
      });
    });

    const intersects = this.raycaster.intersectObjects(furnitureMeshes, true);

    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj && !obj.userData.isFurniture) {
        obj = obj.parent;
      }

      if (obj && obj.userData.isFurniture) {
        this.selectFurniture(obj as THREE.Group);
      }
    } else if (this.transformControls.object) {
      this.deselectFurniture();
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.ghostFurniture) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.groundPlane);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const furnitureData = FURNITURE_DATA.find((f) => f.id === this.currentDraggedFurnitureId);
      if (furnitureData) {
        const { x, z } = snapPosition(point.x, point.z, furnitureData.size.width, furnitureData.size.depth);
        this.ghostFurniture.position.set(x, 0, z);

        const hasCollision = this.checkGhostCollision(x, z);
        this.setGhostCollisionState(hasCollision);
      }
    }
  }

  private handleDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private handleDrop(event: DragEvent): void {
    event.preventDefault();
    const furnitureId = event.dataTransfer?.getData('furnitureId');
    if (!furnitureId) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.groundPlane);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const furnitureData = FURNITURE_DATA.find((f) => f.id === furnitureId);
      if (furnitureData) {
        const { x, z } = snapPosition(point.x, point.z, furnitureData.size.width, furnitureData.size.depth);

        const collision = this.checkCollisionAtPosition(
          furnitureId,
          x, z, 0,
          [...this.furnitureMap.keys()]
        );

        if (!collision) {
          this.addFurniture(furnitureId, { x, y: 0, z }, { x: 0, y: 0, z: 0 });
        } else {
          this.callbacks.onCollision(true);
        }
      }
    }

    this.hideGhost();
  }

  private handleDragLeave(): void {
    this.hideGhost();
  }

  private handleResize(): void {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  public getFurnitureInstanceIds(): string[] {
    return [...this.furnitureMap.keys()];
  }

  private handleTransformChange(): void {
    if (!this.selectedFurniture) return;

    const instanceId = this.selectedFurniture.userData.instanceId;
    if (!instanceId) return;

    const pos = this.selectedFurniture.position;
    const rot = this.selectedFurniture.rotation;

    const furnitureData = FURNITURE_DATA.find(
      (f) => f.id === this.selectedFurniture?.userData.furnitureId
    );
    if (furnitureData) {
      const { x, z } = snapPosition(pos.x, pos.z, furnitureData.size.width, furnitureData.size.depth);
      const snappedY = snapRotation(rot.y);

      this.selectedFurniture.position.x = x;
      this.selectedFurniture.position.z = z;
      this.selectedFurniture.rotation.y = snappedY;

      const collision = this.checkCollisionAtPosition(
        this.selectedFurniture.userData.furnitureId,
        x, z, snappedY,
        [...this.furnitureMap.keys()],
        instanceId
      );

      if (!collision) {
        this.callbacks.onFurnitureMoved(
          instanceId,
          { x, y: pos.y, z },
          { x: rot.x, y: snappedY, z: rot.z }
        );
        this.callbacks.onCollision(false);
      } else {
        this.callbacks.onCollision(true);
      }
    }
  }

  public selectFurniture(group: THREE.Group): void {
    if (this.selectedFurniture === group) return;

    this.deselectFurniture();
    this.selectedFurniture = group;
    this.transformControls.attach(group);
    this.callbacks.onSelectFurniture(group.userData.instanceId);
  }

  public deselectFurniture(): void {
    if (this.selectedFurniture) {
      this.transformControls.detach();
      this.selectedFurniture = null;
      this.callbacks.onSelectFurniture(null);
    }
  }

  public setGizmoMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.transformControls.setMode(mode);
  }

  public addFurniture(
    furnitureId: string,
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number },
    instanceId?: string
  ): string {
    const furnitureData = FURNITURE_DATA.find((f) => f.id === furnitureId);
    if (!furnitureData) return '';

    const group = this.furnitureFactory.createFurniture(furnitureId);
    group.position.set(position.x, position.y, position.z);
    group.rotation.set(rotation.x, rotation.y, rotation.z);

    const newInstanceId = instanceId || `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    group.userData.instanceId = newInstanceId;

    this.scene.add(group);
    this.furnitureMap.set(newInstanceId, group);

    if (furnitureData.isLightSource && this.lighting.getIsNight()) {
      this.furnitureFactory.setLightEnabled(group, true);
    }

    return newInstanceId;
  }

  public removeFurniture(instanceId: string): void {
    const group = this.furnitureMap.get(instanceId);
    if (group) {
      if (this.selectedFurniture === group) {
        this.deselectFurniture();
      }
      this.scene.remove(group);
      this.furnitureMap.delete(instanceId);
    }
  }

  public updateFurniture(instanceId: string, updates: Partial<FurnitureInstance>): void {
    const group = this.furnitureMap.get(instanceId);
    if (!group) return;

    if (updates.position) {
      group.position.set(updates.position.x, updates.position.y, updates.position.z);
    }
    if (updates.rotation) {
      group.rotation.set(updates.rotation.x, updates.rotation.y, updates.rotation.z);
    }
    if (updates.scale) {
      group.scale.set(updates.scale.x, updates.scale.y, updates.scale.z);
    }
  }

  public clearAllFurniture(): void {
    this.deselectFurniture();
    this.furnitureMap.forEach((group) => {
      this.scene.remove(group);
    });
    this.furnitureMap.clear();
  }

  public showGhost(furnitureId: string): void {
    this.hideGhost();
    this.currentDraggedFurnitureId = furnitureId;

    const group = this.furnitureFactory.createFurniture(furnitureId);
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x87ceeb,
          transparent: true,
          opacity: 0.5,
        });
      }
    });
    group.userData.isGhost = true;
    this.ghostFurniture = group;
    this.scene.add(group);
  }

  public hideGhost(): void {
    if (this.ghostFurniture) {
      this.scene.remove(this.ghostFurniture);
      this.ghostFurniture = null;
    }
    this.currentDraggedFurnitureId = null;
    this.callbacks.onCollision(false);
  }

  private checkGhostCollision(x: number, z: number): boolean {
    if (!this.currentDraggedFurnitureId) return false;

    return this.checkCollisionAtPosition(
      this.currentDraggedFurnitureId,
      x, z, 0,
      [...this.furnitureMap.keys()]
    );
  }

  private checkCollisionAtPosition(
    furnitureId: string,
    x: number,
    z: number,
    rotation: number,
    existingInstanceIds: string[],
    excludeInstanceId?: string
  ): boolean {
    const furnitureData = FURNITURE_DATA.find((f) => f.id === furnitureId);
    if (!furnitureData) return false;

    const newItem = {
      instanceId: 'new',
      position: { x, y: 0, z },
      size: furnitureData.size,
      rotation,
    };

    const existingItems = existingInstanceIds
      .filter((id) => id !== excludeInstanceId)
      .map((id) => {
        const group = this.furnitureMap.get(id);
        const data = FURNITURE_DATA.find((f) => f.id === group?.userData.furnitureId);
        return {
          instanceId: id,
          position: {
            x: group?.position.x || 0,
            y: group?.position.y || 0,
            z: group?.position.z || 0,
          },
          size: data?.size || { width: 1, depth: 1, height: 1 },
          rotation: group?.rotation.y || 0,
        };
      });

    return CollisionDetector.checkAllCollisions(newItem, existingItems) !== null;
  }

  private setGhostCollisionState(hasCollision: boolean): void {
    if (!this.ghostFurniture) return;

    this.ghostFurniture.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        child.material.color.setHex(hasCollision ? 0xff6b6b : 0x87ceeb);
      }
    });

    this.callbacks.onCollision(hasCollision);
  }

  public setGridVisible(visible: boolean): void {
    this.gridHelper.setVisible(visible);
  }

  public setDayTime(time: DayTime): void {
    const isNight = time === 'night';

    if (isNight && !this.lighting.getIsNight()) {
      const bedInstances = [...this.furnitureMap.entries()].filter(
        ([_, group]) => group.userData.furnitureId === 'round-bed'
      );

      if (bedInstances.length > 0) {
        const [, bedGroup] = bedInstances[0];
        const petPos = this.pet.getPosition();
        const bedData = FURNITURE_DATA.find((f) => f.id === 'round-bed');
        if (bedData && this.pet.isOnBed(
          { x: bedGroup.position.x, z: bedGroup.position.z },
          bedData.size
        )) {
          this.pet.playYawn();
        }
      }
    }

    this.lighting.setNight(isNight);
    this.room.setNightMode(isNight);

    this.furnitureMap.forEach((group, instanceId) => {
      const data = FURNITURE_DATA.find((f) => f.id === group.userData.furnitureId);
      if (data?.isLightSource) {
        this.furnitureFactory.setLightEnabled(group, isNight);
      }
    });

    this.scene.background = new THREE.Color(isNight ? 0x1a1a2e : 0xfff0f5);
    if (this.scene.fog) {
      (this.scene.fog as THREE.Fog).color.setHex(isNight ? 0x1a1a2e : 0xfff0f5);
    }
  }

  public setTopView(): void {
    this.camera.position.set(0, 20, 0.01);
    this.camera.lookAt(0, 0, 0);
    this.orbitControls.update();
  }

  public setPerspectiveView(): void {
    this.camera.position.set(12, 12, 12);
    this.camera.lookAt(0, 0, 0);
    this.orbitControls.target.set(0, 1, 0);
    this.orbitControls.update();
  }

  private animate(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const deltaTime = Math.min(this.clock.getDelta(), 0.1);

    this.lighting.update(deltaTime);

    const furniturePositions = [...this.furnitureMap.entries()].map(([id, group]) => ({
      x: group.position.x,
      z: group.position.z,
      furnitureId: group.userData.furnitureId,
    }));

    this.pet.update(deltaTime, furniturePositions);

    this.orbitControls.update();

    if (this.transformControls.object) {
      const selected = this.transformControls.object as THREE.Group;
      const furnitureData = FURNITURE_DATA.find(
        (f) => f.id === selected.userData.furnitureId
      );
      if (furnitureData) {
        const collision = this.checkCollisionAtPosition(
          selected.userData.furnitureId,
          selected.position.x,
          selected.position.z,
          selected.rotation.y,
          [...this.furnitureMap.keys()],
          selected.userData.instanceId
        );
        this.callbacks.onCollision(collision);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  public getPetAnimation(): string {
    return this.pet.getCurrentAnimation();
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}
