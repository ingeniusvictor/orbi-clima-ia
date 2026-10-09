import React, { useState, useEffect } from 'react';
import { LayoutGrid, Cpu, User, CheckCircle2 } from 'lucide-react';
import { PreferredWidgetVariant } from '../types/weatherTypes';
import { loadUserPreferences, updateUserPreferences } from '../services/userPreferencesService';

const WIDGETS_CONFIG: { id: PreferredWidgetVariant; label: string; desc: string; targetProfile: 'person' | 'field_tech' }[] = [
  {
    id: 'skyorb_2x2',
    label: 'ORBI SkyOrb 2x2 Snapshot',
    desc: 'Esfera premium compacta (2x2) con origen, temperatura y ubicación.',
    targetProfile: 'person'
  },
  {
    id: 'skyorb_4x2',
    label: 'ORBI SkyOrb 4x2 Snapshot',
    desc: 'Panel premium con esfera (4x2), resumen climático e indicadores.',
    targetProfile: 'person'
  },
  {
    id: 'skyorb_4x4',
    label: 'ORBI SkyOrb 4x4 Snapshot',
    desc: 'Panel inmersivo (4x4) con recomendación, estado y riesgo de perfil.',
    targetProfile: 'field_tech'
  },
  {
    id: 'skypanel',
    label: 'SkyPanel Standard',
    desc: 'Panel general limpio con métricas clave y radar.',
    targetProfile: 'person'
  },
  {
    id: 'cinematic_bar',
    label: 'Cinematic Weather Bar',
    desc: 'Barra inmersiva con acentos visuales fluidos.',
    targetProfile: 'person'
  },
  {
    id: 'field_command',
    label: 'Field Command Center',
    desc: 'Vista de control avanzada enfocada en riesgos.',
    targetProfile: 'field_tech'
  },
  {
    id: 'skyorb_mini',
    label: 'SkyOrb Mini Core',
    desc: 'Fórmula circular compacta y minimalista.',
    targetProfile: 'person' // generic/both
  }
];

export default function WidgetPreferenceCard() {
  const [prefs, setPrefs] = useState(() => loadUserPreferences());

  useEffect(() => {
    const handleUpdate = () => {
      setPrefs(loadUserPreferences());
    };
    window.addEventListener('orbi-user-preferences-changed', handleUpdate);
    return () => {
      window.removeEventListener('orbi-user-preferences-changed', handleUpdate);
    };
  }, []);

  const handleWidgetChange = (variant: PreferredWidgetVariant) => {
    updateUserPreferences({ preferredWidgetVariant: variant });
    import('../services/weatherMemoryService').then(({ recordWidgetUse }) => {
      recordWidgetUse(variant);
    });
  };

  const currentProfile = prefs.preferredProfile;

  return (
    <div id="widget-preference-card" className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl transition-all hover:border-slate-700">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100 font-sans">Diseño Widget Preferido</h3>
          <p className="text-xs text-slate-400 mt-0.5">Estilo de widget por defecto</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 mb-4 leading-relaxed font-sans">
        Selecciona el estilo visual preferido para tu pantalla e integraciones Android de widgets.
      </p>

      <div className="space-y-2.5">
        {WIDGETS_CONFIG.map((widget) => {
          const isSelected = prefs.preferredWidgetVariant === widget.id;
          const isRecommended = widget.targetProfile === currentProfile;

          return (
            <button
              key={widget.id}
              onClick={() => handleWidgetChange(widget.id)}
              className={`w-full p-3 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                isSelected
                  ? 'bg-blue-500/5 border-blue-500/40 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 font-sans">{widget.label}</span>
                  {isRecommended && (
                    <span className="text-[9px] font-mono font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/15">
                      RECOMENDADO
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans leading-relaxed">{widget.desc}</p>
              </div>

              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
