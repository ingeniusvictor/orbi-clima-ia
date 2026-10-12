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
    case 'hot': return { text: 'text-amber-200', border: 'border-amber-300/40', glow: 'rgba(251,191,36,.26)', a: '#ffd166', b: '#7c4a13' };
    case 'rain': return { text: 'text-blue-300', border: 'border-blue-400/40', glow: 'rgba(59,130,246,.28)', a: '#60a5fa', b: '#172554' };
    case 'storm': return { text: 'text-violet-300', border: 'border-violet-400/40', glow: 'rgba(139,92,246,.30)', a: '#a78bfa', b: '#2e1065' };
    case 'snow':
    case 'cold': return { text: 'text-sky-200', border: 'border-sky-200/40', glow: 'rgba(186,230,253,.28)', a: '#e0f2fe', b: '#075985' };
    case 'fog': return { text: 'text-zinc-200', border: 'border-zinc-300/35', glow: 'rgba(212,212,216,.22)', a: '#e4e4e7', b: '#475569' };
    case 'wind': return { text: 'text-cyan-300', border: 'border-cyan-300/40', glow: 'rgba(34,211,238,.25)', a: '#67e8f9', b: '#134e4a' };
    case 'cloudy':
    case 'partly_cloudy': return { text: 'text-slate-200', border: 'border-slate-300/30', glow: 'rgba(148,163,184,.22)', a: '#cbd5e1', b: '#334155' };
    default: return { text: 'text-cyan-300', border: 'border-cyan-300/40', glow: 'rgba(34,211,238,.25)', a: '#67e8f9', b: '#164e63' };
  }
}

function fallbackConditionLabel(condition: WeatherCondition) {
  const map: Record<WeatherCondition, string> = {
    sunny: 'Soleado',
    partly_cloudy: 'Parcialmente nublado',
    cloudy: 'Nublado',
    fog: 'Niebla',
    rain: 'Lluvia',
    snow: 'Nevada',
    storm: 'Tormenta',
    wind: 'Ventoso',
    cold: 'Frío',
    hot: 'Caluroso',
    night: 'Despejado',
  };
  return map[condition] ?? 'Estable';
}

function exactConditionLabel(current: CurrentWeather) {
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

function SourceBadge({ weatherSourceState }: { weatherSourceState?: any }) {
  const label = weatherSourceState?.provider === 'mock'
    ? 'DEMO'
    : weatherSourceState?.mode === 'cached'
      ? 'CACHE'
      : weatherSourceState?.mode === 'fallback'
        ? 'SEGURO'
        : 'LIVE';
  const cls = label === 'LIVE'
    ? 'text-emerald-300 border-emerald-400/35 bg-emerald-400/10'
    : 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10';
  return <span className={`px-2.5 py-1 rounded-full border text-[8px] font-black font-mono tracking-wider ${cls}`}>{label}</span>;
}

function BrandHeader({ weatherSourceState, compact = false }: { weatherSourceState?: any; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <img
          src="/orbi-clima-app-icon.jpg"
          alt=""
          aria-hidden="true"
          className={`${compact ? 'w-6 h-6' : 'w-7 h-7'} rounded-[8px] object-cover border border-cyan-300/30 shadow-[0_0_12px_rgba(34,211,238,.18)]`}
        />
        <div className="flex items-baseline gap-1 min-w-0 whitespace-nowrap">
          <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-white font-black`}>ORBI</span>
          <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-cyan-300 font-black`}>CLIMA IA</span>
        </div>
      </div>
      <SourceBadge weatherSourceState={weatherSourceState} />
    </div>
  );
}

function Frame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[linear-gradient(135deg,#020611_0%,#07101f_58%,#050a16_100%)] border border-cyan-300/25 shadow-[0_20px_50px_rgba(0,0,0,.45),0_0_28px_rgba(34,211,238,.09)] ${className}`}>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_52%_44%,rgba(34,211,238,.11),transparent_54%)]" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

function NativeOrb({ current, size = 112 }: { current: CurrentWeather; size?: number }) {
  const tone = accent(current.condition);
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      <div className={`absolute inset-[1%] rounded-full border ${tone.border}`} />
      <div className="absolute -inset-[15%] rounded-[50%] border border-cyan-300/15 rotate-[-12deg]" />
      <div className="absolute -inset-[8%] rounded-[50%] border border-violet-300/15 rotate-[16deg]" />
      <div
        className={`absolute inset-[13%] rounded-full border ${tone.border}`}
        style={{
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.45), ${tone.a} 18%, ${tone.b} 72%, #07101d 100%)`,
          boxShadow: `0 0 ${Math.round(size * .28)}px ${tone.glow}, inset 0 0 ${Math.round(size * .12)}px rgba(255,255,255,.10)`,
        }}
      />
      <ConditionIcon condition={current.condition} className={`${size >= 100 ? 'w-8 h-8' : 'w-6 h-6'} relative z-10 text-white/85`} />
      <span className="absolute right-[20%] top-[15%] w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_white]" />
    </div>
  );
}

