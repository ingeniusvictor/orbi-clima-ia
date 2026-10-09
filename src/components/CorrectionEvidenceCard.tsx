import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, ClipboardList, HelpCircle } from 'lucide-react';
import { PostRcFixItem } from '../services/pilotFeedbackService';

interface CorrectionEvidenceCardProps {
  fixes: PostRcFixItem[];
  onUpdateFix: (id: string, partial: any) => void;
}

export default function CorrectionEvidenceCard({ fixes, onUpdateFix }: CorrectionEvidenceCardProps) {
  const [selectedFixId, setSelectedFixId] = useState<string>('');
  
  // Evidence states
  const [whatChanged, setWhatChanged] = useState('');
  const [whereChanged, setWhereChanged] = useState('');
  const [howTested, setHowTested] = useState('');
  const [deviceUsed, setDeviceUsed] = useState('');
  const [result, setResult] = useState('Exitoso (OK)');
  const [validator, setValidator] = useState('');

  const activeFixes = fixes.filter(f => !['validated', 'closed'].includes(f.status));

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixId) return;

    const summary = `Qué se corrigió: ${whatChanged} | Dónde: ${whereChanged} | Cómo se probó: ${howTested}`;
    const validation = `Dispositivo: ${deviceUsed} | Resultado: ${result} | Validador: ${validator || 'Admin'} | Fecha: ${new Date().toLocaleDateString('es-CL')}`;

    onUpdateFix(selectedFixId, {
      fixSummary: summary,
      validationNotes: validation,
      status: 'validated' // Auto transition to validated on evidence submission!
    });

    // Reset Form
    setSelectedFixId('');
    setWhatChanged('');
    setWhereChanged('');
    setHowTested('');
    setDeviceUsed('');
    setValidator('');
    alert('Evidencia de corrección registrada y parche promovido a "Validado".');
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Cada parche realizado debe contar con un registro formal de evidencia técnica que sustente el cierre de la observación, de modo de garantizar la trazabilidad de calidad de ORBI SkyCore™.
      </p>

      {activeFixes.length === 0 ? (
        <div className="p-4 bg-emerald-500/5 border border-dashed border-emerald-500/25 rounded-xl text-center">
          <p className="text-[10px] text-emerald-400 font-mono font-bold">✨ ¡No hay correcciones pendientes de evidencia! Todas están validadas o cerradas.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitEvidence} className="bg-slate-950/40 p-3.5 rounded-lg border border-slate-800 space-y-3">
          <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Registrar Evidencia de Remediación
          </h5>

          <div className="text-[10px]">
            <label className="block text-slate-400 font-medium mb-1">Seleccionar Corrección Activa *</label>
            <select
              required
              value={selectedFixId}
              onChange={e => setSelectedFixId(e.target.value)}
              className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
            >
              <option value="">-- Seleccionar Fix --</option>
              {activeFixes.map(f => (
                <option key={f.id} value={f.id}>[{f.priority.toUpperCase()}] {f.title}</option>
              ))}
            </select>
          </div>

          {selectedFixId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[10px]">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Qué se corrigió *</label>
                  <input
                    type="text"
                    required
                    value={whatChanged}
                    onChange={e => setWhatChanged(e.target.value)}
                    placeholder="Ej: Se colapsaron secciones secundarias en Home"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Dónde se corrigió *</label>
                  <input
                    type="text"
                    required
                    value={whereChanged}
                    onChange={e => setWhereChanged(e.target.value)}
                    placeholder="Ej: MobileHomeScreen.tsx"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cómo se probó *</label>
                  <input
                    type="text"
                    required
                    value={howTested}
                    onChange={e => setHowTested(e.target.value)}
                    placeholder="Ej: Scroll vertical verificado en pantalla 6\"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Dispositivo usado *</label>
                  <input
                    type="text"
                    required
                    value={deviceUsed}
                    onChange={e => setDeviceUsed(e.target.value)}
                    placeholder="Ej: Samsung Galaxy S23"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Resultado de la Prueba</label>
                  <select
                    value={result}
                    onChange={e => setResult(e.target.value)}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200"
                  >
                    <option value="Exitoso (OK)">Exitoso (OK)</option>
                    <option value="Monitoreo requerido">Monitoreo requerido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Validador / Tester Responsable *</label>
                  <input
                    type="text"
                    required
                    value={validator}
                    onChange={e => setValidator(e.target.value)}
                    placeholder="Ej: Carlos Mendoza"
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-all cursor-pointer"
              >
                PROMOVER PARCHE A VALIDADO ✅
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
