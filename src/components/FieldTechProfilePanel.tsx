import { useState, useEffect } from 'react';
import { CurrentWeather, HourlyForecast, DailyForecast, OrbiNotificationPermissionState, OrbiNotificationCandidate } from '../types/weatherTypes';
import { HardHat, ShieldCheck, Bell, CheckCircle, BellOff, Info } from 'lucide-react';
import { buildAdvancedSkyCoreAnalysis } from '../utils/weatherRiskEngine';
import { buildSmartWeatherAlerts } from '../utils/skyCoreAlertEngine';
import { buildNotificationCandidatesFromAlerts } from '../services/notificationCandidateBuilder';
import { checkOrbiNotificationPermission } from '../services/notificationPermissionService';
import { loadScheduledSummarySettings } from '../services/scheduledSummaryService';
import { PREFS_STORAGE_KEY, DEFAULT_PREFERENCES } from './NotificationSettingsPanel';
import BestWindowCard from './BestWindowCard';
import PriorityRecommendationCard from './PriorityRecommendationCard';
import TechnicalRiskBreakdown from './TechnicalRiskBreakdown';
import { getDecisionBadgeClass, getDecisionLabel } from '../utils/skyCoreRiskLabels';

interface FieldTechProfilePanelProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export default function FieldTechProfilePanel({ current, hourly, daily }: FieldTechProfilePanelProps) {
  const analysis = buildAdvancedSkyCoreAnalysis({ current, hourly, daily, profile: 'field_tech' });
  const smartAlerts = buildSmartWeatherAlerts({ current, hourly, daily, profile: 'field_tech', advancedAnalysis: analysis });

