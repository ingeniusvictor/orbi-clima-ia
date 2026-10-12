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

function sourceLabel(weatherSourceState?: any) {
  if (weatherSourceState?.provider === 'mock') return 'DEMO';
  if (weatherSourceState?.mode === 'cached') return 'CACHE';
  if (weatherSourceState?.mode === 'fallback') return 'SEGURO';
  return 'LIVE';
}

function SourceBadge({ weatherSourceState }: { weatherSourceState?: any }) {
  const label = sourceLabel(weatherSourceState);
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

function OrbitalBrandHeader({ weatherSourceState }: { weatherSourceState?: any }) {
  const now = new Date();
  const date = now.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: 'short' }).replaceAll('.', '').toUpperCase();
  const time = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="absolute left-4 right-4 top-3.5 z-30 flex items-start justify-between pointer-events-none">
      <div className="flex items-center gap-2">
        <img src="/orbi-clima-app-icon.jpg" alt="" aria-hidden="true" className="w-8 h-8 rounded-[9px] object-cover border border-cyan-300/30 shadow-[0_0_14px_rgba(34,211,238,.20)]" />
        <div className="leading-tight">
          <div><span className="text-[11px] font-black text-white">ORBI</span> <span className="text-[11px] font-black text-cyan-300">CLIMA IA</span></div>
          <div className="text-[7px] tracking-[.18em] font-mono text-cyan-300/70">SKYCORE ORBITAL</div>
        </div>
      </div>
      <div className="text-right leading-tight">
        <div className="text-[7px] font-bold text-slate-400 tracking-wide">{date}</div>
        <div className="text-[19px] font-light text-white mt-0.5">{time}</div>
        <div className="text-[7px] text-cyan-300 mt-0.5">↻ {sourceLabel(weatherSourceState)}</div>
      </div>
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

