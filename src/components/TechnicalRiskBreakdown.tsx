import { Zap, Activity, Wind, Sun, Info, ShieldCheck } from 'lucide-react';
import { SkyCoreRiskScore } from '../types/weatherTypes';
import { getRiskLevelBadgeClass } from '../utils/skyCoreRiskLabels';

interface TechnicalRiskBreakdownProps {
  scores: SkyCoreRiskScore[];
}

export default function TechnicalRiskBreakdown({ scores }: TechnicalRiskBreakdownProps) {
  // Extract matching scores
  const getScore = (cat: string) => scores.find(s => s.category === cat);

  const elec = getScore('electrical_work');
  const field = getScore('field_work');
  const wind = getScore('wind');
  const pv = getScore('solar_pv');

  const renderProgressBar = (scoreValue: number) => {
    let barColor = 'bg-emerald-500';
    if (scoreValue >= 75) barColor = 'bg-rose-500';
    else if (scoreValue >= 50) barColor = 'bg-amber-500';
    else if (scoreValue >= 25) barColor = 'bg-sky-500';

    return (
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${scoreValue}%` }} />
      </div>
    );
  };

  return (
    <div id="technical-risk-breakdown" className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-xs font-mono font-bold tracking-wider text-white/50 uppercase">
          Desglose Operativo Técnico
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Protocolo HSE Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Row 1: Electrical and Terrain */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Zap className="w-4 h-4 shrink-0" />
                <span className="text-xs font-sans font-bold text-white">Maniobras Eléctricas</span>
              </div>
              {elec && (
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${getRiskLevelBadgeClass(elec.level)}`}>
                  {elec.label}
                </span>
              )}
            </div>
            <p className="text-[11px] font-sans text-white/60 leading-relaxed mt-1">
              {elec?.reason || 'Sin restricciones detectadas.'} {elec?.recommendation}
            </p>
          </div>
          {elec && renderProgressBar(elec.score)}
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Activity className="w-4 h-4 shrink-0" />
                <span className="text-xs font-sans font-bold text-white">Trabajos Exteriores</span>
              </div>
              {field && (
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${getRiskLevelBadgeClass(field.level)}`}>
                  {field.label}
                </span>
              )}
            </div>
            <p className="text-[11px] font-sans text-white/60 leading-relaxed mt-1">
              {field?.reason || 'Condición apta para terreno.'} {field?.recommendation}
            </p>
          </div>
          {field && renderProgressBar(field.score)}
        </div>

        {/* Row 2: Winds and Solar PV */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <Wind className="w-4 h-4 shrink-0" />
                <span className="text-xs font-sans font-bold text-white">Carga de Viento Sostenido</span>
              </div>
              {wind && (
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${getRiskLevelBadgeClass(wind.level)}`}>
                  {wind.label}
                </span>
              )}
            </div>
            <p className="text-[11px] font-sans text-white/60 leading-relaxed mt-1">
              {wind?.reason} {wind?.recommendation}
            </p>
          </div>
          {wind && renderProgressBar(wind.score)}
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400">
                <Sun className="w-4 h-4 shrink-0" />
                <span className="text-xs font-sans font-bold text-white">Capa Fotovoltaica (Generación)</span>
              </div>
              {pv && (
                <span className={`px-1.5 py-0.5 text-[8px] font-mono font-bold uppercase rounded border ${getRiskLevelBadgeClass(pv.level)}`}>
                  {pv.label}
                </span>
              )}
            </div>
            <p className="text-[11px] font-sans text-white/60 leading-relaxed mt-1">
              {pv?.reason} {pv?.recommendation}
            </p>
          </div>
          {pv && renderProgressBar(pv.score)}
        </div>
      </div>

      {/* Solar disclaimer from Section 23 */}
      <div className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl mt-1">
        <Info className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-[10px] font-mono text-yellow-400 leading-normal">
          <strong>DISCLAIMER FOTOVOLTAICO:</strong> Estimación climática orientativa. No reemplaza medición SCADA ni modelos de producción calibrados de planta.
        </p>
      </div>
    </div>
  );
}
