import React from 'react';
import { Award, FileBadge, Copy, Download, RefreshCw, Lock, Unlock } from 'lucide-react';
import { FinalReleaseSealState, issueLocalReleaseSeal } from '../services/finalReleaseSealService';
import { buildLocalReleaseSealMarkdown, downloadLocalReleaseSeal } from '../services/finalReleaseExportService';

interface LocalReleaseSealCertificateCardProps {
  state: FinalReleaseSealState;
  isGatePassed: boolean;
  onUpdateState: (partial: Partial<FinalReleaseSealState>) => void;
  onIssueSeal: () => void;
}

export default function LocalReleaseSealCertificateCard({
  state,
  isGatePassed,
  onUpdateState,
  onIssueSeal
}: LocalReleaseSealCertificateCardProps) {
  const isSealed = state.freezeStatus === 'local_release_sealed' || state.localSealIssued;

  const certificateText = buildLocalReleaseSealMarkdown(state);

  const handleCopy = () => {
    navigator.clipboard.writeText(certificateText);
    alert('Certificado de sello local copiado al portapapeles.');
  };

  const handleDownload = () => {
    downloadLocalReleaseSeal(state);
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <p className="text-[10px] text-slate-400">
        Declaración formal del cierre de calidad local. Solo se permite emitir el sello de liberación si se cumplen el 100% de las compuertas técnicas y el Feature Freeze se encuentra activo.
      </p>

      {/* Main Certificate view */}
      <div className="bg-slate-950/70 p-3.5 rounded-lg border border-indigo-500/20 font-mono text-[9px] text-slate-300 max-h-[200px] overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
        {certificateText}
      </div>

      {/* Primary seal action trigger */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
        {isSealed ? (
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <FileBadge className="w-12 h-12 text-emerald-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-400 font-mono uppercase">ESTADO DE CONFORMIDAD: SELLO LOCAL v1.0 EMITIDO</h5>
              <p className="text-[9px] text-slate-400 mt-1 max-w-sm mx-auto">
                El ciclo técnico de ORBI Clima IA v1.0 ha sido clausurado y bloqueado con éxito. Se ha establecido la política de congelamiento permanente de características.
              </p>
            </div>
            <div className="pt-1.5 flex justify-center gap-2">
              <button
                onClick={() => {
                  if (confirm('¿Desea reabrir el sello técnico para auditoría adicional?')) {
                    onUpdateState({
                      localSealIssued: false,
                      freezeStatus: 'draft'
                    });
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 bg-slate-850 hover:bg-slate-800 text-slate-400 border border-slate-800 font-bold rounded text-[9px] cursor-pointer"
              >
                <Unlock className="w-3 h-3" /> REABRIR SELLO LOCAL
              </button>
            </div>
          </div>
        ) : (
          <div>
            {isGatePassed && state.featureFreezeActive ? (
              <div className="space-y-2">
                <p className="text-[9.5px] text-amber-400 font-mono font-bold text-center">
                  ⚠️ ¡ATENCIÓN! Sello listo para ser estampado de forma irreversible en esta sesión.
                </p>
                <button
                  onClick={onIssueSeal}
                  className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-black rounded text-xs font-mono tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  <Award className="w-4 h-4" /> EMITIR SELLO LOCAL DEFECTO (SEAL v1.0)
                </button>
              </div>
            ) : (
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-lg text-center text-[10px] text-slate-500 font-mono">
                Debe resolver todas las compuertas técnicas y activar el "Feature Freeze" en la sección de arriba para habilitar el botón de estampar sello.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side Action Buttons */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono font-bold rounded cursor-pointer transition-all"
        >
          COPIAR CERTIFICADO
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 font-mono font-bold rounded cursor-pointer transition-all"
        >
          DESCARGAR (.MD)
        </button>
      </div>
    </div>
  );
}
