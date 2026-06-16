import { useState } from 'react';
import { FURNITURE_DATA, CATEGORY_LABELS } from '@/data/furniture';
import { useSceneStore } from '@/store/sceneStore';
import type { CategoryType } from '@/store/types';
import { Lock } from 'lucide-react';
import clsx from 'clsx';

interface FurnitureCatalogProps {
  sceneRef: React.MutableRefObject<any>;
}

export default function FurnitureCatalog({ sceneRef }: FurnitureCatalogProps) {
  const { activeCategory, setActiveCategory, isMobile, collisionWarning } = useSceneStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const categories: CategoryType[] = ['sleep', 'food', 'play', 'decor'];

  const filteredFurniture = FURNITURE_DATA.filter(
    (f) => f.category === activeCategory
  );

  const handleDragStart = (e: React.DragEvent, furnitureId: string) => {
    e.dataTransfer.setData('furnitureId', furnitureId);
    e.dataTransfer.effectAllowed = 'copy';

    if (sceneRef.current) {
      sceneRef.current.showGhost(furnitureId);
    }
  };

  const handleDragEnd = () => {
    if (sceneRef.current) {
      sceneRef.current.hideGhost();
    }
    setHoveredItem(null);
  };

  const handleItemClick = (furnitureId: string) => {
    if (!FURNITURE_DATA.find((f) => f.id === furnitureId)?.unlocked) return;

    if (sceneRef.current) {
      const furnitureData = FURNITURE_DATA.find((f) => f.id === furnitureId);
      if (furnitureData) {
        useSceneStore.getState().addFurniture(
          furnitureId,
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 },
          furnitureData.size
        );
      }
    }
  };

  return (
    <div
      className={clsx(
        'bg-white/90 backdrop-blur-md shadow-soft rounded-3xl p-4',
        isMobile
          ? 'fixed bottom-0 left-0 right-0 z-40 max-h-[50vh] rounded-b-none'
          : 'w-72 max-h-[80vh]'
      )}
    >
      <h2 className="text-lg font-bold text-pink-600 mb-3 flex items-center gap-2">
        <span className="text-2xl">🏠</span>
        家具目录
      </h2>

      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeCategory === cat
                ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-cute scale-105'
                : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {collisionWarning && (
        <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-2 rounded-xl mb-3 animate-pulse">
          ⚠️ 家具位置重叠，请调整放置位置
        </div>
      )}

      <div
        className={clsx(
          'grid gap-3 overflow-y-auto scrollbar-hide',
          isMobile ? 'grid-cols-4' : 'grid-cols-3',
          collisionWarning ? 'max-h-[calc(50vh-160px)]' : 'max-h-[calc(80vh-160px)]'
        )}
      >
        {filteredFurniture.map((item) => (
          <div
            key={item.id}
            draggable={item.unlocked}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragEnd={handleDragEnd}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleItemClick(item.id)}
            className={clsx(
              'relative flex flex-col items-center p-3 rounded-2xl transition-all duration-200 cursor-pointer',
              item.unlocked
                ? 'bg-gradient-to-b from-pink-50 to-purple-50 hover:shadow-cute hover:-translate-y-1 border-2 border-transparent hover:border-pink-300'
                : 'bg-gray-100 opacity-60 cursor-not-allowed',
              hoveredItem === item.id && item.unlocked && 'scale-105'
            )}
          >
            {!item.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                <Lock className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-3xl mb-1">{item.icon}</div>
            <span
              className={clsx(
                'text-xs text-center font-medium',
                item.unlocked ? 'text-pink-700' : 'text-gray-500'
              )}
            >
              {item.name}
            </span>
            {!item.unlocked && item.unlockCondition && (
              <span className="text-[10px] text-gray-500 mt-1 text-center">
                {item.unlockCondition}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-400 text-center">
        💡 拖拽或点击放置家具
      </div>
    </div>
  );
}
