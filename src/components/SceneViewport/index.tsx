import { useEffect, useRef } from 'react';
import { SceneManager } from '@/scene/SceneManager';
import { useSceneStore } from '@/store/sceneStore';
import type { FurnitureInstance } from '@/store/types';

interface SceneViewportProps {
  sceneRef: React.MutableRefObject<SceneManager | null>;
}

export default function SceneViewport({ sceneRef }: SceneViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  const {
    dayTime,
    showGrid,
    gizmoMode,
    furniture,
  } = useSceneStore();

  useEffect(() => {
    if (!containerRef.current) return;
    if (sceneRef.current) return;

    const sceneManager = new SceneManager(containerRef.current, {
      onSelectFurniture: (instanceId) => {
        useSceneStore.getState().setSelectedInstance(instanceId);
      },
      onFurnitureMoved: (instanceId, position, rotation) => {
        if (syncingRef.current) return;
        syncingRef.current = true;
        useSceneStore.getState().updateFurniture(instanceId, { position, rotation });
        requestAnimationFrame(() => {
          syncingRef.current = false;
        });
      },
      onFurnitureAdded: (instanceId, furnitureId, position, rotation) => {
        if (syncingRef.current) return;
        syncingRef.current = true;

        const state = useSceneStore.getState();
        const exists = state.furniture.some(f => f.instanceId === instanceId);
        if (!exists) {
          const newInstance: FurnitureInstance = {
            instanceId,
            furnitureId,
            position,
            rotation,
            scale: { x: 1, y: 1, z: 1 },
          };

          const newFurniture = [...state.furniture, newInstance];
          const newPast = [...state.history.past, state.furniture].slice(-10);

          useSceneStore.setState({
            furniture: newFurniture,
            selectedInstanceId: instanceId,
            history: {
              past: newPast,
              present: newFurniture,
              future: [],
            },
          });
        }

        requestAnimationFrame(() => {
          syncingRef.current = false;
        });
      },
      onFurnitureRemoved: (instanceId) => {
        if (syncingRef.current) return;
        syncingRef.current = true;

        const state = useSceneStore.getState();
        const exists = state.furniture.some(f => f.instanceId === instanceId);
        if (exists) {
          const newFurniture = state.furniture.filter(f => f.instanceId !== instanceId);
          const newPast = [...state.history.past, state.furniture].slice(-10);

          useSceneStore.setState({
            furniture: newFurniture,
            selectedInstanceId: state.selectedInstanceId === instanceId ? null : state.selectedInstanceId,
            history: {
              past: newPast,
              present: newFurniture,
              future: [],
            },
          });
        }

        requestAnimationFrame(() => {
          syncingRef.current = false;
        });
      },
      onCollision: (hasCollision) => {
        useSceneStore.getState().setCollisionWarning(hasCollision ? '家具位置重叠' : null);
      },
    });

    sceneRef.current = sceneManager;

    const initialState = useSceneStore.getState();
    sceneManager.setDayTime(initialState.dayTime);
    sceneManager.setGridVisible(initialState.showGrid);
    sceneManager.setGizmoMode(initialState.gizmoMode);

    syncingRef.current = true;
    initialState.furniture.forEach(f => {
      sceneManager.addFurniture(f.furnitureId, f.position, f.rotation, f.instanceId, false);
    });
    requestAnimationFrame(() => {
      syncingRef.current = false;
    });

    return () => {
      sceneManager.destroy();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || syncingRef.current) return;

    const currentIds = new Set(furniture.map((f) => f.instanceId));
    const existingIds = new Set<string>();

    sceneRef.current.getFurnitureInstanceIds().forEach((id) => existingIds.add(id));

    syncingRef.current = true;

    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        sceneRef.current?.removeFurniture(id);
      }
    });

    furniture.forEach((f) => {
      if (!existingIds.has(f.instanceId)) {
        sceneRef.current?.addFurniture(f.furnitureId, f.position, f.rotation, f.instanceId, false);
      } else {
        sceneRef.current?.updateFurniture(f.instanceId, f);
      }
    });

    requestAnimationFrame(() => {
      syncingRef.current = false;
    });
  }, [furniture]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setDayTime(dayTime);
    }
  }, [dayTime]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setGridVisible(showGrid);
    }
  }, [showGrid]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setGizmoMode(gizmoMode);
    }
  }, [gizmoMode]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
