export interface FurnitureInstance {
  instanceId: string;
  furnitureId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'sleep' | 'food' | 'play' | 'decor';
  size: { width: number; depth: number; height: number };
  color: string;
  icon: string;
  unlocked: boolean;
  unlockCondition?: string;
  isLightSource?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  furniture: FurnitureInstance[];
  dayTime: 'day' | 'night';
}

export interface HistoryState {
  past: FurnitureInstance[][];
  present: FurnitureInstance[];
  future: FurnitureInstance[][];
}

export type DayTime = 'day' | 'night';
export type CategoryType = 'sleep' | 'food' | 'play' | 'decor';

export const GRID_SIZE = 0.5;
export const ROOM_WIDTH = 10;
export const ROOM_DEPTH = 10;
export const ROOM_HEIGHT = 4;
export const MAX_HISTORY = 10;
