import { useState, useEffect } from 'react';
import { WeatherProfile } from '../types/weatherTypes';
import { Settings, ShieldCheck, Info } from 'lucide-react';

interface AlertPreferencePreviewProps {
  profile: WeatherProfile;
}

export default function AlertPreferencePreview({ profile }: AlertPreferencePreviewProps) {
  // Simple local storage or state for mock switches
  const [personPreferences, setPersonPreferences] = useState({
    rain: true,
    uv: true,
    tempLimits: true,
    wind: false,
  });

  const [techPreferences, setTechPreferences] = useState({
    humidity: true,
    windGusts: true,
    rainOps: true,
    stormCritical: true,
    uvFaena: true,
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('orbi_alert_preferences_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.person) setPersonPreferences(parsed.person);
        if (parsed.tech) setTechPreferences(parsed.tech);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const savePreferences = (updatedPerson: any, updatedTech: any) => {
    localStorage.setItem(
      'orbi_alert_preferences_v1',
      JSON.stringify({ person: updatedPerson, tech: updatedTech })
    );
  };

  const togglePerson = (key: keyof typeof personPreferences) => {
    const next = { ...personPreferences, [key]: !personPreferences[key] };
    setPersonPreferences(next);
    savePreferences(next, techPreferences);
  };

  const toggleTech = (key: keyof typeof techPreferences) => {
    const next = { ...techPreferences, [key]: !techPreferences[key] };
    setTechPreferences(next);
    savePreferences(personPreferences, next);
  };

  // Switch pill renderer
  const renderSwitch = (label: string, value: boolean, onToggle: () => void) => {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
        <span className="text-xs text-white/70 font-sans">{label}</span>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            value ? 'bg-cyan-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              value ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  };

  return (
    <div className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col gap-3" id="alert-preference-preview">
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-sans font-bold text-white uppercase tracking-wider">
            Preferencias de alerta — vista previa local
          </span>
        </div>
        <span className="text-[9px] font-mono text-cyan-400">CONFIGURACIÓN</span>
      </div>

      <p className="text-[11px] text-white/50 leading-relaxed font-sans">
        Determina qué tipo de eventos climáticos dispararán las alertas en pantalla para cada perfil de visualización.
      </p>

      {profile === 'person' ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-300 uppercase tracking-widest mb-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Canales Activos Persona
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {renderSwitch('Probabilidad de Lluvia (>=60%)', personPreferences.rain, () => togglePerson('rain'))}
            {renderSwitch('Índice UV Alto (>=6)', personPreferences.uv, () => togglePerson('uv'))}
            {renderSwitch('Límites Temp (<=8°C / >=30°C)', personPreferences.tempLimits, () => togglePerson('tempLimits'))}
            {renderSwitch('Vientos y Ráfagas Fuertes', personPreferences.wind, () => togglePerson('wind'))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-amber-300 uppercase tracking-widest mb-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Canales Activos Técnico Terreno
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {renderSwitch('Humedad Crítica Condensación', techPreferences.humidity, () => toggleTech('humidity'))}
            {renderSwitch('Viento y Ráfagas Operativas', techPreferences.windGusts, () => toggleTech('windGusts'))}
            {renderSwitch('Lluvia Operativa en Faena', techPreferences.rainOps, () => toggleTech('rainOps'))}
            {renderSwitch('Riesgo Eléctrico / Tormenta', techPreferences.stormCritical, () => toggleTech('stormCritical'))}
            {renderSwitch('Radiación UV EPP en Faena', techPreferences.uvFaena, () => toggleTech('uvFaena'))}
          </div>
        </div>
      )}

      {/* Preparation for MÓDULO 5 info badge */}
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-[10px] text-cyan-300/80 mt-1">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Próximo paso (Módulo 5):</strong> Estos canales se enlazarán al <code>NotificationChannel</code> nativo de Android para emitir notificaciones reales en segundo plano.
        </span>
      </div>
    </div>
  );
}
