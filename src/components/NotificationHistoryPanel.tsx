import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadNotificationHistory, clearNotificationHistory } from '../services/notificationHistoryService';
import { OrbiNotificationHistoryItem } from '../types/weatherTypes';
import { Trash2, Bell, AlertTriangle, ShieldAlert, Zap, Clock } from 'lucide-react';

interface NotificationHistoryPanelProps {
  refreshTrigger?: number;
}

export default function NotificationHistoryPanel({ refreshTrigger = 0 }: NotificationHistoryPanelProps) {
  const [history, setHistory] = useState<OrbiNotificationHistoryItem[]>([]);

  const fetchHistory = () => {
    setHistory(loadNotificationHistory());
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  const handleClear = () => {
    clearNotificationHistory();
    fetchHistory();
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          icon: <ShieldAlert className="w-3.5 h-3.5" />
        };
      case 'warning':
        return {
          bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          icon: <AlertTriangle className="w-3.5 h-3.5" />
        };
      case 'watch':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <Clock className="w-3.5 h-3.5" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: <Zap className="w-3.5 h-3.5" />
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col gap-4" id="notification-history-panel">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-cyan-500" />
          Historial de Notificaciones ({history.length})
        </h4>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors duration-200"
            id="btn-clear-history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-2.5 custom-scrollbar">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 px-4 rounded-2xl border border-white/5 bg-white/[0.01] text-center flex flex-col items-center justify-center gap-2"
              id="empty-notification-history"
            >
              <Bell className="w-8 h-8 text-slate-600 stroke-[1.5]" />
              <p className="text-xs text-slate-500">No se han enviado notificaciones locales todavía.</p>
              <span className="text-[10px] text-slate-600">
                Usa el botón de prueba o activa alertas reales para generar avisos.
              </span>
            </motion.div>
          ) : (
            history.map((item) => {
              const severityInfo = getSeverityStyles(item.severity);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3.5 rounded-xl border border-white/5 bg-[#0e1628]/60 flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-xs text-slate-200 line-clamp-1 flex-1">
                      {item.title}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${severityInfo.bg} flex items-center gap-1 shrink-0`}>
                      {severityInfo.icon}
                      {item.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.body}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-1.5">
                    <span>
                      Canal: <span className="text-slate-400 font-mono">{item.channel}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.sentAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
