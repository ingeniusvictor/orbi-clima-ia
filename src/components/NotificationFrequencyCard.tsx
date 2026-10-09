import { useState, useEffect } from 'react';
import { Sliders, ShieldAlert, Check, Users, Shield, Clock } from 'lucide-react';
import { loadNotificationFrequencySettings, saveNotificationFrequencySettings, DEFAULT_NOTIFICATION_FREQUENCY } from '../services/notificationFrequencyService';
import { NotificationFrequencySettings } from '../types/weatherTypes';

type FrequencyProfileMode = 'bajo' | 'normal' | 'alto';

export default function NotificationFrequencyCard() {
  const [settings, setSettings] = useState<NotificationFrequencySettings | null>(null);
  const [profileMode, setProfileMode] = useState<FrequencyProfileMode>('normal');

  useEffect(() => {
    const currentSettings = loadNotificationFrequencySettings();
    setSettings(currentSettings);
    
    // Determine profile mode from current values
    if (currentSettings.maxPersonPerDay <= 2 && currentSettings.minMinutesBetweenAny >= 60) {
      setProfileMode('bajo');
    } else if (currentSettings.maxPersonPerDay >= 5 && currentSettings.minMinutesBetweenAny <= 15) {
      setProfileMode('alto');
    } else {
      setProfileMode('normal');
    }

    const handleChanged = () => {
      const s = loadNotificationFrequencySettings();
      setSettings(s);
    };
    window.addEventListener('orbi-frequency-settings-changed', handleChanged);
    return () => {
      window.removeEventListener('orbi-frequency-settings-changed', handleChanged);
    };
  }, []);

  if (!settings) return null;

  const applyProfile = (mode: FrequencyProfileMode) => {
    setProfileMode(mode);
    let newSettings: NotificationFrequencySettings;

    switch (mode) {
      case 'bajo':
        newSettings = {
          maxPersonPerDay: 2,
          maxFieldPerDay: 3,
          minMinutesBetweenSimilar: 120,
          minMinutesBetweenAny: 60,
        };
        break;
      case 'alto':
        newSettings = {
          maxPersonPerDay: 5,
          maxFieldPerDay: 8,
          minMinutesBetweenSimilar: 45,
          minMinutesBetweenAny: 15,
        };
        break;
      case 'normal':
      default:
        newSettings = { ...DEFAULT_NOTIFICATION_FREQUENCY };
        break;
    }

    setSettings(newSettings);
    saveNotificationFrequencySettings(newSettings);
  };

  return (
    <div className="p-4.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col gap-4" id="frequency-card">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Frecuencia y Anti-Spam</h4>
          <span className="text-[10px] text-slate-500 font-mono">Control inteligente de volumen de alertas</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase font-mono text-slate-400">Sensibilidad de Frecuencia</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyProfile('bajo')}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-1 items-center justify-center ${
              profileMode === 'bajo'
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="text-[11px] font-bold">Bajo (Estricto)</span>
            <span className="text-[8px] font-mono">Menor ruido</span>
          </button>

          <button
            onClick={() => applyProfile('normal')}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-1 items-center justify-center ${
              profileMode === 'normal'
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="text-[11px] font-bold">Normal</span>
            <span className="text-[8px] font-mono">Balanceado</span>
          </button>

          <button
            onClick={() => applyProfile('alto')}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-1 items-center justify-center ${
              profileMode === 'alto'
                ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                : 'bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="text-[11px] font-bold">Alto (Permisivo)</span>
            <span className="text-[8px] font-mono">Máxima info</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-white/5">
        <div className="p-2 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col gap-1">
          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Users className="w-2.5 h-2.5 text-cyan-400" /> Límites Diarios
          </span>
          <div className="flex flex-col text-[10px] text-slate-300 font-medium font-sans gap-0.5 mt-0.5">
            <span className="flex justify-between">Persona: <strong className="font-mono text-cyan-400">{settings.maxPersonPerDay} / día</strong></span>
            <span className="flex justify-between">Técnico: <strong className="font-mono text-emerald-400">{settings.maxFieldPerDay} / día</strong></span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-950/30 border border-white/5 flex flex-col gap-1">
          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5 text-indigo-400" /> Espaciado Mínimo
          </span>
          <div className="flex flex-col text-[10px] text-slate-300 font-medium font-sans gap-0.5 mt-0.5">
            <span className="flex justify-between">Similares: <strong className="font-mono text-indigo-400">{settings.minMinutesBetweenSimilar} min</strong></span>
            <span className="flex justify-between">Cualquiera: <strong className="font-mono text-indigo-400">{settings.minMinutesBetweenAny} min</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
