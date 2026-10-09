import { useState, useEffect } from 'react';
import { CurrentWeather, HourlyForecast, DailyForecast, OrbiNotificationPermissionState, OrbiNotificationCandidate } from '../types/weatherTypes';
import { Star, ShieldCheck, Bell, CheckCircle, BellOff, HelpCircle } from 'lucide-react';
import { buildAdvancedSkyCoreAnalysis } from '../utils/weatherRiskEngine';
import { buildSmartWeatherAlerts } from '../utils/skyCoreAlertEngine';
import { buildNotificationCandidatesFromAlerts } from '../services/notificationCandidateBuilder';
import { checkOrbiNotificationPermission } from '../services/notificationPermissionService';
import { loadScheduledSummarySettings } from '../services/scheduledSummaryService';
import { PREFS_STORAGE_KEY, DEFAULT_PREFERENCES } from './NotificationSettingsPanel';
import PersonDailyDecisionPanel from './PersonDailyDecisionPanel';
import PriorityRecommendationCard from './PriorityRecommendationCard';
import SkyCoreRiskMatrix from './SkyCoreRiskMatrix';

interface PersonProfilePanelProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export default function PersonProfilePanel({ current, hourly, daily }: PersonProfilePanelProps) {
  const analysis = buildAdvancedSkyCoreAnalysis({ current, hourly, daily, profile: 'person' });
  const smartAlerts = buildSmartWeatherAlerts({ current, hourly, daily, profile: 'person', advancedAnalysis: analysis });

  const [permission, setPermission] = useState<OrbiNotificationPermissionState>('unknown');
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES.person);
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
        if (fullPrefs.person) {
          setPrefs(fullPrefs.person);
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
    if (alert.category === 'rain') return prefs.rain;
    if (alert.category === 'uv') return prefs.uv;
    if (alert.category === 'cold' || alert.category === 'heat') return prefs.temp;
    if (alert.category === 'wind' || alert.category === 'gusts') return prefs.wind;
    return true;
  });

  const candidates = buildNotificationCandidatesFromAlerts({
    alerts: filteredAlerts,
    profile: 'person',
    allowWatch: true
  });

  const candidate = candidates.length > 0 ? candidates[0] : null;

  const activePrefsList = [];
  if (prefs.rain) activePrefsList.push('Lluvia');
  if (prefs.uv) activePrefsList.push('UV');
  if (prefs.temp) activePrefsList.push('Temp');
  if (prefs.wind) activePrefsList.push('Viento');

  return (
    <div className="flex flex-col gap-6" id="person-profile-panel">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        <Star className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-sans font-medium text-white uppercase tracking-wider">
          Asistente de Vida Diaria ORBI Clima IA
        </h3>
      </div>

      {/* Alertas personales Android Panel */}
      <div className="p-4.5 rounded-2xl border border-cyan-500/10 bg-cyan-950/5 flex flex-col gap-3" id="person-alerts-section">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Alertas Personales Android</h4>
          </div>
          <div className="flex items-center gap-1">
            {permission === 'granted' ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" />
                ACTIVAS
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                <BellOff className="w-2.5 h-2.5" />
                INACTIVAS
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Preferencias Activas</span>
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
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Resumen Matutino</span>
            <div className="text-slate-300 mt-1 font-medium flex flex-col gap-0.5">
              <span className={`font-semibold text-[11px] ${summarySettings.personMorningEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                {summarySettings.personMorningEnabled ? 'Activado y programado' : 'Desactivado'}
              </span>
              <p className="text-[10px] text-slate-400">
                {summarySettings.personMorningEnabled ? `Diario a las ${summarySettings.personMorningTime}` : 'Habilitar en ajustes'}
              </p>
            </div>
          </div>

          <div className="text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Próxima Alerta Candidata</span>
            <div className="text-slate-300 mt-1 font-medium">
              {candidate ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-cyan-400 font-semibold text-[11px] line-clamp-1">{candidate.title.split('—')[1]?.trim() || candidate.title}</span>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{candidate.body}</p>
                </div>
              ) : (
                <span className="text-slate-500 text-[10px] italic">Sin alertas en el horizonte</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Panel (Does most of the Q&A from old visual cards) */}
      <PersonDailyDecisionPanel
        current={current}
        scores={analysis.riskScores}
        bestWindow={analysis.bestWindow}
        globalDecision={analysis.globalDecision}
      />

      {/* Priority Recommendations */}
      <PriorityRecommendationCard recommendations={analysis.recommendations} />

      {/* Risk Matrix */}
      <SkyCoreRiskMatrix scores={analysis.riskScores} />

      {/* Summary Narrative */}
      <div className="p-4 rounded-2xl border border-white/5 bg-white/5 flex gap-3.5" id="person-summary-box">
        <div className="flex-shrink-0 mt-0.5 text-cyan-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-white/40">Análisis Narrativo de un Vistazo</span>
          <p className="text-xs font-sans text-white/80 leading-relaxed mt-1">
            {analysis.personSummary || 'Condiciones estables del ambiente para pasear o realizar trámites.'}
          </p>
        </div>
      </div>
    </div>
  );
}

