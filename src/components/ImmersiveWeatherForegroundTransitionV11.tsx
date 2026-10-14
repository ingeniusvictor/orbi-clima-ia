import { useEffect, useRef } from 'react';
import ImmersivePrecipitationCanvas from './ImmersivePrecipitationCanvas';
import SnowFrostCanvas from './SnowFrostCanvas';
import { useAtmosphereTransition } from '../hooks/useAtmosphereTransition';
import type { AtmosphereTransitionReason } from '../services/atmosphereTransitionProfiles';
import type {
  AtmosphereModel,
  AtmosphereScene,
} from '../services/weatherAtmosphereEngine';
import '../styles/immersive-weather-foreground.css';

interface ImmersiveWeatherForegroundTransitionV11Props {
  targetModel: AtmosphereModel;
  active: boolean;
  debugPreset: string;
  transitionReason: AtmosphereTransitionReason;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function wetSceneEntries(sceneWeights: Partial<Record<AtmosphereScene, number>>) {
  return (Object.entries(sceneWeights) as Array<[AtmosphereScene, number]>)
    .filter(([scene, weight]) => (
      (scene === 'rain' || scene === 'storm' || scene === 'snow') && weight > 0.008
    ))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
}

export default function ImmersiveWeatherForegroundTransitionV11({
  targetModel,
  active,
  debugPreset,
  transitionReason,
}: ImmersiveWeatherForegroundTransitionV11Props) {
  const sceneModelsRef = useRef<Map<AtmosphereScene, AtmosphereModel>>(new Map());
  sceneModelsRef.current.set(targetModel.scene, targetModel);

  const transition = useAtmosphereTransition(targetModel, active, transitionReason, true);
  const wetScenes = wetSceneEntries(transition.sceneWeights);

  useEffect(() => {
    if (transition.phase !== 'stable') return;
    sceneModelsRef.current = new Map([[targetModel.scene, targetModel]]);
  }, [targetModel, transition.phase]);

  if (wetScenes.length === 0 && transition.model.precipitationStrength <= 0.02) return null;

  const hasRainFamily = wetScenes.some(([scene]) => scene === 'rain' || scene === 'storm');
  const wetGlassOpacity = hasRainFamily
    ? clamp01(transition.wetGlassIntensity * 1.15)
    : 0;

  return (
    <div
      className={`orbi-immersive-weather-foreground ${active ? 'is-active' : 'is-paused'}`}
      data-scene={transition.model.scene}
      data-quality={transition.model.quality}
      data-precipitation-kind={transition.model.precipitationKind}
      data-precipitation-intensity={transition.model.precipitationIntensity}
      data-debug-scene={debugPreset}
      data-foreground-engine="v11-transition"
      data-transition-phase={transition.phase}
      data-transition-from={transition.fromScene}
      data-transition-to={transition.toScene}
      data-transition-progress={transition.progress.toFixed(3)}
      data-storm-energy={transition.stormEnergy.toFixed(3)}
      data-wet-glass={transition.wetGlassIntensity.toFixed(3)}
      aria-hidden="true"
    >
      {wetScenes.map(([scene, weight]) => {
        const familyModel = sceneModelsRef.current.get(scene) ?? { ...transition.model, scene };
        const familyStrength = Math.max(0.04, familyModel.precipitationStrength);
        const strengthProgress = clamp01(transition.model.precipitationStrength / familyStrength);
        const incoming = scene === transition.toScene;
        const visualWeight = incoming ? Math.min(weight, strengthProgress) : weight;

        if (scene === 'snow') {
          return (
            <div
              key={scene}
              className="orbi-transition-foreground-family"
              data-foreground-family={scene}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: Number(visualWeight.toFixed(4)),
                pointerEvents: 'none',
              }}
            >
              <SnowFrostCanvas
                quality={familyModel.quality}
                snowStrength={familyModel.precipitationStrength}
                frostStrength={familyModel.frostStrength}
                windStrength={familyModel.windStrength}
                active={active}
              />
            </div>
          );
        }

        const lightningReady = scene === 'storm' && transition.stormEnergy > 0.62;
        const canvasScene: AtmosphereScene = lightningReady ? 'storm' : 'rain';

        return (
          <div
            key={scene}
            className="orbi-transition-foreground-family"
            data-foreground-family={scene}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: Number(visualWeight.toFixed(4)),
              pointerEvents: 'none',
            }}
          >
            <ImmersivePrecipitationCanvas
              scene={canvasScene}
              quality={familyModel.quality}
              precipitationStrength={familyModel.precipitationStrength}
              precipitationKind={familyModel.precipitationKind}
              precipitationIntensity={familyModel.precipitationIntensity}
              windStrength={familyModel.windStrength}
              active={active}
            />
          </div>
        );
      })}

      {hasRainFamily && (
        <div
          className="orbi-rain-glass-sheen"
          style={{ opacity: Number(wetGlassOpacity.toFixed(4)) }}
        />
      )}
    </div>
  );
}
