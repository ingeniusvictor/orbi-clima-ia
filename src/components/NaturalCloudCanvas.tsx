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

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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

  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);
  return lerp(nx0, nx1, sy);
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
    case 'storm':
      return {
        light: [150, 159, 171],
        mid: [92, 104, 119],
        shade: [37, 46, 59],
        alpha: 0.96,
        contrast: 1.18,
      };
    case 'rain':
      return {
        light: [190, 200, 207],
        mid: [132, 145, 156],
        shade: [70, 82, 94],
        alpha: 0.93,
        contrast: 1.08,
      };
    case 'cloudy':
      return {
        light: [230, 235, 239],
        mid: [172, 184, 193],
        shade: [105, 119, 131],
        alpha: 0.9,
        contrast: 1.02,
      };
    case 'cold':
      return {
        light: [235, 243, 247],
        mid: [183, 197, 205],
        shade: [125, 142, 154],
        alpha: 0.82,
        contrast: 0.96,
      };
    case 'partly-cloudy':
      return {
        light: [248, 250, 251],
        mid: [207, 216, 222],
        shade: [153, 166, 176],
        alpha: 0.76,
        contrast: 0.92,
      };
    case 'wind':
      return {
        light: [239, 244, 247],
        mid: [194, 204, 211],
        shade: [139, 153, 164],
        alpha: 0.72,
        contrast: 0.94,
      };
    default:
      return {
        light: [249, 251, 252],
        mid: [221, 227, 231],
        shade: [174, 184, 191],
        alpha: 0.65,
        contrast: 0.9,
      };
  }
}

function evaluateCloudField(
  u: number,
  v: number,
  seed: number,
  coverage: number,
): number {
  const warpX = fbm(u * 1.45 + 11.3, v * 1.18 + 2.7, seed + 71, 4) - 0.5;
  const warpY = fbm(u * 1.22 + 4.1, v * 1.62 + 8.4, seed + 113, 4) - 0.5;
  const warpedU = u * 3.05 + warpX * 1.08 + warpY * 0.28;
  const warpedV = v * 2.18 + warpY * 0.72 - warpX * 0.2;

  const broad = fbm(warpedU, warpedV, seed, 5);
  const billows = ridgedFbm(warpedU * 1.62 + 7.2, warpedV * 1.48 + 3.8, seed + 151);
  const medium = fbm(warpedU * 2.35 + 13.7, warpedV * 2.08 + 9.2, seed + 193, 4);
  const erosion = fbm(warpedU * 4.7 + 21.4, warpedV * 4.05 + 16.1, seed + 239, 3);

  const threshold = 0.64 - clamp01(coverage) * 0.2;
  const raw = broad * 0.57 + billows * 0.23 + medium * 0.2 - Math.max(0, erosion - 0.56) * 0.22;
  return smoothstep(threshold, threshold + 0.2, raw);
}

function createCloudTexture(
  width: number,
  height: number,
  seed: number,
  scene: AtmosphereScene,
  coverage: number,
): HTMLCanvasElement {
  const texture = document.createElement('canvas');
  texture.width = width;
  texture.height = height;
  const ctx = texture.getContext('2d', { alpha: true });
  if (!ctx) return texture;

  const image = ctx.createImageData(width, height);
  const densityField = new Float32Array(width * height);
  const { light, mid, shade, alpha: sceneAlpha, contrast } = cloudTint(scene);

  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1);
    const verticalEnvelope = smoothstep(0.015, 0.13, v) * (1 - smoothstep(0.74, 0.995, v));
    const baseWeight = 0.84 + smoothstep(0.42, 0.88, v) * 0.16;

    for (let x = 0; x < width; x += 1) {
      const u = x / Math.max(1, width - 1);
      densityField[y * width + x] = evaluateCloudField(u, v, seed, coverage) * verticalEnvelope * baseWeight;
    }
  }

  const sampleDensity = (x: number, y: number) => {
    const sx = Math.max(0, Math.min(width - 1, x));
    const sy = Math.max(0, Math.min(height - 1, y));
    return densityField[sy * width + sx];
  };

  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1);
    const lowerDarkening = smoothstep(0.32, 0.86, v);

    for (let x = 0; x < width; x += 1) {
      const density = densityField[y * width + x];
      const index = (y * width + x) * 4;

      if (density <= 0.002) {
        image.data[index + 3] = 0;
        continue;
      }

      // Approximate directional volumetric light by sampling toward an upper-left
      // virtual sun and comparing against lower-right cloud mass.
      const litSample = sampleDensity(x - 2, y - 2);
      const shadowSample = sampleDensity(x + 3, y + 4);
      const directional = clamp01(0.5 + (litSample - shadowSample) * 1.7);
      const selfShadow = clamp01(1 - density * 0.54 - lowerDarkening * 0.28);
      const highlight = clamp01((directional * 0.72 + selfShadow * 0.28) * contrast);

      const midMix = smoothstep(0.12, 0.58, highlight);
      const lightMix = smoothstep(0.52, 0.94, highlight);
      const r = lerp(lerp(shade[0], mid[0], midMix), light[0], lightMix);
      const g = lerp(lerp(shade[1], mid[1], midMix), light[1], lightMix);
      const b = lerp(lerp(shade[2], mid[2], midMix), light[2], lightMix);

      // Density-driven alpha creates soft translucent edges without CSS blur.
      const edgeAlpha = smoothstep(0.025, 0.42, density);
      const coreAlpha = lerp(0.58, 1, smoothstep(0.42, 0.92, density));

      image.data[index] = Math.round(r);
      image.data[index + 1] = Math.round(g);
      image.data[index + 2] = Math.round(b);
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
  verticalDrift = 0,
) {
  ctx.globalAlpha = clamp01(opacity);
  const normalized = ((offset % drawWidth) + drawWidth) % drawWidth;
  let x = -normalized - drawWidth;
  while (x < canvasWidth + drawWidth) {
    ctx.drawImage(texture, x, y + verticalDrift, drawWidth, drawHeight);
    x += drawWidth;
  }
}

