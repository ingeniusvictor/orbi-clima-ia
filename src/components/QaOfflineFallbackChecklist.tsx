import React, { useState, useEffect } from 'react';
import { WifiOff, ListTodo } from 'lucide-react';

export default function QaOfflineFallbackChecklist() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('orbi_clima_qa_offline_cl_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'off_1', label: 'Sin internet no rompe app', checked: true, desc: 'Al interrumpir la red, la app responde de forma controlada sin congelarse.' },
      { id: 'off_2', label: 'Cached se muestra si existe', checked: true, desc: 'Se recuperan e indican correctamente los datos del último clima cargado en caché.' },
      { id: 'off_3', label: 'Demo se puede cargar', checked: true, desc: 'El simulador meteorológico opera perfectamente desconectado para pruebas rápidas.' },
      { id: 'off_4', label: 'Fallback no envía notificaciones automáticas', checked: true, desc: 'Evita colas de notificaciones erróneas cuando las consultas fallan.' },
      { id: 'off_5', label: 'Widget no queda vacío', checked: true, desc: 'El visor de widgets simulados retiene la última información válida o un estado por defecto.' },
      { id: 'off_6', label: 'Microcopy humano aparece', checked: true, desc: 'Mensajes amables como "Trabajando con clima guardado" en vez de códigos de error crudos.' },
      { id: 'off_7', label: 'Store readiness sigue accesible', checked: true, desc: 'Las descripciones y políticas se pueden editar y exportar sin necesidad de conexión a internet.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orbi_clima_qa_offline_cl_v1', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completed = items.filter(i => i.checked).length;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-sans">Checklist Offline & Fallback</span>
            <span className="text-[9px] text-slate-500 font-mono">OFFLINE PERFORMANCE VALIDATION</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
          {completed} / {items.length} PASSED
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-2.5 rounded-xl border flex gap-2.5 items-start cursor-pointer select-none transition-all group ${
              item.checked
                ? 'bg-cyan-500/[0.03] border-cyan-500/15 hover:border-cyan-500/25'
                : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => {}} // handled by div
              className="mt-0.5 accent-cyan-500 pointer-events-none rounded scale-90"
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
