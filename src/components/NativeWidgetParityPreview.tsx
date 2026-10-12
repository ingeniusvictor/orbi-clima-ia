import React, { useMemo, useState } from 'react';
import { Cloud, CloudRain, Eye, Snowflake, Sun, Wind, Zap } from 'lucide-react';
import type { CurrentWeather, HourlyForecast, WeatherCondition } from '../types/weatherTypes';

type NativeVariant = 'mini' | 'panel' | 'command' | 'field' | 'cinematic';

interface NativeWidgetParityPreviewProps {
  current: CurrentWeather;
  hourly: HourlyForecast[];
  locationName: string;
  shortNarrative: string;
  bestWindow: string;
  weatherSourceState?: any;
}

const variants: Array<{ id: NativeVariant; label: string; size: string }> = [
  { id: 'mini', label: 'SkyOrb Mini', size: '2×2' },
  { id: 'panel', label: 'SkyPanel', size: '4×2' },
  { id: 'command', label: 'SkyOrb Command', size: '4×4' },
  { id: 'field', label: 'Field Command', size: '4×4' },
  { id: 'cinematic', label: 'Cinematic Bar', size: '5×2' },
];

function accent(condition: WeatherCondition) {
  switch (condition) {
    case 'sunny':
    case 'hot': return { text: 'text-amber-200', border: 'border-amber-300/35', glow: 'rgba(251,191,36,.28)', a: '#ffd166', b: '#7c4a13' };
    case 'rain': return { text: 'text-blue-300', border: 'border-blue-400/35', glow: 'rgba(59,130,246,.28)', a: '#60a5fa', b: '#172554' };
    case 'storm': return { text: 'text-violet-300', border: 'border-violet-400/35', glow: 'rgba(139,92,246,.28)', a: '#a78bfa', b: '#2e1065' };
    case 'snow':
    case 'cold': return { text: 'text-sky-200', border: 'border-sky-200/35', glow: 'rgba(186,230,253,.30)', a: '#e0f2fe', b: '#075985' };
    case 'fog': return { text: 'text-zinc-200', border: 'border-zinc-300/30', glow: 'rgba(212,212,216,.22)', a: '#e4e4e7', b: '#475569' };
    case 'wind': return { text: 'text-cyan-300', border: 'border-cyan-300/35', glow: 'rgba(34,211,238,.25)', a: '#67e8f9', b: '#134e4a' };
    case 'cloudy':
    case 'partly_cloudy': return { text: 'text-slate-200', border: 'border-slate-300/25', glow: 'rgba(148,163,184,.22)', a: '#cbd5e1', b: '#334155' };
    default: return { text: 'text-cyan-300', border: 'border-cyan-300/35', glow: 'rgba(34,211,238,.25)', a: '#67e8f9', b: '#164e63' };
  }
}

function fallbackConditionLabel(condition: WeatherCondition) {
  const map: Record<WeatherCondition, string> = {
    sunny: 'Soleado', partly_cloudy: 'Parcial', cloudy: 'Nublado', fog: 'Niebla', rain: 'Lluvia', snow: 'Nevado',
    storm: 'Tormenta', wind: 'Ventoso', cold: 'Frío', hot: 'Caluroso', night: 'Despejado',
  };
  return map[condition] ?? 'Estable';
}

function conditionLabel(current: CurrentWeather) {
  return current.conditionLabel?.trim() || fallbackConditionLabel(current.condition);
}

function ConditionIcon({ condition, className = 'w-8 h-8' }: { condition: WeatherCondition; className?: string }) {
  if (condition === 'rain') return <CloudRain className={className} />;
  if (condition === 'snow' || condition === 'cold') return <Snowflake className={className} />;
  if (condition === 'storm') return <Zap className={className} />;
  if (condition === 'wind') return <Wind className={className} />;
  if (condition === 'fog') return <Eye className={className} />;
  if (condition === 'cloudy' || condition === 'partly_cloudy') return <Cloud className={className} />;
  return <Sun className={className} />;
}

function NativeOrb({ current, size = 108 }: { current: CurrentWeather; size?: number }) {
  const tone = accent(current.condition);
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <div className={`absolute inset-[3%] rounded-full border ${tone.border}`} />
      <div className="absolute inset-[10%] rounded-full border border-cyan-300/15" />
      <div
        className={`absolute inset-[18%] rounded-full border ${tone.border}`}
        style={{
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.45), ${tone.a} 18%, ${tone.b} 72%, #07101d 100%)`,
          boxShadow: `0 0 ${Math.round(size * .28)}px ${tone.glow}, inset 0 0 ${Math.round(size * .12)}px rgba(255,255,255,.10)`,
        }}
      />
      <ConditionIcon condition={current.condition} className={`${size >= 100 ? 'w-8 h-8' : 'w-6 h-6'} relative z-10 text-white/85`} />
      <span className="absolute right-[22%] top-[18%] w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_white]" />
    </div>
  );
}

