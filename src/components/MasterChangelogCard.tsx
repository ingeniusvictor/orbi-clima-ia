import React, { useState } from 'react';
import { FileText, Copy, Download, RefreshCw } from 'lucide-react';
import { buildMasterChangelogMarkdown, downloadMasterChangelog } from '../services/finalReleaseExportService';

export default function MasterChangelogCard() {
  const [log, setLog] = useState('');

  const handleGenerate = () => {
    const text = buildMasterChangelogMarkdown();
    setLog(text);
  };

  const handleCopy = () => {
    if (!log) {
      alert('Genere el changelog primero.');
      return;
    }
    navigator.clipboard.writeText(log);
    alert('Changelog maestro copiado al portapapeles.');
  };

  const handleDownload = () => {
    downloadMasterChangelog();
  };

  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Compila el historial unificado de cambios y liberaciones de ingeniería desde el Módulo 0 (Base SkyCore) hasta el Módulo 12 actual.
      </p>

      {log ? (
        <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono text-[9px] text-slate-300 max-h-[160px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
          {log}
        </div>
      ) : (
        <div className="p-6 text-center bg-slate-900/10 border border-dashed border-slate-800 rounded-xl">
          <p className="text-[10px] text-slate-500 font-mono">El changelog maestro no se ha generado.</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap gap-2 pt-1 text-[10px]">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold rounded cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-pink-400" /> GENERAR CHANGELOG
        </button>
        <button
          onClick={handleCopy}
          disabled={!log}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-mono font-bold rounded transition-all ${
            log
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer'
              : 'bg-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Copy className="w-3.5 h-3.5" /> COPIAR TEXTO
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 font-mono font-bold rounded cursor-pointer transition-all"
        >
          <Download className="w-3.5 h-3.5" /> DESCARGAR (.MD)
        </button>
      </div>
    </div>
  );
}
