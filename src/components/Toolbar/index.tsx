import { useState } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import {
  Sun,
  Moon,
  Grid3X3,
  Undo2,
  Redo2,
  Trash2,
  Save,
  Move,
  RotateCcw,
  Maximize2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import clsx from 'clsx';

interface ToolbarProps {
  sceneRef: React.MutableRefObject<any>;
  onOpenSchemes: () => void;
}

export default function Toolbar({ sceneRef, onOpenSchemes }: ToolbarProps) {
  const {
    dayTime,
    setDayTime,
    showGrid,
    setShowGrid,
    selectedInstanceId,
    deleteFurniture,
    undo,
    redo,
    canUndo,
    canRedo,
    gizmoMode,
    setGizmoMode,
    isMobile,
  } = useSceneStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showGizmoOptions, setShowGizmoOptions] = useState(false);

  const handleToggleDayNight = () => {
    const newTime = dayTime === 'day' ? 'night' : 'day';
    setDayTime(newTime);
    if (sceneRef.current) {
      sceneRef.current.setDayTime(newTime);
    }
  };

  const handleToggleGrid = () => {
    const newShow = !showGrid;
    setShowGrid(newShow);
    if (sceneRef.current) {
      sceneRef.current.setGridVisible(newShow);
    }
  };

  const handleDelete = () => {
    if (selectedInstanceId) {
      deleteFurniture(selectedInstanceId);
      if (sceneRef.current) {
        sceneRef.current.removeFurniture(selectedInstanceId);
      }
      setShowDeleteConfirm(false);
    }
  };

  const handleGizmoModeChange = (mode: 'translate' | 'rotate' | 'scale') => {
    setGizmoMode(mode);
    if (sceneRef.current) {
      sceneRef.current.setGizmoMode(mode);
    }
    setShowGizmoOptions(false);
  };

  const gizmoIcons = {
    translate: Move,
    rotate: RotateCcw,
    scale: Maximize2,
  };

  const GizmoIcon = gizmoIcons[gizmoMode];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
      <div className="bg-white/90 backdrop-blur-md shadow-soft rounded-full px-4 py-2 flex items-center gap-2">
        <button
          onClick={handleToggleDayNight}
          className={clsx(
            'p-2 rounded-full transition-all duration-200 hover:scale-110',
            dayTime === 'day'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-indigo-100 text-indigo-600'
          )}
          title={dayTime === 'day' ? '切换到夜晚' : '切换到白天'}
        >
          {dayTime === 'day' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <div className="w-px h-6 bg-pink-200" />

        <button
          onClick={handleToggleGrid}
          className={clsx(
            'p-2 rounded-full transition-all duration-200 hover:scale-110',
            showGrid
              ? 'bg-pink-100 text-pink-600'
              : 'bg-gray-100 text-gray-400'
          )}
          title={showGrid ? '隐藏网格' : '显示网格'}
        >
          <Grid3X3 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-pink-200" />

        <button
          onClick={undo}
          disabled={!canUndo()}
          className={clsx(
            'p-2 rounded-full transition-all duration-200 hover:scale-110',
            canUndo()
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
          title="撤销"
        >
          <Undo2 className="w-5 h-5" />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo()}
          className={clsx(
            'p-2 rounded-full transition-all duration-200 hover:scale-110',
            canRedo()
              ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          )}
          title="重做"
        >
          <Redo2 className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-pink-200" />

        {isMobile && selectedInstanceId && (
          <>
            <div className="relative">
              <button
                onClick={() => setShowGizmoOptions(!showGizmoOptions)}
                className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-all duration-200 flex items-center gap-1"
              >
                <GizmoIcon className="w-5 h-5" />
                {showGizmoOptions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showGizmoOptions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-soft p-2 flex flex-col gap-1 min-w-[120px]">
                  <button
                    onClick={() => handleGizmoModeChange('translate')}
                    className={clsx(
                      'p-2 rounded-xl flex items-center gap-2 text-sm transition-colors',
                      gizmoMode === 'translate'
                        ? 'bg-purple-100 text-purple-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    )}
                  >
                    <Move className="w-4 h-4" />
                    移动
                  </button>
                  <button
                    onClick={() => handleGizmoModeChange('rotate')}
                    className={clsx(
                      'p-2 rounded-xl flex items-center gap-2 text-sm transition-colors',
                      gizmoMode === 'rotate'
                        ? 'bg-purple-100 text-purple-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    )}
                  >
                    <RotateCcw className="w-4 h-4" />
                    旋转
                  </button>
                  <button
                    onClick={() => handleGizmoModeChange('scale')}
                    className={clsx(
                      'p-2 rounded-xl flex items-center gap-2 text-sm transition-colors',
                      gizmoMode === 'scale'
                        ? 'bg-purple-100 text-purple-600'
                        : 'hover:bg-gray-100 text-gray-600'
                    )}
                  >
                    <Maximize2 className="w-4 h-4" />
                    缩放
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-pink-200" />
          </>
        )}

        {selectedInstanceId && (
          <>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 hover:scale-110"
              title="删除家具"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-pink-200" />
          </>
        )}

        <button
          onClick={onOpenSchemes}
          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200 hover:scale-110"
          title="管理布置方案"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-soft p-4 min-w-[240px]">
          <p className="text-gray-700 mb-3 text-center font-medium">
            确定要删除这件家具吗？
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2 px-4 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-2 px-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors font-medium"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
