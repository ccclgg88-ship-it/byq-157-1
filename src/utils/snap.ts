import { GRID_SIZE, ROOM_WIDTH, ROOM_DEPTH } from '@/store/types';

export const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

export const snapPosition = (
  x: number,
  z: number,
  width: number,
  depth: number
): { x: number; z: number } => {
  const halfW = width / 2;
  const halfD = depth / 2;
  const maxX = ROOM_WIDTH / 2 - halfW;
  const minX = -ROOM_WIDTH / 2 + halfW;
  const maxZ = ROOM_DEPTH / 2 - halfD;
  const minZ = -ROOM_DEPTH / 2 + halfD;

  let snappedX = snapToGrid(x);
  let snappedZ = snapToGrid(z);

  snappedX = Math.max(minX, Math.min(maxX, snappedX));
  snappedZ = Math.max(minZ, Math.min(maxZ, snappedZ));

  return { x: snappedX, z: snappedZ };
};

export const snapRotation = (angle: number): number => {
  const step = Math.PI / 2;
  return Math.round(angle / step) * step;
};
