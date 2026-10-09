import React from 'react';
import { MODULE_COMPLETION_MATRIX } from '../utils/moduleCompletionMatrix';
import { CheckSquare, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ModuleCompletionMatrixCard() {
  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Resumen de la matriz de madurez técnica de los 13 módulos del proyecto. Todos deben estar en estado <strong className="text-emerald-400">Completed</strong> para certificar la estabilidad de la v1.0.
      </p>

      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {MODULE_COMPLETION_MATRIX.map(m => {
          return (
            <div
              key={m.id}
              className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1.5 hover:border-slate-800 transition-all text-[10px]"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="font-mono text-pink-400 font-bold bg-pink-500/10 px-1.5 py-0.2 rounded text-[8.5px]">
                  {m.id}
                </span>
                <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[8px] font-bold">
                  {m.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h5 className="font-bold text-slate-200 text-[10px]">{m.name}</h5>
                <p className="text-slate-400 mt-1 text-[9px]"><strong className="text-slate-500">Evidencia:</strong> {m.evidence}</p>
                <p className="text-slate-500 mt-0.5 text-[9px]"><strong className="text-slate-600">Riesgo residual:</strong> {m.residualRisk}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