function SourceBadge({ weatherSourceState }: { weatherSourceState?: any }) {
  const label = weatherSourceState?.provider === 'mock'
    ? 'DEMO'
    : weatherSourceState?.mode === 'cached'
      ? 'CACHE'
      : weatherSourceState?.mode === 'fallback'
        ? 'SEGURO'
        : 'LIVE';
  const cls = label === 'LIVE' ? 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10' : 'text-cyan-300 border-cyan-400/25 bg-cyan-400/10';
  return <span className={`px-2 py-1 rounded-full border text-[8px] font-black font-mono tracking-wider ${cls}`}>{label}</span>;
}

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(135deg,#030712_0%,#07101f_58%,#050a16_100%)] border border-cyan-300/25 shadow-[0_20px_50px_rgba(0,0,0,.45),0_0_25px_rgba(34,211,238,.08)] ${className}`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_52%_44%,rgba(34,211,238,.11),transparent_54%)]" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function Metric({ label, value, tone = 'text-cyan-300' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/[.07] bg-slate-900/70 px-3 py-2.5 min-w-0">
      <div className={`text-[7px] font-mono font-black tracking-[.14em] ${tone}`}>{label}</div>
      <div className="text-[12px] font-black text-white mt-1 truncate">{value}</div>
    </div>
  );
}

