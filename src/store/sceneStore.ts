import { create } from 'zustand';
import type { FurnitureInstance, DayTime, Scheme, HistoryState, CategoryType } from './types';
import { MAX_HISTORY } from './types';
import { generateInstanceId } from '@/utils/instanceId';
import { loadActiveFurniture, saveActiveFurniture, loadSchemes, saveSchemes } from '@/utils/storage';

interface SceneState {
  furniture: FurnitureInstance[];
  selectedInstanceId: string | null;
  dayTime: DayTime;
  showGrid: boolean;
  isDragging: boolean;
  draggedFurnitureId: string | null;
  collisionWarning: string | null;
  history: HistoryState;
  schemes: Scheme[];
  activeCategory: CategoryType;
  gizmoMode: 'translate' | 'rotate' | 'scale';
  isMobile: boolean;

  setSelectedInstance: (id: string | null) => void;
  setDayTime: (time: DayTime) => void;
  setShowGrid: (show: boolean) => void;
  setActiveCategory: (category: CategoryType) => void;
  setGizmoMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  setDragging: (dragging: boolean, furnitureId?: string) => void;
  setCollisionWarning: (warning: string | null) => void;

  addFurniture: (furnitureId: string, position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }, size: { width: number; depth: number; height: number }) => void;
  updateFurniture: (instanceId: string, updates: Partial<FurnitureInstance>) => void;
  deleteFurniture: (instanceId: string) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  saveScheme: (name: string) => void;
  loadScheme: (schemeId: string) => void;
  deleteScheme: (schemeId: string) => void;
  updateSchemeName: (schemeId: string, name: string) => void;
  clearFurniture: () => void;

  init: () => void;
}

const initialHistory: HistoryState = {
  past: [],
  present: [],
  future: [],
};

export const useSceneStore = create<SceneState>((set, get) => ({
  furniture: [],
  selectedInstanceId: null,
  dayTime: 'day',
  showGrid: true,
  isDragging: false,
  draggedFurnitureId: null,
  collisionWarning: null,
  history: initialHistory,
  schemes: [],
  activeCategory: 'sleep',
  gizmoMode: 'translate',
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,

  setSelectedInstance: (id) => set({ selectedInstanceId: id }),
  setDayTime: (time) => set({ dayTime: time }),
  setShowGrid: (show) => set({ showGrid: show }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setGizmoMode: (mode) => set({ gizmoMode: mode }),
  setDragging: (dragging, furnitureId) => set({ isDragging: dragging, draggedFurnitureId: furnitureId || null }),
  setCollisionWarning: (warning) => set({ collisionWarning: warning }),

  addFurniture: (furnitureId, position, rotation, size) => {
    const state = get();
    const newInstance: FurnitureInstance = {
      instanceId: generateInstanceId(),
      furnitureId,
      position,
      rotation,
      scale: { x: 1, y: 1, z: 1 },
    };

    const newPresent = [...state.furniture, newInstance];
    const newPast = [...state.history.past, state.furniture].slice(-MAX_HISTORY);

    set({
      furniture: newPresent,
      selectedInstanceId: newInstance.instanceId,
      history: {
        past: newPast,
        present: newPresent,
        future: [],
      },
    });

    saveActiveFurniture(newPresent);
  },

  updateFurniture: (instanceId, updates) => {
    const state = get();
    const newFurniture = state.furniture.map((f) =>
      f.instanceId === instanceId ? { ...f, ...updates } : f
    );

    set({ furniture: newFurniture });
    saveActiveFurniture(newFurniture);
  },

  deleteFurniture: (instanceId) => {
    const state = get();
    const newFurniture = state.furniture.filter((f) => f.instanceId !== instanceId);
    const newPast = [...state.history.past, state.furniture].slice(-MAX_HISTORY);

    set({
      furniture: newFurniture,
      selectedInstanceId: state.selectedInstanceId === instanceId ? null : state.selectedInstanceId,
      history: {
        past: newPast,
        present: newFurniture,
        future: [],
      },
    });

    saveActiveFurniture(newFurniture);
  },

  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;

    const newPast = [...state.history.past];
    const previous = newPast.pop()!;
    const newFuture = [state.history.present, ...state.history.future];

    set({
      furniture: previous,
      history: {
        past: newPast,
        present: previous,
        future: newFuture,
      },
    });

    saveActiveFurniture(previous);
  },

  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;

    const newFuture = [...state.history.future];
    const next = newFuture.shift()!;
    const newPast = [...state.history.past, state.history.present];

    set({
      furniture: next,
      history: {
        past: newPast,
        present: next,
        future: newFuture,
      },
    });

    saveActiveFurniture(next);
  },

  canUndo: () => get().history.past.length > 0,
  canRedo: () => get().history.future.length > 0,

  saveScheme: (name) => {
    const state = get();
    const now = Date.now();
    const newScheme: Scheme = {
      id: `scheme_${now}`,
      name,
      createdAt: now,
      updatedAt: now,
      furniture: [...state.furniture],
      dayTime: state.dayTime,
    };

    const newSchemes = [...state.schemes, newScheme].slice(0, 3);
    set({ schemes: newSchemes });
    saveSchemes(newSchemes);
  },

  loadScheme: (schemeId) => {
    const state = get();
    const scheme = state.schemes.find((s) => s.id === schemeId);
    if (!scheme) return;

    const newPast = [...state.history.past, state.furniture].slice(-MAX_HISTORY);
    set({
      furniture: scheme.furniture,
      dayTime: scheme.dayTime,
      history: {
        past: newPast,
        present: scheme.furniture,
        future: [],
      },
    });

    saveActiveFurniture(scheme.furniture);
  },

  deleteScheme: (schemeId) => {
    const state = get();
    const newSchemes = state.schemes.filter((s) => s.id !== schemeId);
    set({ schemes: newSchemes });
    saveSchemes(newSchemes);
  },

  updateSchemeName: (schemeId, name) => {
    const state = get();
    const newSchemes = state.schemes.map((s) =>
      s.id === schemeId ? { ...s, name, updatedAt: Date.now() } : s
    );
    set({ schemes: newSchemes });
    saveSchemes(newSchemes);
  },

  clearFurniture: () => {
    const state = get();
    const newFurniture: FurnitureInstance[] = [];
    const newPast = [...state.history.past, state.furniture].slice(-MAX_HISTORY);

    set({
      furniture: newFurniture,
      selectedInstanceId: null,
      history: {
        past: newPast,
        present: newFurniture,
        future: [],
      },
    });

    saveActiveFurniture(newFurniture);
  },

  init: () => {
    const savedFurniture = loadActiveFurniture();
    const savedSchemes = loadSchemes();

    if (savedFurniture.length > 0) {
      set({
        furniture: savedFurniture,
        history: {
          ...initialHistory,
          present: savedFurniture,
        },
      });
    }

    if (savedSchemes.length > 0) {
      set({ schemes: savedSchemes });
    }

    const checkMobile = () => set({ isMobile: window.innerWidth < 768 });
    window.addEventListener('resize', checkMobile);
  },
}));
