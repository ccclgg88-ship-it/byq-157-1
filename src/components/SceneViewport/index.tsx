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
    furniture,
    dayTime,
    showGrid,
    gizmoMode,
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

    existingIds.forEach((id) => {
      if (!currentIds.has(id)) {
        sceneRef.current?.removeFurniture(id);
      }
    });

    furniture.forEach((f) => {
      if (!existingIds.has(f.instanceId)) {
        sceneRef.current?.addFurniture(f.furnitureId, f.position, f.rotation, f.instanceId);
      } else {
        sceneRef.current?.updateFurniture(f.instanceId, f);
      }
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
