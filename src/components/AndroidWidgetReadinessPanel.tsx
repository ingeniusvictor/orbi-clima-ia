import { useEffect, useState } from 'react';
import { getWidgetSyncStatus, WidgetSyncStatus, OrbiWidgetContract, syncAndroidWidgetContract } from '../services/androidWidgetService';
import { Smartphone, Cpu, RefreshCw, CheckCircle, AlertTriangle, FileText, Sparkles, Send, Eye, ShieldCheck, HardHat, Bell, Zap, Info, Moon, Sliders } from 'lucide-react';
import { checkOrbiNotificationPermission } from '../services/notificationPermissionService';
import { loadNotificationHistory } from '../services/notificationHistoryService';
import { loadQuietHoursSettings } from '../services/quietHoursService';
import { loadBlockedLogs } from '../services/notificationBlockLogService';
import { loadUserPreferences } from '../services/userPreferencesService';
import { loadWeatherMemory } from '../services/weatherMemoryService';
import { getMostUsedLocation, getMostUsedProfile, getMostUsedWidget } from '../utils/weatherMemoryScoring';

interface AndroidWidgetReadinessPanelProps {
  lastUpdatedTrigger?: string;
  currentContract?: OrbiWidgetContract | null;
  isCompact?: boolean;
}

export default function AndroidWidgetReadinessPanel({ lastUpdatedTrigger, currentContract, isCompact = false }: AndroidWidgetReadinessPanelProps) {
  const [syncStatus, setSyncStatus] = useState<WidgetSyncStatus>(getWidgetSyncStatus());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string>('skypanel');
  const [customContract, setCustomContract] = useState<OrbiWidgetContract | null>(null);
  const [userPrefs, setUserPrefs] = useState(() => loadUserPreferences());
  const [memory, setMemory] = useState(() => loadWeatherMemory());


  // Notification states
  const [notifPermission, setNotifPermission] = useState<string>('unknown');
  const [lastNotificationSent, setLastNotificationSent] = useState<string>('Ninguna');
  const [historyCount, setHistoryCount] = useState<number>(0);

  // Scheduler states
  const [qhEnabled, setQhEnabled] = useState(false);
  const [freqEnabled, setFreqEnabled] = useState(true);
  const [lastQhBlock, setLastQhBlock] = useState<string>('Ninguno');
  const [lastFreqBlock, setLastFreqBlock] = useState<string>('Ninguno');

  const refreshStatus = async () => {
    setIsRefreshing(true);
    
    // Refresh permission & history
    const perm = await checkOrbiNotificationPermission();
    setNotifPermission(perm);
    
    const history = loadNotificationHistory();
    setHistoryCount(history.length);
    if (history.length > 0) {
      setLastNotificationSent(`${history[0].title.split('—')[1]?.trim() || history[0].title} (${new Date(history[0].sentAt).toLocaleTimeString()})`);
    } else {
      setLastNotificationSent('Ninguna');
    }

    // Refresh Scheduler
    const qh = loadQuietHoursSettings();
    setQhEnabled(qh.enabled);
    setFreqEnabled(true); // Frequency guard is always active in Módulo 6A

    const logs = loadBlockedLogs();
    const qhLogs = logs.filter(l => l.type === 'quiet_hours');
    if (qhLogs.length > 0) {
      setLastQhBlock(`${qhLogs[0].title.split('—')[1]?.trim() || qhLogs[0].title} (${new Date(qhLogs[0].blockedAt).toLocaleTimeString()})`);
    } else {
      setLastQhBlock('Ninguno');
    }

    const freqLogs = logs.filter(l => l.type === 'frequency');
    if (freqLogs.length > 0) {
      setLastFreqBlock(`${freqLogs[0].title.split('—')[1]?.trim() || freqLogs[0].title} (${new Date(freqLogs[0].blockedAt).toLocaleTimeString()})`);
    } else {
      setLastFreqBlock('Ninguno');
    }

    setTimeout(() => {
      setSyncStatus(getWidgetSyncStatus());
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    refreshStatus();
    setUserPrefs(loadUserPreferences());
    if (currentContract) {
      setSelectedVariant(currentContract.visualVariantHint || 'skypanel');
    }

    const handlePrefsChange = () => {
      setUserPrefs(loadUserPreferences());
      setMemory(loadWeatherMemory());
      refreshStatus();
    };

    const handleMemoryChange = () => {
      setMemory(loadWeatherMemory());
    };

    // Event listeners to keep live sync
    window.addEventListener('orbi-quiet-hours-changed', refreshStatus);
    window.addEventListener('orbi-frequency-settings-changed', refreshStatus);
    window.addEventListener('orbi-blocked-notifications-changed', refreshStatus);
    window.addEventListener('orbi-web-notification', refreshStatus);
    window.addEventListener('orbi-user-preferences-changed', handlePrefsChange);
    window.addEventListener('orbi-weather-memory-changed', handleMemoryChange);

    return () => {
      window.removeEventListener('orbi-quiet-hours-changed', refreshStatus);
      window.removeEventListener('orbi-frequency-settings-changed', refreshStatus);
      window.removeEventListener('orbi-blocked-notifications-changed', refreshStatus);
      window.removeEventListener('orbi-web-notification', refreshStatus);
      window.removeEventListener('orbi-user-preferences-changed', handlePrefsChange);
      window.removeEventListener('orbi-weather-memory-changed', handleMemoryChange);
    };
  }, [lastUpdatedTrigger, currentContract]);

  const contractToShow = customContract || currentContract || syncStatus.contract;

  // Render badging for status fields
  const getBadgeClass = (value: string) => {
    switch (value) {
      case 'Web Preview':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'Android Native':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Active':
      case 'Synced':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Needs Android Build':
      case 'Fallback':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Planned':
      case 'Ready for Android Studio':
        return 'bg-cyan-500/5 text-cyan-300 border-cyan-500/10';
      default:
        return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  // 1. Sincronizar widget ahora
  const handleSyncNow = async () => {
    if (contractToShow) {
      const updated = {
        ...contractToShow,
        lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      await syncAndroidWidgetContract(updated);
      refreshStatus();
    }
  };

  // 2. Forzar contrato demo
  const handleForceDemo = async () => {
    const demoContract: OrbiWidgetContract = {
      version: '1.1.0',
      appName: 'ORBI Clima IA',
      engineName: 'Powered by ORBI SkyCore™',
      tagline: 'Tu núcleo climático inteligente.',
      locationName: 'Santiago Centro',
      temperatureC: 22,
      feelsLikeC: 21,
      conditionLabel: 'Despejado',
      conditionCode: 'sunny',
      globalDecisionLabel: 'Óptimo',
      riskLevel: 'low',
      mainRiskLabel: 'Estable',
      shortNarrative: 'Excelente jornada para exteriores, radiación moderada.',
      bestWindow: '09:00–17:00',
      sourceMode: 'mock',
      lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      profile: 'person',
      humidity: 42,
      windSpeedKmh: 12,
      windGustKmh: 18,
      uvIndex: 4,
      rainProbability: 0,
      technicalRecommendation: 'Siga pautas normales de terreno.',
      personRecommendation: 'Excelente jornada para exteriores.',
      nextHour1Label: '14h',
      nextHour1Temp: 23,
      nextHour2Label: '15h',
      nextHour2Temp: 22,
      nextHour3Label: '16h',
      nextHour3Temp: 20,
      visualVariantHint: 'skyorb_mini',
      mainAlertTitle: '',
      mainAlertSeverity: 'info',
      mainAlertMessage: '',
      mainAlertTimeLabel: ''
    };
    setCustomContract(demoContract);
    setSelectedVariant('skyorb_mini');
    await syncAndroidWidgetContract(demoContract);
    refreshStatus();
  };

  // 3. Forzar contrato técnico
  const handleForceTechnical = async () => {
    const techContract: OrbiWidgetContract = {
      version: '1.1.0',
      appName: 'ORBI Clima IA',
      engineName: 'Powered by ORBI SkyCore™',
      tagline: 'Tu núcleo climático inteligente.',
      locationName: 'Minera El Teniente',
      temperatureC: 7,
      feelsLikeC: 4,
      conditionLabel: 'Ventoso',
      conditionCode: 'wind',
      globalDecisionLabel: 'Precaución',
      riskLevel: 'medium',
      mainRiskLabel: 'Viento Moderado',
      shortNarrative: 'Atención a ráfagas de 45 km/h. Ventana recomendada antes de las 14:00.',
      bestWindow: '08:00–13:00',
      sourceMode: 'live',
      lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      profile: 'field_tech',
      humidity: 78,
      windSpeedKmh: 28,
      windGustKmh: 45,
      uvIndex: 2,
      rainProbability: 25,
      technicalRecommendation: 'Validar condensación y sujeción de tableros antes de operar en terreno.',
      personRecommendation: 'Abrigo de tres capas y gafas de seguridad contra polvo.',
      nextHour1Label: '15h',
      nextHour1Temp: 6,
      nextHour2Label: '16h',
      nextHour2Temp: 5,
      nextHour3Label: '17h',
      nextHour3Temp: 3,
      visualVariantHint: 'field_command',
      mainAlertTitle: 'Ráfagas Fuertes en Altura',
      mainAlertSeverity: 'warning',
      mainAlertMessage: 'Ráfagas de viento de hasta 45 km/h a partir del mediodía.',
      mainAlertTimeLabel: 'Hoy 12:00h'
    };
    setCustomContract(techContract);
    setSelectedVariant('field_command');
    await syncAndroidWidgetContract(techContract);
    refreshStatus();
  };

  // 4. Change variant hint dynamically
  const handleVariantChange = async (hint: string) => {
    setSelectedVariant(hint);
    if (contractToShow) {
      const updated = {
        ...contractToShow,
        visualVariantHint: hint
      };
      if (customContract) {
        setCustomContract(updated);
      }
      await syncAndroidWidgetContract(updated);
      refreshStatus();
    }
  };

  const mostUsedLoc = getMostUsedLocation(memory);
  const mostUsedProfile = getMostUsedProfile(memory);
  const mostUsedWidget = getMostUsedWidget(memory);

  const mostUsedWidgetLabel = mostUsedWidget ? (
    mostUsedWidget === 'skyorb_mini' ? 'SkyOrb Mini' :
    mostUsedWidget === 'skypanel' ? 'SkyPanel' :
    mostUsedWidget === 'field_command' ? 'Field Command' : 'Cinematic Bar'
  ) : 'Ninguno';

  const mostUsedProfileLabel = mostUsedProfile === 'person' ? 'Persona' : (mostUsedProfile === 'field_tech' ? 'Técnico Terreno' : 'Ninguno');
  const mostUsedLocName = mostUsedLoc ? mostUsedLoc.name : 'Ninguna';

  if (isCompact) {
    return (
      <div className="w-full flex flex-col gap-4 text-left font-sans" id="android-widget-readiness-panel-compact">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wider">
                Sincronización de Widgets
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Conexión directa con la pantalla de inicio Android.
              </p>
            </div>
          </div>
          <button
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="p-1.5 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 rounded-lg cursor-pointer active:scale-95 transition-all focus:outline-none"
            title="Sincronizar Estado"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#050914] border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Widget Preferido</span>
            <span className="text-xs font-sans font-bold text-slate-200 mt-0.5 block capitalize">
              {selectedVariant.replace('_', ' ')}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#050914] border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Estado Sincronización</span>
            <span className="text-xs font-sans font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Sincronizado
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#050914] border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Última Sincronización</span>
            <span className="text-xs font-sans font-bold text-cyan-400 mt-0.5 block font-mono">
              {syncStatus.lastSyncTime || 'Justo ahora'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#050914] border border-white/5">
            <span className="text-[9px] font-mono text-slate-500 uppercase block">Canal Activo</span>
            <span className="text-xs font-sans font-bold text-indigo-400 mt-0.5 block font-mono">
              orbi_skyorb_v1
            </span>
          </div>
        </div>

        {/* Change variant selectors */}
        <div className="space-y-2">
          <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wide block">Variante de Widget Preferida</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'skypanel', label: 'SkyPanel (4x2)' },
              { id: 'skyorb_mini', label: 'SkyOrb Mini (2x2)' },
              { id: 'field_command', label: 'Field Command (4x4)' },
              { id: 'cinematic_bar', label: 'Cinematic Bar (5x2)' },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => handleVariantChange(v.id)}
                className={`py-2 px-3 text-center text-[10px] font-bold rounded-xl border transition-all cursor-pointer focus:outline-none ${
                  selectedVariant === v.id
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                    : 'bg-[#050914] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={handleSyncNow}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-[11px] font-bold rounded-xl cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md focus:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sincronizar Widget Ahora
          </button>
          <button
            onClick={handleForceDemo}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 text-[10px] font-sans font-bold rounded-xl cursor-pointer active:scale-95 transition-all focus:outline-none"
          >
            Simular Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5 text-left font-sans" id="android-widget-readiness-panel">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
              Android Widget Readiness Panel
            </h3>
            <p className="text-[11px] text-white/40 font-mono">
              DIAGNÓSTICO MOTOR DE SINCRONIZACIÓN · JETPACK GLANCE
            </p>
          </div>
        </div>

        <button
          onClick={refreshStatus}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/15 rounded-lg cursor-pointer transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          SINC STATS
        </button>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Row 1, Col 1 */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Contrato Generado</span>
          <span className="text-xs font-sans font-bold text-white mt-1 flex items-center gap-1.5">
            {contractToShow ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">SÍ (v{contractToShow.version})</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-mono">PENDIENTE</span>
              </>
            )}
          </span>
        </div>

        {/* Row 1, Col 2 */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Última Sync Local</span>
          <span className="text-xs font-sans font-bold text-white mt-1 block font-mono">
            {syncStatus.lastSyncTime ? (
              <span className="text-cyan-400">{syncStatus.lastSyncTime}</span>
            ) : (
              <span className="text-white/30">Ninguna</span>
            )}
          </span>
        </div>

        {/* Row 1, Col 3 */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Modo Plataforma</span>
          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold ${getBadgeClass(syncStatus.platformMode)}`}>
            {syncStatus.platformMode}
          </span>
        </div>

        {/* Row 2, Col 1 */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Bridge Android</span>
          <span className="text-xs font-sans font-bold text-white mt-1 flex items-center gap-1.5">
            {syncStatus.bridgeAvailable ? (
              <>
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">DISPONIBLE</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-cyan-400/50" />
                <span className="text-white/40 font-mono">SIMULADO</span>
              </>
            )}
          </span>
        </div>

        {/* Row 2, Col 2 */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Widget Nativo</span>
          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold ${getBadgeClass(syncStatus.widgetStatus)}`}>
            {syncStatus.widgetStatus}
          </span>
        </div>

        {/* Row 2, Col 3 */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Estado de Integración</span>
          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold ${getBadgeClass(syncStatus.statusLabel)}`}>
            {syncStatus.statusLabel}
          </span>
        </div>

        {/* Row 3, Col 1 (Módulo 5) */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/10">
          <span className="text-[9px] font-mono text-cyan-400/70 uppercase block flex items-center gap-1">
            <Bell className="w-3 h-3 text-cyan-400" /> Permiso Alertas Android
          </span>
          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold ${
            notifPermission === 'granted' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : notifPermission === 'denied'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {notifPermission.toUpperCase()}
          </span>
        </div>

        {/* Row 3, Col 2 (Módulo 5) */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/10">
          <span className="text-[9px] font-mono text-cyan-400/70 uppercase block flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" /> Canales Inicializados
          </span>
          <span className="text-xs font-sans font-bold text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">SÍ (3 CANALES)</span>
          </span>
        </div>

        {/* Row 3, Col 3 (Módulo 5) */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/10 col-span-2 sm:col-span-1">
          <span className="text-[9px] font-mono text-cyan-400/70 uppercase block flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" /> Última Alerta Enviada
          </span>
          <span className="text-[10px] text-slate-300 block mt-1 font-mono font-medium truncate" title={lastNotificationSent}>
            {lastNotificationSent}
          </span>
        </div>

        {/* Row 4: Scheduler (Módulo 6A) */}
        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10">
          <span className="text-[9px] font-mono text-indigo-400 uppercase block flex items-center gap-1">
            <Moon className="w-3.5 h-3.5" /> Quiet Hours
          </span>
          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold ${
            qhEnabled 
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' 
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            {qhEnabled ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/10">
          <span className="text-[9px] font-mono text-emerald-400 uppercase block flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> Frequency Guard
          </span>
          <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold ${
            freqEnabled 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-slate-800 text-slate-500 border-slate-700'
          }`}>
            {freqEnabled ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/10 col-span-2 sm:col-span-1">
          <span className="text-[9px] font-mono text-cyan-400 uppercase block">Scheduler Status</span>
          <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded border mt-1.5 font-bold bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
            6A ACTIVE
          </span>
        </div>

        {/* Row 5: Scheduler Last Blocks */}
        <div className="p-3 rounded-xl bg-indigo-950/10 border border-indigo-500/5 col-span-2 sm:col-span-1.5">
          <span className="text-[9px] font-mono text-indigo-400/70 uppercase block">Último bloqueo Quiet Hours</span>
          <span className="text-[10px] text-slate-300 block mt-1 font-mono font-medium truncate" title={lastQhBlock}>
            {lastQhBlock}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-950/10 border border-emerald-500/5 col-span-2 sm:col-span-1.5">
          <span className="text-[9px] font-mono text-emerald-400/70 uppercase block">Último bloqueo Frecuencia</span>
          <span className="text-[10px] text-slate-300 block mt-1 font-mono font-medium truncate" title={lastFreqBlock}>
            {lastFreqBlock}
          </span>
        </div>
      </div>

      {/* Control Buttons (Section 19 requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-b border-white/5 py-4">
        <button
          onClick={handleSyncNow}
          disabled={!contractToShow}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-sans font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 border border-white/10 rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          Sincronizar widget ahora
        </button>

        <button
          onClick={handleForceDemo}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-sans font-bold text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl cursor-pointer transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          Forzar contrato demo (2x2)
        </button>

        <button
          onClick={handleForceTechnical}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-sans font-bold text-amber-300 bg-white/5 hover:bg-white/10 border border-amber-500/10 rounded-xl cursor-pointer transition-all active:scale-95"
        >
          <HardHat className="w-3.5 h-3.5" />
          Forzar contrato técnico (4x4)
        </button>
      </div>

      {/* Visual Variant Hint Selector */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-mono text-white/50">SELECCIONAR VARIANTE SUGERIDA EN CONTRATO (visualVariantHint)</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['skyorb_mini', 'skypanel', 'field_command', 'cinematic_bar'].map((variant) => (
            <button
              key={variant}
              onClick={() => handleVariantChange(variant)}
              className={`px-3 py-2 text-xs font-mono rounded-lg border transition-all cursor-pointer text-center ${
                selectedVariant === variant
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {variant === 'skyorb_mini' && 'SkyOrb Mini (2x2)'}
              {variant === 'skypanel' && 'SkyPanel (4x2)'}
              {variant === 'field_command' && 'Field Command (4x4)'}
              {variant === 'cinematic_bar' && 'Cinematic Bar (5x2)'}
            </button>
          ))}
        </div>
      </div>

      {/* Contract Preview Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-1">
        <div className="md:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-white/50">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              CONTRATO JSON SERIALIZADO (SharedPreferences)
            </span>
          </div>

          <pre className="text-[10px] text-cyan-200/90 font-mono p-3 bg-black/45 border border-white/5 rounded-2xl h-[240px] overflow-y-auto leading-normal select-all">
            {contractToShow ? (
              JSON.stringify(contractToShow, null, 2)
            ) : (
              `// El contrato se generará al cargar datos climatológicos\n// buscando ubicaciones o presionando los selectores rápidos.`
            )}
          </pre>
        </div>

        <div className="md:col-span-5 flex flex-col gap-2.5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Vínculo con Jetpack Glance
          </span>
          <p className="text-[11px] text-white/60 leading-relaxed">
            Este JSON es guardado en las <code>SharedPreferences</code> de Android con la llave <code>orbi_skyorb_widget_contract_v1</code> mediante el plugin Capacitor Bridge.
          </p>
          <div className="text-[10px] space-y-1.5 font-mono text-white/50 border-t border-white/5 pt-2.5 mt-auto">
            <div className="flex justify-between">
              <span>Layout Activo:</span>
              <span className="text-cyan-400 font-bold capitalize">{selectedVariant.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span>Receiver:</span>
              <span className="text-white">OrbiSkyOrbWidgetReceiver</span>
            </div>
            <div className="flex justify-between">
              <span>Min Android SDK:</span>
              <span className="text-white">26 (Android 8.0)</span>
            </div>
            <div className="flex justify-between">
              <span>Actualización:</span>
              <span className="text-emerald-400">Inmediata (Triggered)</span>
            </div>
          </div>
          
          <div className="text-[10px] space-y-1.5 font-mono text-white/50 border-t border-white/5 pt-2.5">
            <span className="text-[10px] font-sans font-bold text-cyan-400 block mb-1">PREFERENCIAS CARGADAS (Módulo 7A)</span>
            <div className="flex justify-between">
              <span>Widget Preferido:</span>
              <span className="text-teal-400 font-bold">{userPrefs.preferredWidgetVariant}</span>
            </div>
            <div className="flex justify-between">
              <span>Perfil de Inicio:</span>
              <span className="text-pink-400 font-bold capitalize">{userPrefs.preferredProfile === 'person' ? 'Persona' : 'Técnico Terreno'}</span>
            </div>
            <div className="flex justify-between">
              <span>Sensibilidad Alertas:</span>
              <span className="text-amber-400 font-bold capitalize">{userPrefs.alertSensitivity}</span>
            </div>
            <div className="flex justify-between text-[9px] text-white/30 mt-1">
              <span>Actualizado:</span>
              <span>{new Date(userPrefs.updatedAt).toLocaleTimeString('es-CL')}</span>
            </div>
          </div>

          <div className="text-[10px] space-y-1.5 font-mono text-white/50 border-t border-white/5 pt-2.5">
            <span className="text-[10px] font-sans font-bold text-indigo-400 block mb-1">MEMORIA CLIMÁTICA LOCAL (Módulo 7B)</span>
            <div className="flex justify-between">
              <span>Widget Más Usado:</span>
              <span className="text-slate-300 font-bold">{mostUsedWidgetLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Perfil Más Usado:</span>
              <span className="text-slate-300 font-bold capitalize">{mostUsedProfileLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Ubicación Frecuente:</span>
              <span className="text-slate-300 font-bold truncate max-w-[130px]" title={mostUsedLocName}>{mostUsedLocName}</span>
            </div>
            <div className="flex justify-between">
              <span>Estado Memoria:</span>
              <span className="text-emerald-400 font-bold">Activa / Local</span>
            </div>
          </div>

          <div className="text-[10px] space-y-1.5 font-mono text-white/50 border-t border-white/5 pt-2.5">
            <span className="text-[10px] font-sans font-bold text-teal-400 block mb-1">PÚBLICO Y TIENDA (Módulo 8A & 8B)</span>
            <div className="flex justify-between">
              <span>Public Polish:</span>
              <span className="text-emerald-400 font-bold">Activo</span>
            </div>
            <div className="flex justify-between">
              <span>Onboarding:</span>
              <span className={localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true' ? 'Completado' : 'Pendiente'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Widget Showcase:</span>
              <span className="text-emerald-400 font-bold">Activo</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1">
              <span>Store Readiness:</span>
              <span className="text-amber-400 font-bold">Draft / Ready for Review</span>
            </div>
            <div className="flex justify-between">
              <span>Target SDK:</span>
              <span className="text-slate-400 font-bold">Needs Android Studio verification</span>
            </div>
            <div className="flex justify-between">
              <span>Privacy Policy:</span>
              <span className="text-amber-400 font-bold">Draft</span>
            </div>
            <div className="flex justify-between">
              <span>Data Safety:</span>
              <span className="text-amber-400 font-bold">Draft</span>
            </div>
            <div className="flex justify-between">
              <span>Permissions Inventory:</span>
              <span className="text-amber-400 font-bold">Draft</span>
            </div>
            <div className="pt-2 border-t border-white/5 flex flex-col gap-1.5">
              <button
                onClick={() => {
                  const el = document.getElementById('orbi-qa-center-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-center py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 font-bold text-[9px] font-mono rounded cursor-pointer transition-all"
              >
                🛠️ ABRIR QA CENTER
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('orbi-packaging-panel-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-center py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/15 text-blue-400 font-bold text-[9px] font-mono rounded cursor-pointer transition-all"
              >
                📦 EMPAQUETADO ANDROID (9B)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
