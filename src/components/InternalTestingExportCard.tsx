import React from 'react';
import { Download, FileDown, FolderArchive, ArrowRight } from 'lucide-react';
import {
  downloadInternalTestingReleasePack,
  downloadTesterProtocol,
  downloadTesterFeedbackTemplate,
  downloadFinalRcCertificate
} from '../services/internalTestingExportService';
import { RcClosureState } from '../services/rcClosureStateService';

interface InternalTestingExportCardProps {
  state: RcClosureState;
}

export default function InternalTestingExportCard({
  state
}: InternalTestingExportCardProps) {
  const isClosed = state.status === 'final_closed';

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <FileDown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Exportar Paquete de Pruebas</h4>
            <p className="text-[10px] text-slate-400">Descarga de reportes y plantillas Markdown</p>
          </div>
        </div>
      </div>

      <p className="text-[10.5px] text-slate-400 leading-relaxed">
        Descarga la documentación para tus repositorios de desarrollo, auditorías internas o para compartir los protocolos con tus testers.
      </p>

      {/* Grid of exports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
        {/* 1. Internal testing pack */}
        <button
          onClick={() => downloadInternalTestingReleasePack(state)}
          className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 text-slate-300 transition-all cursor-pointer text-left"
        >
          <div className="truncate">
            <span className="text-[8px] text-slate-500 block uppercase">Reporte General</span>
            <span className="font-bold truncate text-slate-200 block mt-0.5">Internal Testing Pack</span>
          </div>
          <Download className="w-4 h-4 text-indigo-400 shrink-0" />
        </button>

        {/* 2. Tester Protocol */}
        <button
          onClick={downloadTesterProtocol}
          className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded-xl flex items-center justify-between gap-3 text-slate-300 transition-all cursor-pointer text-left"
        >
          <div className="truncate">
            <span className="text-[8px] text-slate-500 block uppercase">Manual de Pruebas</span>
            <span className="font-bold truncate text-slate-200 block mt-0.5">Tester Protocol</span>
          </div>
          <Download className="w-4 h-4 text-cyan-400 shrink-0" />
        </button>

        {/* 3. Feedback Template */}
        <button
          onClick={downloadTesterFeedbackTemplate}
          className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/30 rounded-xl flex items-center justify-between gap-3 text-slate-300 transition-all cursor-pointer text-left"
        >
          <div className="truncate">
            <span className="text-[8px] text-slate-500 block uppercase">Plantilla Tester</span>
            <span className="font-bold truncate text-slate-200 block mt-0.5">Feedback Template</span>
          </div>
          <Download className="w-4 h-4 text-pink-400 shrink-0" />
        </button>

        {/* 4. Final RC Certificate */}
        <button
          onClick={() => {
            if (isClosed) downloadFinalRcCertificate(state);
          }}
          disabled={!isClosed}
          className={`p-3 border rounded-xl flex items-center justify-between gap-3 text-left transition-all ${
            isClosed
              ? 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-amber-500/30 text-slate-300 cursor-pointer'
              : 'bg-slate-900/20 border-slate-900 text-slate-600 cursor-not-allowed'
          }`}
        >
          <div className="truncate">
            <span className="text-[8px] text-slate-500 block uppercase">Certificado de Lanzamiento</span>
            <span className="font-bold truncate text-slate-200 block mt-0.5">Final RC Certificate</span>
          </div>
          <Download className={`w-4 h-4 shrink-0 ${isClosed ? 'text-amber-400' : 'text-slate-700'}`} />
        </button>
      </div>

      {/* Quick download all files helper */}
      <button
        onClick={() => {
          downloadInternalTestingReleasePack(state);
          setTimeout(downloadTesterProtocol, 300);
          setTimeout(downloadTesterFeedbackTemplate, 600);
          if (isClosed) {
            setTimeout(() => downloadFinalRcCertificate(state), 900);
          }
        }}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-indigo-950/20"
      >
        <FolderArchive className="w-4 h-4" /> DESCARGAR PAQUETE COMPLETO (.MDs)
      </button>
    </div>
  );
}
