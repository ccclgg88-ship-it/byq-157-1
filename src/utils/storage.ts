import type { Scheme, FurnitureInstance } from '@/store/types';

const STORAGE_KEYS = {
  SCHEMES: 'pet-nest-schemes',
  ACTIVE_SCHEME: 'pet-nest-active',
};

export const saveSchemes = (schemes: Scheme[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
  } catch (e) {
    console.error('Failed to save schemes:', e);
  }
};

export const loadSchemes = (): Scheme[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEMES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load schemes:', e);
    return [];
  }
};

export const saveActiveFurniture = (furniture: FurnitureInstance[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SCHEME, JSON.stringify(furniture));
  } catch (e) {
    console.error('Failed to save active furniture:', e);
  }
};

export const loadActiveFurniture = (): FurnitureInstance[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SCHEME);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load active furniture:', e);
    return [];
  }
};

export const exportScheme = (scheme: Scheme): string => {
  return JSON.stringify(scheme, null, 2);
};

export const importScheme = (jsonStr: string): Scheme | null => {
  try {
    const scheme = JSON.parse(jsonStr);
    if (!scheme.id || !scheme.name || !Array.isArray(scheme.furniture)) {
      return null;
    }
    return scheme;
  } catch (e) {
    console.error('Failed to import scheme:', e);
    return null;
  }
};
