import { isAndroidNativeRuntime } from './androidRuntimeDiagnosticsService';

const ORB_SELECTOR = '#orbi-climate-core-container > div.relative > div.relative.overflow-hidden.z-10';
const CANVAS_CLASS = 'orbi-android-fluid-contour-canvas';
const MAX_FPS = 24;
const FRAME_INTERVAL = 1000 / MAX_FPS;

interface RadiusSet {
  horizontal: [number, number, number, number];
  vertical: [number, number, number, number];
}

const fallbackKeyframes = [
  '48% 52% 55% 45% / 48% 54% 46% 52%',
  '53% 47% 43% 57% / 55% 45% 55% 45%',
  '45% 55% 58% 42% / 42% 58% 42% 58%',
  '51% 49% 46% 54% / 53% 47% 53% 47%',
];

function expandFour(values: number[]): [number, number, number, number] {
  if (values.length === 1) return [values[0], values[0], values[0], values[0]];
  if (values.length === 2) return [values[0], values[1], values[0], values[1]];
  if (values.length === 3) return [values[0], values[1], values[2], values[1]];
  return [values[0], values[1], values[2], values[3]];
}

function parseRadiusToken(token: string, dimension: number): number {
  const value = Number.parseFloat(token);
  if (!Number.isFinite(value)) return dimension * 0.5;
  return token.includes('%') ? (value / 100) * dimension : value;
}

function parseRadiusList(part: string, width: number, height: number, vertical: boolean) {
  const dimension = vertical ? height : width;
  return expandFour(
    part
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => parseRadiusToken(token, dimension)),
  );
}

function normalizeRadius(raw: string, width: number, height: number): RadiusSet {
  const [horizontalRaw, verticalRaw = horizontalRaw] = raw.split('/');
  const horizontal = parseRadiusList(horizontalRaw, width, height, false);
  const vertical = parseRadiusList(verticalRaw, width, height, true);

  const [tlx, trx, brx, blx] = horizontal;
  const [tly, try_, bry, bly] = vertical;
  const factors = [
    1,
    width / Math.max(1, tlx + trx),
    width / Math.max(1, blx + brx),
    height / Math.max(1, tly + bly),
    height / Math.max(1, try_ + bry),
  ];
  const scale = Math.min(...factors);

  return {
    horizontal: horizontal.map((value) => value * scale) as RadiusSet['horizontal'],
    vertical: vertical.map((value) => value * scale) as RadiusSet['vertical'],
  };
}

function drawRoundedBlob(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: RadiusSet,
) {
  const [tlx, trx, brx, blx] = radius.horizontal;
  const [tly, try_, bry, bly] = radius.vertical;

  ctx.beginPath();
  ctx.moveTo(x + tlx, y);
  ctx.lineTo(x + width - trx, y);
  ctx.ellipse(x + width - trx, y + try_, trx, try_, 0, -Math.PI / 2, 0);
  ctx.lineTo(x + width, y + height - bry);
  ctx.ellipse(x + width - brx, y + height - bry, brx, bry, 0, 0, Math.PI / 2);
  ctx.lineTo(x + blx, y + height);
  ctx.ellipse(x + blx, y + height - bly, blx, bly, 0, Math.PI / 2, Math.PI);
  ctx.lineTo(x, y + tly);
  ctx.ellipse(x + tlx, y + tly, tlx, tly, 0, Math.PI, Math.PI * 1.5);
  ctx.closePath();
}

