import { useState, useRef } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import { FURNITURE_DATA } from '@/data/furniture';
import { exportScheme, importScheme } from '@/utils/storage';
import {
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  Edit3,
  Check,
  FileJson,
} from 'lucide-react';
import clsx from 'clsx';

interface SchemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneRef: React.MutableRefObject<any>;
}

export default function SchemeModal({ isOpen, onClose, sceneRef }: SchemeModalProps) {
  const {
    schemes,
    saveScheme,
    loadScheme,
    deleteScheme,
    updateSchemeName,
    furniture,
    clearFurniture,
  } = useSceneStore();

  const [newSchemeName, setNewSchemeName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newSchemeName.trim()) return;
    if (schemes.length >= 3) {
      alert('最多只能保存 3 个方案，请先删除一个');
      return;
    }
    saveScheme(newSchemeName.trim());
    setNewSchemeName('');
  };

  const handleLoad = (schemeId: string) => {
    loadScheme(schemeId);
    if (sceneRef.current) {
      sceneRef.current.clearAllFurniture();
      const scheme = schemes.find((s) => s.id === schemeId);
      if (scheme) {
        scheme.furniture.forEach((f) => {
          sceneRef.current.addFurniture(
            f.furnitureId,
            f.position,
            f.rotation,
            f.instanceId
          );
        });
        sceneRef.current.setDayTime(scheme.dayTime);
      }
    }
    onClose();
  };

  const handleDelete = (schemeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个方案吗？')) {
      deleteScheme(schemeId);
    }
  };

  const handleStartEdit = (schemeId: string, currentName: string) => {
    setEditingId(schemeId);
    setEditName(currentName);
  };

  const handleSaveEdit = (schemeId: string) => {
    if (editName.trim()) {
      updateSchemeName(schemeId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const handleExport = (scheme: any) => {
    const jsonStr = exportScheme(scheme);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheme.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setImportText(content);
      } catch (err) {
        setImportError('读取文件失败');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importText.trim()) return;

    const scheme = importScheme(importText.trim());
    if (!scheme) {
      setImportError('无效的方案文件格式');
      return;
    }

    if (schemes.length >= 3) {
      setImportError('最多只能保存 3 个方案');
      return;
    }

    saveScheme(scheme.name);
    setShowImport(false);
    setImportText('');
    setImportError('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSchemePreview = (schemeFurniture: any[]) => {
    return schemeFurniture.slice(0, 4).map((f) => {
      const data = FURNITURE_DATA.find((d) => d.id === f.furnitureId);
      return data?.icon || '📦';
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">💾</span>
              布置方案管理
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] scrollbar-hide">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-600 mb-2">
              保存当前方案 ({schemes.length}/3)
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSchemeName}
                onChange={(e) => setNewSchemeName(e.target.value)}
                placeholder="输入方案名称..."
                className="flex-1 px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors"
                maxLength={20}
              />
              <button
                onClick={handleSave}
                disabled={!newSchemeName.trim() || schemes.length >= 3}
                className={clsx(
                  'px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1',
                  newSchemeName.trim() && schemes.length < 3
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:shadow-cute'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                <Plus className="w-5 h-5" />
                保存
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowImport(!showImport)}
              className="flex-1 py-2 px-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              导入 JSON
            </button>
            <button
              onClick={() => {
                clearFurniture();
                if (sceneRef.current) {
                  sceneRef.current.clearAllFurniture();
                }
                onClose();
              }}
              className="py-2 px-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              清空
            </button>
          </div>

          {showImport && (
            <div className="mb-4 p-4 bg-purple-50 rounded-2xl">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-4 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FileJson className="w-5 h-5" />
                  选择文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="或粘贴 JSON 内容..."
                className="w-full px-3 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-sm font-mono h-24 resize-none"
              />
              {importError && (
                <p className="text-red-500 text-sm mt-1">{importError}</p>
              )}
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={clsx(
                  'mt-2 w-full py-2 rounded-xl font-medium transition-all',
                  importText.trim()
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
              >
                导入方案
              </button>
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-600 mb-2">已保存方案</h3>
            {schemes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📭</div>
                <p>暂无保存的方案</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border-2 border-transparent hover:border-pink-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      {editingId === scheme.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 rounded-lg border-2 border-pink-300 focus:outline-none text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(scheme.id)}
                            className="p-1 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-700">
                            {scheme.name}
                          </span>
                          <button
                            onClick={() => handleStartEdit(scheme.id, scheme.name)}
                            className="p-1 rounded-lg hover:bg-white/50 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span
                          className={clsx(
                            'text-xs px-2 py-1 rounded-full',
                            scheme.dayTime === 'day'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-indigo-100 text-indigo-700'
                          )}
                        >
                          {scheme.dayTime === 'day' ? '☀️ 白天' : '🌙 夜晚'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-2xl">
                          {getSchemePreview(scheme.furniture).join('')}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {scheme.furniture.length} 件家具
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDate(scheme.updatedAt)}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleLoad(scheme.id)}
                        className="flex-1 py-2 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium hover:shadow-cute transition-all"
                      >
                        加载方案
                      </button>
                      <button
                        onClick={() => handleExport(scheme)}
                        className="py-2 px-4 rounded-xl bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                        title="导出 JSON"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(scheme.id, e)}
                        className="py-2 px-4 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="删除方案"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
