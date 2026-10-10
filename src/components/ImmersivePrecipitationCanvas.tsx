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
  phase: number;
}

interface GlassDrop {
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
  velocityY: number;
  alpha: number;
  trail: number;
  phase: number;
  slideThreshold: number;
  generation: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.177 + salt * 17.331) * 43758.5453123;
  return value - Math.floor(value);
}

function makeRain(count: number, width: number, height: number): RainParticle[] {
  return Array.from({ length: count }, (_, index) => {
    const depth = 0.12 + seeded(index, 2) * 0.88;
    return {
      x: seeded(index, 3) * width,
      y: seeded(index, 5) * height,
      speed: 240 + depth * 960 + seeded(index, 7) * 210,
      length: 9 + depth * 68 + seeded(index, 11) * 22,
      width: 0.35 + depth * 1.95,
      alpha: 0.045 + depth * 0.29,
      depth,
      phase: seeded(index, 47) * Math.PI * 2,
    };
  });
}

function makeGlassDrops(count: number, width: number, height: number): GlassDrop[] {
  return Array.from({ length: count }, (_, index) => {
    const baseRadius = 1.6 + seeded(index, 19) * 5.6;
    return {
      x: width * (0.035 + seeded(index, 13) * 0.93),
      y: height * (0.035 + seeded(index, 17) * 0.82),
      radius: baseRadius,
      baseRadius,
      velocityY: 0,
      alpha: 0.1 + seeded(index, 29) * 0.24,
      trail: 5 + seeded(index, 31) * 28,
      phase: seeded(index, 37) * Math.PI * 2,
      slideThreshold: 3.7 + seeded(index, 41) * 3.8,
      generation: 0,
    };
  });
}

function resetGlassDrop(drop: GlassDrop, width: number, height: number, index: number) {
  drop.generation += 1;
  const salt = 53 + drop.generation * 7;
  drop.x = width * (0.04 + seeded(index + drop.generation * 13, salt) * 0.92);
  drop.y = height * (0.025 + seeded(index + drop.generation * 17, salt + 2) * 0.18);
  drop.baseRadius = 1.5 + seeded(index + drop.generation * 19, salt + 4) * 5.4;
  drop.radius = drop.baseRadius;
  drop.velocityY = 0;
  drop.alpha = 0.1 + seeded(index + drop.generation * 23, salt + 6) * 0.22;
  drop.trail = 6 + seeded(index + drop.generation * 29, salt + 8) * 34;
  drop.slideThreshold = 3.8 + seeded(index + drop.generation * 31, salt + 10) * 3.6;
}

