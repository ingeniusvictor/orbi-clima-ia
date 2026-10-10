import { useEffect, useRef } from 'react';
import type { AtmosphereQuality, AtmosphereScene } from '../services/weatherAtmosphereEngine';

interface ImmersivePrecipitationCanvasProps {
  scene: AtmosphereScene;
  quality: AtmosphereQuality;
  precipitationStrength: number;
  windStrength: number;
  active: boolean;
}

interface RainParticle {
  x: number;
  y: number;
  speed: number;
  length: number;
  width: number;
  alpha: number;
  depth: number;
}

interface GlassDrop {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  trail: number;
  phase: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.177 + salt * 17.331) * 43758.5453123;
  return value - Math.floor(value);
}

function makeRain(count: number, width: number, height: number): RainParticle[] {
  return Array.from({ length: count }, (_, index) => {
    const depth = 0.18 + seeded(index, 2) * 0.82;
    return {
      x: seeded(index, 3) * width,
      y: seeded(index, 5) * height,
      speed: 280 + depth * 790 + seeded(index, 7) * 180,
      length: 12 + depth * 54 + seeded(index, 11) * 18,
      width: 0.45 + depth * 1.6,
      alpha: 0.07 + depth * 0.26,
      depth,
    };
  });
}

function makeGlassDrops(count: number, width: number, height: number): GlassDrop[] {
  return Array.from({ length: count }, (_, index) => ({
    x: width * (0.04 + seeded(index, 13) * 0.92),
    y: height * (0.05 + seeded(index, 17) * 0.83),
    radius: 1.8 + seeded(index, 19) * 5.7,
    speed: 2 + seeded(index, 23) * 9,
    alpha: 0.11 + seeded(index, 29) * 0.2,
    trail: 3 + seeded(index, 31) * 18,
    phase: seeded(index, 37) * Math.PI * 2,
  }));
}

