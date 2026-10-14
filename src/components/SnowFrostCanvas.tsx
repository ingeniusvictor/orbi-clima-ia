import { useEffect, useRef } from 'react';
import type { AtmosphereQuality } from '../services/weatherAtmosphereEngine';

interface SnowFrostCanvasProps {
  quality: AtmosphereQuality;
  snowStrength: number;
  frostStrength: number;
  windStrength: number;
  active: boolean;
}

interface SnowParticle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  wobble: number;
  phase: number;
  depth: number;
  opacity: number;
  crystalline: boolean;
}

interface FrostBranch {
  edge: 0 | 1 | 2 | 3;
  offset: number;
  length: number;
  angle: number;
  forks: number;
  opacity: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function seeded(index: number, salt: number) {
  const value = Math.sin(index * 91.177 + salt * 17.331) * 43758.5453123;
  return value - Math.floor(value);
}

function particleCount(quality: AtmosphereQuality, android: boolean) {
  if (quality === 'static') return android ? 34 : 48;
  if (quality === 'low') return android ? 42 : 60;
  if (quality === 'balanced') return android ? 58 : 86;
  if (quality === 'high') return android ? 72 : 112;
  return android ? 78 : 136;
}

function drawCrystal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  alpha: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.strokeStyle = `rgba(247,252,255,${alpha})`;
  ctx.lineWidth = Math.max(0.55, radius * 0.12);
  ctx.lineCap = 'round';

  for (let arm = 0; arm < 6; arm += 1) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -radius);
    ctx.moveTo(0, -radius * 0.58);
    ctx.lineTo(-radius * 0.22, -radius * 0.76);
    ctx.moveTo(0, -radius * 0.58);
    ctx.lineTo(radius * 0.22, -radius * 0.76);
    ctx.stroke();
  }
  ctx.restore();
}

function buildFrostBranches(count: number): FrostBranch[] {
  return Array.from({ length: count }, (_, index) => ({
    edge: (index % 4) as 0 | 1 | 2 | 3,
    offset: 0.04 + seeded(index, 71) * 0.92,
    length: 18 + seeded(index, 73) * 48,
    angle: (seeded(index, 79) - 0.5) * 0.7,
    forks: 2 + Math.floor(seeded(index, 83) * 3),
    opacity: 0.14 + seeded(index, 89) * 0.3,
  }));
}

