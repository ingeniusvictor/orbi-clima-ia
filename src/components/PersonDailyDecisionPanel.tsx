import { Thermometer, CloudRain, Smile, Sun, Calendar, ShieldCheck } from 'lucide-react';
import { SkyCoreRiskScore, SkyCoreTimeWindow, SkyCoreDecision, CurrentWeather } from '../types/weatherTypes';
import { getDecisionLabel } from '../utils/skyCoreRiskLabels';

interface PersonDailyDecisionPanelProps {
  current: CurrentWeather;
  scores: SkyCoreRiskScore[];
  bestWindow?: SkyCoreTimeWindow;
  globalDecision: SkyCoreDecision;
}

export default function PersonDailyDecisionPanel({ current, scores, bestWindow, globalDecision }: PersonDailyDecisionPanelProps) {
  // 1. ¿Necesito chaqueta?
  const temp = current.temperatureC;
  let jacketAnswer = 'No es necesaria';
  let jacketColor = 'text-emerald-400';
  if (temp <= 8) {
    jacketAnswer = 'Chaqueta gruesa y abrigo obligatorio';
    jacketColor = 'text-rose-400 font-bold';
  } else if (temp <= 14) {
    jacketAnswer = 'Chaqueta ligera o suéter temprano';
    jacketColor = 'text-amber-400';
  } else if (temp >= 30) {
    jacketAnswer = 'Sin chaqueta, prefiere ropa delgada y transpirable';
    jacketColor = 'text-sky-400';
  }

  // 2. ¿Lloverá pronto?
  const rainScore = scores.find(s => s.category === 'rain')?.score || 0;
  let rainAnswer = 'Sin probabilidad de lluvias';
  let rainColor = 'text-emerald-400';
  if (current.precipitationMm > 0) {
    rainAnswer = 'Lloviendo actualmente, lleva paraguas';
    rainColor = 'text-rose-400 font-bold';
  } else if (rainScore >= 60) {
    rainAnswer = 'Muy probable, lleva paraguas indispensable';
    rainColor = 'text-rose-400';
  } else if (rainScore >= 40) {
    rainAnswer = 'Probabilidad moderada, ten cuidado';
    rainColor = 'text-amber-400';
  }

  // 3. ¿Buen momento para salir?
  let departureAnswer = 'Excelente momento para salir';
  let departureColor = 'text-emerald-400';
  if (globalDecision === 'critical' || globalDecision === 'not_recommended') {
    departureAnswer = 'No recomendado, prefiere resguardo';
    departureColor = 'text-rose-400 font-bold';
  } else if (globalDecision === 'caution') {
    departureAnswer = 'Favorable, pero toma precauciones del panel';
    departureColor = 'text-amber-400';
  }

  // 4. ¿Cuidado con UV?
  const uvVal = current.uvIndex;
  let uvAnswer = 'Riesgo bajo hoy';
  let uvColor = 'text-emerald-400';
  if (uvVal >= 8) {
    uvAnswer = 'UV Extremo, bloqueador cada 2 horas obligatorio';
    uvColor = 'text-rose-400 font-bold';
  } else if (uvVal >= 6) {
    uvAnswer = 'UV Alto, bloqueador e hidratación indispensables';
    uvColor = 'text-amber-400';
  } else if (uvVal >= 3) {
    uvAnswer = 'UV Moderado, usa bloqueador si estarás expuesto';
    uvColor = 'text-sky-400';
  }

  return (
    <div id="person-daily-decision-panel" className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <h4 className="text-xs font-mono font-bold tracking-wider text-white/50 uppercase">
          Decisiones Diarias Rápidas
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Inteligencia SkyCore™</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Chaqueta */}
        <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-3 hover:bg-white/[0.03] transition-all">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0 mt-0.5">
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/40 uppercase">
              ¿Necesito abrigo hoy?
            </span>
            <span className={`text-xs font-sans ${jacketColor}`}>
              {jacketAnswer}
            </span>
          </div>
        </div>

        {/* Lluvia */}
        <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-3 hover:bg-white/[0.03] transition-all">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
            <CloudRain className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/40 uppercase">
              ¿Lloverá en las próximas horas?
            </span>
            <span className={`text-xs font-sans ${rainColor}`}>
              {rainAnswer}
            </span>
          </div>
        </div>

        {/* Salir */}
        <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-3 hover:bg-white/[0.03] transition-all">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <Smile className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/40 uppercase">
              ¿Es buen momento para salir?
            </span>
            <span className={`text-xs font-sans ${departureColor}`}>
              {departureAnswer}
            </span>
          </div>
        </div>

        {/* UV */}
        <div className="p-3.5 rounded-2xl bg-white/[0.01] border border-white/5 flex items-start gap-3 hover:bg-white/[0.03] transition-all">
          <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-400 shrink-0 mt-0.5">
            <Sun className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-white/40 uppercase">
              ¿Precaución de Radiación UV?
            </span>
            <span className={`text-xs font-sans ${uvColor}`}>
              {uvAnswer}
            </span>
          </div>
        </div>
      </div>

      {/* Best Window embedded snippet */}
      {bestWindow && (
        <div className="flex items-center gap-2.5 bg-sky-500/5 border border-sky-500/10 p-3 rounded-xl mt-1 text-[11px] font-sans text-white/80">
          <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Mejor horario recomendado:</strong> de {bestWindow.startTime} a {bestWindow.endTime} ({bestWindow.label}). {bestWindow.reason}
          </span>
        </div>
      )}
    </div>
  );
}
