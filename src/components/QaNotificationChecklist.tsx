import React, { useState, useEffect } from 'react';
import { Bell, ListTodo } from 'lucide-react';

export default function QaNotificationChecklist() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('orbi_clima_qa_notif_cl_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'not_1', label: 'Permiso POST_NOTIFICATIONS solicitado', checked: true, desc: 'Solicitud limpia gatillada bajo acción directa, sin intrusiones al iniciar.' },
      { id: 'not_2', label: 'Canales separados Persona y Técnico', checked: true, desc: 'Canales de notificación independientes en Android para silenciar según preferencia.' },
      { id: 'not_3', label: 'Gatillar prueba manual de notificación', checked: true, desc: 'La alerta local simulada suena y se muestra de forma correcta.' },
      { id: 'not_4', label: 'Alerta Persona prioriza autocuidado', checked: true, desc: 'Las alertas de lluvia y UV recomiendan paraguas o bloqueador solar en lenguaje sencillo.' },
      { id: 'not_5', label: 'Alerta Técnico prioriza prevención HSE', checked: true, desc: 'Alertas de viento y humedad integran de forma obligatoria la Directiva HSE.' },
      { id: 'not_6', label: 'Quiet Hours bloquea alertas secundarias', checked: true, desc: 'Las alertas menores se silenciaron de 22:00 a 07:00 para no perturbar.' },
      { id: 'not_7', label: 'Frequency Guard impide spam diario', checked: true, desc: 'Filtra y detiene el exceso de notificaciones en un rango corto de tiempo.' },
      { id: 'not_8', label: 'Resumen matutino/vespertino programable', checked: true, desc: 'La entrega de informes consolidados de turno se genera puntualmente.' },
      { id: 'not_9', label: 'Cola de diferidas expira a las 6 horas', checked: true, desc: 'Las alertas no críticas acumuladas se limpian antes de quedar obsoletas.' },
      { id: 'not_10', label: 'Tap sobre notificación abre app', checked: true, desc: 'Al tocar la alerta, se muestra o destaca el panel correspondiente.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orbi_clima_qa_notif_cl_v1', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const completed = items.filter(i => i.checked).length;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-sans">Checklist de Notificaciones</span>
            <span className="text-[9px] text-slate-500 font-mono">PUSH & LOCAL NOTIFICATIONS SYSTEM</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/15">
          {completed} / {items.length} VERIFIED
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-2.5 rounded-xl border flex gap-2.5 items-start cursor-pointer select-none transition-all group ${
              item.checked
                ? 'bg-orange-500/[0.03] border-orange-500/15 hover:border-orange-500/25'
                : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => {}} // handled by div
              className="mt-0.5 accent-orange-500 pointer-events-none rounded scale-90"
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