export default function SnowFrostCanvas({
  quality,
  snowStrength,
  frostStrength,
  windStrength,
  active,
}: SnowFrostCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const parent = canvas.parentElement;
    if (!parent) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    const android = document.documentElement.classList.contains('capacitor-android')
      || document.documentElement.classList.contains('android-webview');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let raf = 0;
    let disposed = false;
    let lastFrame = performance.now();
    let lastPaint = 0;
    let frostProgress = quality === 'static' || reduceMotion ? clamp01(frostStrength) : 0;

    const targetFps = quality === 'static' || reduceMotion
      ? 1
      : android
        ? 18
        : quality === 'ultra'
          ? 28
          : quality === 'high'
            ? 24
            : 20;
    const frameInterval = 1000 / targetFps;

    const particles: SnowParticle[] = Array.from(
      { length: particleCount(quality, android) },
      (_, index) => {
        const depth = 0.12 + seeded(index, 5) * 0.88;
        return {
          x: seeded(index, 7),
          y: seeded(index, 11),
          radius: 0.75 + depth * 3.6 + seeded(index, 13) * 1.1,
          speed: 18 + depth * 54 + seeded(index, 17) * 24,
          drift: (seeded(index, 19) - 0.5) * (9 + depth * 16),
          wobble: 7 + seeded(index, 23) * 18,
          phase: seeded(index, 29) * Math.PI * 2,
          depth,
          opacity: 0.2 + depth * 0.58,
          crystalline: depth > 0.72 && seeded(index, 31) > 0.58,
        };
      },
    );

    const frostBranches = buildFrostBranches(android ? 24 : 34);

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = Math.max(120, rect.width);
      height = Math.max(160, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, android ? 1.05 : 1.3);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    const drawFrost = (strength: number, seconds: number) => {
      const edgeDepth = Math.max(18, Math.min(width, height) * (0.07 + strength * 0.045));
      const top = ctx.createLinearGradient(0, 0, 0, edgeDepth);
      top.addColorStop(0, `rgba(226,246,255,${0.2 * strength})`);
      top.addColorStop(0.38, `rgba(191,228,244,${0.085 * strength})`);
      top.addColorStop(1, 'rgba(180,224,242,0)');
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, width, edgeDepth);

      const left = ctx.createLinearGradient(0, 0, edgeDepth, 0);
      left.addColorStop(0, `rgba(221,244,253,${0.15 * strength})`);
      left.addColorStop(0.46, `rgba(176,220,239,${0.055 * strength})`);
      left.addColorStop(1, 'rgba(176,220,239,0)');
      ctx.fillStyle = left;
      ctx.fillRect(0, 0, edgeDepth, height);

      const right = ctx.createLinearGradient(width, 0, width - edgeDepth, 0);
      right.addColorStop(0, `rgba(225,246,255,${0.14 * strength})`);
      right.addColorStop(0.46, `rgba(180,224,242,${0.052 * strength})`);
      right.addColorStop(1, 'rgba(180,224,242,0)');
      ctx.fillStyle = right;
      ctx.fillRect(width - edgeDepth, 0, edgeDepth, height);

      const bottomDepth = edgeDepth * 0.78;
      const bottom = ctx.createLinearGradient(0, height, 0, height - bottomDepth);
      bottom.addColorStop(0, `rgba(218,240,250,${0.1 * strength})`);
      bottom.addColorStop(1, 'rgba(190,229,245,0)');
      ctx.fillStyle = bottom;
      ctx.fillRect(0, height - bottomDepth, width, bottomDepth);

      ctx.lineCap = 'round';
      for (let index = 0; index < frostBranches.length; index += 1) {
        const branch = frostBranches[index];
        const pulse = 0.94 + Math.sin(seconds * 0.13 + index * 0.71) * 0.06;
        const alpha = branch.opacity * strength * pulse;
        let x = 0;
        let y = 0;
        let baseAngle = 0;

        if (branch.edge === 0) {
          x = branch.offset * width;
          y = 1;
          baseAngle = Math.PI / 2 + branch.angle;
        } else if (branch.edge === 1) {
          x = width - 1;
          y = branch.offset * height;
          baseAngle = Math.PI + branch.angle;
        } else if (branch.edge === 2) {
          x = branch.offset * width;
          y = height - 1;
          baseAngle = -Math.PI / 2 + branch.angle;
        } else {
          x = 1;
          y = branch.offset * height;
          baseAngle = branch.angle;
        }

        const length = branch.length * (0.65 + strength * 0.5);
        const endX = x + Math.cos(baseAngle) * length;
        const endY = y + Math.sin(baseAngle) * length;
        ctx.strokeStyle = `rgba(235,250,255,${alpha})`;
        ctx.lineWidth = 0.55 + strength * 0.55;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        for (let fork = 1; fork <= branch.forks; fork += 1) {
          const progress = fork / (branch.forks + 1);
          const fx = x + (endX - x) * progress;
          const fy = y + (endY - y) * progress;
          const forkLength = length * (0.12 + progress * 0.08);
          for (const direction of [-1, 1]) {
            const angle = baseAngle + direction * (0.52 + seeded(index * 5 + fork, 97) * 0.26);
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + Math.cos(angle) * forkLength, fy + Math.sin(angle) * forkLength);
            ctx.stroke();
          }
        }
      }
    };

    const paint = (now: number, advance: boolean) => {
      const dt = Math.min(0.055, Math.max(0.001, (now - lastFrame) / 1000 || 0.016));
      lastFrame = now;
      const seconds = now / 1000;
      const strength = clamp01(snowStrength);
      const targetFrost = clamp01(frostStrength);
      if (advance) frostProgress += (targetFrost - frostProgress) * Math.min(1, dt * 0.72);
      else frostProgress = targetFrost;

      ctx.clearRect(0, 0, width, height);

      const gust = clamp01(
        0.46
        + Math.sin(seconds * 0.43) * 0.18
        + Math.sin(seconds * 0.91 + 1.7) * 0.12,
      );
      const windPx = (10 + windStrength * 70) * (0.48 + gust * 0.72);

      for (let index = 0; index < particles.length; index += 1) {
        const flake = particles[index];
        const wobble = Math.sin(seconds * (0.72 + flake.depth * 0.56) + flake.phase) * flake.wobble;

        if (advance) {
          flake.y += ((flake.speed * (0.62 + strength * 0.66)) * dt) / height;
          flake.x += ((flake.drift + windPx * (0.22 + flake.depth * 0.52) + wobble) * dt) / width;
        }

        if (flake.y > 1.08 || flake.x > 1.1) {
          flake.y = -0.08 - seeded(index + Math.floor(seconds), 103) * 0.22;
          flake.x = -0.16 + seeded(index + Math.floor(seconds * 0.7), 107) * 1.12;
        } else if (flake.x < -0.12) {
          flake.x = 1.06;
        }

        const x = flake.x * width;
        const y = flake.y * height;
        const radius = flake.radius * (0.84 + strength * 0.28);
        const alpha = flake.opacity * (0.48 + strength * 0.52);

        if (flake.crystalline && radius > 3.1) {
          drawCrystal(ctx, x, y, radius * 1.45, alpha * 0.72, seconds * 0.08 + flake.phase);
        } else {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.8);
          glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
          glow.addColorStop(0.46, `rgba(237,249,255,${alpha * 0.72})`);
          glow.addColorStop(1, 'rgba(212,240,252,0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      drawFrost(frostProgress, seconds);
    };

    const draw = (now: number) => {
      if (disposed) return;
      if (now - lastPaint >= frameInterval) {
        lastPaint = now;
        paint(now, true);
      }
      if (active && quality !== 'static' && !reduceMotion && document.visibilityState !== 'hidden') {
        raf = requestAnimationFrame(draw);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active && !disposed && quality !== 'static' && !reduceMotion) {
        cancelAnimationFrame(raf);
        lastFrame = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    paint(performance.now(), false);
    if (active && quality !== 'static' && !reduceMotion) raf = requestAnimationFrame(draw);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [quality, snowStrength, frostStrength, windStrength, active]);

  return <canvas ref={canvasRef} className="orbi-snow-frost-canvas" aria-hidden="true" />;
}
