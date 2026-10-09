import React from 'react';
import { ShieldCheck, CheckCircle2, CheckSquare, Square } from 'lucide-react';

interface DeviceAcceptanceChecklistCardProps {
  checklist: Record<string, boolean>;
  onToggleCheck: (id: string) => void;
  onCheckAll: () => void;
  onClearAll: () => void;
}

const CHECKLIST_ITEMS = [
  { id: 'device-install', label: 'Instala correctamente en dispositivo Android' },
  { id: 'device-no-crash', label: 'Abre sin colgarse ni crashear' },
  { id: 'device-mobileshell', label: 'MobileShell se ve y se siente como app Android' },
  { id: 'device-no-long-panels', label: 'No aparecen paneles técnicos largos en Home' },
  { id: 'device-bottom-nav', label: 'Bottom navigation con 4 pestañas funciona' },
  { id: 'device-onboarding', label: 'Onboarding aparece o se mantiene completado' },
  { id: 'device-live-weather', label: 'Carga clima live desde Open-Meteo' },
  { id: 'device-manual-search', label: 'Funciona búsqueda manual de estaciones/ciudades' },
  { id: 'device-gps-allowed', label: 'Funciona geolocalización por GPS con permiso' },
  { id: 'device-gps-denied', label: 'Funciona correctamente con GPS denegado (fallback)' },
  { id: 'device-fallback-offline', label: 'Funciona en modo sin internet/offline' },
  { id: 'device-person-profile', label: 'Perfil Persona activo y funcional' },
  { id: 'device-tech-profile', label: 'Perfil Técnico Terreno activo y funcional' },
  { id: 'device-hse-visible', label: 'Directiva HSE de terreno visible en paneles' },
  { id: 'device-smart-alerts', label: 'Alertas climáticas inteligentes visibles' },
  { id: 'device-test-notif', label: 'Notificación de prueba en segundo plano funciona' },
  { id: 'device-quiet-hours', label: 'Quiet Hours y Frequency Guard activos' },
  { id: 'device-widget-skypanel', label: 'Widget SkyPanel (Previsualización) funciona' },
  { id: 'device-widget-skyorb-mini', label: 'Widget SkyOrb Mini (Previsualización) funciona' },
  { id: 'device-widget-field-cmd', label: 'Widget Field Command (Previsualización) funciona' },
  { id: 'device-widget-cinematic', label: 'Widget Cinematic Bar (Previsualización) funciona' },
  { id: 'device-prefs-persist', label: 'Preferencias de usuario persisten localmente' },
  { id: 'device-local-memory', label: 'Memoria local funciona (búsquedas editables/eliminables)' },
  { id: 'device-advanced-console-gate', label: 'AdvancedOrbiConsole solo abre tras pasar DeveloperModeGate' },
  { id: 'device-no-hsec', label: 'Sin referencias prohibidas a regulaciones (No HSEC ni HASEC)' }
];

export default function DeviceAcceptanceChecklistCard({
  checklist,
  onToggleCheck,
  onCheckAll,
  onClearAll
}: DeviceAcceptanceChecklistCardProps) {
  const completedCount = CHECKLIST_ITEMS.filter(item => checklist[item.id]).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-4 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans text-left space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Checklist de Aceptación de Dispositivo</h4>
            <p className="text-[10px] text-slate-400">25 ítems mínimos requeridos en el equipo físico</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onCheckAll}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[9px] rounded transition-all cursor-pointer"
          >
            VERIFICAR TODO
          </button>
          <button
            onClick={onClearAll}
            className="px-2 py-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-mono text-[9px] rounded transition-all cursor-pointer"
          >
            LIMPIAR
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-[#050914] p-2.5 rounded-xl border border-slate-800 flex justify-between items-center gap-3">
        <div className="flex-1">
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-300 font-bold shrink-0">
          {completedCount}/{totalCount} ({percent}%)
        </span>
      </div>

      {/* Checklist grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
        {CHECKLIST_ITEMS.map(item => {
          const checked = !!checklist[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onToggleCheck(item.id)}
              className={`p-2 rounded-xl flex items-center justify-between text-left gap-2 border transition-all cursor-pointer ${
                checked
                  ? 'bg-indigo-500/5 border-indigo-500/15 text-slate-200'
                  : 'bg-slate-900/40 border-slate-800/40 text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="leading-tight">{item.label}</span>
              <div className="shrink-0">
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )
                }
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
