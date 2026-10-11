import { useEffect, useMemo, useRef } from 'react';
import type { CurrentWeather, DailyForecast } from '../types/weatherTypes';
import LivingWeatherAtmosphere from './LivingWeatherAtmosphere';
import SnowFrostCanvas from './SnowFrostCanvas';
import {
  AtmospherePhase,
  buildWeatherAtmosphereModel,
  resolveAtmosphereQuality,
} from '../services/weatherAtmosphereEngine';
import '../styles/immersive-weather-foreground.css';

interface AtmosphereLabPreviewSceneProps {
  currentWeather: CurrentWeather;
  dailyForecast?: DailyForecast;
  timezone?: string;
  phaseOverride?: AtmospherePhase;
}

interface PreviewRainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  depth: number;
  phase: number;
}

interface PreviewGlassDrop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.177 + salt * 17.331) * 43758.5453123;
  return value - Math.floor(value);
}

function PreviewPrecipitationCanvas({
  scene,
  precipitationStrength,
  windStrength,
}: {
  scene: string;
  precipitationStrength: number;
  windStrength: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const wet = scene === 'rain' || scene === 'storm' || (scene !== 'snow' && precipitationStrength > 0.12);
    if (!wet) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return undefined;
    }

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let disposed = false;
    let last = performance.now();
    let lastPaint = 0;

    const rain: PreviewRainDrop[] = Array.from({ length: scene === 'storm' ? 54 : 38 }, (_, index) => ({
      x: seeded(index, 3),
      y: seeded(index, 5),
      speed: 0.32 + seeded(index, 7) * 0.8,
      length: 13 + seeded(index, 11) * 34,
      depth: 0.2 + seeded(index, 13) * 0.8,
      phase: seeded(index, 17) * Math.PI * 2,
    }));

    const glass: PreviewGlassDrop[] = Array.from({ length: scene === 'storm' ? 18 : 13 }, (_, index) => ({
      x: 0.06 + seeded(index, 19) * 0.88,
      y: 0.05 + seeded(index, 23) * 0.8,
      radius: 1.7 + seeded(index, 29) * 3.7,
      speed: 0.004 + seeded(index, 31) * 0.018,
      phase: seeded(index, 37) * Math.PI * 2,
    }));

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(120, rect.width);
      height = Math.max(120, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);
    resize();

    const strength = clamp01(precipitationStrength);
    const stormBoost = scene === 'storm' ? 1.3 : 1;

    const draw = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(draw);
      if (now - lastPaint < 1000 / 24) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      lastPaint = now;
      ctx.clearRect(0, 0, width, height);

      const seconds = now / 1000;
      const gust = clamp01(0.52 + Math.sin(seconds * 0.54) * 0.18 + Math.sin(seconds * 1.12 + 1.4) * 0.11);
      const angle = (4 + (windStrength * 0.7 + gust * 0.35) * 22) * Math.PI / 180;
      const dx = Math.sin(angle);
      const dy = Math.cos(angle);

      ctx.lineCap = 'round';
      for (const drop of rain) {
        const travel = (190 + drop.depth * 420) * dt * (0.72 + strength * 0.8) * stormBoost;
        drop.x += (dx * travel / Math.max(1, width)) * (0.36 + drop.depth * 0.45);
        drop.y += dy * travel / Math.max(1, height);
        if (drop.y > 1.18 || drop.x > 1.18 || drop.x < -0.18) {
          drop.y = -0.18 - seeded(Math.round(drop.phase * 100), 41) * 0.22;
          drop.x = -0.08 + seeded(Math.round(drop.speed * 1000 + seconds), 43) * 1.16;
        }
        const x = drop.x * width;
        const y = drop.y * height;
        const length = drop.length * (0.75 + drop.depth * 0.42);
        const alpha = (0.08 + drop.depth * 0.24) * (0.45 + strength * 0.7);
        const gradient = ctx.createLinearGradient(x - dx * length, y - dy * length, x, y);
        gradient.addColorStop(0, 'rgba(215,236,248,0)');
        gradient.addColorStop(1, `rgba(246,252,255,${alpha})`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.45 + drop.depth * 1.05;
        ctx.beginPath();
        ctx.moveTo(x - dx * length, y - dy * length);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      for (const bead of glass) {
        if (bead.radius > 3.3 && strength > 0.4) {
          bead.y += bead.speed * dt * (0.4 + strength);
          if (bead.y > 0.94) bead.y = 0.05;
        }
        const x = bead.x * width;
        const y = bead.y * height;
        const r = bead.radius * (0.92 + Math.sin(seconds * 0.45 + bead.phase) * 0.05);
        const beadGradient = ctx.createRadialGradient(x - r * 0.3, y - r * 0.36, r * 0.12, x, y, r * 1.12);
        beadGradient.addColorStop(0, 'rgba(255,255,255,0.38)');
        beadGradient.addColorStop(0.38, 'rgba(220,240,249,0.18)');
        beadGradient.addColorStop(1, 'rgba(75,112,132,0)');
        ctx.fillStyle = beadGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.82, r, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      if (scene === 'storm') {
        const cycle = 5.9;
        const local = seconds % cycle;
        const flash = Math.max(0, 1 - Math.abs(local - 2.35) / 0.08, (1 - Math.abs(local - 2.55) / 0.055) * 0.56);
        if (flash > 0.01) {
          ctx.fillStyle = `rgba(219,234,254,${0.16 * flash})`;
          ctx.fillRect(0, 0, width, height);
        }
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [scene, precipitationStrength, windStrength]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[6] pointer-events-none" aria-hidden="true" />;
}

export default function AtmosphereLabPreviewScene({
  currentWeather,
  dailyForecast,
  timezone,
  phaseOverride,
}: AtmosphereLabPreviewSceneProps) {
  const model = useMemo(() => buildWeatherAtmosphereModel({
    current: currentWeather,
    daily: dailyForecast,
    timezone,
    quality: resolveAtmosphereQuality(),
    phaseOverride,
  }), [currentWeather, dailyForecast, timezone, phaseOverride]);

  const snowScene = model.scene === 'snow';

  return (
    <div className="absolute inset-0 overflow-hidden" data-preview-scene={model.scene} data-preview-phase={model.phase}>
      <LivingWeatherAtmosphere
        currentWeather={currentWeather}
        dailyForecast={dailyForecast}
        timezone={timezone}
        phaseOverride={phaseOverride}
      />
      {snowScene ? (
        <SnowFrostCanvas
          quality={model.quality}
          snowStrength={model.precipitationStrength}
          frostStrength={model.frostStrength}
          windStrength={model.windStrength}
          active
        />
      ) : (
        <PreviewPrecipitationCanvas
          scene={model.scene}
          precipitationStrength={model.precipitationStrength}
          windStrength={model.windStrength}
        />
      )}
      {(model.scene === 'rain' || model.scene === 'storm') && (
        <div className="absolute inset-0 z-[7] pointer-events-none bg-[linear-gradient(112deg,transparent_0%,rgba(230,245,252,0.025)_45%,transparent_72%)]" />
      )}
    </div>
  );
}
