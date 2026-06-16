import * as THREE from 'three';
import { GRID_SIZE, ROOM_WIDTH, ROOM_DEPTH } from '@/store/types';

export class GridHelper {
  public group: THREE.Group;
  private gridHelper: THREE.GridHelper;
  private isVisible: boolean = true;

  constructor() {
    this.group = new THREE.Group();

    this.gridHelper = new THREE.GridHelper(
      ROOM_WIDTH,
      ROOM_WIDTH / GRID_SIZE,
      0xffb6c1,
      0xe6e6fa
    );
    this.gridHelper.position.y = 0.01;
    this.group.add(this.gridHelper);

    const axesHelper = new THREE.AxesHelper(1);
    axesHelper.visible = false;
    this.group.add(axesHelper);
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible;
    this.gridHelper.visible = visible;
  }

  public getVisible(): boolean {
    return this.isVisible;
  }

  public toggle(): boolean {
    this.isVisible = !this.isVisible;
    this.gridHelper.visible = this.isVisible;
    return this.isVisible;
  }

  public getGridPosition(worldX: number, worldZ: number): { x: number; z: number } {
    const snappedX = Math.round(worldX / GRID_SIZE) * GRID_SIZE;
    const snappedZ = Math.round(worldZ / GRID_SIZE) * GRID_SIZE;
    return { x: snappedX, z: snappedZ };
  }
}
