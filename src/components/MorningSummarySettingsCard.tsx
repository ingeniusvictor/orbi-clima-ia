import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, AlertCircle } from 'lucide-react';
import { loadScheduledSummarySettings, saveScheduledSummarySettings } from '../services/scheduledSummaryService';

export default function MorningSummarySettingsCard() {
  const [settings, setSettings] = useState(loadScheduledSummarySettings());
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    // Generate a beautiful human-like mock preview based on standard current time/day
    setPreviewText(
      'ORBI Clima IA — Resumen de la mañana\nMañana fresca (14°C), UV alto al mediodía y baja probabilidad de lluvia. Mejor ventana: 10:00–13:00.'
    );
  }, []);

  const handleToggle = (enabled: boolean) => {
    const updated = { ...settings, personMorningEnabled: enabled };
    setSettings(updated);
    saveScheduledSummarySettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...settings, personMorningTime: time };
    setSettings(updated);
    saveScheduledSummarySettings(updated);
  };

  return (
    <div id="morning-summary-settings-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans">Perfil Persona</h3>
            <p className="text-xs text-slate-400 mt-0.5">Resumen matutino automatizado</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.personMorningEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950 peer-checked:after:border-amber-600"></div>
        </label>
      </div>

      <p className="text-xs text-slate-300 mt-4 leading-relaxed font-sans">
        Resumen climático matutino: recibe una lectura breve del día con temperatura, riesgo principal y mejor ventana.
      </p>

      {settings.personMorningEnabled && (
        <div className="mt-5 space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Hora programada
            </span>
            <input
              type="time"
              value={settings.personMorningTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-1.5 focus:ring-amber-500 focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">Vista previa</span>
            <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 border border-slate-800 font-sans whitespace-pre-line leading-relaxed italic">
              {previewText}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-300/80 leading-relaxed font-sans">
              <span className="font-semibold text-amber-300">Estado:</span> Próximo resumen programado para mañana a las <span className="font-mono font-bold text-amber-400">{settings.personMorningTime}</span>. Depende de datos climáticos frescos (menores de 90 minutos) para poder enviarse de forma automática.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
