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
} from 'lucide-react';
import clsx from 'clsx';

interface ToolbarProps {
  sceneRef: React.MutableRefObject<any>;
  onOpenSchemes: () => void;
  onDelete: () => void;
}

export default function Toolbar({ sceneRef, onOpenSchemes, onDelete }: ToolbarProps) {
  const {
    dayTime,
    setDayTime,
    showGrid,
    setShowGrid,
    selectedInstanceId,
    undo,
    redo,
    canUndo,
    canRedo,
    gizmoMode,
    setGizmoMode,
  } = useSceneStore();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleDayNight = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 500);

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

  const handleUndo = () => {
    if (!canUndo()) return;
    undo();
  };

  const handleRedo = () => {
    if (!canRedo()) return;
    redo();
  };

  const handleGizmoModeChange = (mode: 'translate' | 'rotate' | 'scale') => {
    setGizmoMode(mode);
    if (sceneRef.current) {
      sceneRef.current.setGizmoMode(mode);
    }
  };

  const gizmoControls = [
    { mode: 'translate' as const, icon: Move, label: '移动' },
    { mode: 'rotate' as const, icon: RotateCcw, label: '旋转' },
    { mode: 'scale' as const, icon: Maximize2, label: '缩放' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
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
          onClick={handleUndo}
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
          onClick={handleRedo}
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

        {selectedInstanceId && (
          <>
            <div className="flex items-center gap-1">
              {gizmoControls.map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => handleGizmoModeChange(mode)}
                  className={clsx(
                    'p-2 rounded-full transition-all duration-200',
                    gizmoMode === mode
                      ? 'bg-purple-500 text-white shadow-cute scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  title={label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-pink-200" />

            <button
              onClick={onDelete}
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

      {selectedInstanceId && (
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-gray-500">
          已选中家具 · 拖动 gizmo 调整位置
        </div>
      )}
    </div>
  );
}
