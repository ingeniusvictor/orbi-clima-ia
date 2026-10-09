import React from 'react';
import { FINAL_RISK_REVIEW, NATIVE_HSE_DIRECTIVE, getResidualRiskSummary } from '../utils/finalRiskReview';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function FinalRiskReviewCard() {
  const summary = getResidualRiskSummary();

  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Declaración formal de riesgos operativos residuales. Todo factor de riesgo ha sido evaluado y mitigado localmente de acuerdo al manual de calidad SkyCore™.
      </p>

      {/* Mandatory Official HSE Directive Notice */}
      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[10px] space-y-1.5">
        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400 text-[9px] uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" /> Directiva de Seguridad de Terreno
        </div>
        <p className="text-slate-300 font-medium italic">
          "{NATIVE_HSE_DIRECTIVE}"
        </p>
      </div>

      {/* Risk Summary Badge Row */}
      <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
        <div className="p-2 bg-rose-500/5 border border-rose-500/25 rounded-lg">
          <span className="text-rose-400 font-bold block text-sm">{summary.high}</span>
          <span className="text-slate-500 text-[8px] uppercase">Riesgo Alto</span>
        </div>
        <div className="p-2 bg-amber-500/5 border border-amber-500/25 rounded-lg">
          <span className="text-amber-400 font-bold block text-sm">{summary.med}</span>
          <span className="text-slate-500 text-[8px] uppercase">Riesgo Medio</span>
        </div>
        <div className="p-2 bg-emerald-500/5 border border-emerald-500/25 rounded-lg">
          <span className="text-emerald-400 font-bold block text-sm">{summary.low}</span>
          <span className="text-slate-500 text-[8px] uppercase">Riesgo Bajo</span>
        </div>
      </div>

      {/* List of risks */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {FINAL_RISK_REVIEW.map(r => {
          const isHigh = r.level === 'Alto';
          const isMed = r.level === 'Medio';

          return (
            <div
              key={r.id}
              className="p-3 bg-slate-950/40 rounded-lg border border-slate-850 space-y-1 text-[10px]"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-slate-500 font-bold font-mono text-[8.5px] uppercase">
                  {r.category}
                </span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] font-bold ${
                  isHigh 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                    : isMed 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {r.level.toUpperCase()}
                </span>
              </div>

              <p className="font-bold text-slate-200 text-[9.5px]">{r.risk}</p>
              <p className="text-slate-400 text-[9px] mt-1"><strong className="text-slate-500">Mitigación:</strong> {r.mitigation}</p>
              
              <div className="pt-1.5 flex justify-between items-center text-[9px] font-mono border-t border-slate-900/40 mt-1.5 text-slate-500">
                <span>ID: {r.id}</span>
                <span className="text-emerald-400 font-bold">Estado: {r.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
