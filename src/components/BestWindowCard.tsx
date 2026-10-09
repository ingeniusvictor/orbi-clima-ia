import { Calendar, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { SkyCoreTimeWindow } from '../types/weatherTypes';
import { getDecisionBadgeClass, getDecisionLabel } from '../utils/skyCoreRiskLabels';

interface BestWindowCardProps {
  bestWindow?: SkyCoreTimeWindow;
}

export default function BestWindowCard({ bestWindow }: BestWindowCardProps) {
  if (!bestWindow) {
    return (
      <div id="best-window-card" className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 text-white/50">
        <Info className="w-5 h-5 text-sky-400 shrink-0" />
        <p className="text-xs font-sans">
          No se ha determinado una ventana ideal hoy debido a condiciones variables persistentes.
        </p>
      </div>
    );
  }

  const { label, startTime, endTime, decision, reason } = bestWindow;
  const badgeClass = getDecisionBadgeClass(decision);
  const decisionText = getDecisionLabel(decision);

  const getDecisionIcon = () => {
    switch (decision) {
      case 'optimal':
      case 'favorable':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'caution':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'not_recommended':
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
    }
  };

  return (
    <div id="best-window-card" className="p-5 rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all pointer-events-none" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
            Ventana Óptima SkyCore
          </span>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-lg border ${badgeClass}`}>
          {decisionText}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="text-2xl font-mono font-bold text-white tracking-tight flex items-baseline gap-2">
          <span>{startTime}</span>
          <span className="text-white/30 text-base font-sans font-normal">a</span>
          <span>{endTime}</span>
        </div>
        <p className="text-xs font-sans font-medium text-white/70">
          Bloque recomendado: <span className="text-sky-300">{label}</span>
        </p>
      </div>

      <div className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 p-3 rounded-xl mt-1">
        {getDecisionIcon()}
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40 leading-none">
            Análisis de Carga
          </span>
          <p className="text-[11px] font-sans text-white/80 leading-relaxed">
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
}
