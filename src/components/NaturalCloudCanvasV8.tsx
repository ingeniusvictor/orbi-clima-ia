import { useEffect, useRef } from 'react';
import type { AtmosphereQuality, AtmosphereScene } from '../services/weatherAtmosphereEngine';

interface NaturalCloudCanvasProps {
  scene: AtmosphereScene;
  quality: AtmosphereQuality;
  cloudOpacity: number;
  cloudSpeedSeconds: number;
  windStrength: number;
  active: boolean;
}

type RGB = readonly [number, number, number];

type SceneProfile = {
  seedBase: number;
  thresholdBias: number;
  warp: number;
  ridgeWeight: number;
  broadWeight: number;
  mediumWeight: number;
  erosionWeight: number;
  verticalScale: number;
  towerWeight: number;
  lowerDarkening: number;
  layerY: readonly [number, number, number];
  layerHeight: readonly [number, number, number];
  layerWidth: readonly [number, number, number];
  layerOpacity: readonly [number, number, number];
  travel: readonly [number, number, number];
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const SCENE_PROFILES: Record<AtmosphereScene, SceneProfile> = {
  setup: {
    seedBase: 37, thresholdBias: 0.05, warp: 0.72, ridgeWeight: 0.13, broadWeight: 0.66,
    mediumWeight: 0.21, erosionWeight: 0.17, verticalScale: 1.05, towerWeight: 0,
    lowerDarkening: 0.16, layerY: [0.01, 0.11, 0.22], layerHeight: [0.24, 0.3, 0.34],
    layerWidth: [1.55, 1.62, 1.7], layerOpacity: [0.25, 0.36, 0.44], travel: [0.42, 0.61, 0.82],
  },
  clear: {
    seedBase: 83, thresholdBias: 0.11, warp: 0.62, ridgeWeight: 0.1, broadWeight: 0.7,
    mediumWeight: 0.2, erosionWeight: 0.2, verticalScale: 1.08, towerWeight: 0,
    lowerDarkening: 0.1, layerY: [0.02, 0.13, 0.23], layerHeight: [0.2, 0.24, 0.28],
    layerWidth: [1.62, 1.7, 1.78], layerOpacity: [0.16, 0.23, 0.29], travel: [0.4, 0.57, 0.76],
  },
  'partly-cloudy': {
    seedBase: 241, thresholdBias: 0.075, warp: 1.12, ridgeWeight: 0.26, broadWeight: 0.5,
    mediumWeight: 0.24, erosionWeight: 0.31, verticalScale: 1.32, towerWeight: 0.16,
    lowerDarkening: 0.18, layerY: [0.015, 0.12, 0.24], layerHeight: [0.24, 0.31, 0.37],
    layerWidth: [1.5, 1.58, 1.66], layerOpacity: [0.34, 0.48, 0.58], travel: [0.44, 0.67, 0.9],
  },
  cloudy: {
    seedBase: 503, thresholdBias: -0.015, warp: 0.9, ridgeWeight: 0.19, broadWeight: 0.62,
    mediumWeight: 0.19, erosionWeight: 0.18, verticalScale: 0.92, towerWeight: 0.04,
    lowerDarkening: 0.29, layerY: [-0.015, 0.07, 0.17], layerHeight: [0.3, 0.39, 0.48],
    layerWidth: [1.62, 1.7, 1.8], layerOpacity: [0.46, 0.68, 0.8], travel: [0.42, 0.63, 0.86],
  },
  rain: {
    seedBase: 811, thresholdBias: -0.065, warp: 1.04, ridgeWeight: 0.13, broadWeight: 0.7,
    mediumWeight: 0.17, erosionWeight: 0.1, verticalScale: 0.72, towerWeight: 0.02,
    lowerDarkening: 0.43, layerY: [0.035, 0.15, 0.29], layerHeight: [0.27, 0.34, 0.41],
    layerWidth: [1.78, 1.9, 2.02], layerOpacity: [0.55, 0.76, 0.88], travel: [0.36, 0.55, 0.75],
  },
  storm: {
    seedBase: 1297, thresholdBias: -0.08, warp: 1.42, ridgeWeight: 0.36, broadWeight: 0.42,
    mediumWeight: 0.22, erosionWeight: 0.16, verticalScale: 1.58, towerWeight: 0.42,
    lowerDarkening: 0.58, layerY: [-0.08, 0.015, 0.14], layerHeight: [0.42, 0.54, 0.66],
    layerWidth: [1.42, 1.52, 1.62], layerOpacity: [0.62, 0.84, 0.96], travel: [0.47, 0.73, 1.02],
  },
  wind: {
    seedBase: 1621, thresholdBias: 0.035, warp: 1.16, ridgeWeight: 0.15, broadWeight: 0.59,
    mediumWeight: 0.26, erosionWeight: 0.24, verticalScale: 0.7, towerWeight: 0,
    lowerDarkening: 0.15, layerY: [0.03, 0.14, 0.27], layerHeight: [0.19, 0.24, 0.3],
    layerWidth: [1.94, 2.08, 2.22], layerOpacity: [0.3, 0.43, 0.53], travel: [0.7, 1.03, 1.38],
  },
  cold: {
    seedBase: 1889, thresholdBias: 0.015, warp: 0.84, ridgeWeight: 0.18, broadWeight: 0.62,
    mediumWeight: 0.2, erosionWeight: 0.2, verticalScale: 0.92, towerWeight: 0.04,
    lowerDarkening: 0.2, layerY: [0.01, 0.12, 0.23], layerHeight: [0.25, 0.32, 0.38],
    layerWidth: [1.64, 1.72, 1.82], layerOpacity: [0.34, 0.49, 0.6], travel: [0.41, 0.62, 0.84],
  },
  hot: {
    seedBase: 2137, thresholdBias: 0.12, warp: 0.6, ridgeWeight: 0.1, broadWeight: 0.7,
    mediumWeight: 0.2, erosionWeight: 0.22, verticalScale: 0.95, towerWeight: 0,
    lowerDarkening: 0.08, layerY: [0.01, 0.13, 0.25], layerHeight: [0.18, 0.23, 0.27],
    layerWidth: [1.66, 1.76, 1.86], layerOpacity: [0.12, 0.18, 0.23], travel: [0.38, 0.54, 0.7],
  },
};

function hash2d(x: number, y: number, seed: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return value - Math.floor(value);
}

function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const n00 = hash2d(x0, y0, seed);
  const n10 = hash2d(x0 + 1, y0, seed);
  const n01 = hash2d(x0, y0 + 1, seed);
  const n11 = hash2d(x0 + 1, y0 + 1, seed);
  return lerp(lerp(n00, n10, sx), lerp(n01, n11, sx), sy);
}

