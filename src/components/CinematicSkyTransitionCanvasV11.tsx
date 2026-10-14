import { useEffect, useRef } from 'react';
import type {
  AtmospherePhase,
  AtmosphereQuality,
  AtmosphereScene,
  SolarLightingState,
} from '../services/weatherAtmosphereEngine';
import '../styles/living-weather-cinematic-sky-v9.css';

interface CinematicSkyTransitionCanvasV11Props {
  scene: AtmosphereScene;
  phase: AtmospherePhase;
  quality: AtmosphereQuality;
  solar: SolarLightingState;
  cloudOpacity: number;
  luminance: number;
  active: boolean;
}

type RGB = readonly [number, number, number];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
];
const rgb = (value: RGB, alpha = 1) => `rgba(${value[0]},${value[1]},${value[2]},${alpha})`;

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.177 + salt * 17.331) * 43758.5453123;
  return value - Math.floor(value);
}

function sceneExposure(scene: AtmosphereScene) {
  switch (scene) {
    case 'storm': return 0.48;
    case 'rain': return 0.66;
    case 'snow': return 0.82;
    case 'cloudy': return 0.76;
    case 'cold': return 0.86;
    case 'hot': return 1.08;
    default: return 1;
  }
}

function applyExposure(color: RGB, exposure: number): RGB {
  return [
    Math.max(0, Math.min(255, Math.round(color[0] * exposure))),
    Math.max(0, Math.min(255, Math.round(color[1] * exposure))),
    Math.max(0, Math.min(255, Math.round(color[2] * exposure))),
  ];
}