function MetricBubble({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'cyan' | 'violet' | 'amber' }) {
  const style = {
    blue: 'border-blue-400/50 text-blue-300 shadow-[0_0_18px_rgba(59,130,246,.10)]',
    cyan: 'border-cyan-300/50 text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,.10)]',
    violet: 'border-violet-400/50 text-violet-300 shadow-[0_0_18px_rgba(139,92,246,.10)]',
    amber: 'border-amber-300/50 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,.10)]',
  }[tone];
  return (
    <div className={`w-[70px] h-[70px] rounded-full border bg-[#07101f]/78 flex flex-col items-center justify-center ${style}`}>
      <span className="text-[7px] leading-none font-mono font-black tracking-[.04em]">{label}</span>
      <span className="text-[18px] leading-none font-black text-white mt-1">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, tone = 'text-cyan-300' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/[.07] bg-slate-900/70 px-3 py-2.5 min-w-0">
      <div className={`text-[7px] font-mono font-black tracking-[.12em] ${tone}`}>{label}</div>
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
  const [variant, setVariant] = useState<NativeVariant>('command');
  const tone = accent(current.condition);
  const next = useMemo(() => hourly.slice(0, 3), [hourly]);
  const rainProbability = next[0]?.precipitationProbability ?? 0;
  const exactLabel = exactConditionLabel(current);

  const commandPreview = (
    <Frame className="w-full max-w-[390px] aspect-square rounded-[30px] p-4 mx-auto">
      <BrandHeader weatherSourceState={weatherSourceState} />
      <div className="relative h-[72%] mt-2">
        <div className="absolute inset-[10%_18%] rounded-[50%] border border-cyan-300/20 rotate-[-12deg]" />
        <div className="absolute inset-[15%_14%] rounded-[50%] border border-violet-300/20 rotate-[16deg]" />
        <div className="absolute left-[2%] top-[15%]"><MetricBubble label="LLUVIA" value={`${rainProbability}%`} tone="blue" /></div>
        <div className="absolute right-[2%] top-[15%]"><MetricBubble label="HUMEDAD" value={`${current.humidity}%`} tone="cyan" /></div>
        <div className="absolute left-[2%] bottom-[10%]"><MetricBubble label="VIENTO" value={`${current.windSpeedKmh}`} tone="violet" /></div>
        <div className="absolute right-[2%] bottom-[10%]"><MetricBubble label="UV" value={`${current.uvIndex}`} tone="amber" /></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <NativeOrb current={current} size={126} />
          <div className="text-[39px] leading-none font-black text-white -mt-1">{current.temperatureC}°</div>
          <div className={`max-w-[210px] text-center text-[10px] leading-tight font-black mt-2 ${tone.text}`}>{exactLabel}</div>
          <div className="text-[10px] text-slate-300 font-bold mt-1">{locationName}</div>
        </div>
      </div>
      <div className="rounded-xl border border-cyan-300/15 bg-slate-900/72 px-3 py-2">
        <div className="flex gap-2 items-center min-w-0">
          <span className="text-[8px] font-black text-cyan-300 shrink-0">ORBI IA</span>
          <span className="text-[8px] text-slate-100 font-semibold truncate">{shortNarrative || 'Condición meteorológica actual sincronizada.'}</span>
        </div>
        <div className="flex justify-between gap-2 mt-1.5 text-[7px] text-slate-500">
          <span className="truncate">{next.map(h => `${h.time} ${h.temperatureC}°`).join(' · ') || 'Evolución horaria sincronizada'}</span>
          <span className="text-cyan-300/75 font-black shrink-0">SKYORB COMMAND</span>
        </div>
      </div>
    </Frame>
  );

  const preview = (() => {
    if (variant === 'command') return commandPreview;

    if (variant === 'mini') {
      return (
        <Frame className="w-[220px] aspect-square rounded-[28px] p-4 mx-auto">
          <BrandHeader weatherSourceState={weatherSourceState} compact />
          <div className="h-[calc(100%-28px)] flex flex-col items-center justify-center -mt-1">
            <NativeOrb current={current} size={100} />
            <div className="text-[36px] leading-none font-black text-white mt-1">{current.temperatureC}°</div>
            <div className={`max-w-[180px] text-center text-[9px] leading-tight font-black uppercase mt-2 ${tone.text}`}>{exactLabel}</div>
            <div className="text-[10px] font-bold text-slate-300 mt-1">{locationName}</div>
          </div>
        </Frame>
      );
    }

    if (variant === 'panel') {
      return (
        <Frame className="w-full max-w-[520px] aspect-[2.28/1] rounded-[28px] p-4 mx-auto">
          <BrandHeader weatherSourceState={weatherSourceState} compact />
          <div className="grid grid-cols-[96px_1fr_1.12fr] gap-3 items-center h-[calc(100%-30px)]">
            <NativeOrb current={current} size={92} />
            <div className="min-w-0">
              <div className="text-[34px] leading-none font-black text-white">{current.temperatureC}°</div>
              <div className={`text-[9px] leading-tight font-black mt-2 ${tone.text}`}>{exactLabel}</div>
              <div className="text-[9px] text-slate-300 font-bold mt-1 truncate">{locationName}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 min-w-0">
              <MetricCard label="HUMEDAD" value={`${current.humidity}%`} />
              <MetricCard label="LLUVIA" value={`${rainProbability}%`} tone="text-blue-300" />
              <MetricCard label="VIENTO" value={`${current.windSpeedKmh} km/h`} tone="text-violet-300" />
              <MetricCard label="UV" value={`${current.uvIndex}`} tone="text-amber-200" />
            </div>
          </div>
        </Frame>
      );
    }

    if (variant === 'field') {
      return (
        <Frame className="w-full max-w-[390px] aspect-square rounded-[30px] p-4 mx-auto">
          <BrandHeader weatherSourceState={weatherSourceState} />
          <div className="text-[9px] font-mono font-black tracking-[.16em] text-amber-300 mt-2">FIELD COMMAND</div>
          <div className="mt-3 rounded-2xl border border-emerald-400/20 bg-slate-900/75 px-3 py-3 flex justify-between items-end">
            <div><div className="text-[7px] text-slate-500 font-mono">CONDICIÓN OPERATIVA</div><div className="text-[17px] text-emerald-300 font-black mt-1">FAVORABLE</div></div>
            <div className="text-[18px] font-black text-white">{current.temperatureC}° / {current.feelsLikeC}°</div>
          </div>
          <div className="grid grid-cols-[112px_1fr] gap-3 mt-3">
            <div className="flex flex-col items-center"><NativeOrb current={current} size={106} /><span className={`text-[9px] font-black text-center ${tone.text}`}>{exactLabel}</span></div>
            <div className="grid grid-cols-2 gap-2"><MetricCard label="HUMEDAD" value={`${current.humidity}%`} /><MetricCard label="VIENTO" value={`${current.windSpeedKmh} km/h`} tone="text-violet-300" /><MetricCard label="UV" value={`${current.uvIndex}`} tone="text-amber-200" /><MetricCard label="LLUVIA" value={`${rainProbability}%`} tone="text-blue-300" /></div>
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
        <BrandHeader weatherSourceState={weatherSourceState} compact />
        <div className="grid grid-cols-[106px_155px_1fr] gap-3 items-center h-[calc(100%-28px)]">
          <NativeOrb current={current} size={98} />
          <div><div className="text-[34px] font-black leading-none text-white">{current.temperatureC}°</div><div className={`text-[9px] leading-tight font-black mt-2 ${tone.text}`}>{exactLabel}</div><div className="text-[10px] text-slate-300 mt-1 font-bold">{locationName}</div></div>
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
            <p className="text-[10px] font-mono font-black tracking-[.12em] text-cyan-300">VISTA DE PARIDAD NATIVA · CANVAS V3</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">El preview replica la jerarquía y proporciones del renderer Fluid V3 real. El launcher sólo puede variar márgenes externos según fabricante, densidad y cuadrícula.</p>
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
            <span className="block text-[8px] font-mono text-slate-500 mt-0.5">NATIVO V3 · {item.size}</span>
          </button>
        ))}
      </div>

      <div className="py-2">{preview}</div>
      <p className="text-[9px] text-slate-500 text-center font-mono">OC-22P · WIDGET PREVIEW PARITY + BRAND</p>
    </div>
  );
}
