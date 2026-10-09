import React, { useState, useEffect } from 'react';
import { CheckSquare, ListTodo, ThumbsUp, Sparkles, Filter } from 'lucide-react';
import { getDefaultChecklist, ChecklistItem } from '../utils/storeReadinessChecklist';

interface ReleaseChecklistCardProps {
  onScoreChange?: (score: number) => void;
}

export default function ReleaseChecklistCard({ onScoreChange }: ReleaseChecklistCardProps) {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('orbi_clima_store_checklist_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return getDefaultChecklist();
      }
    }
    return getDefaultChecklist();
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'build' | 'functional' | 'privacy' | 'textual'>('all');

  useEffect(() => {
    localStorage.setItem('orbi_clima_store_checklist_v1', JSON.stringify(items));
    const completed = items.filter(i => i.completed).length;
    const score = Math.round((completed / items.length) * 100);
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [items, onScoreChange]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const score = Math.round((completedCount / totalCount) * 100);

  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'build', label: 'Compilación (Build)' },
    { key: 'functional', label: 'Funcional' },
    { key: 'privacy', label: 'Privacidad' },
    { key: 'textual', label: 'Seguridad Textual' }
  ];

  const filteredItems = items.filter(i => activeCategory === 'all' || i.category === activeCategory);

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Release Checklist</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">CHECKLIST INTERACTIVO DE PRODUCCIÓN</p>
          </div>
        </div>

        {/* Score Ring / Bar */}
        <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/10 px-4 py-2 rounded-2xl">
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wide">Readiness Score</span>
            <span className="text-xs text-slate-300 font-sans font-medium">{completedCount} / {totalCount} completados</span>
          </div>
          <div className="text-2xl font-bold font-sans text-purple-400 tracking-tighter">
            {score}%
          </div>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800/80 pb-3">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              activeCategory === cat.key
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Checklist list */}
      <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-3.5 rounded-xl border flex gap-3 items-start cursor-pointer select-none transition-all group ${
              item.completed
                ? 'bg-purple-500/[0.03] border-purple-500/15 hover:border-purple-500/25'
                : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
            }`}
          >
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => {}} // handled by div onClick
              className="mt-1 accent-purple-500 cursor-pointer text-purple-500 pointer-events-none rounded"
            />
            <div className="space-y-1">
              <span className={`text-xs font-sans font-bold block ${item.completed ? 'text-slate-300 line-through opacity-70' : 'text-slate-200'}`}>
                {item.title}
              </span>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed group-hover:text-slate-300 transition-colors">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3.5 rounded-xl bg-[#060a12] border border-slate-800/60 text-[10px] text-slate-400 font-sans leading-relaxed flex items-center justify-between">
        <span>Target SDK vigente requerido por Google Play: <strong className="text-slate-200">Android 15 (API 35+)</strong></span>
        <span className="font-mono text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700/50">VIGENTE</span>
      </div>
    </div>
  );
}