function MetricBubble({ label, value, tone, sub }: { label: string; value: string; tone: 'blue' | 'cyan' | 'violet' | 'amber'; sub?: string }) {
  const style = {
    blue: 'border-blue-400/50 text-blue-300 shadow-[0_0_20px_rgba(59,130,246,.14)]',
    cyan: 'border-cyan-300/50 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,.14)]',
    violet: 'border-violet-400/50 text-violet-300 shadow-[0_0_20px_rgba(139,92,246,.14)]',
    amber: 'border-amber-300/50 text-amber-200 shadow-[0_0_20px_rgba(251,191,36,.14)]',
  }[tone];
  return (
    <div className={`w-[66px] h-[66px] rounded-full border bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,.08),rgba(7,16,31,.90)_58%,rgba(2,6,17,.96))] flex flex-col items-center justify-center ${style}`}>
      <span className="text-[6px] leading-none font-mono font-black tracking-[.04em]">{label}</span>
      <span className="text-[17px] leading-none font-black text-white mt-1">{value}</span>
      {sub && <span className="text-[6px] leading-none text-slate-400 mt-1">{sub}</span>}
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

function readDailyPreview(hourly: HourlyForecast[], current: CurrentWeather) {
  try {
    const raw = localStorage.getItem('orbi_clima_last_weather_bundle_v1');
    const daily = raw ? JSON.parse(raw)?.data?.daily : null;
    if (Array.isArray(daily) && daily.length >= 3) return daily.slice(0, 3);
  } catch {
    // Fall through to deterministic hourly fallback.
  }
  return hourly.slice(0, 3).map((h, index) => ({
    date: '',
    minTempC: h.temperatureC,
    maxTempC: h.temperatureC,
    condition: h.condition,
    conditionLabel: h.conditionLabel,
    fallbackLabel: index === 0 ? 'HOY' : `+${index + 1}H`,
  })).concat([]).slice(0, 3).map((item, index) => ({
    ...item,
    condition: item.condition || current.condition,
    conditionLabel: item.conditionLabel || current.conditionLabel,
    fallbackLabel: item.fallbackLabel || (index === 0 ? 'HOY' : `+${index + 1}H`),
  }));
}

function dayLabel(item: any, index: number) {
  if (index === 0) return 'HOY';
  if (!item?.date) return item?.fallbackLabel || `+${index + 1}H`;
  try {
    return new Date(`${item.date}T12:00:00`)
      .toLocaleDateString('es-CL', { weekday: 'short' })
      .replaceAll('.', '')
      .slice(0, 3)
      .toUpperCase();
  } catch {
    return item?.fallbackLabel || `+${index + 1}H`;
  }
}

function ForecastBubble({ item, index }: { item: any; index: number }) {
  const condition = (item?.condition || 'cloudy') as WeatherCondition;
  const max = Math.round(item?.maxTempC ?? item?.temperatureC ?? 0);
  const min = Math.round(item?.minTempC ?? item?.temperatureC ?? 0);
  return (
    <div className="w-[68px] h-[68px] rounded-full border border-cyan-300/35 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,.10),rgba(11,27,52,.88)_46%,rgba(2,6,17,.98)_100%)] shadow-[0_0_22px_rgba(34,211,238,.13)] flex flex-col items-center justify-center">
      <div className="text-[7px] font-black text-white leading-none">{dayLabel(item, index)}</div>
      <ConditionIcon condition={condition} className="w-5 h-5 text-white/90 mt-1" />
      <div className="text-[7px] font-black leading-none mt-1"><span className="text-cyan-300">{max}°</span><span className="text-slate-500"> / </span><span className="text-amber-300">{min}°</span></div>
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
  const dailyPreview = useMemo(() => readDailyPreview(hourly, current), [hourly, current]);
  const rainProbability = next[0]?.precipitationProbability ?? 0;
  const exactLabel = exactConditionLabel(current);

  const commandPreview = (
    <Frame className="w-full max-w-[420px] aspect-square rounded-[32px] mx-auto">
      <OrbitalBrandHeader weatherSourceState={weatherSourceState} />

      <div className="absolute left-1/2 top-[49%] w-[75%] h-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/15" />
      <div className="absolute left-1/2 top-[49%] w-[68%] h-[68%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/15" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const angle = (Math.PI * 2 * i) / 8 - Math.PI / 2;
        const x = 50 + Math.cos(angle) * 35;
        const y = 49 + Math.sin(angle) * 35;
        return <span key={i} className="absolute w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.9)]" style={{ left: `${x}%`, top: `${y}%` }} />;
      })}

      <div className="absolute left-[15%] top-[18%]"><ForecastBubble item={dailyPreview[1] || dailyPreview[0]} index={1} /></div>
      <div className="absolute left-1/2 top-[11%] -translate-x-1/2"><ForecastBubble item={dailyPreview[0]} index={0} /></div>
      <div className="absolute right-[15%] top-[18%]"><ForecastBubble item={dailyPreview[2] || dailyPreview[0]} index={2} /></div>

      <div
        className="absolute left-1/2 top-[49%] w-[190px] h-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/55 flex flex-col items-center justify-center shadow-[0_0_44px_rgba(34,211,238,.20),inset_0_0_36px_rgba(255,255,255,.06)]"
        style={{ background: `radial-gradient(circle at 34% 25%, rgba(255,255,255,.18), ${tone.a}55 23%, ${tone.b}d9 60%, #030817 100%)` }}
      >
        <div className="absolute inset-[5%] rounded-full border border-violet-300/18" />
        <ConditionIcon condition={current.condition} className="w-10 h-10 text-white/90 relative z-10 -mt-1" />
        <div className="text-[50px] leading-none font-light text-white relative z-10 mt-1">{current.temperatureC}°</div>
        <div className="max-w-[150px] text-center text-[10px] leading-tight font-semibold text-white relative z-10 mt-1.5">{exactLabel}</div>
        <div className="text-[9px] text-cyan-300 font-bold relative z-10 mt-1">{locationName}</div>
        <div className="text-[7px] text-slate-400 relative z-10 mt-0.5">Sensación {current.feelsLikeC}°</div>
        <div className="text-[7px] text-amber-300 relative z-10 mt-0.5">UV {current.uvIndex}</div>
      </div>

      <div className="absolute left-[17%] top-[69%]"><MetricBubble label="LLUVIA" value={`${rainProbability}%`} sub="Probabilidad" tone="blue" /></div>
      <div className="absolute left-1/2 top-[72%] -translate-x-1/2"><MetricBubble label="VIENTO" value={`${current.windSpeedKmh}`} sub="km/h" tone="violet" /></div>
      <div className="absolute right-[17%] top-[69%]"><MetricBubble label="HUMEDAD" value={`${current.humidity}%`} sub={current.humidity >= 70 ? 'Alta' : 'Normal'} tone="cyan" /></div>

      <div className="absolute left-[9%] right-[9%] bottom-[4.5%] h-[42px] rounded-full border border-cyan-300/20 bg-slate-950/78 px-3 flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,.06)]">
        <span className="w-5 h-5 rounded-full flex items-center justify-center bg-cyan-400/10 text-cyan-300 text-[12px] shrink-0">✦</span>
        <span className="text-[8px] font-black text-cyan-300 shrink-0">ORBI IA</span>
        <span className="text-[8px] text-slate-200 font-medium truncate flex-1">{shortNarrative || 'Condición meteorológica actual sincronizada.'}</span>
        <span className="text-cyan-300 text-[13px]">›</span>
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
            <p className="text-[10px] font-mono font-black tracking-[.12em] text-cyan-300">SKYORB COMMANDER · ORBITAL V4</p>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Commander 4×4 replica la arquitectura orbital nativa V4: núcleo dominante, pronóstico superior, métricas inferiores y rail ORBI IA. Los demás formatos permanecen en Fluid V3.</p>
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
            <span className="block text-[8px] font-mono text-slate-500 mt-0.5">{item.id === 'command' ? 'ORBITAL V4' : 'NATIVO V3'} · {item.size}</span>
          </button>
        ))}
      </div>

      <div className="py-2">{preview}</div>
      <p className="text-[9px] text-slate-500 text-center font-mono">OC-22Q · SKYORB COMMANDER ORBITAL V4</p>
    </div>
  );
}