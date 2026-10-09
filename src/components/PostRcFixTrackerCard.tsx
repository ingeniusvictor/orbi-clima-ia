import React, { useState } from 'react';
import { Plus, Trash2, Link2, CheckSquare, Clock, ShieldCheck, Wrench } from 'lucide-react';
import { PostRcFixItem, PilotFeedbackItem, PilotFeedbackSeverity, PostRcFixStatus } from '../services/pilotFeedbackService';
import { PRIORITY_LABELS, calculatePriority } from '../utils/fixPriorityScoring';

interface PostRcFixTrackerCardProps {
  fixes: PostRcFixItem[];
  feedback: PilotFeedbackItem[];
  onAddFix: (fix: any) => void;
  onUpdateFix: (id: string, partial: any) => void;
  onDeleteFix: (id: string) => void;
}

export default function PostRcFixTrackerCard({
  fixes,
  feedback,
  onAddFix,
  onUpdateFix,
  onDeleteFix
}: PostRcFixTrackerCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFbIds, setSelectedFbIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<'p0' | 'p1' | 'p2' | 'p3'>('p2');
  const [severity, setSeverity] = useState<PilotFeedbackSeverity>('medium');
  const [status, setStatus] = useState<PostRcFixStatus>('open');
  const [owner, setOwner] = useState('');
  const [fixSummary, setFixSummary] = useState('');
  const [validationNotes, setValidationNotes] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddFix({
      title,
      description,
      sourceFeedbackIds: selectedFbIds,
      priority,
      severity,
      status,
      owner: owner || 'Desarrollador',
      fixSummary,
      validationNotes
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setSelectedFbIds([]);
    setPriority('p2');
    setOwner('');
    setFixSummary('');
    setValidationNotes('');
    setIsAdding(false);
  };

  const handleAutoFillFromFeedback = (fb: PilotFeedbackItem) => {
    setTitle(`Arreglar: ${fb.title}`);
    setDescription(`Solución técnica a reporte: ${fb.description}`);
    setSelectedFbIds([fb.id]);
    setSeverity(fb.severity);
    
    // Auto calculate priority based on rule
    const calculated = calculatePriority(fb.severity, fb.type, fb.description);
    setPriority(calculated);
    setIsAdding(true);
  };

  const unlinkedFeedback = feedback.filter(fb => !fb.linkedFixId);

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-300 font-mono">Tracker de Correcciones (Post-RC Fixes)</h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 font-mono font-bold rounded text-[10px] cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> {isAdding ? 'CANCELAR NUEVO' : 'CREAR FIX'}
        </button>
      </div>

      {/* Triage feedback quick helper */}
      {!isAdding && unlinkedFeedback.length > 0 && (
        <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/60">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
            <Link2 className="w-3.5 h-3.5 text-cyan-400" /> Crear Corrección Desde Observación Abierta
          </p>
          <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
            {unlinkedFeedback.map(fb => (
              <div key={fb.id} className="flex justify-between items-center p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded transition-all text-[9px] font-mono">
                <span className="text-slate-300 truncate max-w-[210px]">{fb.title}</span>
                <button
                  onClick={() => handleAutoFillFromFeedback(fb)}
                  className="px-1.5 py-0.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 rounded font-bold transition-all cursor-pointer"
                >
                  PARCHEAR 🛠️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adding Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-2.5 text-[10px]">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Título de la Corrección *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Corregir scroll excesivo"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Dueño / Encargado</label>
              <input
                type="text"
                value={owner}
                onChange={e => setOwner(e.target.value)}
                placeholder="Equipo UX (Opcional)"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Prioridad (Matriz)</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
              >
                {Object.entries(PRIORITY_LABELS).map(([key, item]) => (
                  <option key={key} value={key}>{item.label} — {item.desc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Estado del Parche</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as PostRcFixStatus)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
              >
                <option value="open">Abierto (Open)</option>
                <option value="in_progress">En Progreso (In Progress)</option>
                <option value="ready_for_test">Listo para Testing (Ready for Test)</option>
                <option value="validated">Validado por Tester (Validated)</option>
                <option value="monitoring">Monitoreo Preventivo (Monitoring)</option>
                <option value="wont_fix">No Corregir (Wont Fix)</option>
                <option value="closed">Cerrado Completado (Closed)</option>
              </select>
            </div>
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Descripción Técnica del Cambio *</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describa el alcance de la corrección..."
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500/50 h-14 resize-none"
            />
          </div>

          {/* Linked feedback selection */}
          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Asociar Feedback Origen (IDs)</label>
            <div className="max-h-[80px] overflow-y-auto bg-slate-900 p-2 border border-slate-800 rounded space-y-1">
              {feedback.map(fb => {
                const isSelected = selectedFbIds.includes(fb.id);
                return (
                  <label key={fb.id} className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100 py-0.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (isSelected) {
                          setSelectedFbIds(selectedFbIds.filter(id => id !== fb.id));
                        } else {
                          setSelectedFbIds([...selectedFbIds, fb.id]);
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{fb.title} ({fb.id})</span>
                  </label>
                );
              })}
              {feedback.length === 0 && (
                <p className="text-[9px] text-slate-500 font-mono">No hay feedback disponible para asociar.</p>
              )}
            </div>
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Evidencia de Corrección (Qué y Cómo)</label>
            <input
              type="text"
              value={fixSummary}
              onChange={e => setFixSummary(e.target.value)}
              placeholder="Ej: Se colapsaron paneles secundarios. Probado en 6.5\"
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
            />
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Notas de Validación y Pruebas</label>
            <input
              type="text"
              value={validationNotes}
              onChange={e => setValidationNotes(e.target.value)}
              placeholder="Resultados correctos en terreno real"
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-bold rounded text-xs transition-all cursor-pointer"
          >
            GUARDAR REGISTRO DE PARCHE
          </button>
        </form>
      )}

      {/* Fixes List */}
      <div className="space-y-2">
        {fixes.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-500 font-mono">No hay parches ni fixes registrados en el tracker.</p>
          </div>
        ) : (
          fixes.map(fix => {
            const p = PRIORITY_LABELS[fix.priority];
            const isClosed = ['validated', 'closed'].includes(fix.status);
            return (
              <div
                key={fix.id}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isClosed 
                    ? 'bg-slate-900/10 border-slate-800/50 opacity-80' 
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border ${p.color}`}>
                        {p.label} — {p.desc.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        Responsable: {fix.owner}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-200 mt-1">{fix.title}</h5>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        const newStatus = prompt(
                          'Cambiar estado del Fix:\nopen, in_progress, ready_for_test, validated, wont_fix, monitoring, closed',
                          fix.status
                        );
                        if (newStatus && [
                          'open', 'in_progress', 'ready_for_test', 'validated', 'wont_fix', 'monitoring', 'closed'
                        ].includes(newStatus)) {
                          onUpdateFix(fix.id, { status: newStatus as PostRcFixStatus });
                        }
                      }}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[9px] cursor-pointer"
                      title="Cambiar estado"
                    >
                      {fix.status.toUpperCase()}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar registro de fix de parches?')) {
                          onDeleteFix(fix.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <p className="text-[10px] text-slate-400 mt-1.5 bg-slate-950/20 p-2 rounded border border-slate-850">
                  {fix.description}
                </p>

                {/* Validation Evidence */}
                {(fix.fixSummary || fix.validationNotes) && (
                  <div className="mt-2 p-2 bg-slate-950/40 rounded border border-slate-800/80 text-[10px] space-y-1">
                    {fix.fixSummary && (
                      <div>
                        <span className="text-cyan-400 font-mono font-bold">Solución:</span> {fix.fixSummary}
                      </div>
                    )}
                    {fix.validationNotes && (
                      <div>
                        <span className="text-emerald-400 font-mono font-bold">Validación:</span> {fix.validationNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Associated feedback */}
                {fix.sourceFeedbackIds && fix.sourceFeedbackIds.length > 0 && (
                  <div className="mt-2 text-[9px] font-mono text-slate-500 flex items-center gap-1">
                    <span className="text-slate-400">Feedback Asociado:</span>
                    {fix.sourceFeedbackIds.map(fId => (
                      <span key={fId} className="bg-slate-800 px-1 py-0.2 rounded text-slate-400">
                        {fId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
