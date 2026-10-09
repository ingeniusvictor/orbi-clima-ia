import React, { useState, useEffect } from 'react';
import { Layers, ListTodo } from 'lucide-react';

export default function QaWidgetChecklist() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('orbi_clima_qa_widget_cl_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'wid_1', label: 'SkyPanel 4x2 visible', checked: true, desc: 'Muestra clima, viento, e indicador del perfil en formato mediano.' },
      { id: 'wid_2', label: 'SkyOrb Mini 2x2 visible', checked: true, desc: 'Visualización circular minimalista centrando la temperatura principal.' },
      { id: 'wid_3', label: 'Field Command 4x4 visible', checked: true, desc: 'Muestra vientos, ráfagas, y la directiva HSE reducida para terreno.' },
      { id: 'wid_4', label: 'Cinematic Bar 5x2 visible', checked: true, desc: 'Formato panorámico para tablets con aura degradada adaptada al sol.' },
      { id: 'wid_5', label: 'Contrato JSON se sincroniza', checked: true, desc: 'El volcado JSON de los widgets refleja exactamente los datos climáticos actuales.' },
      { id: 'wid_6', label: 'Estado Live/Cached/Demo reflejado', checked: true, desc: 'La procedencia climática aparece grabada en la esquina inferior del widget.' },
      { id: 'wid_7', label: 'Tap abre app (Deep Link)', checked: true, desc: 'Al pulsar la simulación de widget, se ejecuta el deep link para abrir la app.' },
      { id: 'wid_8', label: 'Fallback premium en offline', checked: true, desc: 'Indica claramente al usuario cuando opera con datos meteorológicos de la caché.' },
      { id: 'wid_9', label: 'Actualiza tras cambiar ciudad', checked: true, desc: 'El contenido del widget cambia inmediatamente al modificar la ciudad preferida.' },
      { id: 'wid_10', label: 'Actualiza tras cambiar perfil', checked: true, desc: 'El widget redibuja las recomendaciones al alternar entre Persona y Técnico.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orbi_clima_qa_widget_cl_v1', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completed = items.filter(i => i.checked).length;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-sans">Checklist de Widgets Android</span>
            <span className="text-[9px] text-slate-500 font-mono">NATIVE WIDGET INTEGRATION VERIFICATION</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">
          {completed} / {items.length} COMPLETED
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-2.5 rounded-xl border flex gap-2.5 items-start cursor-pointer select-none transition-all group ${
              item.checked
                ? 'bg-indigo-500/[0.03] border-indigo-500/15 hover:border-indigo-500/25'
                : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => {}} // handled by div
              className="mt-0.5 accent-indigo-500 pointer-events-none rounded scale-90"
            />
            <div className="space-y-0.5">
              <span className={`text-[11px] font-bold block ${item.checked ? 'text-slate-300 line-through opacity-70' : 'text-slate-200'}`}>
                {item.label}
              </span>
              <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
