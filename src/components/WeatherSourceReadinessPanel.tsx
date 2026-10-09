import { Globe, Database, HelpCircle, Unlock, CheckCircle } from 'lucide-react';
import { WeatherSourceState } from '../types/weatherTypes';

interface WeatherSourceReadinessPanelProps {
  state?: WeatherSourceState;
}

export default function WeatherSourceReadinessPanel({ state }: WeatherSourceReadinessPanelProps) {
  const sources = [
    { name: 'Open-Meteo API', type: 'Live MVP Active', status: 'active', desc: 'Suministro global en tiempo real integrado de forma segura sin claves ni credenciales.' },
    { name: 'MeteoChile / DMC', type: 'Planned Chile Layer', status: 'planned', desc: 'Estaciones de terreno oficiales y avisos de tormentas chilenas.' },
    { name: 'MET Norway', type: 'Planned Backup Model', status: 'planned', desc: 'Modelo meteorológico escandinavo de altísima fidelidad y respaldo.' },
    { name: 'OpenWeather API', type: 'Optional Pro', status: 'enterprise', desc: 'Datos históricos acumulados y alertas globales avanzadas.' },
    { name: 'Tomorrow.io API', type: 'Optional Enterprise', status: 'enterprise', desc: 'Previsiones hiper-locales y análisis de ráfagas de viento específicas.' },
  ];

  return (
    <div className="w-full flex flex-col gap-5" id="weather-source-readiness-panel">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Globe className="text-cyan-400 w-4.5 h-4.5" />
          <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider">
            Weather Source Readiness (Integración de Datos)
          </h3>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Ecosistema de conectores y orígenes de datos climáticos de ORBI Clima IA, operando de forma segura y transparente.
        </p>
      </div>

      {/* Main Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Active Information */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3 md:col-span-7">
          <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0 animate-pulse" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              Integración Real Desbloqueada (Módulo 1)
            </span>
            <p className="text-xs text-emerald-200/80 leading-relaxed mt-0.5">
              Hemos migrado con éxito a un suministro meteorológico híbrido: datos reales provistos por Open-Meteo con un sistema robusto de caché local y contingencia segura.
            </p>
          </div>
        </div>

        {/* Current State Details Section */}
        <div className="p-4 rounded-2xl bg-[#0a1122] border border-white/5 md:col-span-5 flex flex-col justify-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold block mb-2">
            Estado Actual del Sistema
          </span>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] font-mono text-white/70">
            <div>Fuente activa:</div>
            <div className="text-white font-bold text-right">
              {state?.provider === 'open_meteo' ? 'Open-Meteo API' : 'Local Demo (Mock)'}
            </div>
            
            <div>Modo actual:</div>
            <div className={`font-bold text-right uppercase ${state?.mode === 'live' ? 'text-emerald-400' : state?.mode === 'cached' ? 'text-cyan-400' : 'text-amber-400'}`}>
              {state?.mode || 'mock'}
            </div>
            
            <div>Sincronización:</div>
            <div className="text-slate-300 font-bold text-right">
              {state?.lastUpdated || 'No sínc.'}
            </div>
            
            <div>Respaldo de Red:</div>
            <div className="text-emerald-400 font-bold text-right">Habilitado (Cache)</div>
          </div>
        </div>

      </div>

      {/* Source Cards list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sources.map((src, idx) => {
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between gap-3 transition-all hover:bg-white/10"
              id={`source-card-${idx}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-sans font-bold text-white block">{src.name}</span>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${
                    src.status === 'active' 
                      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                      : src.status === 'planned' 
                      ? 'text-white/40 bg-white/5 border-white/10' 
                      : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                  }`}>
                    {src.status === 'active' ? 'ACTIVO LIVE' : src.status === 'planned' ? 'PLANIFICADO' : 'OPCIONAL'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40 mt-1 block uppercase">{src.type}</span>
                <p className="text-[11px] text-white/60 leading-relaxed mt-2">{src.desc}</p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 border-t border-white/5 pt-2">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Protocolo seguro HTTPS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
