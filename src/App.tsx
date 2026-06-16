import { useRef, useEffect, useState } from 'react';
import type { SceneManager } from '@/scene/SceneManager';
import SceneViewport from '@/components/SceneViewport';
import FurnitureCatalog from '@/components/FurnitureCatalog';
import Toolbar from '@/components/Toolbar';
import SchemeModal from '@/components/SchemeModal';
import { useSceneStore } from '@/store/sceneStore';
import { Eye, Home, Heart } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const sceneRef = useRef<SceneManager | null>(null);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { init, isMobile, selectedInstanceId, deleteFurniture, furniture } = useSceneStore();

  useEffect(() => {
    init();
  }, [init]);

  const handleDelete = () => {
    if (selectedInstanceId) {
      deleteFurniture(selectedInstanceId);
      setShowDeleteConfirm(false);
    }
  };

  const handleSetTopView = () => {
    sceneRef.current?.setTopView();
    setShowViewOptions(false);
  };

  const handleSetPerspectiveView = () => {
    sceneRef.current?.setPerspectiveView();
    setShowViewOptions(false);
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="absolute inset-0">
        <SceneViewport sceneRef={sceneRef} />
      </div>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-soft px-5 py-2.5 pointer-events-auto">
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-xl animate-float">🏠</span>
            宠物小窝 3D
          </h1>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <div className="relative">
          <button
            onClick={() => setShowViewOptions(!showViewOptions)}
            className="bg-white/90 backdrop-blur-md shadow-soft rounded-full p-3 text-purple-600 hover:bg-white transition-all hover:scale-110"
            title="视角切换"
          >
            <Eye className="w-5 h-5" />
          </button>

          {showViewOptions && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-soft p-2 min-w-[140px] z-30">
              <button
                onClick={handleSetPerspectiveView}
                className="w-full py-2 px-3 rounded-xl hover:bg-purple-50 text-gray-700 flex items-center gap-2 text-sm transition-colors"
              >
                <Home className="w-4 h-4" />
                透视视角
              </button>
              <button
                onClick={handleSetTopView}
                className="w-full py-2 px-3 rounded-xl hover:bg-purple-50 text-gray-700 flex items-center gap-2 text-sm transition-colors"
              >
                <Eye className="w-4 h-4" />
                俯视视角
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <Toolbar
          sceneRef={sceneRef}
          onOpenSchemes={() => setIsSchemeModalOpen(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />
      </div>

      <div
        className={clsx(
          'absolute z-20',
          isMobile
            ? 'bottom-0 left-0 right-0'
            : 'right-4 top-24 bottom-4 w-72'
        )}
      >
        <FurnitureCatalog sceneRef={sceneRef} />
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center text-lg">
              🐱
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">小橘</p>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                <span className="text-xs text-gray-500">心情愉悦</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>🏠 家具数量：{furniture.length} 件</p>
            <p>💡 点击家具可编辑</p>
            <p>🔄 滚轮缩放，拖拽旋转视角</p>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <p className="text-gray-700 mb-4 text-center font-medium text-lg">
              🗑️ 确定要删除这件家具吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      <SchemeModal
        isOpen={isSchemeModalOpen}
        onClose={() => setIsSchemeModalOpen(false)}
        sceneRef={sceneRef}
      />
    </div>
  );
}

export default App;
