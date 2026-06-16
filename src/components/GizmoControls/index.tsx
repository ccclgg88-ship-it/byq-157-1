import { useSceneStore } from '@/store/sceneStore';
import { Move, RotateCcw, Maximize2, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface GizmoControlsProps {
  onDelete: () => void;
}

export default function GizmoControls({ onDelete }: GizmoControlsProps) {
  const { selectedInstanceId, gizmoMode, setGizmoMode, isMobile } = useSceneStore();

  if (!isMobile || !selectedInstanceId) return null;

  const controls = [
    { mode: 'translate' as const, icon: Move, label: '移动' },
    { mode: 'rotate' as const, icon: RotateCcw, label: '旋转' },
    { mode: 'scale' as const, icon: Maximize2, label: '缩放' },
  ];

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-md rounded-full shadow-soft px-2 py-2 flex items-center gap-1">
      {controls.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setGizmoMode(mode)}
          className={clsx(
            'p-3 rounded-full transition-all duration-200 flex flex-col items-center gap-0.5',
            gizmoMode === mode
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          <Icon className="w-5 h-5" />
          <span className="text-[10px]">{label}</span>
        </button>
      ))}
      <div className="w-px h-10 bg-gray-200 mx-1" />
      <button
        onClick={onDelete}
        className="p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 flex flex-col items-center gap-0.5"
      >
        <Trash2 className="w-5 h-5" />
        <span className="text-[10px]">删除</span>
      </button>
    </div>
  );
}
