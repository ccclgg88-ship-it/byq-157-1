import { useEffect, useRef } from 'react';
import { SceneManager } from '@/scene/SceneManager';
import { useSceneStore } from '@/store/sceneStore';

interface SceneViewportProps {
  sceneRef: React.MutableRefObject<SceneManager | null>;
}

export default function SceneViewport({ sceneRef }: SceneViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  const {
    setSelectedInstance,
    updateFurniture,
    setCollisionWarning,
    furniture,
    dayTime,
    showGrid,
    gizmoMode,
  } = useSceneStore();

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    initRef.current = true;

    const sceneManager = new SceneManager(containerRef.current, {
      onSelectFurniture: (instanceId) => {
        setSelectedInstance(instanceId);
      },
      onFurnitureMoved: (instanceId, position, rotation) => {
        updateFurniture(instanceId, { position, rotation });
      },
      onCollision: (hasCollision) => {
        setCollisionWarning(hasCollision ? '家具位置重叠' : null);
      },
    });

    sceneRef.current = sceneManager;

    furniture.forEach((f) => {
      sceneManager.addFurniture(f.furnitureId, f.position, f.rotation, f.instanceId);
    });

    sceneManager.setDayTime(dayTime);
    sceneManager.setGridVisible(showGrid);
    sceneManager.setGizmoMode(gizmoMode);

    return () => {
      sceneManager.destroy();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

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