function drawGlassDrop(ctx: CanvasRenderingContext2D, drop: GlassDrop, nowSeconds: number, strength: number) {
  const pulse = 0.9 + Math.sin(nowSeconds * 0.48 + drop.phase) * 0.055;
  const radius = drop.radius * pulse;

  if (drop.trail > 5 && drop.velocityY > 1.4) {
    const trailLength = drop.trail * Math.min(1.8, 0.65 + drop.velocityY / 30);
    const trailGradient = ctx.createLinearGradient(drop.x, drop.y - trailLength, drop.x, drop.y + radius * 1.25);
    trailGradient.addColorStop(0, 'rgba(204, 229, 242, 0)');
    trailGradient.addColorStop(0.58, `rgba(209, 231, 243, ${drop.alpha * 0.2})`);
    trailGradient.addColorStop(1, `rgba(242, 250, 254, ${drop.alpha * 0.46})`);
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = Math.max(0.6, radius * 0.24);
    ctx.beginPath();
    ctx.moveTo(drop.x, drop.y - trailLength);
    ctx.quadraticCurveTo(drop.x - radius * 0.22, drop.y - trailLength * 0.45, drop.x, drop.y - radius * 0.35);
    ctx.stroke();
  }

  const bead = ctx.createRadialGradient(
    drop.x - radius * 0.31,
    drop.y - radius * 0.38,
    radius * 0.12,
    drop.x,
    drop.y,
    radius * 1.08,
  );
  bead.addColorStop(0, `rgba(255,255,255,${drop.alpha * 0.88})`);
  bead.addColorStop(0.28, `rgba(224,241,250,${drop.alpha * 0.42})`);
  bead.addColorStop(0.66, `rgba(126,166,188,${drop.alpha * 0.2})`);
  bead.addColorStop(1, 'rgba(58,94,116,0)');
  ctx.fillStyle = bead;
  ctx.beginPath();
  ctx.ellipse(drop.x, drop.y, radius * (0.8 + strength * 0.04), radius, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = `rgba(248,253,255,${drop.alpha * 0.48})`;
  ctx.lineWidth = Math.max(0.45, radius * 0.1);
  ctx.beginPath();
  ctx.arc(drop.x - radius * 0.18, drop.y - radius * 0.22, radius * 0.43, Math.PI * 1.08, Math.PI * 1.63);
  ctx.stroke();
}

function lightningFlash(seconds: number) {
  const cycle = 8.8;
  const index = Math.floor(seconds / cycle);
  const local = seconds - index * cycle;
  const start = 2.1 + seeded(index, 89) * 3.7;
  const main = Math.max(0, 1 - Math.abs(local - start) / 0.075);
  const echo = Math.max(0, 1 - Math.abs(local - (start + 0.19)) / 0.055) * 0.62;
  return Math.max(main, echo);
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
    const stormBoost = scene === 'storm' ? 1.28 : 1;

    const dpr = Math.min(window.devicePixelRatio || 1, android ? 1.35 : 1.7);
    const cssWidth = Math.max(320, window.innerWidth);
    const cssHeight = Math.max(520, window.innerHeight);
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const qualityFactor = quality === 'ultra' ? 1 : quality === 'high' ? 0.88 : quality === 'balanced' ? 0.72 : 0.52;
    const rainCount = Math.round((52 + strength * 74) * qualityFactor * stormBoost);
    const glassCount = quality === 'low' || quality === 'static'
      ? Math.round(8 + strength * 5)
      : Math.round((16 + strength * 17) * qualityFactor);

    const rain = makeRain(rainCount, cssWidth, cssHeight);
    const glass = makeGlassDrops(glassCount, cssWidth, cssHeight);

    let disposed = false;
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    let mergeTick = 0;
    const targetFps = quality === 'static' ? 1 : android ? 24 : quality === 'ultra' ? 36 : 30;
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
      mergeTick += 1;

      ctx.clearRect(0, 0, cssWidth, cssHeight);
      const seconds = now / 1000;
      const gust = clamp01(0.56 + Math.sin(seconds * 0.37) * 0.18 + Math.sin(seconds * 0.93 + 1.7) * 0.14 + windStrength * 0.28);
      const dynamicWind = clamp01(windStrength * 0.7 + gust * 0.42);
      const windAngle = (3 + dynamicWind * 21) * Math.PI / 180;
      const xDrift = Math.sin(windAngle);
      const yDrift = Math.cos(windAngle);

      if (active && quality !== 'static') {
        ctx.lineCap = 'round';
        for (const drop of rain) {
          const localGust = 0.88 + gust * 0.34 + Math.sin(seconds * 0.7 + drop.phase) * 0.07;
          const fall = drop.speed * dt * (0.68 + strength * 0.7) * stormBoost * localGust;
          drop.x += xDrift * fall * (0.22 + drop.depth * 0.5);
          drop.y += yDrift * fall;

          if (drop.y - drop.length > cssHeight + 24 || drop.x > cssWidth + 150 || drop.x < -150) {
            drop.y = -drop.length - seeded(Math.round(drop.x + drop.length), 41) * 220;
            drop.x = -100 + seeded(Math.round(drop.speed + drop.length + seconds), 43) * (cssWidth + 200);
          }

          const alpha = drop.alpha * (0.38 + strength * 0.78) * (scene === 'storm' ? 1.15 : 1);
          const gradient = ctx.createLinearGradient(
            drop.x - xDrift * drop.length,
            drop.y - yDrift * drop.length,
            drop.x,
            drop.y,
          );
          gradient.addColorStop(0, 'rgba(205,228,241,0)');
          gradient.addColorStop(0.44, `rgba(213,234,246,${alpha * 0.48})`);
          gradient.addColorStop(1, `rgba(248,253,255,${alpha})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = drop.width * (0.9 + gust * 0.18);
          ctx.beginPath();
          ctx.moveTo(drop.x - xDrift * drop.length, drop.y - yDrift * drop.length);
          ctx.lineTo(drop.x, drop.y);
          ctx.stroke();
        }

        glass.forEach((drop, index) => {
          drop.radius = Math.min(drop.baseRadius * 1.68, drop.radius + dt * (0.08 + strength * 0.28));
          if (drop.radius >= drop.slideThreshold && strength > 0.34) {
            drop.velocityY = Math.min(42, drop.velocityY + dt * (3.5 + strength * 13));
            drop.y += drop.velocityY * dt;
            drop.x += Math.sin(seconds * 0.32 + drop.phase) * dt * (0.22 + windStrength * 0.45);
          }
          if (drop.y > cssHeight * 0.97) resetGlassDrop(drop, cssWidth, cssHeight, index);
          drawGlassDrop(ctx, drop, seconds, strength);
        });

        if (mergeTick % 12 === 0 && glass.length <= 40) {
          for (let i = 0; i < glass.length; i += 1) {
            for (let j = i + 1; j < glass.length; j += 1) {
              const a = glass[i];
              const b = glass[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const threshold = (a.radius + b.radius) * 0.48;
              if (dx * dx + dy * dy < threshold * threshold) {
                if (a.radius >= b.radius) {
                  a.radius = Math.min(a.baseRadius * 1.85, Math.sqrt(a.radius * a.radius + b.radius * b.radius));
                  a.velocityY = Math.max(a.velocityY, b.velocityY);
                  resetGlassDrop(b, cssWidth, cssHeight, j);
                } else {
                  b.radius = Math.min(b.baseRadius * 1.85, Math.sqrt(a.radius * a.radius + b.radius * b.radius));
                  b.velocityY = Math.max(a.velocityY, b.velocityY);
                  resetGlassDrop(a, cssWidth, cssHeight, i);
                }
              }
            }
          }
        }
      } else if (active) {
        for (const drop of glass) drawGlassDrop(ctx, drop, seconds, strength);
      }

      if (active && scene === 'storm') {
        const flash = lightningFlash(seconds);
        if (flash > 0.01) {
          const flashGradient = ctx.createLinearGradient(0, 0, cssWidth, cssHeight);
          flashGradient.addColorStop(0, `rgba(226,239,255,${0.16 * flash})`);
          flashGradient.addColorStop(0.52, `rgba(202,224,255,${0.1 * flash})`);
          flashGradient.addColorStop(1, `rgba(154,188,235,${0.05 * flash})`);
          ctx.fillStyle = flashGradient;
          ctx.fillRect(0, 0, cssWidth, cssHeight);
        }
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
