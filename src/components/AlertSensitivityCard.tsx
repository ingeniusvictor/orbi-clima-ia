import React, { useState, useEffect } from 'react';
import { Sliders, Shield, AlertTriangle, AlertOctagon } from 'lucide-react';
import { AlertSensitivityMode } from '../types/weatherTypes';
import { loadUserPreferences, updateUserPreferences } from '../services/userPreferencesService';

export default function AlertSensitivityCard() {
  const [prefs, setPrefs] = useState(() => loadUserPreferences());

  useEffect(() => {
    const handleUpdate = () => {
      setPrefs(loadUserPreferences());
    };
    window.addEventListener('orbi-user-preferences-changed', handleUpdate);
    return () => {
      window.removeEventListener('orbi-user-preferences-changed', handleUpdate);
    };
  }, []);

  const handleSensitivityChange = (mode: AlertSensitivityMode) => {
    updateUserPreferences({ alertSensitivity: mode });
  };

  return (
    <div id="alert-sensitivity-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
          <Sliders className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Sensibilidad de Alertas</h3>
          <p className="text-xs text-slate-400 mt-0.5">Control de volumen preventivo</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        Ajusta qué tan preventivo es el motor de avisos SkyCore™ y cuántas notificaciones estás dispuesto a recibir.
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Low */}
        <button
          onClick={() => handleSensitivityChange('low')}
          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-2 ${
            prefs.alertSensitivity === 'low'
              ? 'bg-emerald-500/5 border-emerald-500/40 text-slate-200'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <Shield className={`w-4 h-4 ${prefs.alertSensitivity === 'low' ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div>
            <span className="text-xs font-bold block">Bajo</span>
            <span className="text-[9px] text-slate-500 leading-none mt-1 block">Menos avisos, solo importantes</span>
          </div>
        </button>

        {/* Normal */}
        <button
          onClick={() => handleSensitivityChange('normal')}
          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-2 ${
            prefs.alertSensitivity === 'normal'
              ? 'bg-blue-500/5 border-blue-500/40 text-slate-200'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 ${prefs.alertSensitivity === 'normal' ? 'text-blue-400' : 'text-slate-500'}`} />
          <div>
            <span className="text-xs font-bold block">Normal</span>
            <span className="text-[9px] text-slate-500 leading-none mt-1 block">Equilibrio recomendado</span>
          </div>
        </button>

        {/* High */}
        <button
          onClick={() => handleSensitivityChange('high')}
          className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-2 ${
            prefs.alertSensitivity === 'high'
              ? 'bg-rose-500/5 border-rose-500/40 text-slate-200'
              : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <AlertOctagon className={`w-4 h-4 ${prefs.alertSensitivity === 'high' ? 'text-rose-400' : 'text-slate-500'}`} />
          <div>
            <span className="text-xs font-bold block">Alto</span>
            <span className="text-[9px] text-slate-500 leading-none mt-1 block">Más avisos preventivos</span>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-sans">
        {prefs.alertSensitivity === 'low' && (
          <span><strong>Efecto Módulo 6A:</strong> Se filtrarán todos los avisos de tipo informativo o preventivo leve (Watch/Info). El límite diario se reduce a la mitad y los silencios entre alertas similares se duplican (3 horas).</span>
        )}
        {prefs.alertSensitivity === 'normal' && (
          <span><strong>Efecto Módulo 6A:</strong> Configuración estándar equilibrada. Máximo 3 alertas/día para Persona, 5 para Técnico, con 90 minutos de intervalo de seguridad anti-spam entre avisos similares.</span>
        )}
        {prefs.alertSensitivity === 'high' && (
          <span><strong>Efecto Módulo 6A:</strong> Se permiten avisos ultra preventivos con mayor sensibilidad. El límite diario se incrementa un 50% y los intervalos mínimos de silencio se reducen a la mitad (45 minutos).</span>
        )}
      </div>
    </div>
  );
}
