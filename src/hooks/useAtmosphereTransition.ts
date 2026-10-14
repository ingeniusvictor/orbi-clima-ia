import { useEffect, useRef, useState } from 'react';
import {
  AtmosphereTransitionController,
  type AtmosphereTransitionSnapshot,
} from '../services/atmosphereTransitionController';
import type { AtmosphereTransitionReason } from '../services/atmosphereTransitionProfiles';
import type { AtmosphereModel } from '../services/weatherAtmosphereEngine';

const REACT_SAMPLE_INTERVAL_MS = 100;

function resolveReason(
  previousTarget: AtmosphereModel,
  nextTarget: AtmosphereModel,
  requestedReason: AtmosphereTransitionReason,
): AtmosphereTransitionReason {
  if (
    requestedReason === 'weather-truth'
    && previousTarget.scene === nextTarget.scene
    && previousTarget.phase !== nextTarget.phase
  ) {
    return 'time-phase';
  }
  return requestedReason;
}

export function useAtmosphereTransition(
  target: AtmosphereModel,
  active: boolean,
  requestedReason: AtmosphereTransitionReason,
  enabled: boolean,
): AtmosphereTransitionSnapshot {
  const controllerRef = useRef<AtmosphereTransitionController | null>(null);
  if (!controllerRef.current) controllerRef.current = new AtmosphereTransitionController();

  const previousTargetRef = useRef(target);
  const [snapshot, setSnapshot] = useState<AtmosphereTransitionSnapshot>(() => (
    controllerRef.current!.setTarget(target, performance.now(), requestedReason)
  ));

  useEffect(() => {
    const now = performance.now();

    if (!enabled) {
      const baselineController = new AtmosphereTransitionController();
      controllerRef.current = baselineController;
      previousTargetRef.current = target;
      setSnapshot(baselineController.setTarget(target, now, requestedReason));
      return;
    }

    const effectiveReason = resolveReason(previousTargetRef.current, target, requestedReason);
    previousTargetRef.current = target;
    setSnapshot(controllerRef.current!.setTarget(target, now, effectiveReason));
  }, [enabled, requestedReason, target]);

  useEffect(() => {
    if (!enabled || !active || snapshot.phase !== 'transitioning') return undefined;

    let raf = 0;
    let disposed = false;
    let lastPublishedAt = 0;

    const tick = (now: number) => {
      if (disposed) return;

      if (now - lastPublishedAt >= REACT_SAMPLE_INTERVAL_MS) {
        const next = controllerRef.current!.sample(now);
        lastPublishedAt = now;
        setSnapshot(next);
        if (next.phase === 'stable') return;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
    };
  }, [active, enabled, snapshot.phase, snapshot.startedAt]);

  return snapshot;
}
