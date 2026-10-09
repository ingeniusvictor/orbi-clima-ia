import React, { useState, useEffect } from 'react';
import { Tablet, Smartphone, Laptop, CheckSquare, ListTodo, AlertCircle } from 'lucide-react';

export default function QaDeviceChecklist() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('orbi_clima_qa_device_cl_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'dev_1', label: 'Navegador Desktop (Chrome/Safari/Firefox)', checked: true, desc: 'Prueba de visualización fluida y responsive en pantallas anchas.' },
      { id: 'dev_2', label: 'Android WebView / Capacitor Container', checked: true, desc: 'Inspeccionar el renderizado dentro del webview nativo de Android.' },
      { id: 'dev_3', label: 'Dispositivo Android Físico', checked: false, desc: 'Gatillar flujos en un teléfono real para verificar latencia táctil.' },
      { id: 'dev_4', label: 'Emulador Android (Android Studio)', checked: false, desc: 'Verificar compatibilidad con diversas APIs (API 33, 34, 35).' },
      { id: 'dev_5', label: 'Modo Oscuro Integrado', checked: true, desc: 'Validar contraste del tema visual oscuro profundo de la app.' },
      { id: 'dev_6', label: 'Pantalla de Formato Pequeño (< 360px)', checked: false, desc: 'Ajustar la resolución para prevenir desbordes de texto.' },
      { id: 'dev_7', label: 'Pantalla de Formato Grande / Tablet', checked: false, desc: 'Validar expansiones de grilla y legibilidad en pantallas grandes.' },
      { id: 'dev_8', label: 'Simulación Sin Internet (Offline)', checked: false, desc: 'Garantizar que la aplicación cargue datos en caché sin cerrarse.' },
      { id: 'dev_9', label: 'GPS Denegado (Ubicación desactivada)', checked: true, desc: 'Verificar que la app ofrezca la búsqueda manual sin congelarse.' },
      { id: 'dev_10', label: 'GPS Permitido (Geolocalización activa)', checked: false, desc: 'Confirmar que cargue las coordenadas de forma autónoma.' },
      { id: 'dev_11', label: 'Notificaciones Denegadas', checked: true, desc: 'La app no debe forzar diálogos repetitivos ni dar errores.' },
      { id: 'dev_12', label: 'Notificaciones Permitidas', checked: false, desc: 'Se configuran correctamente los canales de alerta del sistema.' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orbi_clima_qa_device_cl_v1', JSON.stringify(items));
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
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block uppercase tracking-wider font-sans">Checklist de Dispositivos</span>
            <span className="text-[9px] text-slate-500 font-mono">MATRIZ DE DISPOSITIVOS Y COMPATIBILIDAD</span>
          </div>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/15">
          {completed} / {items.length} TESTED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
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
