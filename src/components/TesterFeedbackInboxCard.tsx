import React, { useState } from 'react';
import { Plus, Trash2, Clipboard, Edit2, Check, X, AlertTriangle, MessageSquare, Shield } from 'lucide-react';
import { PilotFeedbackItem, PilotFeedbackType, PilotFeedbackSeverity, PilotFeedbackStatus } from '../services/pilotFeedbackService';
import { FEEDBACK_TYPE_LABELS, SEVERITY_LABELS } from '../utils/feedbackClassification';
import { DEFAULT_FEEDBACK_QUESTIONNAIRE } from '../utils/testerFeedbackTemplates';

interface TesterFeedbackInboxCardProps {
  feedback: PilotFeedbackItem[];
  onAddFeedback: (item: any) => void;
  onUpdateFeedback: (id: string, partial: any) => void;
  onDeleteFeedback: (id: string) => void;
  onLinkToFix: (id: string) => void;
}

export default function TesterFeedbackInboxCard({
  feedback,
  onAddFeedback,
  onUpdateFeedback,
  onDeleteFeedback,
  onLinkToFix
}: TesterFeedbackInboxCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [testerName, setTesterName] = useState('');
  const [testerRole, setTesterRole] = useState('field_tech');
  const [deviceModel, setDeviceModel] = useState('');
  const [androidVersion, setAndroidVersion] = useState('14');
  const [type, setType] = useState<PilotFeedbackType>('bug');
  const [severity, setSeverity] = useState<PilotFeedbackSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [actualBehavior, setActualBehavior] = useState('');
  const [status, setStatus] = useState<PilotFeedbackStatus>('new');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddFeedback({
      testerName: testerName || 'Anónimo',
      testerRole,
      deviceModel: deviceModel || 'Simulador Android',
      androidVersion,
      appVersion: '1.0.0-rc.1',
      type,
      severity,
      title,
      description,
      reproductionSteps,
      expectedBehavior,
      actualBehavior,
      status
    });

    // Reset Form
    setTesterName('');
    setDeviceModel('');
    setTitle('');
    setDescription('');
    setReproductionSteps('');
    setExpectedBehavior('');
    setActualBehavior('');
    setIsAdding(false);
  };

  const handlePasteQuestionnaireTemplate = (question: string) => {
    setTitle(`Pregunta Piloto: ${question.replace('¿', '').replace('?', '')}`);
    setDescription(`Tester responde al cuestionario de control:\n\nPregunta: ${question}\nRespuesta: OK / Sin fallas en el dispositivo real.`);
    setExpectedBehavior('La aplicación funciona sin incidentes en este punto.');
    setActualBehavior('Funcionamiento correcto verificado en terreno.');
    setType('ux_observation');
    setSeverity('low');
    setIsAdding(true);
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-slate-300 font-mono">Bandeja de Entrada (Inbox)</h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 px-2 py-1 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 font-mono font-bold rounded text-[10px] cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> {isAdding ? 'CANCELAR NUEVO' : 'CREAR FEEDBACK'}
        </button>
      </div>

      {/* Questionnaire quick pasting */}
      {!isAdding && (
        <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/60">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
            <Clipboard className="w-3 h-3 text-pink-400" /> Cargar Pregunta de Plantilla
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
            {DEFAULT_FEEDBACK_QUESTIONNAIRE.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handlePasteQuestionnaireTemplate(q)}
                className="text-[9px] text-slate-300 bg-slate-850 hover:bg-pink-500/10 hover:text-pink-300 px-2 py-1 border border-slate-800 rounded transition-all cursor-pointer text-left truncate max-w-[190px]"
                title={q}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Adding Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800 space-y-3">
          <div className="grid grid-cols-2 gap-2.5 text-[10px]">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Nombre del Tester</label>
              <input
                type="text"
                value={testerName}
                onChange={e => setTesterName(e.target.value)}
                placeholder="Carlos Mendoza (Opcional)"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Rol de Testing</label>
              <select
                value={testerRole}
                onChange={e => setTesterRole(e.target.value)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
              >
                <option value="field_tech">Técnico Terreno (field_tech)</option>
                <option value="general_user">Usuario General (general_user)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Modelo de Dispositivo</label>
              <input
                type="text"
                value={deviceModel}
                onChange={e => setDeviceModel(e.target.value)}
                placeholder="XCover 6 Pro (Opcional)"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Android OS Versión</label>
              <input
                type="text"
                value={androidVersion}
                onChange={e => setAndroidVersion(e.target.value)}
                placeholder="14 (Opcional)"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Tipo de Feedback</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as PilotFeedbackType)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
              >
                {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Severidad del Reporte</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as PilotFeedbackSeverity)}
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
              >
                {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Título Resumido *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Falla de carga de widgets en Android 15"
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Descripción de la Observación *</label>
            <textarea
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describa el comportamiento de la app en detalle..."
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50 h-16 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Comportamiento Esperado</label>
              <input
                type="text"
                value={expectedBehavior}
                onChange={e => setExpectedBehavior(e.target.value)}
                placeholder="Cómo debería actuar"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Comportamiento Actual</label>
              <input
                type="text"
                value={actualBehavior}
                onChange={e => setActualBehavior(e.target.value)}
                placeholder="Cómo actúa actualmente"
                className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
              />
            </div>
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Pasos de Reproducción</label>
            <textarea
              value={reproductionSteps}
              onChange={e => setReproductionSteps(e.target.value)}
              placeholder="1. Abrir app\n2. Presionar widget..."
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50 h-12 resize-none"
            />
          </div>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Estado de Entrada Inicial</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as PilotFeedbackStatus)}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-pink-500/50"
            >
              <option value="new">Nuevo (New)</option>
              <option value="triaged">Triage (Triaged)</option>
              <option value="needs_fix">Requiere Ajustes (Needs Fix)</option>
              <option value="monitoring">Monitoreo Preventivo (Monitoring)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-pink-500 hover:bg-pink-600 text-slate-950 font-bold rounded text-xs transition-all cursor-pointer"
          >
            GUARDAR OBSERVACIÓN LOCAL
          </button>
        </form>
      )}

      {/* Feedback List */}
      <div className="space-y-2">
        {feedback.length === 0 ? (
          <div className="p-6 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">
            <p className="text-[10px] text-slate-500 font-mono">Bandeja de entrada vacía. Cree o simule feedback desde la plantilla.</p>
          </div>
        ) : (
          feedback.map(fb => {
            const isCritical = fb.severity === 'critical';
            return (
              <div
                key={fb.id}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isCritical 
                    ? 'bg-rose-500/5 border-rose-500/30' 
                    : 'bg-slate-900/30 border-slate-800/80'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                        isCritical 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {SEVERITY_LABELS[fb.severity].toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {FEEDBACK_TYPE_LABELS[fb.type]}
                      </span>
                      {fb.linkedFixId && (
                        <span className="px-1.5 py-0.2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[8px] font-mono rounded">
                          🔗 LINKED: {fb.linkedFixId}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-slate-200 mt-1">{fb.title}</h5>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newStatus = prompt(
                          'Cambiar estado del feedback:\nnuevo, triaged, accepted, rejected, needs_fix, monitoring, fixed, validated, closed',
                          fb.status
                        );
                        if (newStatus && [
                          'new', 'triaged', 'accepted', 'rejected', 'needs_fix', 'monitoring', 'fixed', 'validated', 'closed'
                        ].includes(newStatus)) {
                          onUpdateFeedback(fb.id, { status: newStatus as PilotFeedbackStatus });
                        }
                      }}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-mono text-[9px] cursor-pointer"
                      title="Cambiar estado"
                    >
                      {fb.status.toUpperCase()}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar reporte de feedback?')) {
                          onDeleteFeedback(fb.id);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <p className="text-[10px] text-slate-400 mt-1.5 bg-slate-950/20 p-2 rounded border border-slate-850">
                  {fb.description}
                </p>

                {/* Secondary details */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-800/40">
                  <div>
                    <span className="text-slate-400">Tester:</span> {fb.testerName} ({fb.testerRole})
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Dispositivo:</span> {fb.deviceModel} (A{fb.androidVersion})
                  </div>
                </div>

                {fb.reproductionSteps && (
                  <div className="mt-1.5 text-[9px] font-mono text-slate-500 bg-slate-950/40 p-1.5 rounded">
                    <span className="text-slate-400 block font-bold">Pasos:</span>
                    {fb.reproductionSteps}
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
