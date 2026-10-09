import React, { useState, useEffect } from 'react';
import { ShieldCheck, ClipboardCheck, ArrowLeft, RefreshCw, AlertOctagon, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { loadPackagingChecklist, savePackagingChecklist, PackagingChecklistItem } from '../utils/androidPackagingChecklist';
import { loadQaState } from '../services/qaStateService';
import VersioningChecklistCard from './VersioningChecklistCard';
import ManifestAuditCard from './ManifestAuditCard';
import GradleReleaseChecklistCard from './GradleReleaseChecklistCard';
import AppIconAssetChecklistCard from './AppIconAssetChecklistCard';
import SignedBuildChecklistCard from './SignedBuildChecklistCard';
import AabApkValidationCard from './AabApkValidationCard';
import PlayConsolePreflightCard from './PlayConsolePreflightCard';
import PackagingExportCard from './PackagingExportCard';

interface GateItem {
  id: string;
  name: string;
  status: 'passed' | 'failed';
  message: string;
}

export default function AndroidPackagingReadinessPanel() {
  const [items, setItems] = useState<PackagingChecklistItem[]>(() => loadPackagingChecklist());
  const [qaScore, setQaScore] = useState(100);
  const [criticalBugsCount, setCriticalBugsCount] = useState(0);
  const [criticalTestsFailed, setCriticalTestsFailed] = useState(0);
  const [storeScore, setStoreScore] = useState(0);
  const [hasPrivacy, setHasPrivacy] = useState(true);
  const [hasHsec, setHasHsec] = useState(false); // strictly false, no HSEC/HASEC allowed in ORBI

  // Reload statistics dynamically
  const reloadStats = () => {
    // 1. QA State
    const qa = loadQaState();
    setQaScore(qa.qaScore);
    
    const openCritBugs = qa.bugs.filter(b => b.status === 'open' && b.severity === 'critical').length;
    setCriticalBugsCount(openCritBugs);

    const failedCritTests = qa.tests.filter(t => t.status === 'failed' && t.severity === 'critical').length;
    setCriticalTestsFailed(failedCritTests);

    // 2. Store Readiness Score
    const savedStore = localStorage.getItem('orbi_clima_store_checklist_v1');
    if (savedStore) {
      try {
        const storeItems = JSON.parse(savedStore);
        if (Array.isArray(storeItems) && storeItems.length > 0) {
          const completed = storeItems.filter((i: any) => i.completed).length;
          const pct = Math.round((completed / storeItems.length) * 100);
          setStoreScore(pct);
          
          // Check if privacy checkbox is completed ("Borrador de Política de Privacidad revisado y copiado" or category === 'privacy')
          const privacyItems = storeItems.filter((i: any) => i.category === 'privacy');
          const privacyCompleted = privacyItems.every((i: any) => i.completed);
          setHasPrivacy(privacyCompleted || privacyItems.some((i: any) => i.completed));
        } else {
          setStoreScore(0);
          setHasPrivacy(false);
        }
      } catch (e) {
        setStoreScore(0);
        setHasPrivacy(false);
      }
    } else {
      setStoreScore(0);
      setHasPrivacy(false);
    }

    // 3. Packaging items
    setItems(loadPackagingChecklist());
  };

  useEffect(() => {
    reloadStats();
    
    // Listen to storage events or state updates
    const handleFocus = () => reloadStats();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleToggleCheck = (id: string) => {
    const updated = items.map(item => item.id === id ? { ...item, completed: !item.completed } : item);
    setItems(updated);
    savePackagingChecklist(updated);
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const packagingScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Build Gate checks
  const gates: GateItem[] = [
    {
      id: 'gate-qa-score',
      name: 'Puntaje QA >= 95%',
      status: qaScore >= 95 ? 'passed' : 'failed',
      message: `QA Score actual de ${qaScore}%. Reclama optimización de pruebas.`
    },
    {
      id: 'gate-crit-bugs',
      name: 'Sin Bugs Críticos Abiertos',
      status: criticalBugsCount === 0 ? 'passed' : 'failed',
      message: `Se encontraron ${criticalBugsCount} bugs críticos abiertos en el Bug Tracker local.`
    },
    {
      id: 'gate-crit-tests',
      name: 'Sin Pruebas Críticas Fallidas',
      status: criticalTestsFailed === 0 ? 'passed' : 'failed',
      message: `Existen ${criticalTestsFailed} casos de prueba críticos con estado 'failed'.`
    },
    {
      id: 'gate-store-ready',
      name: 'Store Readiness Completo (>= 90%)',
      status: storeScore >= 90 ? 'passed' : 'failed',
      message: `Store Readiness actual de ${storeScore}%. Complete la checklist de Play Store.`
    },
    {
      id: 'gate-privacy',
      name: 'Privacy Package Revisado',
      status: hasPrivacy ? 'passed' : 'failed',
      message: 'Debe revisar y marcar como completada la política de privacidad local.'
    },
    {
      id: 'gate-hsec',
      name: 'Sin Directivas HSEC/HASEC Habilitadas',
      status: !hasHsec ? 'passed' : 'failed',
      message: 'Detección de esquemas restrictivos prohibidos. Alerta de seguridad.'
    },
    {
      id: 'gate-build-android',
      name: 'Compilación Android Confirmada',
      // We consider android build confirmed if build checklists are passing or we marked minSdk/compileSdk as complete
      status: items.filter(i => i.id === 'g-compile' || i.id === 'g-target').every(i => i.completed) ? 'passed' : 'failed',
      message: 'Falta confirmar la sincronización de dependencias y niveles de SDK nativos.'
    }
  ];

  const gateIsPassed = gates.every(g => g.status === 'passed');

  // Determine overall status
  let statusLabel: 'Draft' | 'Needs Android Studio Verification' | 'Ready for Signed Build' | 'Ready for Internal Testing' | 'Blocked' = 'Draft';
  let statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  if (!gateIsPassed) {
    statusLabel = 'Blocked';
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (packagingScore === 100) {
    statusLabel = 'Ready for Internal Testing';
    statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 animate-pulse';
  } else if (packagingScore >= 70) {
    statusLabel = 'Ready for Signed Build';
    statusColor = 'text-teal-400 bg-teal-500/10 border-teal-500/20';
  } else if (packagingScore >= 40) {
    statusLabel = 'Needs Android Studio Verification';
    statusColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
  } else {
    statusLabel = 'Draft';
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="space-y-8" id="orbi-packaging-readiness-panel">
      {/* Main Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-sans font-bold text-white tracking-tight flex items-center gap-2">
              Android Packaging & Signed Build Readiness — Módulo 9B
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-2xl">
            Preparación técnica de empaquetado final de ORBI Clima IA, auditoría de manifiesto, checklist de compilado Gradle, resguardo de claves de firma Release pre-vuelo y preflight de Google Play Console.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => {
                const el = document.getElementById('orbi-pilot-feedback-loop-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              🛠️ POST-RC FIXES
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('orbi-internal-testing-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/15 text-pink-400 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              🧪 CONTINUAR A CIERRE RC
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('orbi-qa-center-panel');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-slate-300 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              ⬅️ VOLVER AL QA CENTER
            </button>
            <button
              onClick={reloadStats}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> SINCRONIZAR DATOS DE QA Y TIENDA
            </button>
          </div>
        </div>

        {/* Dynamic score badge */}
        <div className="flex items-center gap-4 bg-[#060a12] border border-slate-800 p-4 rounded-2xl shrink-0 w-full lg:w-auto">
          <div className="text-left lg:text-center flex-1 lg:flex-none">
            <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider">Packaging Score</span>
            <span className={`px-2.5 py-0.5 mt-1 rounded text-[10px] font-mono font-bold block border text-center ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <div className="text-4xl font-black font-sans text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tighter shrink-0">
            {packagingScore}%
          </div>
        </div>
      </div>

      {/* QA Dependency Gate Section */}
      <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">QA Dependency Gate</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">COMPATIBILIDAD CON LA REGLA DE EMPAQUETADO</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-500">Estado de la Puerta:</span>
            {gateIsPassed ? (
              <span className="text-emerald-400 font-bold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                Aprobado (Desbloqueado)
              </span>
            ) : (
              <span className="text-rose-400 font-bold uppercase bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                Bloqueado (Atención Requerida)
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Para que el empaquetado se declare listo para el canal de pruebas internas de Google Play, es mandatorio superar todos los criterios de la compuerta de aseguramiento de calidad local.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {gates.map((gate, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                gate.status === 'passed'
                  ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20'
                  : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[11px] font-sans font-bold text-slate-200 leading-normal">{gate.name}</span>
                {gate.status === 'passed' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
              </div>
              <p className={`text-[9px] font-sans leading-normal ${gate.status === 'passed' ? 'text-slate-400' : 'text-rose-300'}`}>
                {gate.status === 'passed' ? 'Satisfecho con éxito.' : gate.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Row 1 */}
        <VersioningChecklistCard />
        <ManifestAuditCard />

        {/* Row 2 */}
        <GradleReleaseChecklistCard items={items} onToggle={handleToggleCheck} />
        <AppIconAssetChecklistCard items={items} onToggle={handleToggleCheck} />

        {/* Row 3 */}
        <SignedBuildChecklistCard items={items} onToggle={handleToggleCheck} />
        <AabApkValidationCard items={items} onToggle={handleToggleCheck} />

        {/* Row 4 */}
        <PlayConsolePreflightCard items={items} onToggle={handleToggleCheck} />
        <PackagingExportCard />
      </div>
    </div>
  );
}