function fbm(x: number, y: number, seed: number, octaves = 5): number {
  let sum = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let normalization = 0;
  for (let octave = 0; octave < octaves; octave += 1) {
    sum += valueNoise(x * frequency, y * frequency, seed + octave * 17) * amplitude;
    normalization += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }
  return sum / normalization;
}

function ridgedFbm(x: number, y: number, seed: number): number {
  let sum = 0;
  let amplitude = 0.58;
  let frequency = 1;
  let normalization = 0;
  for (let octave = 0; octave < 4; octave += 1) {
    const sample = valueNoise(x * frequency, y * frequency, seed + octave * 23);
    const ridge = 1 - Math.abs(sample * 2 - 1);
    sum += ridge * ridge * amplitude;
    normalization += amplitude;
    amplitude *= 0.47;
    frequency *= 2.11;
  }
  return sum / normalization;
}

function cloudTint(scene: AtmosphereScene): { light: RGB; mid: RGB; shade: RGB; alpha: number; contrast: number } {
  switch (scene) {
    case 'storm': return { light: [145, 153, 169], mid: [82, 94, 113], shade: [27, 35, 51], alpha: 0.98, contrast: 1.24 };
    case 'rain': return { light: [182, 194, 203], mid: [118, 133, 146], shade: [57, 70, 84], alpha: 0.95, contrast: 1.12 };
    case 'cloudy': return { light: [229, 235, 239], mid: [169, 182, 192], shade: [101, 116, 129], alpha: 0.91, contrast: 1.03 };
    case 'cold': return { light: [238, 245, 248], mid: [188, 201, 210], shade: [127, 145, 158], alpha: 0.83, contrast: 0.97 };
    case 'partly-cloudy': return { light: [250, 251, 252], mid: [211, 220, 226], shade: [154, 169, 180], alpha: 0.78, contrast: 0.94 };
    case 'wind': return { light: [240, 245, 248], mid: [194, 205, 213], shade: [137, 152, 164], alpha: 0.73, contrast: 0.95 };
    default: return { light: [249, 251, 252], mid: [222, 228, 232], shade: [176, 186, 193], alpha: 0.66, contrast: 0.91 };
  }
}