function extractFirstRgb(source: string): [number, number, number] | null {
  const match = source.match(/rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function withAlpha(rgb: [number, number, number], alpha: number) {
  return `rgba(${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}, ${alpha})`;
}

function interpolate(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function fallbackRadius(now: number, width: number, height: number): RadiusSet {
  const duration = 7800;
  const phase = ((now % duration) / duration) * fallbackKeyframes.length;
  const index = Math.floor(phase) % fallbackKeyframes.length;
  const next = (index + 1) % fallbackKeyframes.length;
  const rawT = phase - Math.floor(phase);
  const smoothT = rawT * rawT * (3 - 2 * rawT);
  const a = normalizeRadius(fallbackKeyframes[index], width, height);
  const b = normalizeRadius(fallbackKeyframes[next], width, height);

  return {
    horizontal: a.horizontal.map((value, i) => interpolate(value, b.horizontal[i], smoothT)) as RadiusSet['horizontal'],
    vertical: a.vertical.map((value, i) => interpolate(value, b.vertical[i], smoothT)) as RadiusSet['vertical'],
  };
}

function currentFluidRadius(orb: HTMLElement, now: number, width: number, height: number) {
  const inlineRadius = orb.style.borderRadius?.trim();
  if (inlineRadius && inlineRadius !== '50%' && inlineRadius !== '50% 50%') {
    return normalizeRadius(inlineRadius, width, height);
  }
  return fallbackRadius(now, width, height);
}

function attachContour(): (() => void) | null {
  const orb = document.querySelector<HTMLElement>(ORB_SELECTOR);
  if (!orb) return null;
  const parent = orb.parentElement;
  if (!parent) return null;

  const canvas = document.createElement('canvas');
  canvas.className = CANVAS_CLASS;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: '9',
    display: 'block',
  });
  parent.insertBefore(canvas, orb);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    canvas.remove();
    return null;
  }

  let cssSize = 0;
  let pad = 0;
  let dpr = 1;
  let raf = 0;
  let lastFrame = 0;
  let running = true;

  const syncGeometry = () => {
    cssSize = Math.max(1, orb.offsetWidth);
    // Wider pad than 10614 so the viscous contour has room to bulge without clipping.
    pad = Math.ceil(cssSize * 0.17);
    const cssCanvasSize = cssSize + pad * 2;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.style.width = `${cssCanvasSize}px`;
    canvas.style.height = `${cssCanvasSize}px`;
    canvas.style.left = `${orb.offsetLeft - pad}px`;
    canvas.style.top = `${orb.offsetTop - pad}px`;
    canvas.width = Math.max(1, Math.round(cssCanvasSize * dpr));
    canvas.height = Math.max(1, Math.round(cssCanvasSize * dpr));
  };

  const resizeObserver = new ResizeObserver(syncGeometry);
  resizeObserver.observe(orb);
  syncGeometry();

  const draw = (now: number) => {
    if (!running) return;
    raf = window.requestAnimationFrame(draw);
    if (document.hidden || now - lastFrame < FRAME_INTERVAL || cssSize <= 0) return;
    lastFrame = now;

    const cssCanvasSize = cssSize + pad * 2;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssCanvasSize, cssCanvasSize);

    const center = pad + cssSize / 2;
    const stableRadius = cssSize / 2;
    const computed = window.getComputedStyle(orb);
    const tint =
      extractFirstRgb(computed.backgroundImage) ||
      extractFirstRgb(computed.borderColor) ||
      ([226, 232, 240] as [number, number, number]);

    // Viscous/lava-like drift. The blob grows and leans slowly while the real
    // Orb remains the only complete sphere. All motion lives outside the punched core.
    const slowPhase = (now / 8200) * Math.PI * 2;
    const secondaryPhase = (now / 11700) * Math.PI * 2;
    const widthScale = 1.075 + Math.sin(slowPhase) * 0.016 + Math.sin(secondaryPhase * 0.7) * 0.008;
    const heightScale = 1.065 + Math.cos(slowPhase * 0.86) * 0.020 + Math.sin(secondaryPhase) * 0.007;
    const driftX = Math.sin(slowPhase * 0.72) * cssSize * 0.018 + Math.sin(secondaryPhase * 1.13) * cssSize * 0.008;
    const driftY = Math.cos(slowPhase * 0.61) * cssSize * 0.015 + Math.sin(secondaryPhase * 0.83) * cssSize * 0.008;

    const blobWidth = cssSize * widthScale;
    const blobHeight = cssSize * heightScale;
    const x = center - blobWidth / 2 + driftX;
    const y = center - blobHeight / 2 + driftY;
    const radius = currentFluidRadius(orb, now, blobWidth, blobHeight);

    ctx.save();
    drawRoundedBlob(ctx, x, y, blobWidth, blobHeight, radius);

    const gradient = ctx.createRadialGradient(
      center - cssSize * (0.18 + Math.sin(slowPhase) * 0.025),
      center - cssSize * (0.18 + Math.cos(secondaryPhase) * 0.022),
      stableRadius * 0.62,
      center + driftX * 0.35,
      center + driftY * 0.35,
      stableRadius * 1.18,
    );
    gradient.addColorStop(0, withAlpha(tint, 0.015));
    gradient.addColorStop(0.58, withAlpha(tint, 0.09));
    gradient.addColorStop(0.82, withAlpha(tint, 0.19));
    gradient.addColorStop(1, withAlpha(tint, 0.34));
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,255,${0.14 + (Math.sin(slowPhase) + 1) * 0.025})`;
    ctx.lineWidth = 1.15;
    ctx.stroke();

    // Punch out the real Orb plus a very small safety inset. The visible result
    // is a thicker, asymmetric living contour — never a second filled Orb.
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(center, center, stableRadius * 0.972, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  };

  raf = window.requestAnimationFrame(draw);

  return () => {
    running = false;
    window.cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    canvas.remove();
  };
}

/**
 * Android-only fluid contour for the Golden Orb.
 *
 * The real Orb remains one stable clipped surface. This canvas mirrors the
 * original morph geometry and adds a slow viscous drift, but paints only the
 * outer contour beyond the stable circle. Icon/temperature can never be covered.
 */
export function initializeAndroidGoldenOrbFluidContour(): () => void {
  if (!isAndroidNativeRuntime() || typeof window === 'undefined') {
    return () => undefined;
  }

  let detach: (() => void) | null = null;
  let raf = 0;

  const ensure = () => {
    if (!document.hidden && !document.querySelector(`.${CANVAS_CLASS}`)) {
      detach = attachContour();
    }
    raf = window.requestAnimationFrame(ensure);
  };

  raf = window.requestAnimationFrame(ensure);

  return () => {
    window.cancelAnimationFrame(raf);
    detach?.();
  };
}
