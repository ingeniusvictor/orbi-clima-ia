import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { exportPreferencesAsJson, importPreferencesFromJson } from '../services/preferencesExportService';
import { resetUserPreferences } from '../services/userPreferencesService';

export default function PreferencesBackupCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleExport = () => {
    try {
      setErrorMsg(null);
      const json = exportPreferencesAsJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orbi_clima_preferences_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccessMsg('Preferencias exportadas exitosamente.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Error al exportar.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        importPreferencesFromJson(text);
        setSuccessMsg('Preferencias importadas y aplicadas.');
        setTimeout(() => setSuccessMsg(null), 3000);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Error al importar.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetUserPreferences();
    setShowConfirmReset(false);
    setSuccessMsg('Preferencias restablecidas a valores de fábrica.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div id="preferences-backup-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-400">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Respaldo y Reseteo</h3>
          <p className="text-xs text-slate-400 mt-0.5">Control de configuración local</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        El respaldo incluye solo configuración local de ORBI Clima IA. No incluye historial climático ni datos sensibles.
      </p>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-950/60 hover:bg-slate-950 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 font-medium transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Exportar JSON
          </button>

          {/* Import */}
          <button
            onClick={handleImportClick}
            className="flex items-center justify-center gap-2 p-2.5 bg-slate-950/60 hover:bg-slate-950 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 font-medium transition-all"
          >
            <Upload className="w-4 h-4 text-teal-400" /> Importar JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Reset */}
        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 hover:border-rose-500/30 rounded-xl text-xs text-rose-400 transition-all font-medium"
          >
            <RotateCcw className="w-4 h-4" /> Restablecer Preferencias
          </button>
        ) : (
          <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl space-y-2 text-center">
            <span className="text-[11px] text-rose-300 block font-sans">¿Estás seguro de restablecer todas las preferencias?</span>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleReset}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] rounded font-bold"
              >
                Sí, Restablecer
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-rose-400 bg-rose-500/5 border border-rose-500/10 p-2 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
