import { useState, useEffect } from 'react';
import { 
  Cpu, Moon, ShieldAlert, Clock, AlertCircle, 
  CheckCircle, RefreshCw, Database, Trash2, Ban, Sparkles, Sliders, Hourglass
} from 'lucide-react';
import { loadQuietHoursSettings } from '../services/quietHoursService';
import { loadNotificationFrequencySettings } from '../services/notificationFrequencyService';
import { loadBlockedLogs, clearBlockedLogs } from '../services/notificationBlockLogService';
import { loadNotificationHistory } from '../services/notificationHistoryService';
import { loadScheduledSummarySettings } from '../services/scheduledSummaryService';
import { loadDeferredAlerts } from '../services/deferredAlertQueueService';
import { OrbiBlockedNotificationLog, OrbiNotificationHistoryItem, ScheduledAlertItem, ScheduledSummarySettings } from '../types/weatherTypes';
import { loadLastWeatherBundleTimestamp } from '../services/weatherCacheService';
import { loadUserPreferences } from '../services/userPreferencesService';

interface SmartSchedulerPanelProps {
  weatherMode: 'mock' | 'live' | 'fallback' | 'cached';
  lastUpdatedStr?: string;
}

export default function SmartSchedulerPanel({ weatherMode, lastUpdatedStr }: SmartSchedulerPanelProps) {
  const [quietHours, setQuietHours] = useState(loadQuietHoursSettings());
  const [frequency, setFrequency] = useState(loadNotificationFrequencySettings());
  const [blockedLogs, setBlockedLogs] = useState<OrbiBlockedNotificationLog[]>([]);
  const [lastNotification, setLastNotification] = useState<OrbiNotificationHistoryItem | null>(null);
  const [summarySettings, setSummarySettings] = useState<ScheduledSummarySettings>(loadScheduledSummarySettings());
  const [deferredAlerts, setDeferredAlerts] = useState<ScheduledAlertItem[]>(loadDeferredAlerts());
  const [dataAgeMinutes, setDataAgeMinutes] = useState<number>(0);
  const [userPrefs, setUserPrefs] = useState(() => loadUserPreferences());

  const loadData = () => {
    setQuietHours(loadQuietHoursSettings());
    setFrequency(loadNotificationFrequencySettings());
    setBlockedLogs(loadBlockedLogs());
    setSummarySettings(loadScheduledSummarySettings());
    setDeferredAlerts(loadDeferredAlerts());
    setUserPrefs(loadUserPreferences());
    
    const history = loadNotificationHistory();
    setLastNotification(history.length > 0 ? history[0] : null);
  };

  useEffect(() => {
    loadData();

    // Event listeners
    window.addEventListener('orbi-quiet-hours-changed', loadData);
    window.addEventListener('orbi-frequency-settings-changed', loadData);
    window.addEventListener('orbi-blocked-notifications-changed', loadData);
    window.addEventListener('orbi-summary-settings-changed', loadData);
    window.addEventListener('orbi-deferred-alerts-changed', loadData);
    window.addEventListener('orbi-web-notification', loadData);
    window.addEventListener('orbi-user-preferences-changed', loadData);

    return () => {
      window.removeEventListener('orbi-quiet-hours-changed', loadData);
      window.removeEventListener('orbi-frequency-settings-changed', loadData);
      window.removeEventListener('orbi-blocked-notifications-changed', loadData);
      window.removeEventListener('orbi-summary-settings-changed', loadData);
      window.removeEventListener('orbi-deferred-alerts-changed', loadData);
      window.removeEventListener('orbi-web-notification', loadData);
      window.removeEventListener('orbi-user-preferences-changed', loadData);
    };
  }, []);

  // Update data age timer
  useEffect(() => {
    const updateAge = () => {
      const cacheTimestamp = loadLastWeatherBundleTimestamp();
      if (cacheTimestamp) {
        const diffMs = Date.now() - cacheTimestamp;
        setDataAgeMinutes(Math.max(0, Math.floor(diffMs / (1000 * 60))));
      } else if (lastUpdatedStr) {
        // If no cache timestamp but we have lastUpdatedStr, try to parse it or default
        let targetTime = Date.now();
        if (lastUpdatedStr.includes(':')) {
          const [h, m] = lastUpdatedStr.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            const d = new Date();
            d.setHours(h, m, 0, 0);
            targetTime = d.getTime();
          }
        }
        const diffMs = Date.now() - targetTime;
        setDataAgeMinutes(Math.max(0, Math.floor(diffMs / (1000 * 60))));
      } else {
        setDataAgeMinutes(0);
      }
    };

    updateAge();
    const timer = setInterval(updateAge, 30000); // 30s
    return () => clearInterval(timer);
  }, [lastUpdatedStr]);

  const handleClearLogs = () => {
    clearBlockedLogs();
    setBlockedLogs([]);
  };

  const isFresh = dataAgeMinutes < 90;
  
  // Format mode nicely
  const getModeLabelAndColor = (mode: string) => {
    switch (mode) {
      case 'live':
        return { label: 'LIVE / TIEMPO REAL', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'cached':
        return { label: 'CACHED / LOCAL', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
      case 'fallback':
        return { label: 'FALLBACK', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      case 'mock':
      default:
        return { label: 'MOCK / DEMOSTRATIVO', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    }
  };

  const modeInfo = getModeLabelAndColor(weatherMode);

  return (
    <div className="p-6 rounded-3xl bg-[#0a1122]/50 border border-white/5 shadow-xl flex flex-col gap-5" id="smart-scheduler-panel">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 tracking-wide uppercase">Planificador Inteligente (Módulo 6B)</h3>
            <span className="text-[11px] text-slate-400 block font-mono">Smart Summaries, Cola Diferida y Guards Climáticos</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${modeInfo.color}`}>
            {modeInfo.label}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">
            SCHEDULER STATUS: 6B ACTIVE
          </span>
        </div>
      </div>

      {/* Local Preferences Sync Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300 font-sans font-bold">Ajustes de Memoria Local (Módulo 7A):</span>
          <span className="text-[10px] text-teal-400 bg-teal-500/10 border border-teal-500/15 px-1.5 py-0.5 rounded font-bold font-sans">
            Preferencias y memoria local sincronizadas.
          </span>
        </div>
        <div className="flex flex-wrap gap-4 text-slate-400">
          <div>
            <span>Perfil: </span>
            <span className="text-pink-400 font-bold capitalize">{userPrefs.preferredProfile === 'person' ? 'Persona' : 'Técnico Terreno'}</span>
          </div>
          <div>
            <span>Sensibilidad: </span>
            <span className={`font-bold capitalize ${
              userPrefs.alertSensitivity === 'high' ? 'text-rose-400' :
              userPrefs.alertSensitivity === 'low' ? 'text-teal-400' : 'text-amber-400'
            }`}>{userPrefs.alertSensitivity}</span>
          </div>
          <div>
            <span>Horas Silenciosas: </span>
            <span className={userPrefs.quietHoursEnabled ? "text-indigo-400 font-bold" : "text-slate-500"}>
              {userPrefs.quietHoursEnabled ? "Sincronizado" : "Desactivado"}
            </span>
          </div>
          <div>
            <span>Resúmenes Activos: </span>
            <span className="text-emerald-400 font-bold">
              {[
                userPrefs.morningSummaryEnabled ? 'Mañana' : null,
                userPrefs.fieldSummaryEnabled ? 'Pre-Jornada' : null
              ].filter(Boolean).join(' + ') || 'Ninguno'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Statuses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Quiet Hours Status */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Horas Silenciosas</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1">
            <span className={`text-xs font-bold font-mono ${quietHours.enabled ? 'text-indigo-400' : 'text-slate-500'}`}>
              {quietHours.enabled ? 'ACTIVO' : 'INACTIVO'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              {quietHours.enabled ? `${quietHours.startTime} a ${quietHours.endTime}` : 'Sin restricción'}
            </span>
          </div>
        </div>

        {/* Card 2: Frequency Spacing */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Anti-Spam Spacing</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1">
            <span className="text-xs font-bold font-mono text-emerald-400">
              {frequency.minMinutesBetweenAny} min / {frequency.minMinutesBetweenSimilar} min
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Espaciado mínimo entre alertas
            </span>
          </div>
        </div>

        {/* Card 3: Data Freshness */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Frescura Climática</span>
            <Database className={`w-4 h-4 ${isFresh ? 'text-cyan-400' : 'text-amber-400 animate-pulse'}`} />
          </div>
          <div className="mt-1">
            <span className={`text-xs font-bold font-mono ${isFresh ? 'text-cyan-400' : 'text-amber-400'}`}>
              {isFresh ? 'FRECO' : 'ANTIGUO'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Edad: {dataAgeMinutes} min (Máx: 90 min)
            </span>
          </div>
        </div>

        {/* Card 4: Last sent info */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Última Enviada</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1">
            {lastNotification ? (
              <>
                <span className="text-xs font-bold text-slate-200 block truncate font-mono">
                  {lastNotification.title.split('—')[1]?.trim() || lastNotification.title}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {new Date(lastNotification.sentAt).toLocaleTimeString()} ({lastNotification.profile === 'field_tech' ? 'Técnico' : 'Persona'})
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-500 italic block">Ninguna enviada</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">En esta sesión</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Módulo 6B Row Statuses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/5 pt-4">
        {/* Card 5: Persona Morning Summary Status */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Próximo Resumen Persona</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className={`text-xs font-bold font-mono ${summarySettings.personMorningEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
              {summarySettings.personMorningEnabled ? 'PROGRAMADO' : 'DESACTIVADO'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Hora: {summarySettings.personMorningEnabled ? summarySettings.personMorningTime : '—'}
            </span>
          </div>
        </div>

        {/* Card 6: Field Tech Summary Status */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Próximo Resumen Técnico</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-1">
            <span className={`text-xs font-bold font-mono ${summarySettings.fieldPreShiftEnabled ? 'text-blue-400' : 'text-slate-500'}`}>
              {summarySettings.fieldPreShiftEnabled ? 'PROGRAMADO' : 'DESACTIVADO'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              Hora: {summarySettings.fieldPreShiftEnabled ? summarySettings.fieldPreShiftTime : '—'} (HSE Activo)
            </span>
          </div>
        </div>

        {/* Card 7: Deferred Queue Status */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Cola Diferida</span>
            <Hourglass className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1">
            <span className={`text-xs font-bold font-mono ${deferredAlerts.length > 0 ? 'text-indigo-400 animate-pulse' : 'text-slate-500'}`}>
              {deferredAlerts.length > 0 ? `${deferredAlerts.length} DIFERIDAS` : 'VACÍA'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans truncate">
              {deferredAlerts.length > 0 
                ? `Próxima: ${new Date(deferredAlerts[0].scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                : 'SkyCore monitoreando'}
            </span>
          </div>
        </div>

        {/* Card 8: Last Deferred Info */}
        <div className="p-3.5 rounded-2xl bg-[#0e172a] border border-white/5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">Última Diferida / Cola</span>
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-1">
            {deferredAlerts.length > 0 ? (
              <>
                <span className="text-xs font-bold text-slate-200 block truncate font-mono">
                  {deferredAlerts[0].title.split('—')[1]?.trim() || deferredAlerts[0].title}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate font-sans">
                  Motivo: {deferredAlerts[0].reason}
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-slate-500 italic block">Ninguna diferida</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cola libre</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Blocked Notifications Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-400" />
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Registro de Alertas Bloqueadas / Filtros Activos</h4>
          </div>
          {blockedLogs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-[10px] font-mono font-bold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              Limpiar Registro
            </button>
          )}
        </div>

        <div className="max-h-56 overflow-y-auto pr-1 flex flex-col gap-2 rounded-xl scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {blockedLogs.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-white/5 rounded-xl bg-slate-950/20">
              <span className="text-xs text-slate-500 italic">No hay alertas bloqueadas registradas. Las condiciones han sido normales o las alertas fueron procesadas con éxito.</span>
            </div>
          ) : (
            blockedLogs.map((log) => {
              const typeLabels = {
                quiet_hours: { label: 'HORA SILENCIOSA', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
                frequency: { label: 'ANTI-SPAM', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                demo: { label: 'MODO DEMO', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                outdated: { label: 'DATOS VIEJOS', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
                fallback: { label: 'FALLBACK', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' }
              };
              const labelInfo = typeLabels[log.type] || { label: 'FILTRADO', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };

              return (
                <div 
                  key={log.id} 
                  className="p-3 rounded-xl border border-white/5 bg-[#091020]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left hover:border-white/10 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-extrabold border ${labelInfo.color}`}>
                        {labelInfo.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold font-sans">
                        {log.title.split('—')[1]?.trim() || log.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {log.profile === 'field_tech' ? 'Técnico' : 'Persona'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 leading-normal font-sans">
                      {log.body}
                    </p>
                    <div className="text-[9px] text-rose-400/90 font-mono mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Motivo: {log.reason}</span>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 self-end md:self-center shrink-0">
                    {new Date(log.blockedAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
