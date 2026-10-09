import React, { useState } from 'react';
import { downloadAndroidPackagingPackage } from '../services/androidPackagingExportService';
import { Download, FileText, Check, AlertCircle } from 'lucide-react';

export default function PackagingExportCard() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    downloadAndroidPackagingPackage();
    setTimeout(() => setDownloading(false), 2000);
  };

  const filesToExport = [
    {
      name: 'ORBI_CLIMA_IA_ANDROID_PACKAGING_CHECKLIST.md',
      desc: 'Detalle técnico de identidad, versión, Application ID y estado de Gradle.',
    },
    {
      name: 'ORBI_CLIMA_IA_MANIFEST_AUDIT.md',
      desc: 'Auditoría de AndroidManifest.xml, permisos requeridos y exported flags para Android 12+.',
    },
    {
      name: 'ORBI_CLIMA_IA_SIGNED_BUILD_READINESS.md',
      desc: 'Directivas de seguridad, generación del almacén de claves (keystore) y flujo release.',
    },
    {
      name: 'ORBI_CLIMA_IA_PLAY_CONSOLE_PREFLIGHT.md',
      desc: 'Borrador de notas de lanzamiento, preflight de tienda y validación del AAB.',
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#0a1122]/40 border border-white/5 flex flex-col justify-between gap-5 h-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Packaging Export Hub</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">EXPORTE DE MANUALES Y AUDITORÍAS DE FIRMA</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Descargue el set de documentación y checklists técnicos recomendados para importar en su flujo de compilación local en Android Studio o sistema de CI/CD.
        </p>

        <div className="space-y-2.5">
          {filesToExport.map((file, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-[#060a12]/50 border border-white/5 flex gap-2.5 items-start">
              <div className="p-1 rounded bg-slate-800 text-slate-400 shrink-0 mt-0.5">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-slate-300 font-bold block">{file.name}</span>
                <p className="text-[9px] text-slate-500 font-sans leading-relaxed">{file.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2 items-start text-[10px] text-indigo-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="leading-relaxed">
            Los archivos descargados contienen guías operativas e inventarios listos para auditorías internas de TI antes de la generación del AAB de producción.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer font-sans active:scale-98 shadow-md disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Check className="w-4 h-4 animate-bounce" /> Generando Archivos...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> DESCARGAR PAQUETE DE EMPAQUETADO (.MD)
            </>
          )}
        </button>
      </div>
    </div>
  );
}
