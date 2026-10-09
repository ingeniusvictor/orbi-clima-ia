import React from 'react';
import { Lock, Unlock, CheckCircle, AlertTriangle, FileBadge, RefreshCw } from 'lucide-react';
import { PilotFeedbackState } from '../services/pilotFeedbackService';
import { evaluatePostRcClosureGate } from '../utils/postRcClosureGate';

interface PostRcClosureGateCardProps {
  state: PilotFeedbackState;
  onClosePostRc: () => void;
  onReopenPostRc: () => void;
}

export default function PostRcClosureGateCard({
  state,
  onClosePostRc,
  onReopenPostRc
}: PostRcClosureGateCardProps) {
  const gate = evaluatePostRcClosureGate(state);

  const isClosed = state.postRcStatus === 'closed';

  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Compuerta inteligente de calidad post-revisión de terreno. Se deben validar todas las advertencias y bloqueos críticos antes de poder sellar formalmente el ciclo del parche.
      </p>

      {/* Checklist items */}
      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-2">
        <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center justify-between">
          <span>Requisitos del Parche de Piloto</span>
          <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
            gate.isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
          }`}>
            {gate.status.toUpperCase()}
          </span>
        </h5>

        <div className="space-y-2 text-[10px]">
          {gate.requirements.map(req => (
            <div key={req.id} className="flex items-start gap-2">
              <span className={`shrink-0 text-sm mt-0.5 ${req.isMet ? 'text-emerald-400' : 'text-rose-500'}`}>
                {req.isMet ? '✅' : '❌'}
              </span>
              <div>
                <p className={`font-bold ${req.isMet ? 'text-slate-300' : 'text-rose-400 font-bold'}`}>
                  {req.name}
                </p>
                <p className="text-[9px] text-slate-500">{req.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Action Block */}
      {isClosed ? (
        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-center space-y-3">
          <FileBadge className="w-10 h-10 text-emerald-400 mx-auto" />
          <div>
            <h4 className="text-xs font-bold text-emerald-400 font-mono">ESTADO CERTIFICADO: CICLO POST-RC CLAUSURADO</h4>
            <p className="text-[10px] text-slate-400 mt-1 max-w-sm mx-auto">
              El Pilot Feedback Loop para la versión RC1 ha concluido formalmente. Las correcciones han sido registradas y el parche menor RC1.1 cuenta con plena conformidad de calidad.
            </p>
          </div>
          <div className="pt-1.5 flex justify-center gap-2">
            <button
              onClick={onReopenPostRc}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono font-bold rounded text-[9px] cursor-pointer transition-all"
            >
              <Unlock className="w-3.5 h-3.5" /> REABRIR CONTROL DE PARCHES
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-start gap-2.5">
            {gate.isPassed ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div>
              <h5 className="text-[11px] font-bold text-slate-200">
                {gate.isPassed ? 'Listo para Sellar Cierre de Parche' : 'Cierre Bloqueado'}
              </h5>
              <p className="text-[9px] text-slate-400 mt-0.5">
                {gate.isPassed
                  ? 'Todos los requerimientos se encuentran conformes. Puede proceder a emitir el cierre final y bloquear las entradas para la prueba piloto.'
                  : 'Se requiere resolver o documentar debidamente todas las fallas críticas de terreno para poder sellar la compuerta.'}
              </p>
            </div>
          </div>

          <button
            disabled={!gate.isPassed}
            onClick={onClosePostRc}
            className={`w-full py-2 font-mono font-bold rounded text-xs transition-all flex items-center justify-center gap-1.5 ${
              gate.isPassed
                ? 'bg-emerald-400 hover:bg-emerald-500 text-slate-950 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> DECRETAR CIERRE FINAL POST-RC (RC1.1)
          </button>
        </div>
      )}
    </div>
  );
}
