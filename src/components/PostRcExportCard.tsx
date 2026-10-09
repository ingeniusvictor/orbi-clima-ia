import React from 'react';
import { FileDown, FileCheck, ClipboardList, Award, CheckSquare } from 'lucide-react';
import { PilotFeedbackState } from '../services/pilotFeedbackService';
import {
  downloadPilotFeedbackReport,
  downloadPostRcFixTracker,
  downloadRcPatchNotes,
  downloadPostRcClosureCertificate
} from '../services/postRcExportService';

interface PostRcExportCardProps {
  state: PilotFeedbackState;
}

export default function PostRcExportCard({ state }: PostRcExportCardProps) {
  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Descargue la documentación técnica de auditoría generada a partir del Pilot Feedback Loop para adjuntar al informe final de QA o carpeta de Play Console.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Feedback Report */}
        <button
          onClick={() => downloadPilotFeedbackReport(state)}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <ClipboardList className="w-5 h-5 text-pink-400 group-hover:scale-105 transition-transform" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Reporte de Feedback (.MD)</p>
            <p className="text-[8px] text-slate-500">Listado de observaciones de testers</p>
          </div>
        </button>

        {/* 2. Fix Tracker */}
        <button
          onClick={() => downloadPostRcFixTracker(state)}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <CheckSquare className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Tracker de Parches (.MD)</p>
            <p className="text-[8px] text-slate-500">Historial técnico de reparaciones</p>
          </div>
        </button>

        {/* 3. Patch Notes */}
        <button
          onClick={() => downloadRcPatchNotes(state)}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <FileCheck className="w-5 h-5 text-amber-400 group-hover:scale-105 transition-transform" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Patch Notes RC1.1 (.MD)</p>
            <p className="text-[8px] text-slate-500">Changelog para lanzamiento interno</p>
          </div>
        </button>

        {/* 4. Closure Certificate */}
        <button
          onClick={() => downloadPostRcClosureCertificate(state)}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <Award className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Certificado Post-RC (.MD)</p>
            <p className="text-[8px] text-slate-500">Acta de conformidad final SkyCore™</p>
          </div>
        </button>
      </div>
    </div>
  );
}
