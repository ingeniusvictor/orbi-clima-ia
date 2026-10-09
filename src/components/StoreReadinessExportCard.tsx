import React, { useState } from 'react';
import { Download, FileDown, Check, Sparkles } from 'lucide-react';
import {
  downloadStoreReadinessPackage,
  buildStoreReadinessMarkdown,
  buildPrivacyPolicyDraftMarkdown,
  buildDataSafetyDraftMarkdown,
  buildPermissionsInventoryMarkdown,
  buildReleaseChecklistMarkdown
} from '../services/storeReadinessExportService';

export default function StoreReadinessExportCard() {
  const [downloadedState, setDownloadedState] = useState<string | null>(null);

  const triggerSingleDownload = (content: string, filename: string, key: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadedState(key);
    setTimeout(() => setDownloadedState(null), 2000);
  };

  const files = [
    {
      name: 'ORBI_CLIMA_IA_STORE_READINESS.md',
      label: 'Ficha Técnica de Publicación (Draft)',
      contentFn: buildStoreReadinessMarkdown,
      key: 'store'
    },
    {
      name: 'ORBI_CLIMA_IA_PRIVACY_POLICY_DRAFT.md',
      label: 'Borrador de Política de Privacidad',
      contentFn: buildPrivacyPolicyDraftMarkdown,
      key: 'privacy'
    },
    {
      name: 'ORBI_CLIMA_IA_DATA_SAFETY_DRAFT.md',
      label: 'Respuestas de Seguridad de Datos',
      contentFn: buildDataSafetyDraftMarkdown,
      key: 'safety'
    },
    {
      name: 'ORBI_CLIMA_IA_PERMISSIONS_INVENTORY.md',
      label: 'Inventario de Permisos del Manifest',
      contentFn: buildPermissionsInventoryMarkdown,
      key: 'perms'
    },
    {
      name: 'ORBI_CLIMA_IA_RELEASE_CHECKLIST.md',
      label: 'Checklist Completo de Lanzamiento',
      contentFn: buildReleaseChecklistMarkdown,
      key: 'checklist'
    }
  ];

  const handleDownloadAll = () => {
    downloadStoreReadinessPackage();
    setDownloadedState('all');
    setTimeout(() => setDownloadedState(null), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Store Readiness Export</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">EXPORTACIÓN DE DOCUMENTOS DE PUBLICACIÓN</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-sans leading-relaxed">
        Descarga los borradores de documentación pre-lanzamiento en formato Markdown. Estos archivos contienen los textos que debes rellenar en Google Play Console al subir la aplicación.
      </p>

      {/* Individual files list */}
      <div className="space-y-2 border-y border-slate-800/80 py-3.5">
        {files.map((file) => (
          <div key={file.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-slate-800 transition-all">
            <div className="flex flex-col">
              <span className="text-xs font-sans font-bold text-slate-200">{file.label}</span>
              <code className="text-[10px] font-mono text-slate-500 mt-0.5">{file.name}</code>
            </div>
            <button
              onClick={() => triggerSingleDownload(file.contentFn(), file.name, file.key)}
              className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 rounded-lg transition-all cursor-pointer"
              title="Descargar archivo individual"
            >
              {downloadedState === file.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        ))}
      </div>

      {/* Global package button */}
      <button
        onClick={handleDownloadAll}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-950/30 hover:scale-[1.01] active:scale-95"
      >
        {downloadedState === 'all' ? (
          <>
            <Check className="w-4 h-4 text-emerald-300" /> ¡Paquete Descargado con Éxito!
          </>
        ) : (
          <>
            <Download className="w-4 h-4" /> Descargar Paquete de Publicación Completo (.MD)
          </>
        )}
      </button>
    </div>
  );
}