  const [permission, setPermission] = useState<OrbiNotificationPermissionState>('unknown');
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES.field_tech);
  const [summarySettings, setSummarySettings] = useState(() => loadScheduledSummarySettings());

  const loadSettingsAndPermission = async () => {
    // Permission
    const pState = await checkOrbiNotificationPermission();
    setPermission(pState);

    // Summaries
    setSummarySettings(loadScheduledSummarySettings());

    // Preferences
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        const fullPrefs = JSON.parse(saved);
        if (fullPrefs.field_tech) {
          setPrefs(fullPrefs.field_tech);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSettingsAndPermission();

    // Listen to changes
    const handleChanged = () => {
      loadSettingsAndPermission();
    };
    window.addEventListener('orbi-notification-prefs-changed', handleChanged);
    window.addEventListener('orbi-summary-settings-changed', handleChanged);
    window.addEventListener('orbi-web-notification', handleChanged);
    return () => {
      window.removeEventListener('orbi-notification-prefs-changed', handleChanged);
      window.removeEventListener('orbi-summary-settings-changed', handleChanged);
      window.removeEventListener('orbi-web-notification', handleChanged);
    };
  }, []);

  // Compute active candidate directly during render (derived state) to avoid infinite loops
  const filteredAlerts = smartAlerts.filter(alert => {
    if (alert.category === 'humidity') return prefs.humidity;
    if (alert.category === 'wind' || alert.category === 'gusts') return prefs.wind;
    if (alert.category === 'rain') return prefs.rain;
    if (alert.category === 'storm') return prefs.storm;
    if (alert.category === 'uv') return prefs.uv;
    return true;
  });

  const candidates = buildNotificationCandidatesFromAlerts({
    alerts: filteredAlerts,
    profile: 'field_tech',
    allowWatch: true
  });

  const candidate = candidates.length > 0 ? candidates[0] : null;

  const safetyBadgeClass = getDecisionBadgeClass(analysis.globalDecision);
  const safetyStatusLabel = getDecisionLabel(analysis.globalDecision).toUpperCase();

  const activePrefsList = [];
  if (prefs.humidity) activePrefsList.push('Humedad');
  if (prefs.wind) activePrefsList.push('Viento');
  if (prefs.rain) activePrefsList.push('Lluvia');
  if (prefs.storm) activePrefsList.push('Tormenta');
  if (prefs.uv) activePrefsList.push('UV');

  return (
    <div className="flex flex-col gap-6" id="field-tech-panel">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <HardHat className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-sans font-medium text-white uppercase tracking-wider">
          Mesa de Control Terreno ORBI SkyCore™
        </h3>
      </div>

      {/* Alertas técnicas Android Panel */}
      <div className="p-4.5 rounded-2xl border border-amber-500/10 bg-amber-950/5 flex flex-col gap-3.5" id="tech-alerts-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Alertas Técnicas Android</h4>
          </div>
          <div className="flex items-center gap-1">
            {permission === 'granted' ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" />
                CONECTADO
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <BellOff className="w-2.5 h-2.5" />
                DESCONECTADO
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Filtros Activos</span>
            <div className="text-slate-300 mt-1 font-medium flex flex-wrap gap-1">
              {activePrefsList.length > 0 ? (
                activePrefsList.map(pref => (
                  <span key={pref} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                    {pref}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-[10px] italic">Ninguna activa</span>
              )}
            </div>
          </div>

          <div className="text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Resumen Pre-jornada</span>
            <div className="text-slate-300 mt-1 font-medium flex flex-col gap-0.5">
              <span className={`font-semibold text-[11px] ${summarySettings.fieldPreShiftEnabled ? 'text-blue-400' : 'text-slate-500'}`}>
                {summarySettings.fieldPreShiftEnabled ? 'Habilitado y programado' : 'Desconectado'}
              </span>
              <p className="text-[10px] text-slate-400">
                {summarySettings.fieldPreShiftEnabled ? `Diario a las ${summarySettings.fieldPreShiftTime}` : 'Habilitar en ajustes'}
              </p>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Candidata Próxima</span>
            <div className="text-slate-300 mt-1 font-medium">
              {candidate ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-amber-400 font-semibold text-[11px] line-clamp-1">{candidate.title.split('—')[1]?.trim() || candidate.title}</span>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{candidate.body}</p>
                </div>
              ) : (
                <span className="text-slate-500 text-[10px] italic">Sin incidentes proyectados</span>
              )}
            </div>
          </div>
        </div>

        {/* HSE Disclaimer */}
        <div className="mt-2 p-2.5 rounded bg-amber-500/5 border border-amber-500/10 flex gap-2 text-[10px] text-slate-400 leading-normal">
          <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span>
            <strong>Directiva HSE Terreno:</strong> Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.
          </span>
        </div>
      </div>

      {/* Safety Status Header Banner */}
      <div className={`p-4 rounded-2xl border ${safetyBadgeClass} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`} id="tech-safety-banner">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">Seguridad Operacional del Sitio</span>
          <h4 className="text-base font-sans font-bold mt-0.5">{safetyStatusLabel}</h4>
          <p className="text-xs text-white/80 mt-1 leading-relaxed">
            {analysis.technicalSummary || 'Siga las pautas de control operativo estándar.'}
          </p>
        </div>
        <div className="flex-shrink-0 self-stretch md:self-auto bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-center flex flex-col items-center justify-center">
          <span className="text-[9px] font-mono text-white/50 uppercase">Riesgo Global</span>
          <span className="text-xs font-bold font-mono text-white mt-0.5 uppercase">
            {analysis.globalRiskLevel === 'low' ? 'Bajo' : analysis.globalRiskLevel === 'medium' ? 'Medio' : analysis.globalRiskLevel === 'high' ? 'Alto' : 'Crítico'}
          </span>
        </div>
      </div>

      {/* Best Window Card */}
      <BestWindowCard bestWindow={analysis.bestWindow} />

      {/* Priority Recommendations */}
      <PriorityRecommendationCard recommendations={analysis.recommendations} />

      {/* Technical Risks breakdown with progress bars and solar disclaimer */}
      <TechnicalRiskBreakdown scores={analysis.riskScores} />

      {/* Quick Summary Box */}
      <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex gap-3.5" id="tech-summary-box">
        <div className="flex-shrink-0 mt-0.5 text-amber-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-white/40">Resumen Operativo de Seguridad (HSE)</span>
          <p className="text-xs font-sans text-white/80 leading-relaxed mt-1">
            Se ordena el cumplimiento estricto de los protocolos de autocuidado, hidratación, y bloqueo eléctrico (LOTO) de acuerdo al nivel de riesgo detectado.
          </p>
        </div>
      </div>
    </div>
  );
}