function evaluateCloudField(u: number, v: number, seed: number, coverage: number, profile: SceneProfile): number {
  const warpX = fbm(u * 1.39 + 11.3, v * 1.16 + 2.7, seed + 71, 4) - 0.5;
  const warpY = fbm(u * 1.18 + 4.1, v * 1.48 + 8.4, seed + 113, 4) - 0.5;
  const warpedU = u * 3.04 + warpX * profile.warp + warpY * profile.warp * 0.25;
  const warpedV = v * 2.05 * profile.verticalScale + warpY * profile.warp * 0.62 - warpX * 0.18;

  const broad = fbm(warpedU, warpedV, seed, 5);
  const ridges = ridgedFbm(warpedU * 1.58 + 7.2, warpedV * 1.42 + 3.8, seed + 151);
  const medium = fbm(warpedU * 2.33 + 13.7, warpedV * 2.02 + 9.2, seed + 193, 4);
  const erosion = fbm(warpedU * 4.72 + 21.4, warpedV * 4.06 + 16.1, seed + 239, 3);
  const tower = profile.towerWeight > 0
    ? ridgedFbm(u * 1.15 + 31.2, v * 0.78 + 12.4, seed + 331) * smoothstep(0.05, 0.72, 1 - v)
    : 0;

  const threshold = 0.64 - clamp01(coverage) * 0.2 + profile.thresholdBias;
  const raw = broad * profile.broadWeight
    + ridges * profile.ridgeWeight
    + medium * profile.mediumWeight
    + tower * profile.towerWeight
    - Math.max(0, erosion - 0.55) * profile.erosionWeight;

  return smoothstep(threshold, threshold + (profile.towerWeight > 0.2 ? 0.16 : 0.2), raw);
}

function createCloudTexture(width: number, height: number, seed: number, scene: AtmosphereScene, coverage: number): HTMLCanvasElement {
  const texture = document.createElement('canvas');
  texture.width = width;
  texture.height = height;
  const ctx = texture.getContext('2d', { alpha: true });
  if (!ctx) return texture;

  const profile = SCENE_PROFILES[scene];
  const image = ctx.createImageData(width, height);
  const densityField = new Float32Array(width * height);
  const { light, mid, shade, alpha: sceneAlpha, contrast } = cloudTint(scene);

  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1);
    const topFade = profile.towerWeight > 0.2 ? 0.025 : 0.06;
    const bottomFade = scene === 'rain' ? 0.97 : scene === 'storm' ? 0.995 : 0.94;
    const envelope = smoothstep(0.005, topFade, v) * (1 - smoothstep(0.77, bottomFade, v));
    const baseWeight = 0.8 + smoothstep(0.34, 0.9, v) * 0.2;
    for (let x = 0; x < width; x += 1) {
      const u = x / Math.max(1, width - 1);
      densityField[y * width + x] = evaluateCloudField(u, v, seed, coverage, profile) * envelope * baseWeight;
    }
  }

  const sampleDensity = (x: number, y: number) => {
    const sx = Math.max(0, Math.min(width - 1, x));
    const sy = Math.max(0, Math.min(height - 1, y));
    return densityField[sy * width + sx];
  };

  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1);
    const lowerDark = smoothstep(0.28, 0.88, v) * profile.lowerDarkening;
    for (let x = 0; x < width; x += 1) {
      const density = densityField[y * width + x];
      const index = (y * width + x) * 4;
      if (density <= 0.002) {
        image.data[index + 3] = 0;
        continue;
      }
      const lit = sampleDensity(x - 2, y - 2);
      const shadow = sampleDensity(x + 3, y + 4);
      const directional = clamp01(0.5 + (lit - shadow) * (scene === 'storm' ? 2.1 : 1.7));
      const selfShadow = clamp01(1 - density * 0.56 - lowerDark);
      const highlight = clamp01((directional * 0.7 + selfShadow * 0.3) * contrast);
      const midMix = smoothstep(0.1, 0.58, highlight);
      const lightMix = smoothstep(0.5, 0.94, highlight);
      image.data[index] = Math.round(lerp(lerp(shade[0], mid[0], midMix), light[0], lightMix));
      image.data[index + 1] = Math.round(lerp(lerp(shade[1], mid[1], midMix), light[1], lightMix));
      image.data[index + 2] = Math.round(lerp(lerp(shade[2], mid[2], midMix), light[2], lightMix));
      const edgeAlpha = smoothstep(0.02, 0.4, density);
      const coreAlpha = lerp(0.58, 1, smoothstep(0.4, 0.9, density));
      image.data[index + 3] = Math.round(255 * edgeAlpha * coreAlpha * sceneAlpha);
    }
  }

  ctx.putImageData(image, 0, 0);
  return texture;
}

