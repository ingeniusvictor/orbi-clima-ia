import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sliders, Bell, User, HardHat, Info, HelpCircle, Smartphone, Eye, ShieldCheck } from 'lucide-react';
import NotificationPermissionCard from './NotificationPermissionCard';
import NotificationTestPanel from './NotificationTestPanel';
import NotificationHistoryPanel from './NotificationHistoryPanel';
import QuietHoursSettingsCard from './QuietHoursSettingsCard';
import NotificationFrequencyCard from './NotificationFrequencyCard';
import MorningSummarySettingsCard from './MorningSummarySettingsCard';
import TechnicalShiftSummaryCard from './TechnicalShiftSummaryCard';
import DeferredAlertsPanel from './DeferredAlertsPanel';
import NextScheduledAlertCard from './NextScheduledAlertCard';
import { OrbiNotificationPermissionState } from '../types/weatherTypes';
import { checkOrbiNotificationPermission } from '../services/notificationPermissionService';
import { Capacitor } from '@capacitor/core';
import { loadWeatherMemory } from '../services/weatherMemoryService';
import { getMostUsedProfile } from '../utils/weatherMemoryScoring';
import { loadUserPreferences } from '../services/userPreferencesService';

interface NotificationPreferences {
  person: {
    rain: boolean;
    uv: boolean;
    temp: boolean;
    wind: boolean;
  };
  field_tech: {
    humidity: boolean;
    wind: boolean;
    rain: boolean;
    storm: boolean;
    uv: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  person: {
    rain: true,
    uv: true,
    temp: true,
    wind: true
  },
  field_tech: {
    humidity: true,
    wind: true,
    rain: true,
    storm: true,
    uv: true
  }
};

const PREFS_STORAGE_KEY = 'orbi_notification_preferences_v1';

export default function NotificationSettingsPanel() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [permission, setPermission] = useState<OrbiNotificationPermissionState>('unknown');
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  const [memory, setMemory] = useState(() => loadWeatherMemory());

  useEffect(() => {
    const handleMemoryChange = () => {
      setMemory(loadWeatherMemory());
    };
    window.addEventListener('orbi-weather-memory-changed', handleMemoryChange);
    return () => {
      window.removeEventListener('orbi-weather-memory-changed', handleMemoryChange);
    };
  }, []);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        setPrefs(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading notification preferences:', e);
    }
    
