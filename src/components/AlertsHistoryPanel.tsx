import { useState, useEffect } from 'react';
import { SmartWeatherAlert } from '../types/weatherTypes';
import { getAlertSeverityLabel } from '../utils/skyCoreAlertFormatter';
import { Trash2, History, AlertCircle, Calendar } from 'lucide-react';

interface AlertsHistoryPanelProps {
  alerts: SmartWeatherAlert[];
}

export default function AlertsHistoryPanel({ alerts }: AlertsHistoryPanelProps) {
  const [history, setHistory] = useState<any[]>([]);

  // Load from localStorage and sync new ones
  useEffect(() => {
    const saved = localStorage.getItem('orbi_clima_smart_alerts_history_v1');
    let localHistory: any[] = [];
    if (saved) {
      try {
        localHistory = JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Merge new alerts if they aren't already in history
    let updated = [...localHistory];
    let changed = false;

    alerts.forEach((alert) => {
      // Avoid duplicates in history
      const exists = updated.some(item => item.id === alert.id && item.timeLabel === alert.timeLabel);
      if (!exists) {
        updated.unshift({
          id: alert.id,
          title: alert.title,
          severity: alert.severity,
          category: alert.category,
          profile: alert.profile,
          createdAt: alert.createdAt,
          timeLabel: alert.timeLabel,
        });
        changed = true;
      }
    });

    if (changed) {
      // Limit to 20
      updated = updated.slice(0, 20);
      localStorage.setItem('orbi_clima_smart_alerts_history_v1', JSON.stringify(updated));
    }

    setHistory(updated);
  }, [alerts]);

  const clearHistory = () => {
    localStorage.removeItem('orbi_clima_smart_alerts_history_v1');
    setHistory([]);
  };

  const getSeverityClass = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'watch':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString([], { day: '2-digit', month: 'short' });
    } catch {
      return 'Hace un momento';
    }
  };

  return (
    <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col gap-3" id="alerts-history-panel">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-sans font-bold text-white uppercase tracking-wider">
            Historial local de alertas SkyCore
          </span>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/5 hover:bg-red-500/10 px-2 py-1 rounded-md border border-red-500/10 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            LIMPIAR
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 text-center text-white/30 border border-dashed border-white/5 rounded-xl bg-black/20">
          <AlertCircle className="w-6 h-6 mb-1.5" />
          <p className="text-xs font-sans">No hay registros en el historial todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {history.map((item, index) => (
            <div 
              key={index}
              className="p-2.5 rounded-xl bg-black/35 border border-white/5 hover:border-white/10 transition-all flex flex-col gap-1 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-sans font-bold text-white leading-snug">
                  {item.title}
                </span>
                <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${getSeverityClass(item.severity)}`}>
                  {getAlertSeverityLabel(item.severity)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-[9px] font-mono text-white/40 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-white/20" />
                  {formatTimestamp(item.createdAt)}
                </span>
                <span className="uppercase">
                  {item.profile === 'field_tech' ? 'Técnico Terreno' : 'Persona'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