function renderTiledLayer(
  ctx: CanvasRenderingContext2D,
  texture: HTMLCanvasElement,
  canvasWidth: number,
  y: number,
  drawWidth: number,
  drawHeight: number,
  offset: number,
  opacity: number,
  verticalDrift: number,
) {
  ctx.globalAlpha = clamp01(opacity);
  const normalized = ((offset % drawWidth) + drawWidth) % drawWidth;
  let x = -normalized - drawWidth;
  while (x < canvasWidth + drawWidth) {
    ctx.drawImage(texture, x, y + verticalDrift, drawWidth, drawHeight);
    x += drawWidth;
  }
}

export default function NaturalCloudCanvasV8({
  scene,
  quality,
  cloudOpacity,
  cloudSpeedSeconds,
  windStrength,
  active,
}: NaturalCloudCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let raf = 0;
    let disposed = false;
    let lastFrameAt = 0;
    const startAt = performance.now();
    const android = document.documentElement.classList.contains('capacitor-android')
      || document.documentElement.classList.contains('android-webview');
    const resolutionScale = quality === 'ultra' ? 0.78 : quality === 'high' ? 0.68 : quality === 'balanced' ? 0.58 : 0.46;
    const frameRate = quality === 'static' ? 1 : android ? 12 : quality === 'ultra' ? 24 : quality === 'high' ? 20 : 16;
    const frameInterval = 1000 / frameRate;
    const cssWidth = Math.max(320, window.innerWidth);
    const cssHeight = Math.max(520, window.innerHeight);
    canvas.width = Math.max(240, Math.round(cssWidth * resolutionScale));
    canvas.height = Math.max(360, Math.round(cssHeight * resolutionScale));

    const textureWidth = android ? (quality === 'low' || quality === 'static' ? 300 : 380) : (quality === 'ultra' ? 520 : 450);
    const textureHeight = android ? (quality === 'low' || quality === 'static' ? 132 : 164) : (quality === 'ultra' ? 214 : 188);
    const profile = SCENE_PROFILES[scene];
    const seeds = [profile.seedBase + 17, profile.seedBase + 79, profile.seedBase + 173] as const;
    const coverages = [cloudOpacity * 0.68, cloudOpacity * 0.94, Math.min(1, cloudOpacity * 1.12)] as const;
    const textures = seeds.map((seed, index) => createCloudTexture(textureWidth, textureHeight, seed, scene, coverages[index]));

    const draw = (now: number) => {
      if (disposed) return;
      if (now - lastFrameAt < frameInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastFrameAt = now;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const elapsed = quality === 'static' || !active ? 0 : (now - startAt) / 1000;
      const baseTravel = Math.max(100, cloudSpeedSeconds * 2.9);
      const windMultiplier = 1 + windStrength * 0.62;
      const drifts = [
        Math.sin(elapsed * 0.041) * h * 0.011,
        Math.sin(elapsed * 0.033 + 1.7) * h * 0.018,
        Math.sin(elapsed * 0.026 + 3.2) * h * 0.026,
      ];
      const opacityBreath = [
        1 + Math.sin(elapsed * 0.021) * 0.05,
        1 + Math.sin(elapsed * 0.017 + 2.1) * 0.06,
        1 + Math.sin(elapsed * 0.014 + 4.2) * 0.07,
      ];

      for (let index = 0; index < 3; index += 1) {
        renderTiledLayer(
          ctx,
          textures[index],
          w,
          h * profile.layerY[index],
          w * profile.layerWidth[index],
          h * profile.layerHeight[index],
          elapsed * (w / baseTravel) * profile.travel[index] * windMultiplier,
          cloudOpacity * profile.layerOpacity[index] * opacityBreath[index],
          drifts[index],
        );
      }
      ctx.globalAlpha = 1;
      if (quality !== 'static' && active && document.visibilityState !== 'hidden') raf = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !disposed && active && quality !== 'static') {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    draw(performance.now());
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [scene, quality, cloudOpacity, cloudSpeedSeconds, windStrength, active]);

  return <canvas ref={canvasRef} className="lwa-natural-cloud-canvas" aria-hidden="true" />;
}
