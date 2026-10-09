import React, { useState, useEffect } from 'react';
import { loadVersioningInfo, saveVersioningInfo, getInitialVersioningChecklist, VersioningInfo, VersioningCheckItem } from '../utils/versioningReadiness';
import { Tag, Edit2, CheckCircle2, Save, HelpCircle } from 'lucide-react';

export default function VersioningChecklistCard() {
  const [info, setInfo] = useState<VersioningInfo>(() => loadVersioningInfo());
  const [checklist, setChecklist] = useState<VersioningCheckItem[]>(() => {
    const saved = localStorage.getItem('orbi_clima_versioning_checklist_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return getInitialVersioningChecklist();
      }
    }
    return getInitialVersioningChecklist();
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editInfo, setEditInfo] = useState<VersioningInfo>({ ...info });

  const handleSaveInfo = () => {
    saveVersioningInfo(editInfo);
    setInfo(editInfo);
    setIsEditing(false);
  };

  const toggleCheck = (id: string) => {
    const updated = checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setChecklist(updated);
    localStorage.setItem('orbi_clima_versioning_checklist_v1', JSON.stringify(updated));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;

  return (
    <div id="orbi-versioning-card" className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Versioning & Identity</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">ESTADO DEL APPLICATION ID Y COMPILADOS</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            if (isEditing) {
              handleSaveInfo();
            } else {
              setEditInfo({ ...info });
              setIsEditing(true);
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 text-blue-400 text-xs rounded-lg font-bold transition-all cursor-pointer font-sans"
        >
          {isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
          {isEditing ? 'Guardar' : 'Editar Identidad'}
        </button>
      </div>

      {isEditing ? (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider mb-2">Editar Metadatos de Compilación</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-1">APP DISPLAY NAME</label>
              <input
                type="text"
                value={editInfo.appName}
                onChange={e => setEditInfo(prev => ({ ...prev, appName: e.target.value }))}
                className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-1">APPLICATION ID / PACKAGE NAME</label>
              <input
                type="text"
                value={editInfo.packageName}
                onChange={e => setEditInfo(prev => ({ ...prev, packageName: e.target.value }))}
                className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-1">VERSION NAME (LEGIBLE)</label>
              <input
                type="text"
                value={editInfo.versionName}
                onChange={e => setEditInfo(prev => ({ ...prev, versionName: e.target.value }))}
                className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-500 block mb-1">VERSION CODE (ENTERO)</label>
              <input
                type="number"
                value={editInfo.versionCode}
                onChange={e => setEditInfo(prev => ({ ...prev, versionCode: parseInt(e.target.value) || 0 }))}
                className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-mono text-slate-500 block mb-1">CANDIDATE LABEL (QA)</label>
              <input
                type="text"
                value={editInfo.candidateLabel}
                onChange={e => setEditInfo(prev => ({ ...prev, candidateLabel: e.target.value }))}
                className="w-full bg-[#050811] border border-slate-800 rounded-lg p-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer font-sans"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveInfo}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer font-sans"
            >
              Aplicar Cambios
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded-xl bg-slate-900/20 border border-white/5">
          <div className="text-center md:text-left">
            <span className="text-[9px] font-mono text-slate-500 block">APP DISPLAY NAME</span>
            <span className="text-xs font-sans font-bold text-slate-200">{info.appName}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[9px] font-mono text-slate-500 block">APPLICATION ID</span>
            <span className="text-xs font-mono text-blue-400 select-all block truncate" title={info.packageName}>{info.packageName}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[9px] font-mono text-slate-500 block">VERSION NAME</span>
            <span className="text-xs font-sans font-bold text-slate-200">{info.versionName}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[9px] font-mono text-slate-500 block">VERSION CODE</span>
            <span className="text-xs font-mono text-amber-400 font-bold">{info.versionCode}</span>
          </div>
          <div className="text-center md:text-left">
            <span className="text-[9px] font-mono text-slate-500 block">CANDIDATE LABEL</span>
            <span className="text-xs font-sans font-semibold text-slate-300 block truncate" title={info.candidateLabel}>{info.candidateLabel}</span>
          </div>
        </div>
      )}

      {/* Package Identity Warning banner */}
      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-bold text-amber-400 font-sans">Regla Crítica de Publicación</h4>
          <p className="text-[9px] text-amber-400/80 font-sans leading-relaxed">
            Una vez publicada la app en Google Play, cambiar el <span className="font-mono">applicationId</span> equivale a publicar una aplicación totalmente distinta. Manténgalo estable y alineado con su documentación.
          </p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-sans tracking-wide">VERIFICACIÓN DE COMPILADO ({completedCount}/{totalCount})</span>
          <span className="text-[10px] font-mono text-slate-500">{Math.round((completedCount/totalCount)*100)}% COMPLETO</span>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {checklist.map(item => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className="flex items-start gap-3 p-3 rounded-xl bg-[#060a12]/50 border border-white/5 hover:border-blue-500/20 transition-all cursor-pointer group"
            >
              <div className="mt-0.5 shrink-0">
                <CheckCircle2 className={`w-4 h-4 transition-colors ${item.completed ? 'text-emerald-400 fill-emerald-400/10' : 'text-slate-600 group-hover:text-slate-400'}`} />
              </div>
              <div className="space-y-0.5">
                <span className={`text-xs font-sans font-semibold transition-colors ${item.completed ? 'text-slate-300 line-through decoration-slate-600' : 'text-slate-200 group-hover:text-white'}`}>{item.label}</span>
                <p className="text-[10px] text-slate-500 font-sans leading-normal">{item.rule}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