function drawGlassDrop(ctx: CanvasRenderingContext2D, drop: GlassDrop, nowSeconds: number) {
  const pulse = 0.86 + Math.sin(nowSeconds * 0.65 + drop.phase) * 0.08;
  const radius = drop.radius * pulse;

  if (drop.trail > 5) {
    const trailGradient = ctx.createLinearGradient(drop.x, drop.y - drop.trail, drop.x, drop.y + radius * 1.2);
    trailGradient.addColorStop(0, 'rgba(214, 236, 247, 0)');
    trailGradient.addColorStop(0.45, `rgba(209, 231, 243, ${drop.alpha * 0.18})`);
    trailGradient.addColorStop(1, `rgba(235, 247, 252, ${drop.alpha * 0.34})`);
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = Math.max(0.55, radius * 0.22);
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y - drop.trail);
    ctx.lineTo(drop.x, drop.y - radius * 0.4);
    ctx.stroke();
  }

  const bead = ctx.createRadialGradient(
    drop.x - radius * 0.3,
    drop.y - radius * 0.38,
    radius * 0.15,
    drop.x,
    drop.y,
    radius,
  );
  bead.addColorStop(0, `rgba(255,255,255,${drop.alpha * 0.76})`);
  bead.addColorStop(0.33, `rgba(221,239,248,${drop.alpha * 0.36})`);
  bead.addColorStop(0.72, `rgba(122,163,185,${drop.alpha * 0.17})`);
  bead.addColorStop(1, 'rgba(70,105,125,0)');
  ctx.fillStyle = bead;
  ctx.beginPath();
  ctx.ellipse(drop.x, drop.y, radius * 0.82, radius, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(244,251,255,${drop.alpha * 0.42})`;
  ctx.lineWidth = Math.max(0.45, radius * 0.1);
  ctx.beginPath();
  ctx.arc(drop.x - radius * 0.18, drop.y - radius * 0.2, radius * 0.42, Math.PI * 1.08, Math.PI * 1.62);
  ctx.stroke();
}

export default function ImmersivePrecipitationCanvas({
  scene,
  quality,
  precipitationStrength,
  windStrength,
  active,
}: ImmersivePrecipitationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const android = document.documentElement.classList.contains('capacitor-android')
      || document.documentElement.classList.contains('android-webview');
    const strength = clamp01(precipitationStrength);
    const stormBoost = scene === 'storm' ? 1.22 : 1;

    const dpr = Math.min(window.devicePixelRatio || 1, android ? 1.35 : 1.7);
    const cssWidth = Math.max(320, window.innerWidth);
    const cssHeight = Math.max(520, window.innerHeight);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const qualityFactor = quality === 'ultra' ? 1 : quality === 'high' ? 0.88 : quality === 'balanced' ? 0.72 : 0.52;
    const rainCount = Math.round((42 + strength * 56) * qualityFactor * stormBoost);
    const glassCount = quality === 'low' || quality === 'static'
      ? Math.round(7 + strength * 5)
      : Math.round((13 + strength * 15) * qualityFactor);

    const rain = makeRain(rainCount, cssWidth, cssHeight);
    const glass = makeGlassDrops(glassCount, cssWidth, cssHeight);
    const windAngle = (5 + windStrength * 17) * Math.PI / 180;
    const xDrift = Math.sin(windAngle);
    const yDrift = Math.cos(windAngle);

    let disposed = false;
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    const targetFps = quality === 'static' ? 1 : android ? 24 : quality === 'ultra' ? 34 : 28;
    const interval = 1000 / targetFps;

    const frame = (now: number) => {
      if (disposed) return;
      if (now - lastPaint < interval) {
        raf = requestAnimationFrame(frame);
        return;
      }
      const dt = Math.min(0.045, (now - last) / 1000 || 0.016);
      last = now;
      lastPaint = now;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      const seconds = now / 1000;

      if (active && quality !== 'static') {
        ctx.lineCap = 'round';
        for (const drop of rain) {
          const fall = drop.speed * dt * (0.72 + strength * 0.62) * stormBoost;
          drop.x += xDrift * fall * (0.28 + drop.depth * 0.42);
          drop.y += yDrift * fall;

          if (drop.y - drop.length > cssHeight + 20 || drop.x > cssWidth + 120) {
            drop.y = -drop.length - seeded(Math.round(drop.x + drop.length), 41) * 180;
            drop.x = -80 + seeded(Math.round(drop.speed + drop.length), 43) * (cssWidth + 80);
          }

          const alpha = drop.alpha * (0.42 + strength * 0.7) * (scene === 'storm' ? 1.12 : 1);
          const gradient = ctx.createLinearGradient(
            drop.x - xDrift * drop.length,
            drop.y - yDrift * drop.length,
            drop.x,
            drop.y,
          );
          gradient.addColorStop(0, 'rgba(219,237,247,0)');
          gradient.addColorStop(0.48, `rgba(219,237,247,${alpha * 0.52})`);
          gradient.addColorStop(1, `rgba(246,252,255,${alpha})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = drop.width;
          ctx.beginPath();
          ctx.moveTo(drop.x - xDrift * drop.length, drop.y - yDrift * drop.length);
          ctx.lineTo(drop.x, drop.y);
          ctx.stroke();
        }

        for (const drop of glass) {
          if (drop.radius > 4.1 && strength > 0.48) {
            drop.y += drop.speed * dt * strength;
            if (drop.y > cssHeight * 0.92) drop.y = cssHeight * 0.06;
          }
          drawGlassDrop(ctx, drop, seconds);
        }
      } else if (active) {
        for (const drop of glass) drawGlassDrop(ctx, drop, seconds);
      }

      if (active && document.visibilityState !== 'hidden') raf = requestAnimationFrame(frame);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active && !disposed) {
        last = performance.now();
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    frame(performance.now());

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [scene, quality, precipitationStrength, windStrength, active]);

  return <canvas ref={canvasRef} className="orbi-immersive-precipitation-canvas" aria-hidden="true" />;
}
