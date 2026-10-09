import React from 'react';
import { QaReleaseState } from '../services/qaStateService';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ChevronRight } from 'lucide-react';

interface QaModuleMatrixProps {
  state: QaReleaseState;
  onSelectModule: (moduleName: string) => void;
  selectedModule: string | null;
}

export default function QaModuleMatrix({ state, onSelectModule, selectedModule }: QaModuleMatrixProps) {
  // Extract and sort modules
  const modules = Array.from(new Set(state.tests.map(t => t.module))).sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10);
    // Handle sub-modules like 3B, 6B, 7B, 8B
    const letterA = a.match(/\d+([A-Z])/)?.[1] || '';
    const letterB = b.match(/\d+([A-Z])/)?.[1] || '';
    
    if (numA !== numB) return numA - numB;
    return letterA.localeCompare(letterB);
  });

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Matriz de Módulos (0 - 8B)</h3>
        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ESTADO Y COBERTURA DE PRUEBAS POR MÓDULO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {modules.map((modName) => {
          const modTests = state.tests.filter(t => t.module === modName);
          const total = modTests.length;
          const passed = modTests.filter(t => t.status === 'passed').length;
          const failed = modTests.filter(t => t.status === 'failed').length;
          const blocked = modTests.filter(t => t.status === 'blocked').length;
          const review = modTests.filter(t => t.status === 'needs_review').length;

          const isSelected = selectedModule === modName;
          const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

          let statusBadgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/15';
          let statusLabel = 'In Progress';

          if (failed > 0) {
            statusBadgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/15';
            statusLabel = 'Failed';
          } else if (blocked > 0) {
            statusBadgeColor = 'text-orange-400 bg-orange-500/10 border-orange-500/15';
            statusLabel = 'Blocked';
          } else if (passed === total) {
            statusBadgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15';
            statusLabel = 'Passed';
          } else if (review > 0) {
            statusBadgeColor = 'text-indigo-400 bg-indigo-500/10 border-indigo-500/15';
            statusLabel = 'In Review';
          }

          return (
            <div
              key={modName}
              onClick={() => onSelectModule(modName)}
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                isSelected
                  ? 'bg-indigo-500/[0.04] border-indigo-500/40 shadow-md shadow-indigo-950/25'
                  : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-sans font-bold text-slate-200 block line-clamp-1">{modName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {passed}/{total} Pruebas completadas
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${statusBadgeColor}`}>
                  {statusLabel} ({pct}%)
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    failed > 0 ? 'bg-rose-500' : passed === total ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Individual counts preview */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex gap-2.5">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {passed}</span>
                  {failed > 0 && <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-rose-500" /> {failed}</span>}
                  {blocked > 0 && <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-orange-500" /> {blocked}</span>}
                  {review > 0 && <span className="flex items-center gap-1"><HelpCircle className="w-3 h-3 text-indigo-400" /> {review}</span>}
                </div>
                <span className="text-indigo-400 font-bold flex items-center gap-0.5 text-[9px] uppercase tracking-wider">
                  Filtrar Pruebas <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
