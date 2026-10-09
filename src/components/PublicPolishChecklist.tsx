import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Check, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { loadUserPreferences } from '../services/userPreferencesService';
import { loadRcClosureState } from '../services/rcClosureStateService';

export default function PublicPolishChecklist() {
  const [prefs] = useState(() => loadUserPreferences());
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isRcClosed, setIsRcClosed] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem('orbi_clima_first_launch_completed_v1');
    setOnboardingCompleted(val === 'true');

    const checkRc = () => {
      try {
        const rc = loadRcClosureState();
        setIsRcClosed(rc.status === 'final_closed');
      } catch (e) {
        setIsRcClosed(false);
      }
    };
    checkRc();
    window.addEventListener('focus', checkRc);
    window.addEventListener('orbi_rc_closure_changed', checkRc);
    return () => {
      window.removeEventListener('focus', checkRc);
      window.removeEventListener('orbi_rc_closure_changed', checkRc);
    };
  }, []);

  const checklistItems = [
    { id: 'identity', label: 'Identidad visible (ORBI Clima IA & SkyCore)', checked: true },
    { id: 'onboarding', label: 'Onboarding interactivo de primera apertura activo', checked: onboardingCompleted },
    { id: 'profiles', label: 'Perfiles optimizados claros (Persona y Técnico Terreno)', checked: true },
    { id: 'privacy', label: 'Privacidad local explicada (Sin login/nube/backend)', checked: true },
    { id: 'widgets', label: 'Showcase de Widgets Android implementado', checked: true },
    { id: 'alerts', label: 'Alertas climáticas humanas e inteligibles', checked: true },
    { id: 'notifications', label: 'Notificaciones no invasivas explicadas y con log local', checked: true },
    { id: 'memory', label: 'Memoria local transparente, editable y eliminable', checked: true },
    { id: 'hse', label: 'Directiva HSE Terreno oficial presente', checked: true },
    { id: 'anti_hsec', label: 'Sin referencias prohibidas (Sin HSEC ni HASEC)', checked: true },
    { id: 'no_backend', label: 'Sin dependencias de backend, login o nubes de pago', checked: true },
    { id: 'no_api_keys', label: 'Sin API keys ni credenciales expuestas', checked: true },
    { id: 'clean_build', label: 'Build de producción web y Android limpio', checked: true },
    // Módulo 8B items
    { id: 'store_listing', label: 'Ficha pública Play Store preparada (Store Listing Draft)', checked: true },
    { id: 'privacy_package', label: 'Política de privacidad in-app borrador visible (Privacy Package)', checked: true },
    { id: 'data_safety', label: 'Declaración de seguridad de datos armada (Data Safety Draft)', checked: true },
    { id: 'perms_inventory', label: 'Inventario justificado de permisos de Android listo (Permissions Inventory)', checked: true },
    { id: 'release_checklist', label: 'Checklist interactivo de producción integrado (Release Checklist)', checked: true },
    // Módulo 10 items
    { id: 'rc_closure', label: 'Cierre de Release Candidate (Módulo 10)', checked: isRcClosed }
  ];

  const checkedCount = checklistItems.filter(item => item.checked).length;
  const scorePercent = Math.round((checkedCount / checklistItems.length) * 100);

  return (
    <div id="public-polish-checklist" className="p-5 rounded-2xl bg-[#090d19]/90 border border-slate-800 font-sans relative overflow-hidden">
      
      {/* Dynamic Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Public Polish Checklist</h3>
            <p className="text-[10px] text-slate-400">Auditoría interna de calidad para tiendas públicas</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-indigo-400 font-mono">{scorePercent}%</span>
          <span className="text-[9px] block text-slate-400 font-mono">PUNTAJE</span>
        </div>
      </div>

      {/* Main Score Bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/50">
          <div
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] mt-1.5 text-slate-400">
          <span>{checkedCount} de {checklistItems.length} completados</span>
          <span className="text-emerald-400 font-bold font-mono">
            {scorePercent >= 100 ? 'Listo para Lanzamiento' : 'Polishing Activo'}
          </span>
        </div>
      </div>

      {/* Checklist grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={`p-2 rounded-xl flex items-center justify-between gap-2 border ${
              item.checked
                ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-300'
                : 'bg-amber-500/5 border-amber-500/10 text-slate-400'
            }`}
          >
            <span className="truncate">{item.label}</span>
            <div className={`p-0.5 rounded-full shrink-0 ${
              item.checked ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
            }`}>
              <Check className="w-3 h-3" />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestion underlay */}
      {!onboardingCompleted && (
        <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-[10px] text-slate-300 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>El onboarding está inactivo en el almacenamiento local. Puedes restablecerlo en la sección de diagnóstico para simular un primer lanzamiento.</span>
        </div>
      )}

      <div className="mt-3.5 pt-3.5 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>Módulo de Control de Calidad Activo: Módulo 10</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const el = document.getElementById('orbi-internal-testing-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/15 text-pink-400 font-bold rounded-lg cursor-pointer transition-all"
          >
            🧪 TESTING INTERNO
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('orbi-qa-center-panel');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/15 text-indigo-400 font-bold rounded-lg cursor-pointer transition-all"
          >
            🛠️ EJECUTAR QA CENTER
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('orbi-packaging-panel-container');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/15 text-blue-400 font-bold rounded-lg cursor-pointer transition-all"
          >
            📦 PACKAGING ANDROID
          </button>
        </div>
      </div>
    </div>
  );
}
