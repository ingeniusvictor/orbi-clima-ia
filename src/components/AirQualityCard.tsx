import { Activity, Wind, ShieldCheck } from 'lucide-react';
import { AirQualitySnapshot } from '../services/openMeteoAirQualityService';

interface AirQualityCardProps {
  data: AirQualitySnapshot | null;
  loading?: boolean;
}

function bandClasses(band?: AirQualitySnapshot['band']) {
  switch (band) {
    case 'good': return 'text-emerald-300 border-emerald-500/25 bg-emerald-500/10';
    case 'moderate': return 'text-amber-300 border-amber-500/25 bg-amber-500/10';
    case 'sensitive': return 'text-orange-300 border-orange-500/25 bg-orange-500/10';
    case 'unhealthy':
    case 'very_unhealthy':
    case 'hazardous': return 'text-red-300 border-red-500/25 bg-red-500/10';
    default: return 'text-slate-300 border-white/10 bg-white/5';
  }
}

export default function AirQualityCard({ data, loading = false }: AirQualityCardProps) {
  if (loading && !data) {
    return <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5 text-xs text-slate-400">Actualizando calidad del aire…</div>;
  }

  if (!data) {
    return (
      <div className="p-4 rounded-2xl bg-[#090f1e]/70 border border-white/5">
        <div className="flex items-center gap-2 text-slate-300">
          <Wind className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold">Calidad del aire no disponible</span>
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 rounded-2xl bg-[#090f1e]/75 border border-white/5 space-y-3" aria-label="Calidad del aire modelada">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Calidad del aire</p>
            <p className="text-sm font-semibold text-white">AQI modelado</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${bandClasses(data.band)}`}>
          {data.usAqi ?? '—'} · {data.label}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="PM2.5" value={data.pm25} unit="µg/m³" />
        <Metric label="PM10" value={data.pm10} unit="µg/m³" />
        <Metric label="O₃" value={data.ozone} unit="µg/m³" />
      </div>

      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 mt-0.5 shrink-0" />
        <div className="text-[10px] leading-relaxed text-slate-300">
          <p>
            {data.dominantPollutant ? `Contaminante dominante estimado: ${data.dominantPollutant}. ` : ''}
            {data.next12HoursMaxUsAqi !== null ? `Máximo modelado próximas 12 h: AQI ${Math.round(data.next12HoursMaxUsAqi)}.` : ''}
          </p>
          <p className="text-slate-500 mt-1">{data.sourceLabel} · resolución aprox. {data.resolutionKm} km. No es una alerta oficial local.</p>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
      <p className="text-[9px] font-mono uppercase text-slate-500">{label}</p>
      <p className="text-xs font-bold text-white mt-1">{value === null ? '—' : Math.round(value)} <span className="text-[9px] font-normal text-slate-500">{unit}</span></p>
    </div>
  );
}
