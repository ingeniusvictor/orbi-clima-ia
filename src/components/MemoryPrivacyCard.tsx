import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { OrbiWeatherMemory } from '../types/weatherTypes';
import { clearWeatherMemory } from '../services/weatherMemoryService';
import { exportWeatherMemoryAsJson } from '../services/weatherMemoryExportService';

interface MemoryPrivacyCardProps {
  memory: OrbiWeatherMemory;
  onRefresh: () => void;
}

export default function MemoryPrivacyCard({ memory, onRefresh }: MemoryPrivacyCardProps) {
  const [showInspector, setShowInspector] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const json = exportWeatherMemoryAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbi_clima_memory_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Memoria exportada exitosamente.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      alert('Error al exportar la memoria: ' + e.message);
    }
  };

  const handleClear = () => {
    clearWeatherMemory();
    setShowConfirmClear(false);
    onRefresh();
    setSuccessMsg('Memoria climática borrada de forma segura.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div id="memory-privacy-card" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      {/* Header with Icon, Title, and Subtitle stacked */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-100 font-sans uppercase tracking-wider">Transparencia y Privacidad</h3>
          <p className="text-[10px] text-slate-400 font-sans">Control total sobre tus datos locales</p>
        </div>
      </div>

      {/* Description / Content directly below the title */}
      <div className="mb-3.5">
        <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
          Tu memoria climática es 100% local, editable y privada. ORBI nunca envía tus patrones de consulta, geolocalizaciones o preferencias a ningún servidor externo.
        </p>
      </div>

      {/* Footer Actions and Buttons at the bottom */}
      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-800/60 flex-wrap sm:flex-nowrap">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
          Auditoría de Datos
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/60 hover:bg-slate-950 hover:text-white border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 transition-all cursor-pointer select-none"
            title="Exportar base de datos a JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" /> Exportar
          </button>

          <button
            onClick={() => setShowInspector(!showInspector)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/60 hover:bg-slate-950 hover:text-white border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 transition-all cursor-pointer select-none"
            title="Inspeccionar JSON de memoria"
          >
            {showInspector ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-400" /> Ocultar
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-teal-400" /> Inspeccionar
              </>
            )}
          </button>

          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 rounded-lg text-[10px] font-bold text-rose-400 transition-all cursor-pointer select-none"
              title="Borrar memoria climática"
            >
              <Trash2 className="w-3.5 h-3.5" /> Borrar
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-rose-950/30 border border-rose-500/20 rounded-lg p-1">
              <button
                onClick={handleClear}
                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white text-[9px] rounded font-bold transition-all cursor-pointer"
              >
                Sí
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] rounded font-medium transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Feedback */}
      {successMsg && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* JSON Inspector */}
      {showInspector && (
        <div className="mt-3 p-3 bg-black/80 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 max-h-48 overflow-y-auto">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800 mb-2">
            <span className="text-slate-500 uppercase font-bold text-[9px]">Inspección de Estado Local</span>
            <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-sans">solo lectura</span>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">{JSON.stringify(memory, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
