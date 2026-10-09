import { AlertTriangle, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { SkyCoreRecommendation } from '../types/weatherTypes';

interface PriorityRecommendationCardProps {
  recommendations: SkyCoreRecommendation[];
}

export default function PriorityRecommendationCard({ recommendations }: PriorityRecommendationCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-rose-500/30 bg-rose-500/[0.03] text-rose-400';
      case 'high':
        return 'border-amber-500/20 bg-amber-500/[0.02] text-amber-300';
      case 'medium':
        return 'border-sky-500/20 bg-sky-500/[0.01] text-sky-300';
      case 'low':
      default:
        return 'border-white/5 bg-white/[0.01] text-white/70';
    }
  };

  const getPriorityTag = (priority: string) => {
    switch (priority) {
      case 'critical': return 'CRÍTICO';
      case 'high': return 'ALTO';
      case 'medium': return 'MEDIO';
      case 'low': return 'INFORMATIVO';
      default: return priority.toUpperCase();
    }
  };

  // Show only top 3 primary recommendations
  const primaryRecs = recommendations.slice(0, 3);

  return (
    <div id="priority-recs" className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-xs font-mono font-bold tracking-wider text-white/50 uppercase">
          Recomendaciones Priorizadas
        </h4>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
          Activas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {primaryRecs.map((rec) => {
          const colorClass = getPriorityColor(rec.priority);
          
          return (
            <div
              key={rec.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 ${colorClass}`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold tracking-wider uppercase bg-white/5 px-2 py-0.5 rounded">
                    {getPriorityTag(rec.priority)}
                  </span>
                  {rec.priority === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <h5 className="text-xs font-sans font-bold text-white leading-tight">
                    {rec.title}
                  </h5>
                  <p className="text-[11px] font-sans text-white/70 leading-relaxed">
                    {rec.message}
                  </p>
                </div>
              </div>

              {rec.actionLabel && (
                <button className="w-full mt-1 px-3 py-1.5 text-[10px] font-mono font-bold bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/5 rounded-xl text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/50" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
