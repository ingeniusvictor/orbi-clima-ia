import React from 'react';
import { FileDown, FileCheck, ClipboardList, Award, CheckSquare, ShieldAlert } from 'lucide-react';
import { FinalReleaseSealState } from '../services/finalReleaseSealService';
import {
  downloadLocalReleaseSeal,
  downloadMasterChangelog,
  downloadModuleCompletionMatrix,
  downloadFinalRiskReview,
  downloadMaintenancePath,
  downloadFinalReleasePackage
} from '../services/finalReleaseExportService';

interface FinalReleaseExportCardProps {
  state: FinalReleaseSealState;
}

export default function FinalReleaseExportCard({ state }: FinalReleaseExportCardProps) {
  return (
    <div className="space-y-3 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Descargue la biblioteca consolidada de auditorías y certificados finales para el archivo oficial de control de versiones de ORBI SkyCore™.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. Release Seal Certificate */}
        <button
          onClick={() => downloadLocalReleaseSeal(state)}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <Award className="w-5 h-5 text-indigo-400 group-hover:scale-105 transition-transform shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Release Seal (.MD)</p>
            <p className="text-[8px] text-slate-500">Sello local de liberación técnica v1.0</p>
          </div>
        </button>

        {/* 2. Master Changelog */}
        <button
          onClick={downloadMasterChangelog}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <ClipboardList className="w-5 h-5 text-pink-400 group-hover:scale-105 transition-transform shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Changelog Maestro (.MD)</p>
            <p className="text-[8px] text-slate-500">Historial unificado Módulos 0 a 12</p>
          </div>
        </button>

        {/* 3. Module Completion Matrix */}
        <button
          onClick={downloadModuleCompletionMatrix}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <CheckSquare className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Matriz de Módulos (.MD)</p>
            <p className="text-[8px] text-slate-500">Listado de entregables cerrados 0 a 12</p>
          </div>
        </button>

        {/* 4. Final Risk Review */}
        <button
          onClick={downloadFinalRiskReview}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <ShieldAlert className="w-5 h-5 text-amber-400 group-hover:scale-105 transition-transform shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Risk Review (.MD)</p>
            <p className="text-[8px] text-slate-500">Riesgos residuales y directivas HSE</p>
          </div>
        </button>

        {/* 5. Maintenance Path */}
        <button
          onClick={downloadMaintenancePath}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <FileCheck className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Ruta de Soporte (.MD)</p>
            <p className="text-[8px] text-slate-500">Políticas de ramas v1.0.x y v1.1.x</p>
          </div>
        </button>

        {/* 6. Final Release Package */}
        <button
          onClick={() => downloadFinalReleasePackage(state)}
          className="flex items-center gap-2.5 p-2.5 bg-slate-900/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-all cursor-pointer group"
        >
          <FileDown className="w-5 h-5 text-blue-400 group-hover:scale-105 transition-transform shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-slate-200">Paquete de Cierre (.MD)</p>
            <p className="text-[8px] text-slate-500">Consolidación completa del release final</p>
          </div>
        </button>
      </div>
    </div>
  );
}