export default function NaturalCloudCanvas({
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
    let startAt = performance.now();

    const android = document.documentElement.classList.contains('capacitor-android')
      || document.documentElement.classList.contains('android-webview');
    const resolutionScale = quality === 'ultra' ? 0.78 : quality === 'high' ? 0.68 : quality === 'balanced' ? 0.58 : 0.46;
    const frameRate = quality === 'static' ? 1 : android ? 12 : quality === 'ultra' ? 24 : quality === 'high' ? 20 : 16;
    const frameInterval = 1000 / frameRate;

    const cssWidth = Math.max(320, window.innerWidth);
    const cssHeight = Math.max(520, window.innerHeight);
    canvas.width = Math.max(240, Math.round(cssWidth * resolutionScale));
    canvas.height = Math.max(360, Math.round(cssHeight * resolutionScale));

    // Texture generation happens once per weather/model change. Android keeps
    // conservative source resolution while the lighting model adds perceived volume.
    const textureWidth = android
      ? quality === 'low' || quality === 'static' ? 300 : 380
      : quality === 'low' || quality === 'static' ? 340 : quality === 'ultra' ? 520 : 450;
    const textureHeight = android
      ? quality === 'low' || quality === 'static' ? 132 : 164
      : quality === 'low' || quality === 'static' ? 148 : quality === 'ultra' ? 214 : 188;

    const textures = [
      createCloudTexture(textureWidth, textureHeight, 17, scene, cloudOpacity * 0.7),
      createCloudTexture(textureWidth, textureHeight, 43, scene, cloudOpacity * 0.92),
      createCloudTexture(textureWidth, textureHeight, 89, scene, Math.min(1, cloudOpacity * 1.1)),
    ];

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

      const farDrift = Math.sin(elapsed * 0.045) * h * 0.012;
      const midDrift = Math.sin(elapsed * 0.036 + 1.7) * h * 0.018;
      const nearDrift = Math.sin(elapsed * 0.028 + 3.2) * h * 0.025;
      const farOpacity = cloudOpacity * (0.42 + Math.sin(elapsed * 0.024) * 0.035);
      const midOpacity = cloudOpacity * (0.64 + Math.sin(elapsed * 0.019 + 2.1) * 0.045);
      const nearOpacity = cloudOpacity * (0.77 + Math.sin(elapsed * 0.016 + 4.2) * 0.055);

      renderTiledLayer(
        ctx,
        textures[0],
        w,
        -h * 0.02,
        w * 1.52,
        h * 0.31,
        elapsed * (w / baseTravel) * 0.48 * windMultiplier,
        farOpacity,
        farDrift,
      );
      renderTiledLayer(
        ctx,
        textures[1],
        w,
        h * 0.045,
        w * 1.62,
        h * 0.42,
        elapsed * (w / baseTravel) * 0.72 * windMultiplier,
        midOpacity,
        midDrift,
      );
      renderTiledLayer(
        ctx,
        textures[2],
        w,
        h * 0.135,
        w * 1.76,
        h * 0.5,
        elapsed * (w / baseTravel) * 0.96 * windMultiplier,
        nearOpacity,
        nearDrift,
      );
      ctx.globalAlpha = 1;

      if (quality !== 'static' && active && document.visibilityState !== 'hidden') {
        raf = requestAnimationFrame(draw);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !disposed && active && quality !== 'static') {
        startAt = performance.now();
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
