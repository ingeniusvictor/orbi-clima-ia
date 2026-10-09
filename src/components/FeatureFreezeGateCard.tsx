import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, ArrowRight, Lock, HelpCircle } from 'lucide-react';
import { FeatureFreezeGateResult } from '../utils/featureFreezeGate';

interface FeatureFreezeGateCardProps {
  gateResult: FeatureFreezeGateResult;
  featureFreezeActive: boolean;
  onToggleFeatureFreeze: (active: boolean) => void;
}

export default function FeatureFreezeGateCard({
  gateResult,
  featureFreezeActive,
  onToggleFeatureFreeze
}: FeatureFreezeGateCardProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleActivateFreeze = () => {
    if (confirm('¿Confirmas que ORBI Clima IA v1.0 queda congelada?\nDesde este punto, no se agregarán nuevas funciones a esta versión.')) {
      onToggleFeatureFreeze(true);
    }
  };

  const handleDeactivateFreeze = () => {
    if (confirm('¿Desea levantar el congelamiento de características?')) {
      onToggleFeatureFreeze(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Compuerta estricta de validación. La versión estable 1.0 bloquea toda adición de nuevas características funcionales para cautelar la confiabilidad de los parches menores.
      </p>

      {/* Checklist items */}
      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800 space-y-2">
        <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex justify-between items-center">
          <span>Compuertas Técnicas de Congelamiento</span>
          <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
            gateResult.isPassed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {gateResult.status.toUpperCase()}
          </span>
        </h5>

        <div className="space-y-2 text-[10px]">
          {gateResult.requirements.map(req => (
            <div key={req.id} className="flex items-start gap-2 border-b border-slate-900/40 pb-1.5 last:border-0 last:pb-0">
              <span className={`shrink-0 text-xs mt-0.5 ${req.isMet ? 'text-emerald-400' : 'text-rose-400'}`}>
                {req.isMet ? '✅' : '❌'}
              </span>
              <div>
                <p className={`font-bold ${req.isMet ? 'text-slate-300' : 'text-rose-400'}`}>
                  {req.name}
                </p>
                <p className="text-[9px] text-slate-500">{req.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No More Features Acceptance Section */}
      <div className="p-3.5 bg-slate-900/30 rounded-xl border border-slate-800 space-y-3">
        <h6 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-pink-400" /> Declaración No More Features Gate
        </h6>
        
        <p className="text-[10px] text-slate-400 italic bg-slate-950/30 p-2.5 rounded border border-slate-850">
          "Acepto congelar ORBI Clima IA v1.0. Desde este punto, no se agregarán nuevas funciones a esta versión. Solo se permitirán correcciones críticas, ajustes menores, privacidad, packaging y estabilidad."
        </p>

        {gateResult.isPassed ? (
          <div>
            {!featureFreezeActive ? (
              <button
                type="button"
                onClick={handleActivateFreeze}
                className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-slate-950 font-bold rounded text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" /> ACTIVAR FEATURE FREEZE
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-center text-[10px] font-bold">
                  ❄️ FEATURE FREEZE ESTABLECIDO Y BLOQUEADO
                </div>
                <button
                  type="button"
                  onClick={handleDeactivateFreeze}
                  className="w-full py-1 bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold rounded text-[9px] font-mono transition-all cursor-pointer"
                >
                  Modificar Estado (Unlock)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2.5 bg-rose-500/5 text-rose-400 border border-rose-500/10 rounded-lg text-center text-[10px] font-mono">
            ⚠️ Resuelva todos los requerimientos bloqueantes listados arriba para poder activar la compuerta.
          </div>
        )}
      </div>
    </div>
  );
}