    const checkPermission = async () => {
      setPermission(await checkOrbiNotificationPermission());
    };
    checkPermission();
  }, []);

  const savePreferences = (updatedPrefs: NotificationPreferences) => {
    try {
      setPrefs(updatedPrefs);
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(updatedPrefs));
      // Dispatch custom event to notify other modules of preference changes
      window.dispatchEvent(new Event('orbi-notification-prefs-changed'));
    } catch (e) {
      console.error('Error saving notification preferences:', e);
    }
  };

  const togglePreference = (profile: 'person' | 'field_tech', key: string) => {
    const updated = {
      ...prefs,
      [profile]: {
        ...prefs[profile],
        [key]: !((prefs[profile] as any)[key])
      }
    };
    savePreferences(updated);
  };

  const handleTestSent = () => {
    setRefreshHistoryTrigger(prev => prev + 1);
  };

  const isNative = Capacitor.isNativePlatform();

  const mostUsedProfile = getMostUsedProfile(memory);
  const userPrefs = loadUserPreferences();
  const currentProfile = userPrefs.preferredProfile;

  return (
    <div className="p-6 rounded-3xl bg-[#0a1122]/80 border border-white/5 shadow-xl flex flex-col gap-6" id="orbi-notification-settings-panel">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Bell className="w-5 h-5" id="bell-header-icon" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100">Configuración de Alertas Android</h3>
            <p className="text-xs text-slate-400">Canales, permisos e historial local de ORBI SkyCore™</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-mono font-medium">
          {isNative ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300">NATIVO ANDROID</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300">WEB PREVIEW</span>
            </>
          )}
        </div>
      </div>

      {/* Banner de Notificaciones Locales (Módulo 8A) */}
      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex gap-3 items-start text-xs text-slate-300 font-sans">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-slate-200 block">Notificaciones 100% Locales</span>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
            ORBI usa notificaciones locales del dispositivo de forma directa y nativa. No necesita backend, conexión de red constante, registro de cuentas ni servicios de push remoto para mantenerte seguro.
          </p>
        </div>
      </div>

      {/* Permission Section */}
      <NotificationPermissionCard onPermissionChange={setPermission} />

      {/* Preferences Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {mostUsedProfile && mostUsedProfile !== currentProfile && (
          <div className="col-span-1 md:col-span-2 p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Sliders className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-slate-200 block">Sugerencia de Canal Climático Inteligente</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Detectamos que usas frecuentemente el perfil <strong className="text-indigo-400 capitalize">{mostUsedProfile === 'person' ? 'Persona' : 'Técnico Terreno'}</strong>. Puedes ajustar tu perfil preferido de inicio en el panel de Preferencias sin alterar de forma impositiva tu configuración actual.
                </p>
              </div>
            </div>
            <span className="text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15 uppercase tracking-wide shrink-0 self-start sm:self-auto">
              Sugerencia No Vinculante
            </span>
          </div>
        )}
        
        {/* Person Preferences */}
        <div className="p-4 rounded-2xl border border-white/5 bg-[#0d1527]/40 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 border-b border-white/5 pb-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-xs uppercase tracking-wider">Alertas Perfil Persona</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { id: 'rain', label: 'Lluvia y precipitación', desc: 'Previsión de lluvias o lloviznas' },
              { id: 'uv', label: 'UV Crítico / Radiación solar', desc: 'Alertas de radiación alta al mediodía' },
              { id: 'temp', label: 'Extremos térmicos (Frío/Calor)', desc: 'Temperaturas fuera de rangos de confort' },
              { id: 'wind', label: 'Vientos Fuertes', desc: 'Ráfagas que requieran cuidado general' }
            ].map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(prefs.person as any)[item.id]}
                  onChange={() => togglePreference('person', item.id)}
                  className="mt-0.5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 transition-colors duration-200"
                />
                <div className="flex-1">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-slate-200 transition-colors duration-200">
                    {item.label}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Field Tech Preferences */}
        <div className="p-4 rounded-2xl border border-white/5 bg-[#0d1527]/40 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-200 border-b border-white/5 pb-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs uppercase tracking-wider">Alertas Técnico Terreno</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { id: 'humidity', label: 'Humedad alta & Condensación', desc: 'Previene daños en sistemas eléctricos' },
              { id: 'wind', label: 'Viento & Ráfagas en Altura', desc: 'Garantiza seguridad en trabajos verticales' },
              { id: 'rain', label: 'Lluvia Operativa', desc: 'Afecta la logística o el uso de herramientas' },
              { id: 'storm', label: 'Riesgo de Tormenta Eléctrica', desc: 'Paralización preventiva de obras' },
              { id: 'uv', label: 'UV extremo en faena', desc: 'Protección obligatoria de la cuadrilla' }
            ].map(item => (
              <label key={item.id} className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(prefs.field_tech as any)[item.id]}
                  onChange={() => togglePreference('field_tech', item.id)}
                  className="mt-0.5 rounded border-white/10 bg-white/5 text-amber-500 focus:ring-0 focus:ring-offset-0 h-4 w-4 transition-colors duration-200"
                />
                <div className="flex-1">
                  <span className="text-xs font-medium text-slate-300 group-hover:text-slate-200 transition-colors duration-200">
                    {item.label}
                  </span>
                  <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>

      {/* Módulo 6B: Smart Summaries Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="summary-settings-grid">
        <MorningSummarySettingsCard />
        <TechnicalShiftSummaryCard />
      </div>

      {/* Módulo 6A: Quiet Hours & Frequency Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="scheduler-settings-grid">
        <QuietHoursSettingsCard />
        <NotificationFrequencyCard />
      </div>

      {/* Módulo 6B: Deferred Alerts & Next Scheduled */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="deferred-scheduler-grid">
        <NextScheduledAlertCard />
        <DeferredAlertsPanel />
      </div>

      {/* Diagnostics */}
      <div className="p-4.5 rounded-2xl border border-white/5 bg-[#090f1e]/40">
        <NotificationTestPanel onTestSent={handleTestSent} />
      </div>

      {/* History */}
      <div className="p-4.5 rounded-2xl border border-white/5 bg-[#090f1e]/40">
        <NotificationHistoryPanel refreshTrigger={refreshHistoryTrigger} />
      </div>

    </div>
  );
}
export { DEFAULT_PREFERENCES, PREFS_STORAGE_KEY };
