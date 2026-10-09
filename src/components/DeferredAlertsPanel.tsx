import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Hourglass, ShieldCheck } from 'lucide-react';
import { loadDeferredAlerts, clearDeferredAlerts } from '../services/deferredAlertQueueService';
import { ScheduledAlertItem } from '../types/weatherTypes';

export default function DeferredAlertsPanel() {
  const [alerts, setAlerts] = useState<ScheduledAlertItem[]>(loadDeferredAlerts());

  const refreshList = () => {
    setAlerts(loadDeferredAlerts());
  };

  useEffect(() => {
    window.addEventListener('orbi-deferred-alerts-changed', refreshList);
    return () => {
      window.removeEventListener('orbi-deferred-alerts-changed', refreshList);
    };
  }, []);

  const handleClear = () => {
    clearDeferredAlerts();
    refreshList();
  };

  return (
    <div id="deferred-alerts-panel" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans flex items-center gap-2">
            <Hourglass className="w-4.5 h-4.5 text-indigo-400 animate-pulse" /> Cola de Alertas Diferidas
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">Alertas reprogramadas por restricciones de horario silencioso</p>
        </div>
        {alerts.length > 0 && (
          <button
            onClick={handleClear}
            className="p-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/10 transition-colors flex items-center gap-1.5 font-mono"
            title="Limpiar cola"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 rounded-xl bg-slate-950/40 border border-slate-800/60 text-center flex flex-col items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
            No hay alertas diferidas. SkyCore seguirá observando condiciones relevantes.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const timeStr = new Date(alert.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      alert.severity === 'critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : alert.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate font-sans">{alert.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans line-clamp-2">{alert.body}</p>
                  <p className="text-[10px] text-indigo-400/90 font-sans italic pt-0.5">
                    {alert.title} — {alert.reason.toLowerCase()}. Se evaluará después de las {timeStr}.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0 whitespace-nowrap bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  DIFERIDA
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
