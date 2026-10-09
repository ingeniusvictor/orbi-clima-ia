import React from 'react';
import { getFeedbackTypeStats, getFeedbackSeverityStats, FEEDBACK_TYPE_LABELS, SEVERITY_LABELS } from '../utils/feedbackClassification';
import { PilotFeedbackItem } from '../services/pilotFeedbackService';

interface FeedbackClassificationCardProps {
  feedback: PilotFeedbackItem[];
}

export default function FeedbackClassificationCard({ feedback }: FeedbackClassificationCardProps) {
  const typeStats = getFeedbackTypeStats(feedback);
  const severityStats = getFeedbackSeverityStats(feedback);

  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Clasificación autónoma del feedback recibido para evaluar el nivel de madurez técnica del Release Candidate. Todo feedback catalogado como <span className="text-rose-400 font-bold">Crítico</span> bloquea el cierre post-RC hasta ser remediado.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Severity stats */}
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">Clasificación por Gravedad</h5>
          <div className="space-y-1.5">
            {Object.entries(SEVERITY_LABELS).map(([key, label]) => {
              const count = severityStats[key as any] || 0;
              const percentage = feedback.length > 0 ? Math.round((count / feedback.length) * 100) : 0;
              
              let barColor = 'bg-slate-500';
              if (key === 'critical') barColor = 'bg-rose-500';
              else if (key === 'high') barColor = 'bg-amber-500';
              else if (key === 'medium') barColor = 'bg-cyan-400';

              return (
                <div key={key} className="text-[10px]">
                  <div className="flex justify-between items-center text-slate-400 font-mono mb-0.5">
                    <span>{label}</span>
                    <span className="font-bold text-slate-200">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor}`} style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Type stats */}
        <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
          <h5 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">Distribución por Categorías</h5>
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {Object.entries(FEEDBACK_TYPE_LABELS).map(([key, label]) => {
              const count = typeStats[key as any] || 0;
              if (count === 0) return null; // Only show category if has data
              return (
                <div key={key} className="flex justify-between items-center text-[10px] font-mono text-slate-400 py-0.5 border-b border-slate-900">
                  <span>{label}</span>
                  <span className="bg-slate-800 px-1.5 py-0.2 rounded font-bold text-slate-200">{count}</span>
                </div>
              );
            })}
            {feedback.length === 0 && (
              <p className="text-[9px] text-slate-500 font-mono italic">Sin datos de tipificación.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
