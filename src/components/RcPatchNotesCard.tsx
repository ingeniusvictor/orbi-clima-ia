import React, { useState, useEffect } from 'react';
import { FileText, Copy, Download, RefreshCw } from 'lucide-react';
import { PilotFeedbackState } from '../services/pilotFeedbackService';
import { buildRcPatchNotes } from '../utils/rcPatchNotesBuilder';
import { downloadRcPatchNotes } from '../services/postRcExportService';

interface RcPatchNotesCardProps {
  state: PilotFeedbackState;
}

export default function RcPatchNotesCard({ state }: RcPatchNotesCardProps) {
  const [patchNotes, setPatchNotes] = useState('');

  const generateNotes = () => {
    const notes = buildRcPatchNotes(state);
    setPatchNotes(notes);
  };

  useEffect(() => {
    generateNotes();
  }, [state]);

  const handleCopy = () => {
    navigator.clipboard.writeText(patchNotes);
    alert('Notas de parche copiadas al portapapeles.');
  };

  const handleDownload = () => {
    downloadRcPatchNotes(state);
  };

  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Generación automática de las notas de versión para el parche menor <strong className="text-pink-400">RC1.1</strong>, consolidando exclusivamente los fixes y correcciones que han sido validados en terreno físico.
      </p>

      {/* Code preview block */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono text-[9px] text-slate-300 max-h-[160px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
        {patchNotes || 'Presione el botón para generar las notas del parche.'}
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={generateNotes}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold rounded text-[9px] cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> REGENERAR NOTAS
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold rounded text-[9px] cursor-pointer transition-all"
        >
          <Copy className="w-3.5 h-3.5" /> COPIAR TEXTO
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 font-mono font-bold rounded text-[9px] cursor-pointer transition-all"
        >
          <Download className="w-3.5 h-3.5" /> DESCARGAR (.MD)
        </button>
      </div>
    </div>
  );
}
