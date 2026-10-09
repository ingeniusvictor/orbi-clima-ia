import React, { useState } from 'react';
import { QaBugItem, QaSeverity } from '../services/qaStateService';
import { Bug, Plus, Trash2, CheckCircle2, AlertOctagon, HelpCircle, Archive, Filter } from 'lucide-react';

interface QaBugTrackerPanelProps {
  bugs: QaBugItem[];
  onAddBug: (title: string, description: string, severity: QaSeverity, relatedModule?: string) => void;
  onUpdateBugStatus: (id: string, status: 'open' | 'fixed' | 'wont_fix' | 'monitoring') => void;
  onDeleteBug?: (id: string) => void;
}

export default function QaBugTrackerPanel({ bugs, onAddBug, onUpdateBugStatus, onDeleteBug }: QaBugTrackerPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<QaSeverity>('medium');
  const [relatedModule, setRelatedModule] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'fixed' | 'critical'>('all');

  const modules = [
    'General',
    'Módulo 0 — Identidad y Base Visual',
    'Módulo 1 — Open-Meteo',
    'Módulo 2 — SkyCore Risk Engine',
    'Módulo 3 / 3B — Widgets Android',
    'Módulo 4 — Smart Alerts',
    'Módulo 5 — Local Notifications',
    'Módulo 6A — Quiet Hours + Frequency Guard',
    'Módulo 6B — Summaries + Deferred Alerts',
    'Módulo 7A — Local Preferences Foundation',
    'Módulo 7B — Weather Intelligence Memory',
    'Módulo 8A — Public Polish',
    'Módulo 8B — Store Readiness'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onAddBug(title, description, severity, relatedModule || 'General');
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setRelatedModule('');
    setShowAddForm(false);
  };

  const getSeverityPill = (sev: QaSeverity) => {
    switch (sev) {
      case 'critical':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'high':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'low':
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const filteredBugs = bugs.filter(bug => {
    if (activeFilter === 'open') return bug.status === 'open';
    if (activeFilter === 'fixed') return bug.status === 'fixed';
    if (activeFilter === 'critical') return bug.severity === 'critical' && bug.status === 'open';
    return true;
  });

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
            <Bug className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Bug Tracker Local</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">SEGUIMIENTO DE INCIDENCIAS EN CÁMARA GRIS</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold transition-all cursor-pointer border border-orange-500/15"
        >
          <Plus className="w-4 h-4" /> Reportar Bug
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Título de la Incidencia</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Crash al apagar notificaciones"
                className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-orange-500/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Severidad</label>
              <select
                value={severity}
                onChange={(e: any) => setSeverity(e.target.value)}
                className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-orange-500/40 cursor-pointer"
              >
                <option value="low">Baja (Cosmetic / Minor)</option>
                <option value="medium">Media (Normal Issue)</option>
                <option value="high">Alta (Major Feature Fail)</option>
                <option value="critical">Crítica (Blocker / Crash)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Módulo Relacionado</label>
              <select
                value={relatedModule}
                onChange={(e) => setRelatedModule(e.target.value)}
                className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-orange-500/40 cursor-pointer"
              >
                <option value="">Ninguno / General</option>
                {modules.map(mod => (
                  <option key={mod} value={mod}>{mod}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Descripción del Error</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explica los pasos para reproducir, el comportamiento observado y el comportamiento correcto esperado."
              className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-orange-500/40 resize-none font-sans"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg text-xs cursor-pointer hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              Registrar Bug
            </button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 bg-[#060a12]/80 p-1 rounded-xl border border-slate-800/60 text-[11px] self-start">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
            activeFilter === 'all' ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos ({bugs.length})
        </button>
        <button
          onClick={() => setActiveFilter('open')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
            activeFilter === 'open' ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Abiertos ({bugs.filter(b => b.status === 'open').length})
        </button>
        <button
          onClick={() => setActiveFilter('fixed')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
            activeFilter === 'fixed' ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Corregidos ({bugs.filter(b => b.status === 'fixed').length})
        </button>
        <button
          onClick={() => setActiveFilter('critical')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
            activeFilter === 'critical' ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Críticos ({bugs.filter(b => b.severity === 'critical' && b.status === 'open').length})
        </button>
      </div>

      {/* Bugs list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {filteredBugs.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/20 text-xs text-slate-500 font-sans">
            No se encontraron reportes con el filtro actual. ¡Buen trabajo!
          </div>
        ) : (
          filteredBugs.map((bug) => (
            <div
              key={bug.id}
              className={`p-3.5 rounded-xl border flex flex-col gap-3 hover:border-slate-700 transition-all ${
                bug.status === 'fixed' ? 'bg-slate-950/20 border-slate-900 opacity-60' : 'bg-slate-950/40 border-slate-900'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-bold text-slate-200">{bug.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border uppercase ${getSeverityPill(bug.severity)}`}>
                      {bug.severity}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    {bug.relatedModule ? `Módulo: ${bug.relatedModule}` : 'Módulo: General'}
                  </span>
                </div>

                {/* Status Toggle Menu */}
                <div className="flex items-center gap-1.5 bg-[#060a12] px-1 py-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    onClick={() => onUpdateBugStatus(bug.id, 'open')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                      bug.status === 'open' ? 'bg-orange-500/15 text-orange-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    OPEN
                  </button>
                  <button
                    onClick={() => onUpdateBugStatus(bug.id, 'fixed')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                      bug.status === 'fixed' ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    FIXED
                  </button>
                  <button
                    onClick={() => onUpdateBugStatus(bug.id, 'monitoring')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                      bug.status === 'monitoring' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    MONITOR
                  </button>
                  <button
                    onClick={() => onUpdateBugStatus(bug.id, 'wont_fix')}
                    className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                      bug.status === 'wont_fix' ? 'bg-slate-800 text-slate-400' : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    WONT
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{bug.description}</p>

              {/* Delete custom bugs */}
              {onDeleteBug && (
                <div className="flex justify-between items-center text-[9px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
                  <span>ID: #{bug.id.substring(0, 8)}</span>
                  <button
                    onClick={() => onDeleteBug(bug.id)}
                    className="text-slate-600 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors font-mono"
                  >
                    <Trash2 className="w-3 h-3" /> BORRAR REGISTRO
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
