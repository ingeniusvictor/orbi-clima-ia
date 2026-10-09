import React, { useState } from 'react';
import { QaEvidenceItem } from '../services/qaStateService';
import { ShieldCheck, Plus, FileText, Camera, CheckSquare, Trash2, Calendar } from 'lucide-react';

interface QaEvidencePanelProps {
  evidence: QaEvidenceItem[];
  onAddEvidence: (label: string, description: string, type: 'text' | 'screenshot_note' | 'manual_result' | 'build_log') => void;
  onDeleteEvidence: (id: string) => void;
}

export default function QaEvidencePanel({ evidence, onAddEvidence, onDeleteEvidence }: QaEvidencePanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'text' | 'screenshot_note' | 'manual_result' | 'build_log'>('manual_result');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !description.trim()) return;
    onAddEvidence(label, description, type);
    setLabel('');
    setDescription('');
    setType('manual_result');
    setShowAddForm(false);
  };

  const getIcon = (t: string) => {
    switch (t) {
      case 'screenshot_note':
        return <Camera className="w-4 h-4 text-cyan-400" />;
      case 'build_log':
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'manual_result':
        return <CheckSquare className="w-4 h-4 text-indigo-400" />;
      case 'text':
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'screenshot_note': return 'Captura / Nota Visual';
      case 'build_log': return 'Log de Compilación';
      case 'manual_result': return 'Resultado de Prueba Manual';
      case 'text':
      default: return 'Nota Escrita';
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Evidencias y Certificación Física</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">REGISTRO DE CONFORMIDAD Y PRUEBAS EN DISPOSITIVOS</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-500/15"
        >
          <Plus className="w-4 h-4" /> Registrar Evidencia
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Título / Identificador</label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej: Prueba táctil en Tablet Samsung"
                className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-indigo-500/40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Tipo de Evidencia</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-indigo-500/40 cursor-pointer"
              >
                <option value="manual_result">Resultado de Prueba Manual</option>
                <option value="screenshot_note">Captura / Nota Visual</option>
                <option value="build_log">Log de Compilación</option>
                <option value="text">Nota Escrita</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Descripción y Logs de Evidencia</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el dispositivo, comportamiento observado, versión de Android, conexión de red..."
              className="bg-[#060a12] border border-slate-800 rounded-lg text-xs px-3 py-2 text-slate-200 outline-none focus:border-indigo-500/40 resize-none font-sans"
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
              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-lg text-xs cursor-pointer"
            >
              Guardar Evidencia
            </button>
          </div>
        </form>
      )}

      {/* Evidences list */}
      <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {evidence.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/20 text-xs text-slate-500 font-sans">
            No se han registrado evidencias manuales todavía. Usa el botón superior para agregar una.
          </div>
        ) : (
          evidence.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900/80 flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-slate-800 transition-all group"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg shrink-0 mt-0.5">
                  {getIcon(ev.type)}
                </div>
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-sans font-bold text-slate-200">{ev.label}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[8.5px] font-mono border border-slate-700 uppercase">
                      {getTypeLabel(ev.type)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{ev.description}</p>
                  
                  {/* Timestamp */}
                  <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Registrado el {new Date(ev.createdAt).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              {/* Delete button (only allow delete for non-preset ones, e1 and e2 are presets) */}
              {ev.id !== 'e1' && ev.id !== 'e2' && (
                <button
                  onClick={() => onDeleteEvidence(ev.id)}
                  className="p-1.5 bg-slate-900 border border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-500/15 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer self-end sm:self-center"
                  title="Eliminar evidencia"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