export default function CinematicSkyTransitionCanvasV11({
  scene,
  phase,
  quality,
  solar,
  cloudOpacity,
  luminance,
  active,
}: CinematicSkyTransitionCanvasV11Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const liveStateRef = useRef({ scene, phase, solar, cloudOpacity, luminance });
  liveStateRef.current = { scene, phase, solar, cloudOpacity, luminance };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const parent = canvas.parentElement;
    if (!parent) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return undefined;

    const android = document.documentElement.classList.contains('capacitor-android')
      || document.documentElement.classList.contains('android-webview');

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let disposed = false;
    let lastPaint = 0;
    const targetFps = quality === 'static' ? 1 : android ? 8 : quality === 'ultra' ? 16 : 12;
    const frameInterval = 1000 / targetFps;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(120, rect.width);
      height = Math.max(160, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, android ? 1.1 : 1.35);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    const stars = Array.from({ length: android ? 34 : 52 }, (_, index) => ({
      x: seeded(index, 7),
      y: 0.04 + seeded(index, 11) * 0.58,
      radius: 0.45 + seeded(index, 13) * 1.2,
      phase: seeded(index, 17) * Math.PI * 2,
      strength: 0.28 + seeded(index, 19) * 0.72,
    }));

    const draw = (now: number) => {
      if (disposed) return;
      if (now - lastPaint < frameInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastPaint = now;

      const current = liveStateRef.current;
      const night = clamp01(current.solar.nightStrength);
      const day = 1 - night;
      const warm = clamp01(current.solar.twilightWarmth);
      const exposure = sceneExposure(current.scene) * (0.74 + current.luminance * 0.34);
      const sunnyDay = current.scene === 'clear' && current.phase === 'day' && day > 0.82;
      const snowScene = current.scene === 'snow';

      const nightTop: RGB = [2, 7, 18];
      const nightMid: RGB = [8, 23, 45];
      const nightBottom: RGB = [5, 10, 22];
      const dayTop: RGB = sunnyDay ? [24, 77, 132] : [22, 72, 124];
      const dayMid: RGB = sunnyDay ? [67, 139, 184] : [53, 128, 178];
      const dayBottom: RGB = sunnyDay ? [148, 177, 185] : [100, 157, 189];
      const snowTop: RGB = [52, 79, 107];
      const snowMid: RGB = [104, 132, 153];
      const snowBottom: RGB = [177, 194, 202];
      const warmTop: RGB = current.phase === 'dawn' ? [62, 72, 122] : [47, 49, 92];
      const warmMid: RGB = current.phase === 'dawn' ? [205, 119, 112] : [196, 83, 91];
      const warmBottom: RGB = current.phase === 'dawn' ? [244, 174, 117] : [244, 129, 79];

      let top = mixRgb(nightTop, snowScene ? snowTop : dayTop, day);
      let mid = mixRgb(nightMid, snowScene ? snowMid : dayMid, day);
      let bottom = mixRgb(nightBottom, snowScene ? snowBottom : dayBottom, day);
      top = mixRgb(top, warmTop, warm * 0.72);
      mid = mixRgb(mid, warmMid, warm * 0.86);
      bottom = mixRgb(bottom, warmBottom, warm);

      if (sunnyDay) {
        const solarContinuity = clamp01(current.solar.sunAltitude) * (1 - warm) * 0.18;
        mid = mixRgb(mid, [115, 157, 181], solarContinuity * 0.38);
        bottom = mixRgb(bottom, [232, 188, 132], solarContinuity);
      }

      top = applyExposure(top, exposure);
      mid = applyExposure(mid, exposure);
      bottom = applyExposure(bottom, exposure * 0.94);

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, rgb(top));
      sky.addColorStop(0.55, rgb(mid));
      sky.addColorStop(1, rgb(bottom));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const sunX = width * current.solar.sunPositionX;
      const sunY = height * current.solar.sunPositionY;
      const horizonY = height * 0.72;

      const horizon = ctx.createRadialGradient(
        sunX,
        horizonY,
        0,
        sunX,
        horizonY,
        Math.max(width, height) * (0.44 + warm * 0.12),
      );
      const horizonAlpha = (0.08 + warm * 0.3 + (sunnyDay ? 0.055 : 0))
        * day
        * (1 - current.cloudOpacity * 0.38);
      horizon.addColorStop(0, warm > 0.28
        ? `rgba(255,184,118,${horizonAlpha})`
        : sunnyDay
          ? `rgba(255,207,139,${horizonAlpha * 0.82})`
          : `rgba(167,220,255,${horizonAlpha * 0.75})`);
      horizon.addColorStop(0.44, warm > 0.28
        ? `rgba(255,130,91,${horizonAlpha * 0.36})`
        : sunnyDay
          ? `rgba(255,176,102,${horizonAlpha * 0.25})`
          : `rgba(100,190,244,${horizonAlpha * 0.24})`);
      horizon.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = horizon;
      ctx.fillRect(0, height * 0.28, width, height * 0.72);

      if (night > 0.16) {
        const seconds = now / 1000;
        for (const star of stars) {
          const twinkle = 0.68 + Math.sin(seconds * 0.58 + star.phase) * 0.24;
          const alpha = night * star.strength * twinkle * (1 - current.cloudOpacity * 0.58);
          if (alpha < 0.02) continue;
          ctx.fillStyle = `rgba(227,240,255,${alpha})`;
          ctx.beginPath();
          ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (night > 0.55) {
        const moonX = width * (0.72 + Math.sin(current.solar.daylightProgress * Math.PI) * 0.07);
        const moonY = height * 0.18;
        const moonVisibility = night * (1 - current.cloudOpacity * 0.66);
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, Math.max(42, width * 0.16));
        moonGlow.addColorStop(0, `rgba(222,236,255,${0.18 * moonVisibility})`);
        moonGlow.addColorStop(0.36, `rgba(170,202,245,${0.08 * moonVisibility})`);
        moonGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = moonGlow;
        ctx.fillRect(0, 0, width, height * 0.52);

        ctx.fillStyle = `rgba(236,244,255,${0.84 * moonVisibility})`;
        ctx.beginPath();
        ctx.arc(moonX, moonY, Math.max(8, width * 0.025), 0, Math.PI * 2);
        ctx.fill();
      } else if (current.solar.sunAltitude > -0.06) {
        const visibility = clamp01((current.solar.sunAltitude + 0.08) * 2.4 + 0.16)
          * (1 - current.cloudOpacity * 0.72);
        const highSun = clamp01((current.solar.sunAltitude - 0.34) / 0.56);
        const sunRadius = Math.max(7, width * lerp(warm > 0.35 ? 0.034 : 0.026, 0.016, highSun));
        const glowRadius = sunRadius * lerp(warm > 0.35 ? 7.5 : 7.2, 10.5, highSun);
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowRadius);
        const coreGlowAlpha = lerp(0.48, sunnyDay ? 0.32 : 0.24, highSun) * visibility;
        glow.addColorStop(0, `rgba(255,245,215,${coreGlowAlpha})`);
        glow.addColorStop(0.28, warm > 0.3
          ? `rgba(255,179,110,${0.24 * visibility})`
          : sunnyDay
            ? `rgba(255,210,128,${lerp(0.2, 0.14, highSun) * visibility})`
            : `rgba(220,242,255,${lerp(0.17, 0.11, highSun) * visibility})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(sunX - glowRadius, sunY - glowRadius, glowRadius * 2, glowRadius * 2);

        const discAlpha = warm > 0.3
          ? 0.9 * visibility
          : lerp(0.56, sunnyDay ? 0.14 : 0.08, highSun) * visibility;
        if (discAlpha > 0.025) {
          ctx.fillStyle = warm > 0.3 || sunnyDay
            ? `rgba(255,229,181,${discAlpha})`
            : `rgba(255,248,220,${discAlpha})`;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const atmosphericVeil = ctx.createLinearGradient(0, 0, 0, height);
      atmosphericVeil.addColorStop(0, `rgba(2,7,15,${Math.max(0, current.cloudOpacity - 0.62) * 0.09})`);
      atmosphericVeil.addColorStop(1, `rgba(2,6,14,${0.08 + Math.max(0, 0.62 - current.luminance) * 0.18})`);
      ctx.fillStyle = atmosphericVeil;
      ctx.fillRect(0, 0, width, height);

      if (active && quality !== 'static' && document.visibilityState !== 'hidden') {
        raf = requestAnimationFrame(draw);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active && !disposed && quality !== 'static') {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    draw(performance.now());

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [quality, active]);

  return <canvas ref={canvasRef} className="lwa-cinematic-sky-canvas" aria-hidden="true" />;
}
