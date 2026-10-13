import { useCallback, useEffect, useMemo, useState } from 'react';
import { SmartWeatherAlert, HourlyForecast, WeatherProfile } from '../types/weatherTypes';
import SmartAlertCard from './SmartAlertCard';
import AlertTimelineStrip from './AlertTimelineStrip';
import NotificationHistoryPanel from './NotificationHistoryPanel';
import { loadNotificationHistory } from '../services/notificationHistoryService';
import {
  getUnreadNotificationCount,
  ORBI_NOTIFICATION_READ_STATE_EVENT,
} from '../services/notificationReadStateService';
import { Bell, ShieldCheck, ChevronDown, ChevronUp, History, Activity, Inbox } from 'lucide-react';

interface SmartAlertsPanelProps {
  alerts: SmartWeatherAlert[];
  hourly: HourlyForecast[];
  profile: WeatherProfile;
}

export default function SmartAlertsPanel({ alerts, hourly, profile }: SmartAlertsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'active' | 'history'>('new');
  const [unreadCount, setUnreadCount] = useState(() => getUnreadNotificationCount(loadNotificationHistory()));

  const refreshUnreadCount = useCallback(() => {
    setUnreadCount(getUnreadNotificationCount(loadNotificationHistory()));
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    window.addEventListener('orbi-web-notification', refreshUnreadCount as EventListener);
    window.addEventListener(ORBI_NOTIFICATION_READ_STATE_EVENT, refreshUnreadCount as EventListener);

    return () => {
      window.removeEventListener('orbi-web-notification', refreshUnreadCount as EventListener);
      window.removeEventListener(ORBI_NOTIFICATION_READ_STATE_EVENT, refreshUnreadCount as EventListener);
    };
  }, [refreshUnreadCount]);

  const severityPriority: Record<string, number> = { critical: 4, warning: 3, watch: 2, info: 1 };

  const activeAlerts = useMemo(() => [...alerts].sort((a, b) => {
    const prioA = severityPriority[a.severity] || 0;
    const prioB = severityPriority[b.severity] || 0;
    return prioB - prioA;
  }), [alerts]);

  const hasActiveConditions = activeAlerts.length > 0;
  const displayedAlerts = showAll ? activeAlerts : (hasActiveConditions ? [activeAlerts[0]] : []);

  const statusText = unreadCount > 0
    ? `${unreadCount} ${unreadCount === 1 ? 'aviso nuevo' : 'avisos nuevos'} · ${activeAlerts.length} ${activeAlerts.length === 1 ? 'condición activa' : 'condiciones activas'}`
    : activeAlerts.length > 0
      ? `Todo leído · ${activeAlerts.length} ${activeAlerts.length === 1 ? 'condición activa' : 'condiciones activas'}`
      : 'Todo al día · sin condiciones relevantes';

  return (
    <div
      className="w-full bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden"
      id="smart-alerts-panel"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col gap-3 border-b border-white/5 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 relative">
            <Bell className="w-5 h-5 text-cyan-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-[9px] text-white font-mono font-bold rounded-full flex items-center justify-center border border-slate-900">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-sans font-bold text-white tracking-tight">
              Tus alertas
            </h3>
            <p className="text-[11px] text-white/50 mt-0.5">
              {statusText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/25'
                : 'text-white/45 hover:text-white/80 border border-white/5 bg-white/[0.02]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Nuevas
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[8px] min-w-4 h-4 px-1 rounded-full inline-flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'active'
                ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/25'
                : 'text-white/45 hover:text-white/80 border border-white/5 bg-white/[0.02]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Activas
            {activeAlerts.length > 0 && (
              <span className="bg-white/10 text-white/65 text-[8px] min-w-4 h-4 px-1 rounded-full inline-flex items-center justify-center">
                {activeAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/25'
                : 'text-white/45 hover:text-white/80 border border-white/5 bg-white/[0.02]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial
          </button>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="relative z-10">
          <NotificationHistoryPanel mode="unread" />
        </div>
      )}

      {activeTab === 'active' && (
        <div className="flex flex-col gap-4 relative z-10">
          <div className="rounded-xl border border-cyan-500/10 bg-cyan-500/[0.035] px-3 py-2.5">
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <span className="font-semibold text-cyan-300">Condiciones activas</span> muestran lo que sigue ocurriendo ahora o en las próximas horas. Pueden permanecer aquí aunque ya hayas leído la notificación y no generan por sí solas el contador rojo.
            </p>
          </div>

          {hourly && hourly.length > 0 && (
            <AlertTimelineStrip hourly={hourly} />
          )}

          {!hasActiveConditions ? (
            <div className="flex flex-col items-center justify-center p-7 text-center bg-black/25 border border-dashed border-white/5 rounded-2xl">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-sm font-sans font-bold text-white">
                Sin condiciones relevantes
              </h4>
              <p className="text-xs text-white/50 max-w-sm mt-1 leading-normal">
                {profile === 'field_tech'
                  ? 'SkyCore no detecta condiciones operativas que requieran atención para tu perfil en este momento.'
                  : 'SkyCore no detecta condiciones meteorológicas que requieran atención en este momento.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedAlerts.map((alert) => (
                <SmartAlertCard key={alert.id} alert={alert} />
              ))}

              {activeAlerts.length > 1 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 rounded-xl transition-all cursor-pointer"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      MOSTRAR SOLO LA MÁS IMPORTANTE
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      VER TODAS LAS CONDICIONES ({activeAlerts.length})
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="relative z-10">
          <NotificationHistoryPanel mode="all" />
        </div>
      )}
    </div>
  );
}
