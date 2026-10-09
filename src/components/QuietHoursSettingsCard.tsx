import { useState, useEffect } from 'react';
import { Moon, Info, Check, BellOff, AlertTriangle } from 'lucide-react';
import { loadQuietHoursSettings, saveQuietHoursSettings } from '../services/quietHoursService';
import { QuietHoursSettings, QuietHoursMode } from '../types/weatherTypes';

export default function QuietHoursSettingsCard() {
  const [settings, setSettings] = useState<QuietHoursSettings | null>(null);

  useEffect(() => {
    setSettings(loadQuietHoursSettings());

    const handleChanged = () => {
      setSettings(loadQuietHoursSettings());
    };
    window.addEventListener('orbi-quiet-hours-changed', handleChanged);
    return () => {
      window.removeEventListener('orbi-quiet-hours-changed', handleChanged);
    };
  }, []);

  if (!settings) return null;

  const updateSetting = <K extends keyof QuietHoursSettings>(key: K, value: QuietHoursSettings[K]) => {
    const updated = { ...settings, [key]: value };
    // If we change the main enabled state, also update mode if needed
    if (key === 'enabled') {
      updated.mode = value ? 'critical_only' : 'disabled';
    }
    setSettings(updated);
    saveQuietHoursSettings(updated);
  };

  const handleModeChange = (mode: QuietHoursMode) => {
    const updated = {
      ...settings,
      mode,
      enabled: mode !== 'disabled',
    };
    setSettings(updated);
    saveQuietHoursSettings(updated);
  };

  return (
    <div className="p-4.5 rounded-2xl bg-slate-900/40 border border-white/5 flex flex-col gap-4" id="quiet-hours-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Horas Silenciosas (Quiet Hours)</h4>
            <span className="text-[10px] text-slate-500 font-mono">Control de descanso nocturno</span>
          </div>
        </div>
        <div>
          <button
            onClick={() => updateSetting('enabled', !settings.enabled)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              settings.enabled
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {settings.enabled ? 'ACTIVO' : 'INACTIVO'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Hora Inicio</label>
          <input
            type="time"
            value={settings.startTime}
            disabled={!settings.enabled}
            onChange={(e) => updateSetting('startTime', e.target.value)}
            className="w-full bg-[#0d1527] border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Hora Fin</label>
          <input
            type="time"
            value={settings.endTime}
            disabled={!settings.enabled}
            onChange={(e) => updateSetting('endTime', e.target.value)}
            className="w-full bg-[#0d1527] border border-white/10 rounded-lg p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase font-mono text-slate-400 block">Modo de Filtro</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleModeChange('disabled')}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-0.5 items-center justify-center ${
              settings.mode === 'disabled'
                ? 'bg-slate-800 border-slate-600 text-slate-300'
                : 'bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="text-[10px] font-bold">Inactivo</span>
            <span className="text-[8px] font-mono">Permitir todo</span>
          </button>

          <button
            onClick={() => handleModeChange('critical_only')}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-0.5 items-center justify-center ${
              settings.mode === 'critical_only'
                ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="text-[10px] font-bold">Solo Críticas</span>
            <span className="text-[8px] font-mono">Filtrar alertas</span>
          </button>

          <button
            onClick={() => handleModeChange('enabled')}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-0.5 items-center justify-center ${
              settings.mode === 'enabled'
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                : 'bg-slate-950/20 border-white/5 text-slate-500 hover:text-slate-400'
            }`}
          >
            <span className="text-[10px] font-bold">Silencio Total</span>
            <span className="text-[8px] font-mono">Bloquear todo</span>
          </button>
        </div>
      </div>

      {settings.enabled && settings.mode === 'critical_only' && (
        <label className="flex items-center gap-2.5 p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10 cursor-pointer hover:bg-indigo-500/10 transition-colors">
          <input
            type="checkbox"
            checked={settings.allowCritical}
            onChange={(e) => updateSetting('allowCritical', e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500/30 w-3.5 h-3.5"
          />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-200">Permitir Alertas Críticas de Seguridad</span>
            <span className="text-[9px] text-slate-400 leading-none mt-0.5">Bypassear silencio si hay riesgo extremo</span>
          </div>
        </label>
      )}

      <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex gap-2 text-[10px] text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <span>
          Durante el horario silencioso, ORBI evita notificaciones no críticas para no molestarte. Puedes permitir alertas críticas si quieres recibir avisos importantes durante la noche.
        </span>
      </div>
    </div>
  );
}
