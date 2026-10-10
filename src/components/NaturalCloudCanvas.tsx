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

  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sy;
}

function fbm(x: number, y: number, seed: number): number {
  let sum = 0;
  let amplitude = 0.56;
  let frequency = 1;
  let normalization = 0;

  for (let octave = 0; octave < 5; octave += 1) {
    sum += valueNoise(x * frequency, y * frequency, seed + octave * 13) * amplitude;
    normalization += amplitude;
    amplitude *= 0.5;
    frequency *= 2.03;
  }

  return sum / normalization;
}

function cloudTint(scene: AtmosphereScene): { light: RGB; shade: RGB; alpha: number } {
  switch (scene) {
    case 'storm':
      return { light: [137, 147, 158], shade: [54, 65, 76], alpha: 0.94 };
    case 'rain':
      return { light: [181, 191, 198], shade: [83, 97, 108], alpha: 0.9 };
    case 'cloudy':
      return { light: [220, 227, 232], shade: [112, 127, 139], alpha: 0.86 };
    case 'cold':
      return { light: [230, 239, 244], shade: [134, 153, 165], alpha: 0.78 };
    case 'partly-cloudy':
      return { light: [242, 246, 248], shade: [167, 181, 190], alpha: 0.74 };
    case 'wind':
      return { light: [231, 238, 242], shade: [151, 165, 176], alpha: 0.7 };
    default:
      return { light: [244, 248, 250], shade: [185, 196, 203], alpha: 0.62 };
  }
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
  const { light, shade, alpha: sceneAlpha } = cloudTint(scene);
  const threshold = 0.67 - clamp01(coverage) * 0.2;

  for (let y = 0; y < height; y += 1) {
    const v = y / Math.max(1, height - 1);
    const verticalEnvelope = smoothstep(0.015, 0.16, v) * (1 - smoothstep(0.76, 0.995, v));

    for (let x = 0; x < width; x += 1) {
      const u = x / Math.max(1, width - 1);
      const broad = fbm(u * 3.05, v * 2.45, seed);
      const detail = fbm(u * 7.4 + 5.3, v * 5.8 + 3.1, seed + 97);
      const wisps = fbm(u * 1.42 + 17.2, v * 3.2 + 2.7, seed + 211);
      const density = broad * 0.66 + detail * 0.22 + wisps * 0.12;
      const body = smoothstep(threshold, threshold + 0.2, density) * verticalEnvelope;
      const softEdge = smoothstep(0.025, 0.2, body);
      const localShade = clamp01((density - threshold) / 0.3);
      const upperLight = clamp01(1 - v * 0.82);
      const mix = clamp01(localShade * 0.48 + upperLight * 0.36);

      const index = (y * width + x) * 4;
      image.data[index] = Math.round(shade[0] + (light[0] - shade[0]) * mix);
      image.data[index + 1] = Math.round(shade[1] + (light[1] - shade[1]) * mix);
      image.data[index + 2] = Math.round(shade[2] + (light[2] - shade[2]) * mix);
      image.data[index + 3] = Math.round(255 * softEdge * sceneAlpha);
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
) {
  ctx.globalAlpha = clamp01(opacity);
  const normalized = ((offset % drawWidth) + drawWidth) % drawWidth;
  let x = -normalized - drawWidth;
  while (x < canvasWidth + drawWidth) {
    ctx.drawImage(texture, x, y, drawWidth, drawHeight);
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

    const textureWidth = quality === 'low' || quality === 'static' ? 320 : 420;
    const textureHeight = quality === 'low' || quality === 'static' ? 150 : 190;
    const textures = [
      createCloudTexture(textureWidth, textureHeight, 17, scene, cloudOpacity * 0.72),
      createCloudTexture(textureWidth, textureHeight, 43, scene, cloudOpacity * 0.92),
      createCloudTexture(textureWidth, textureHeight, 89, scene, Math.min(1, cloudOpacity * 1.08)),
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
      const baseTravel = Math.max(92, cloudSpeedSeconds * 2.7);
      const windMultiplier = 1 + windStrength * 0.65;

      renderTiledLayer(ctx, textures[0], w, -h * 0.015, w * 1.42, h * 0.29, elapsed * (w / baseTravel) * 0.52 * windMultiplier, cloudOpacity * 0.45);
      renderTiledLayer(ctx, textures[1], w, h * 0.055, w * 1.5, h * 0.39, elapsed * (w / baseTravel) * 0.78 * windMultiplier, cloudOpacity * 0.66);
      renderTiledLayer(ctx, textures[2], w, h * 0.15, w * 1.62, h * 0.47, elapsed * (w / baseTravel) * 1.02 * windMultiplier, cloudOpacity * 0.78);
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
