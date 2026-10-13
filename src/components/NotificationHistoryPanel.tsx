import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { loadNotificationHistory, clearNotificationHistory } from '../services/notificationHistoryService';
import {
  getUnreadNotifications,
  isNotificationRead,
  markAllNotificationsRead,
  markNotificationRead,
  ORBI_NOTIFICATION_READ_STATE_EVENT,
  resetNotificationReadState,
} from '../services/notificationReadStateService';
import { OrbiNotificationHistoryItem } from '../types/weatherTypes';
import { Trash2, Bell, AlertTriangle, ShieldAlert, Info, Clock, CheckCheck, CheckCircle2 } from 'lucide-react';

interface NotificationHistoryPanelProps {
  refreshTrigger?: number;
  mode?: 'all' | 'unread';
}

export default function NotificationHistoryPanel({ refreshTrigger = 0, mode = 'all' }: NotificationHistoryPanelProps) {
  const [history, setHistory] = useState<OrbiNotificationHistoryItem[]>([]);

  const fetchHistory = useCallback(() => {
    setHistory(loadNotificationHistory());
  }, []);

  useEffect(() => {
    fetchHistory();

    window.addEventListener('orbi-web-notification', fetchHistory as EventListener);
    window.addEventListener(ORBI_NOTIFICATION_READ_STATE_EVENT, fetchHistory as EventListener);

    return () => {
      window.removeEventListener('orbi-web-notification', fetchHistory as EventListener);
      window.removeEventListener(ORBI_NOTIFICATION_READ_STATE_EVENT, fetchHistory as EventListener);
    };
  }, [fetchHistory, refreshTrigger]);

  const visibleHistory = useMemo(
    () => mode === 'unread' ? getUnreadNotifications(history) : history,
    [history, mode]
  );

  const handleClear = () => {
    clearNotificationHistory();
    resetNotificationReadState();
    fetchHistory();
  };

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    fetchHistory();
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(history);
    fetchHistory();
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 text-red-300 border-red-500/25',
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          label: 'Crítica',
        };
      case 'warning':
        return {
          bg: 'bg-orange-500/10 text-orange-300 border-orange-500/25',
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
          label: 'Importante',
        };
      case 'watch':
        return {
          bg: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Precaución',
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/25',
          icon: <Info className="w-3.5 h-3.5" />,
          label: 'Información',
        };
    }
  };

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const sameDay = date.toDateString() === now.toDateString();
      const time = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      if (sameDay) return `Hoy · ${time}`;
      return `${date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })} · ${time}`;
    } catch {
      return 'Reciente';
    }
  };

  const sourceLabel = (item: OrbiNotificationHistoryItem) => {
    if (item.source === 'official_senapred') return 'SENAPRED';
    if (item.profile === 'field_tech') return 'SkyCore · Terreno';
    return 'SkyCore';
  };

  const isUnreadMode = mode === 'unread';

  return (
    <div className="flex flex-col gap-3" id={`notification-history-panel-${mode}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            {isUnreadMode ? <Bell className="w-4 h-4 text-cyan-400" /> : <Clock className="w-4 h-4 text-slate-400" />}
            {isUnreadMode ? 'Nuevos para ti' : 'Historial de avisos'}
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isUnreadMode
              ? 'Solo aparecen aquí los avisos que todavía no has leído.'
              : 'Aquí quedan los avisos anteriores, incluso después de leerlos.'}
          </p>
        </div>

        {isUnreadMode && visibleHistory.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="shrink-0 text-[10px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/15 px-2.5 py-1.5 rounded-lg border border-cyan-500/20 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Leer todas
          </button>
        )}

        {!isUnreadMode && history.length > 0 && (
          <button
            onClick={handleClear}
            className="shrink-0 text-[10px] text-slate-500 hover:text-rose-300 flex items-center gap-1 transition-colors"
            id="btn-clear-history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto pr-1 flex flex-col gap-2.5 custom-scrollbar">
        <AnimatePresence initial={false}>
          {visibleHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 px-4 rounded-2xl border border-white/5 bg-white/[0.015] text-center flex flex-col items-center justify-center gap-2"
            >
              {isUnreadMode ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <Bell className="w-8 h-8 text-slate-600 stroke-[1.5]" />
              )}
              <p className="text-sm font-semibold text-slate-200">
                {isUnreadMode ? 'Todo al día' : 'Aún no hay avisos guardados'}
              </p>
              <span className="text-[11px] text-slate-500 max-w-[260px] leading-relaxed">
                {isUnreadMode
                  ? 'Cuando llegue una notificación nueva aparecerá aquí y el icono Alertas mostrará un contador rojo.'
                  : 'Las notificaciones que ORBI envíe aparecerán aquí para que puedas consultarlas después.'}
              </span>
            </motion.div>
          ) : (
            visibleHistory.map((item) => {
              const severityInfo = getSeverityStyles(item.severity);
              const read = isNotificationRead(item, history);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 transition-colors ${
                    read
                      ? 'border-white/5 bg-[#0b1220]/45'
                      : 'border-cyan-500/25 bg-cyan-500/[0.055] shadow-[0_0_24px_rgba(34,211,238,0.04)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {!read && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-bold tracking-wider">
                            NUEVA
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border ${severityInfo.bg} flex items-center gap-1`}>
                          {severityInfo.icon}
                          {severityInfo.label}
                        </span>
                      </div>
                      <h5 className="font-semibold text-sm text-slate-100 leading-snug">
                        {item.title}
                      </h5>
                    </div>
                    <span className="text-[9px] text-slate-500 shrink-0 pt-0.5">
                      {formatDateTime(item.sentAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300/85 leading-relaxed">
                    {item.body}
                  </p>

                  <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-2">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">
                      {sourceLabel(item)}
                    </span>

                    {!read ? (
                      <button
                        onClick={() => handleMarkRead(item.id)}
                        className="text-[10px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Marcar como leída
                      </button>
                    ) : (
                      <span className="text-[9px] text-emerald-400/75 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Leída
                      </span>
                    )}
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
