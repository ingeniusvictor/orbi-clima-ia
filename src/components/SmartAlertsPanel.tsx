import { useState } from 'react';
import { SmartWeatherAlert, HourlyForecast, WeatherProfile } from '../types/weatherTypes';
import SmartAlertCard from './SmartAlertCard';
import AlertTimelineStrip from './AlertTimelineStrip';
import AlertPreferencePreview from './AlertPreferencePreview';
import AlertsHistoryPanel from './AlertsHistoryPanel';
import { Bell, ShieldCheck, ChevronDown, ChevronUp, Sliders, History } from 'lucide-react';

interface SmartAlertsPanelProps {
  alerts: SmartWeatherAlert[];
  hourly: HourlyForecast[];
  profile: WeatherProfile;
}

export default function SmartAlertsPanel({ alerts, hourly, profile }: SmartAlertsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'config' | 'history'>('alerts');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => [...prev, id]);
  };

  const severityPriority: Record<string, number> = { critical: 4, warning: 3, watch: 2, info: 1 };
  
  // Sort alerts so the most important (highest severity) is always first
  const sortedAlerts = [...alerts].sort((a, b) => {
    const prioA = severityPriority[a.severity] || 0;
    const prioB = severityPriority[b.severity] || 0;
    return prioB - prioA;
  });

  const activeAlerts = sortedAlerts.filter(a => !dismissedAlerts.includes(a.id));
  const hasAlerts = activeAlerts.length > 0;

  // Show only the single most important alert initially, or all if requested
  const displayedAlerts = showAll ? activeAlerts : (hasAlerts ? [activeAlerts[0]] : []);

  return (
    <div 
      className="w-full bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 text-left shadow-2xl relative overflow-hidden"
      id="smart-alerts-panel"
    >
      {/* Background glow overlay */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with active counters and tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 relative">
            <Bell className={`w-5 h-5 text-cyan-400 ${hasAlerts ? 'animate-bounce' : ''}`} />
            {hasAlerts && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-[9px] text-white font-mono font-bold rounded-full flex items-center justify-center border border-slate-900 animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-sans font-bold text-white tracking-tight flex items-center gap-1.5">
              Alertas inteligentes SkyCore
            </h3>
            <p className="text-[11px] font-mono text-white/45 uppercase tracking-wider mt-0.5">
              {hasAlerts 
                ? `${activeAlerts.length} alertas activas detectadas` 
                : 'Condición estable sin anomalías'}
            </p>
          </div>
        </div>

        {/* Navigation tabs within panel */}
        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : 'text-white/40 hover:text-white/80 border border-transparent'
            }`}
          >
            Alertas
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'config'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : 'text-white/40 hover:text-white/80 border border-transparent'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Canales
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                : 'text-white/40 hover:text-white/80 border border-transparent'
            }`}
          >
            <History className="w-3 h-3" />
            Historial
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      {activeTab === 'alerts' && (
        <div className="flex flex-col gap-4">
          {/* Timeline strip above alerts list for quick view */}
          {hourly && hourly.length > 0 && (
            <AlertTimelineStrip hourly={hourly} />
          )}

          {/* List of active alerts */}
          {!hasAlerts ? (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-black/25 border border-dashed border-white/5 rounded-2xl">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-sm font-sans font-bold text-white">
                Condiciones Estables
              </h4>
              <p className="text-xs text-white/50 max-w-sm mt-1 leading-normal">
                {profile === 'field_tech' 
                  ? 'Sin alertas operativas críticas. Todo el espectro técnico reporta parámetros dentro del estándar HSE.' 
                  : 'SkyCore no detecta alertas relevantes para este perfil.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedAlerts.map((alert) => (
                <SmartAlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onDismiss={handleDismiss} 
                />
              ))}

              {/* Toggle ver todas */}
              {activeAlerts.length > 1 && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="mt-1 w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/10 rounded-xl transition-all cursor-pointer"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      MOSTRAR SOLO ALERTA PRINCIPAL
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      VER OTRAS ALERTAS DISPONIBLES ({activeAlerts.length - 1})
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <AlertPreferencePreview profile={profile} />
      )}

      {activeTab === 'history' && (
        <AlertsHistoryPanel alerts={alerts} />
      )}
    </div>
  );
}