export default function NativeWidgetParityPreview({
  current,
  hourly,
  locationName,
  shortNarrative,
  bestWindow,
  weatherSourceState,
}: NativeWidgetParityPreviewProps) {
  const [variant, setVariant] = useState<NativeVariant>('panel');
  const tone = accent(current.condition);
  const next = useMemo(() => hourly.slice(0, 3), [hourly]);
  const rainProbability = next[0]?.precipitationProbability ?? 0;
  const exactLabel = conditionLabel(current);

  const header = (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-white text-[11px] font-black">ORBI</span>
        <span className="text-cyan-300 text-[11px] font-black">CLIMA IA</span>
      </div>
      <SourceBadge weatherSourceState={weatherSourceState} />
    </div>
  );

  const preview = (() => {
    if (variant === 'mini') {
      return (
        <Frame className="w-[220px] aspect-square rounded-[28px] p-4 mx-auto">
          {header}
          <div className="h-[calc(100%-28px)] flex flex-col items-center justify-center -mt-1">
            <NativeOrb current={current} size={104} />
            <div className="text-[36px] leading-none font-black text-white mt-1">{current.temperatureC}°</div>
            <div className={`text-[9px] font-black uppercase tracking-[.12em] mt-2 ${tone.text}`}>{exactLabel}</div>
            <div className="text-[10px] font-bold text-slate-300 mt-1">{locationName}</div>
          </div>
        </Frame>
      );
    }

    if (variant === 'panel') {
      return (
        <Frame className="w-full max-w-[520px] aspect-[2.28/1] rounded-[28px] p-4 mx-auto">
          {header}
          <div className="grid grid-cols-[105px_1fr_1.14fr] gap-3 items-center h-[calc(100%-30px)]">
            <NativeOrb current={current} size={100} />
            <div className="min-w-0">
              <div className="text-[34px] leading-none font-black text-white">{current.temperatureC}°</div>
              <div className={`text-[10px] font-black mt-2 ${tone.text}`}>{exactLabel}</div>
              <div className="text-[10px] text-slate-300 font-bold mt-1 truncate">{locationName}</div>
              <div className="text-[8px] text-slate-500 mt-1">Sensación {current.feelsLikeC}°</div>
            </div>
            <div className="grid grid-cols-2 gap-2 min-w-0">
              <Metric label="HUMEDAD" value={`${current.humidity}%`} />
              <Metric label="LLUVIA" value={`${rainProbability}%`} tone="text-blue-300" />
              <Metric label="VIENTO" value={`${current.windSpeedKmh} km/h`} tone="text-violet-300" />
              <Metric label="UV" value={`${current.uvIndex}`} tone="text-amber-200" />
            </div>
          </div>
        </Frame>
      );
    }

    if (variant === 'command') {
      return (
        <Frame className="w-full max-w-[390px] aspect-square rounded-[30px] p-4 mx-auto">
          {header}
          <div className="relative h-[72%] mt-2">
            <div className="absolute inset-[8%_14%] rounded-[50%] border border-cyan-300/20 rotate-[-8deg]" />
            <div className="absolute inset-[13%_10%] rounded-[50%] border border-violet-300/20 rotate-[12deg]" />
            <div className="absolute left-1 top-10 w-[88px]"><Metric label="LLUVIA" value={`${rainProbability}%`} tone="text-blue-300" /></div>
            <div className="absolute right-1 top-10 w-[88px]"><Metric label="HUMEDAD" value={`${current.humidity}%`} /></div>
            <div className="absolute left-1 bottom-8 w-[88px]"><Metric label="VIENTO" value={`${current.windSpeedKmh}`} tone="text-violet-300" /></div>
            <div className="absolute right-1 bottom-8 w-[88px]"><Metric label="UV" value={`${current.uvIndex}`} tone="text-amber-200" /></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <NativeOrb current={current} size={128} />
              <div className="text-[38px] leading-none font-black text-white -mt-1">{current.temperatureC}°</div>
              <div className={`text-[9px] font-black mt-2 ${tone.text}`}>{exactLabel}</div>
              <div className="text-[10px] text-slate-300 font-bold">{locationName}</div>
            </div>
          </div>
          <div className="rounded-xl border border-cyan-300/15 bg-slate-900/70 px-3 py-2 flex gap-2 items-center">
            <span className="text-[8px] font-black text-cyan-300 shrink-0">ORBI IA</span>
            <span className="text-[8px] text-slate-200 font-semibold truncate">{shortNarrative || 'Condición meteorológica actual sincronizada.'}</span>
          </div>
        </Frame>
      );
    }

    if (variant === 'field') {
      return (
        <Frame className="w-full max-w-[390px] aspect-square rounded-[30px] p-4 mx-auto">
          {header}
          <div className="text-[9px] font-mono font-black tracking-[.16em] text-amber-300 mt-2">FIELD COMMAND</div>
          <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-slate-900/75 px-3 py-3 flex justify-between items-end">
            <div><div className="text-[7px] text-slate-500 font-mono">CONDICIÓN OPERATIVA</div><div className="text-[17px] text-emerald-300 font-black mt-1">FAVORABLE</div></div>
            <div className="text-[18px] font-black text-white">{current.temperatureC}° / {current.feelsLikeC}°</div>
          </div>
          <div className="grid grid-cols-[112px_1fr] gap-3 mt-3">
            <div className="flex flex-col items-center"><NativeOrb current={current} size={110} /><span className={`text-[9px] font-black ${tone.text}`}>{exactLabel}</span></div>
            <div className="grid grid-cols-2 gap-2"><Metric label="HUMEDAD" value={`${current.humidity}%`} /><Metric label="VIENTO" value={`${current.windSpeedKmh} km/h`} tone="text-violet-300" /><Metric label="UV" value={`${current.uvIndex}`} tone="text-amber-200" /><Metric label="LLUVIA" value={`${rainProbability}%`} tone="text-blue-300" /></div>
          </div>
          <div className="mt-3 rounded-2xl border border-amber-300/15 bg-slate-900/75 px-3 py-3">
            <div className="text-[7px] font-black text-amber-300 tracking-[.12em]">ORBI SKYCORE · MITIGACIÓN</div>
            <div className="text-[9px] text-slate-200 mt-1.5 line-clamp-2">{shortNarrative || 'Validar condiciones antes de ejecutar maniobras de terreno.'}</div>
          </div>
        </Frame>
      );
    }

    return (
      <Frame className="w-full max-w-[560px] aspect-[2.6/1] rounded-[28px] p-4 mx-auto">
        {header}
        <div className="grid grid-cols-[116px_180px_1fr] gap-3 items-center h-[calc(100%-28px)]">
          <NativeOrb current={current} size={106} />
          <div><div className="text-[34px] font-black leading-none text-white">{current.temperatureC}°</div><div className={`text-[9px] font-black mt-2 ${tone.text}`}>{exactLabel}</div><div className="text-[10px] text-slate-300 mt-1 font-bold">{locationName}</div></div>
          <div className="min-w-0"><div className="text-[8px] font-black tracking-[.16em] text-cyan-300">ORBI CINEMATIC</div><p className="text-[10px] leading-relaxed text-slate-100 font-semibold mt-2 line-clamp-2">{shortNarrative || 'Clima actual y ventana recomendada en una sola mirada.'}</p><div className="grid grid-cols-3 gap-1.5 mt-3">{next.map((h, i) => <div key={i} className="rounded-lg border border-white/[.06] bg-slate-900/70 px-2 py-1.5 text-center"><div className="text-[7px] text-slate-500">{h.time}</div><div className="text-[10px] text-white font-black">{h.temperatureC}°</div></div>)}</div><div className="text-[7px] text-slate-500 mt-2">Mejor ventana: {bestWindow || 'según evolución'}</div></div>
        </div>
      </Frame>
    );
  })();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[.04] p-3">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.8)] shrink-0" />
          <div>
            <p className="text-[10px] font-mono font-black tracking-[.12em] text-cyan-300">VISTA DE PARIDAD NATIVA · CANVAS V2</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">El widget Android usa esta misma jerarquía y geometría visual. El launcher puede ajustar algunos márgenes externos según fabricante y tamaño de cuadrícula.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {variants.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setVariant(item.id)}
            className={`rounded-xl border px-3 py-2 text-left transition-all ${variant === item.id ? 'border-cyan-400/45 bg-cyan-400/10' : 'border-white/[.06] bg-white/[.025]'}`}
          >
            <span className={`block text-[10px] font-black ${variant === item.id ? 'text-cyan-300' : 'text-slate-300'}`}>{item.label}</span>
            <span className="block text-[8px] font-mono text-slate-500 mt-0.5">NATIVO · {item.size}</span>
          </button>
        ))}
      </div>

      <div className="py-2">{preview}</div>
      <p className="text-[9px] text-slate-500 text-center font-mono">OC-22I · NATIVE WIDGET PARITY</p>
    </div>
  );
}
