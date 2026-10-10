import { useEffect, useMemo, useState } from 'react';
import { CloudSun, Eye, EyeOff, RotateCcw, X } from 'lucide-react';
import { isDeveloperModeEnabled } from './DeveloperModeGate';
import LivingWeatherAtmosphere from './LivingWeatherAtmosphere';
import { loadLastWeatherBundle } from '../services/weatherCacheService';
import {
  ATMOSPHERE_DEBUG_EVENT,
  ATMOSPHERE_DEBUG_PRESETS,
  AtmosphereDebugPreset,
  applyAtmosphereDebugPreset,
  getAtmosphereDebugPreset,
  setAtmosphereDebugPreset,
} from '../services/weatherAtmosphereDebugService';

export default function AtmosphereLabOverlay() {
  const [developerEnabled, setDeveloperEnabled] = useState(() => isDeveloperModeEnabled());
  const [open, setOpen] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [preset, setPreset] = useState<AtmosphereDebugPreset>(() => getAtmosphereDebugPreset());
  const [, forceRefresh] = useState(0);

  useEffect(() => {
    const syncDeveloperMode = () => {
      const enabled = isDeveloperModeEnabled();
      setDeveloperEnabled(enabled);
      if (!enabled) setOpen(false);
    };
    const syncPreset = () => setPreset(getAtmosphereDebugPreset());
    const refreshWeather = () => forceRefresh((value) => value + 1);

    window.addEventListener('orbi_dev_mode_changed', syncDeveloperMode);
    window.addEventListener(ATMOSPHERE_DEBUG_EVENT, syncPreset);
    window.addEventListener('orbi-weather-bundle-updated', refreshWeather);
    return () => {
      window.removeEventListener('orbi_dev_mode_changed', syncDeveloperMode);
      window.removeEventListener(ATMOSPHERE_DEBUG_EVENT, syncPreset);
      window.removeEventListener('orbi-weather-bundle-updated', refreshWeather);
    };
  }, []);

  const bundle = useMemo(() => loadLastWeatherBundle(), [preset, open, previewVisible]);
  const previewCurrent = bundle?.current
    ? applyAtmosphereDebugPreset(bundle.current, preset)
    : null;

  if (!developerEnabled) return null;

  return (
    <div className="fixed right-3 top-[calc(10px+env(safe-area-inset-top))] z-[90] pointer-events-none font-sans">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto h-8 px-2.5 rounded-full border border-cyan-400/25 bg-[#07111f]/95 text-cyan-300 shadow-xl flex items-center gap-1.5 text-[9px] font-black tracking-[0.12em] uppercase active:scale-95 transition-all"
          title="Abrir OC-22 Atmosphere Lab"
        >
          <CloudSun className="w-3.5 h-3.5" />
          ATM LAB
        </button>
      ) : (
        <div className="pointer-events-auto w-[min(92vw,360px)] max-h-[82vh] overflow-y-auto rounded-2xl border border-cyan-400/20 bg-[#06101d]/[0.98] shadow-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-300">
                <CloudSun className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-[0.13em]">OC-22 Atmosphere Lab</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-0.5">QA visual · solo Modo Desarrollador</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white active:scale-95"
              aria-label="Cerrar Atmosphere Lab"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {previewCurrent && previewVisible && (
            <div className="relative h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-[#050914]">
              <LivingWeatherAtmosphere
                currentWeather={previewCurrent}
                dailyForecast={bundle?.daily?.[0]}
                timezone={bundle?.location?.timezone}
              />
              <div className="absolute inset-x-3 bottom-3 z-10 rounded-xl border border-white/10 bg-black/35 px-3 py-2">
                <div className="text-[9px] font-mono text-cyan-300 uppercase tracking-wider">Preview</div>
                <div className="text-sm font-black text-white mt-0.5">{preset === 'live' ? 'Clima real' : ATMOSPHERE_DEBUG_PRESETS.find((item) => item.id === preset)?.label}</div>
              </div>
            </div>
          )}

          {!previewCurrent && (
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-200">
              Carga una ubicación/clima primero para habilitar la preview.
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {ATMOSPHERE_DEBUG_PRESETS.map((item) => {
              const active = preset === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAtmosphereDebugPreset(item.id);
                    setPreset(item.id);
                  }}
                  className={`rounded-xl border p-2.5 text-left transition-all active:scale-[0.98] ${
                    active
                      ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-200'
                      : 'border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-wide">{item.label}</span>
                  <span className="block text-[8px] text-slate-500 mt-0.5">{item.description}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
            <button
              onClick={() => setPreviewVisible((value) => !value)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 text-[9px] text-slate-300 flex items-center gap-1.5 active:scale-95"
            >
              {previewVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {previewVisible ? 'Ocultar preview' : 'Mostrar preview'}
            </button>
            <button
              onClick={() => {
                setAtmosphereDebugPreset('live');
                setPreset('live');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 text-[9px] text-cyan-300 flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Volver a LIVE
            </button>
          </div>

          <p className="text-[8px] leading-relaxed text-slate-500">
            El preset solo altera la escena visual OC-22; no modifica el clima guardado, alertas, recomendaciones ni Weather Truth.
          </p>
        </div>
      )}
    </div>
  );
}