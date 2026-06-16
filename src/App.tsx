import { useRef, useEffect, useState } from 'react';
import type { SceneManager } from '@/scene/SceneManager';
import SceneViewport from '@/components/SceneViewport';
import FurnitureCatalog from '@/components/FurnitureCatalog';
import Toolbar from '@/components/Toolbar';
import SchemeModal from '@/components/SchemeModal';
import GizmoControls from '@/components/GizmoControls';
import { useSceneStore } from '@/store/sceneStore';
import { Move, RotateCcw, Maximize2, Eye, Home } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const sceneRef = useRef<SceneManager | null>(null);
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);

  const { init, isMobile, gizmoMode, setGizmoMode, selectedInstanceId, deleteFurniture } =
    useSceneStore();

  useEffect(() => {
    init();
  }, [init]);

  const handleDelete = () => {
    if (selectedInstanceId) {
      deleteFurniture(selectedInstanceId);
      if (sceneRef.current) {
        sceneRef.current.removeFurniture(selectedInstanceId);
      }
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

  const gizmoControls = [
    { mode: 'translate' as const, icon: Move, label: '移动' },
    { mode: 'rotate' as const, icon: RotateCcw, label: '旋转' },
    { mode: 'scale' as const, icon: Maximize2, label: '缩放' },
  ];

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
          <span className="text-3xl animate-float">🏠</span>
          宠物小窝 3D
        </h1>
        <p className="text-sm text-gray-500 mt-1">为你的圆嘟嘟宠物打造温馨小窝</p>
      </div>

      <div className="absolute top-4 right-4 z-30">
        <div className="relative">
          <button
            onClick={() => setShowViewOptions(!showViewOptions)}
            className="bg-white/90 backdrop-blur-md shadow-soft rounded-full p-3 text-purple-600 hover:bg-white transition-all hover:scale-110"
            title="视角切换"
          >
            <Eye className="w-5 h-5" />
          </button>

          {showViewOptions && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-soft p-2 min-w-[140px]">
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

      {!isMobile && selectedInstanceId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 mt-16">
          <div className="bg-white/90 backdrop-blur-md rounded-full shadow-soft px-2 py-1 flex items-center gap-1">
            {gizmoControls.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => {
                  setGizmoMode(mode);
                  sceneRef.current?.setGizmoMode(mode);
                }}
                className={clsx(
                  'px-3 py-2 rounded-full transition-all duration-200 flex items-center gap-1 text-sm',
                  gizmoMode === mode
                    ? 'bg-purple-500 text-white shadow-cute'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <Toolbar sceneRef={sceneRef} onOpenSchemes={() => setIsSchemeModalOpen(true)} />

      <GizmoControls onDelete={() => setShowDeleteConfirm(true)} />

      <div className="absolute inset-0">
        <SceneViewport sceneRef={sceneRef} />
      </div>

      <div
        className={clsx(
          'absolute z-20',
          isMobile
            ? 'bottom-0 left-0 right-0'
            : 'top-20 left-4 bottom-4'
        )}
      >
        <FurnitureCatalog sceneRef={sceneRef} />
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

      <div className="absolute bottom-4 right-4 z-20 text-xs text-gray-500 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2">
        <p>💡 点击家具可编辑，双击取消选择</p>
        <p className="mt-1">🔄 滚轮缩放，拖拽旋转视角</p>
      </div>
    </div>
  );
}

export default App;
