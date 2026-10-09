import React, { useState } from 'react';
import { ShieldCheck, ClipboardCheck, Layout, ChevronRight, FileCode, CheckCircle2 } from 'lucide-react';
import AppIdentityPackageCard from './AppIdentityPackageCard';
import StoreListingDraftCard from './StoreListingDraftCard';
import PrivacyPackageCard from './PrivacyPackageCard';
import DataSafetyDraftCard from './DataSafetyDraftCard';
import PermissionsInventoryCard from './PermissionsInventoryCard';
import ScreenshotPlannerCard from './ScreenshotPlannerCard';
import ReleaseChecklistCard from './ReleaseChecklistCard';
import StoreReadinessExportCard from './StoreReadinessExportCard';

export default function StoreReadinessPanel() {
  const [score, setScore] = useState<number>(0);

  const getStatusBadge = (scoreVal: number) => {
    if (scoreVal === 100) return { label: 'Ready for Review', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    if (scoreVal >= 75) return { label: 'Ready for Review', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' };
    if (scoreVal >= 50) return { label: 'Draft / Under Review', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };
    return { label: 'Needs Human Review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
  };

  const status = getStatusBadge(score);

  const keyAreas = [
    { name: 'Privacidad', status: 'Draft', color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' },
    { name: 'Permisos', status: 'Draft', color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' },
    { name: 'Data Safety', status: 'Draft', color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' },
    { name: 'Ficha Pública', status: 'Draft', color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' },
    { name: 'Screenshots', status: 'Ready', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' },
    { name: 'Build', status: 'Draft', color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' }
  ];

  return (
    <div className="space-y-8">
      {/* Header and Summary Panel */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ClipboardCheck className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-lg font-sans font-bold text-white tracking-tight flex items-center gap-2">
              Store Readiness ORBI — Paquete de Publicación
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
            Preparación de ORBI Clima IA para publicación interna, revisión de políticas y empaquetado para Google Play. Administra el estado técnico, legal y textual localmente.
          </p>
          <div className="pt-1.5 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('orbi-pilot-feedback-loop-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              💬 FEEDBACK PILOTO (M11)
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('orbi-internal-testing-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/15 text-pink-400 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              🧪 PREPARAR TESTING INTERNO
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('orbi-qa-center-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              🛠️ IR AL QA CENTER DE RELEASE CANDIDATE
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('orbi-packaging-panel-container');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/15 text-blue-400 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              📦 VER EMPAQUETADO ANDROID (9B)
            </button>
          </div>
        </div>

        {/* Global Score Indicator */}
        <div className="flex items-center gap-4 bg-[#060a12] border border-slate-800 p-4 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Play Store Readiness</span>
            <span className={`px-2 py-0.5 mt-1 rounded text-[10px] font-mono font-bold block border ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="text-4xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tighter">
            {score}%
          </div>
        </div>
      </div>

      {/* Key Areas Status Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
        {keyAreas.map((area, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col items-center text-center justify-between gap-2 hover:border-slate-800 transition-all">
            <span className="text-[10px] font-sans text-slate-400 font-bold uppercase tracking-wider">{area.name}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold border ${area.color}`}>
              {area.status}
            </span>
          </div>
        ))}
      </div>

      {/* Row 1: App Identity & Store Listing Draft */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppIdentityPackageCard />
        <StoreListingDraftCard />
      </div>

      {/* Row 2: Privacy Policy & Data Safety */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrivacyPackageCard />
        <DataSafetyDraftCard />
      </div>

      {/* Row 3: Permissions Inventory & Screenshot Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PermissionsInventoryCard />
        <ScreenshotPlannerCard />
      </div>

      {/* Row 4: Release Checklist & Store Readiness Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReleaseChecklistCard onScoreChange={setScore} />
        <StoreReadinessExportCard />
      </div>
    </div>
  );
}
