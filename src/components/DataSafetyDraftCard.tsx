import React from 'react';
import { ShieldAlert, MapPin, Sliders, Bell, Brain, AlertTriangle } from 'lucide-react';

export default function DataSafetyDraftCard() {
  const sections = [
    {
      title: 'Ubicación (Location)',
      icon: MapPin,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/5',
      borderColor: 'border-sky-500/10',
      details: [
        { label: 'Tipo de Datos', value: 'Ubicación aproximada y/o precisa del dispositivo (si el usuario otorga el permiso).' },
        { label: 'Recopilación', value: 'Se solicita al abrir el mapa o pulsar "Obtener mi ubicación GPS" para actualizar las coordenadas del clima local.' },
        { label: 'Uso Declarado', value: 'Funcionalidad de la aplicación (App Functionality) para consultar pronósticos meteorológicos de la zona.' },
        { label: 'Compartición', value: 'No compartida con backend propio. Solo enviada temporalmente de forma anónima al endpoint público de Open-Meteo.' }
      ]
    },
    {
      title: 'Configuración y Preferencias',
      icon: Sliders,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/5',
      borderColor: 'border-indigo-500/10',
      details: [
        { label: 'Tipo de Datos', value: 'Preferencias de la aplicación (perfil activo, límites personalizados, modo demo, quiet hours).' },
        { label: 'Recopilación', value: 'Almacenado localmente a medida que el usuario ajusta sus controles.' },
        { label: 'Uso Declarado', value: 'Personalización de la experiencia (Personalization) y funcionamiento de los widgets locales.' },
        { label: 'Compartición', value: 'No compartida. Almacenada estrictamente en el localStorage del navegador/dispositivo.' }
      ]
    },
    {
      title: 'Notificaciones y Alertas',
      icon: Bell,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/5',
      borderColor: 'border-amber-500/10',
      details: [
        { label: 'Tipo de Datos', value: 'Preferencias de alertas inteligentes e historial local de notificaciones de riesgo.' },
        { label: 'Recopilación', value: 'Creado y guardado en memoria local a medida que el motor SkyCore genera alertas.' },
        { label: 'Uso Declarado', value: 'Funcionalidad de la aplicación (App Functionality) para desplegar avisos locales de seguridad.' },
        { label: 'Compartición', value: 'No compartida. Se procesa de forma interna en el hilo del scheduler de notificaciones.' }
      ]
    },
    {
      title: 'Memoria Climática Local',
      icon: Brain,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-500/5',
      borderColor: 'border-teal-500/10',
      details: [
        { label: 'Tipo de Datos', value: 'Historial de ciudades frecuentes consultadas y widgets añadidos.' },
        { label: 'Recopilación', value: 'Guardado interno automático derivado de la interacción para formular sugerencias heurísticas.' },
        { label: 'Uso Declarado', value: 'Personalización de la experiencia (Personalization).' },
        { label: 'Compartición', value: 'No compartida. Los datos se pueden auditar, exportar o borrar totalmente por el usuario en cualquier momento.' }
      ]
    }
  ];

  return (
    <div className="p-6 rounded-2xl bg-[#090e1a]/80 border border-slate-800 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-sans font-bold text-slate-100 uppercase tracking-wider">Data Safety Draft</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">DECLARACIONES DE SEGURIDAD DE DATOS (GOOGLE PLAY)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((sec, idx) => {
          const IconComp = sec.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl ${sec.bgColor} border ${sec.borderColor} space-y-3`}>
              <div className="flex items-center gap-2">
                <IconComp className={`w-4.5 h-4.5 ${sec.iconColor}`} />
                <span className="text-xs font-sans font-bold text-slate-200 uppercase tracking-wide">{sec.title}</span>
              </div>
              <div className="space-y-2">
                {sec.details.map((detail, dIdx) => (
                  <div key={dIdx} className="text-[11px] font-sans">
                    <span className="font-semibold text-slate-400 block">{detail.label}:</span>
                    <span className="text-slate-200 mt-0.5 block leading-relaxed">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 flex gap-2.5 items-start">
        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          <span className="font-bold text-rose-400">Nota Técnica Importante:</span> La declaración de Data Safety final en Play Store es vinculante para el desarrollador. Debe revisarse contra el APK/AAB real construido, los permisos declarados en el AndroidManifest final y cualquier biblioteca SDK externa de analíticas o publicidad antes de su publicación.
        </p>
      </div>
    </div>
  );
}
