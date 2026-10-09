import React, { useState, useEffect } from 'react';
import { Cpu, Clock, Shield, AlertTriangle } from 'lucide-react';
import { loadScheduledSummarySettings, saveScheduledSummarySettings } from '../services/scheduledSummaryService';

export default function TechnicalShiftSummaryCard() {
  const [settings, setSettings] = useState(loadScheduledSummarySettings());
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    setPreviewText(
      'ORBI Técnico Terreno — Pre-jornada\nCondición con precaución por humedad alta (82%), viento 18 km/h. Mejor ventana: 10:30–14:30. Mantener criterio HSE en terreno.'
    );
  }, []);

  const handleToggle = (enabled: boolean) => {
    const updated = { ...settings, fieldPreShiftEnabled: enabled };
    setSettings(updated);
    saveScheduledSummarySettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...settings, fieldPreShiftTime: time };
    setSettings(updated);
    saveScheduledSummarySettings(updated);
  };

  return (
    <div id="technical-shift-summary-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100 font-sans">Perfil Técnico Terreno</h3>
            <p className="text-xs text-slate-400 mt-0.5">Resumen pre-jornada técnico</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.fieldPreShiftEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500 peer-checked:after:bg-slate-950 peer-checked:after:border-blue-600"></div>
        </label>
      </div>

      <p className="text-xs text-slate-300 mt-4 leading-relaxed font-sans">
        Resumen técnico pre-jornada: recibe un análisis operativo preventivo con condiciones críticas de viento, humedad, UV y ventanas de operación para terreno.
      </p>

      {settings.fieldPreShiftEnabled && (
        <div className="mt-5 space-y-4 pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Hora programada
            </span>
            <input
              type="time"
              value={settings.fieldPreShiftTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-1.5 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">Vista previa técnica</span>
            <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 border border-slate-800 font-sans whitespace-pre-line leading-relaxed italic border-l-2 border-blue-500">
              {previewText}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-blue-500/5 p-2.5 rounded-xl border border-blue-500/10">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-300/80 leading-relaxed font-sans">
              <span className="font-semibold text-blue-300">Estado:</span> Próximo resumen técnico programado para mañana a las <span className="font-mono font-bold text-blue-400">{settings.fieldPreShiftTime}</span>.
            </div>
          </div>
        </div>
      )}

      {/* Mandatory HSE directive block */}
      <div className="mt-4 p-3 rounded-xl bg-amber-950/25 border border-amber-500/15 flex gap-2.5 items-start">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-400/90 leading-relaxed font-sans">
          <span className="font-bold text-amber-400">Directiva HSE Terreno:</span> Las alertas ORBI son apoyo preventivo. No reemplazan protocolos HSE, evaluación en terreno ni instrucciones del empleador.
        </p>
      </div>
    </div>
  );
}
