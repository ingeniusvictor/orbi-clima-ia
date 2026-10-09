import { useEffect, useMemo, useState } from 'react';
import { CurrentWeather, WeatherLocation } from '../types/weatherTypes';
import { AirQualitySnapshot, fetchOpenMeteoAirQuality } from '../services/openMeteoAirQualityService';
import { ForecastUncertaintyReport, fetchForecastUncertainty } from '../services/openMeteoEnsembleService';
import { FloodContextSnapshot, fetchOpenMeteoFloodContext } from '../services/openMeteoFloodService';
import { HydroPrecipSnapshot, fetchHydroPrecipContext } from '../services/openMeteoHydroPrecipService';
import { OfficialAlertsResult, fetchOfficialWeatherAlerts } from '../services/officialWeatherAlertsService';
import {
  MultiModelConsensusReport,
  fetchTrueMultiModelConsensus,
} from '../services/openMeteoMultiModelService';
import {
  ModelSkillSummary,
  registerMultiModelForecastTargets,
  summarizeModelSkill,
  verifyMatureForecastsAgainstDmc,
} from '../services/modelForecastVerificationService';
import {
  DmcObservationSnapshot,
  compareDmcObservationToModel,
  fetchNearestDmcObservation,
} from '../services/dmcObservationService';
import {
  LocalVerificationSummary,
  recordDmcVerificationSample,
  summarizeVerificationHistory,
} from '../services/weatherVerificationService';
import { buildHydrologicRiskAssessment } from '../utils/hydrologicRiskEngine';
import AdaptiveForecastPolicyCard from './AdaptiveForecastPolicyCard';
import AirQualityCard from './AirQualityCard';
import DmcObservationCard from './DmcObservationCard';
import ForecastUncertaintyCard from './ForecastUncertaintyCard';
import HydrologicRiskCard from './HydrologicRiskCard';
import MicroclimateCard from './MicroclimateCard';
import ModelForecastSkillCard from './ModelForecastSkillCard';
import MultiModelConsensusCard from './MultiModelConsensusCard';
import OfficialAlertsCard from './OfficialAlertsCard';

interface WeatherIntelligencePanelProps {
  location: WeatherLocation;
  current: CurrentWeather;
  enabled: boolean;
  onVerificationUpdate?: (summary: LocalVerificationSummary) => void;
}

function publishVerificationSummary(summary: LocalVerificationSummary): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<LocalVerificationSummary>('orbi-weather-verification-updated', {
    detail: summary,
  }));
}

export default function WeatherIntelligencePanel({
  location,
  current,
  enabled,
  onVerificationUpdate,
}: WeatherIntelligencePanelProps) {
  const [airQuality, setAirQuality] = useState<AirQualitySnapshot | null>(null);
  const [uncertainty, setUncertainty] = useState<ForecastUncertaintyReport | null>(null);
  const [multiModel, setMultiModel] = useState<MultiModelConsensusReport | null>(null);
  const [modelSkill, setModelSkill] = useState<ModelSkillSummary>(() => summarizeModelSkill(location));
  const [hydroPrecipitation, setHydroPrecipitation] = useState<HydroPrecipSnapshot | null>(null);
  const [floodContext, setFloodContext] = useState<FloodContextSnapshot | null>(null);
  const [officialAlerts, setOfficialAlerts] = useState<OfficialAlertsResult | null>(null);
  const [dmcObservation, setDmcObservation] = useState<DmcObservationSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const hydrologicAssessment = useMemo(() => {
    if (!hydroPrecipitation) return null;
    return buildHydrologicRiskAssessment({
      precipitation: hydroPrecipitation,
      flood: floodContext,
    });
  }, [hydroPrecipitation, floodContext]);

  const observationComparison = useMemo(
    () => compareDmcObservationToModel(dmcObservation, current),
    [dmcObservation, current],
  );

  useEffect(() => {
    const summary = summarizeVerificationHistory(location);
    publishVerificationSummary(summary);
    onVerificationUpdate?.(summary);
    setModelSkill(summarizeModelSkill(location));
  }, [location.latitude, location.longitude, location.name, onVerificationUpdate]);

  useEffect(() => {
    if (!enabled || !dmcObservation || !observationComparison) return;
    const summary = recordDmcVerificationSample({
      location,
      current,
      observation: dmcObservation,
      comparison: observationComparison,
    });
    publishVerificationSummary(summary);
    onVerificationUpdate?.(summary);
  }, [
    enabled,
    dmcObservation,
    observationComparison,
    current.updatedAt,
    location.latitude,
    location.longitude,
    location.name,
    onVerificationUpdate,
  ]);

  useEffect(() => {
    if (!enabled || !multiModel?.verificationTargets.length) return;
    const summary = registerMultiModelForecastTargets(location, multiModel.verificationTargets);
    setModelSkill(summary);
  }, [
    enabled,
    multiModel?.generatedAt,
    location.latitude,
    location.longitude,
    location.name,
  ]);

  useEffect(() => {
    if (!enabled || !dmcObservation) return;
    const summary = verifyMatureForecastsAgainstDmc(location, dmcObservation);
    setModelSkill(summary);
  }, [
    enabled,
    dmcObservation?.stationId,
    dmcObservation?.reportTime,
    location.latitude,
    location.longitude,
    location.name,
  ]);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setAirQuality(null);
      setUncertainty(null);
      setMultiModel(null);
      setModelSkill(summarizeModelSkill(location));
      setHydroPrecipitation(null);
      setFloodContext(null);
      setOfficialAlerts(null);
      setDmcObservation(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    const load = async () => {
      setLoading(true);
      const params = {
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone || 'auto',
      };

      const [airResult, ensembleResult, multiModelResult, hydroResult, floodResult, officialResult, dmcResult] = await Promise.allSettled([
        fetchOpenMeteoAirQuality(params),
        fetchForecastUncertainty(params),
        fetchTrueMultiModelConsensus(params),
        fetchHydroPrecipContext(params),
        fetchOpenMeteoFloodContext(params),
        fetchOfficialWeatherAlerts(location),
        fetchNearestDmcObservation(location),
      ]);

      if (!active) return;

      if (airResult.status === 'fulfilled') {
        setAirQuality(airResult.value);
      } else {
        console.warn('Air quality layer unavailable:', airResult.reason);
        setAirQuality(null);
      }

      if (ensembleResult.status === 'fulfilled') {
        setUncertainty(ensembleResult.value);
      } else {
        console.warn('Ensemble uncertainty layer unavailable:', ensembleResult.reason);
        setUncertainty(null);
      }

      if (multiModelResult.status === 'fulfilled') {
        setMultiModel(multiModelResult.value);
      } else {
        console.warn('Deterministic multi-model layer unavailable:', multiModelResult.reason);
        setMultiModel(null);
      }

      if (hydroResult.status === 'fulfilled') {
        setHydroPrecipitation(hydroResult.value);
      } else {
        console.warn('Hydrologic precipitation context unavailable:', hydroResult.reason);
        setHydroPrecipitation(null);
      }

      if (floodResult.status === 'fulfilled') {
        setFloodContext(floodResult.value);
      } else {
        console.warn('GloFAS flood context unavailable:', floodResult.reason);
        setFloodContext(null);
      }

      if (officialResult.status === 'fulfilled') {
        setOfficialAlerts(officialResult.value);
      } else {
        console.warn('Official weather-alert provider status unavailable:', officialResult.reason);
        setOfficialAlerts(null);
      }

      if (dmcResult.status === 'fulfilled') {
        setDmcObservation(dmcResult.value);
      } else {
        console.warn('DMC WIS2 observation layer unavailable:', dmcResult.reason);
        setDmcObservation(null);
      }

      setLoading(false);
    };

    load().catch(error => {
      if (!active) return;
      console.warn('Premium weather intelligence refresh failed:', error);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [enabled, location.latitude, location.longitude, location.timezone, location.id]);

  if (!enabled) return null;

  return (
    <div className="space-y-3" id="weather-intelligence-panel">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">ORBI Weather Intelligence</p>
          <p className="text-xs text-slate-400 mt-0.5">SENAPRED oficial · DMC observado · adaptativo · forecast skill · HydroWatch</p>
        </div>
        <span className="text-[9px] font-mono uppercase text-slate-500">OC-09</span>
      </div>

      <OfficialAlertsCard result={officialAlerts} loading={loading} />
      <DmcObservationCard
        observation={dmcObservation}
        comparison={observationComparison}
        loading={loading}
      />
      <AdaptiveForecastPolicyCard location={location} modelSkill={modelSkill} />
      <MultiModelConsensusCard report={multiModel} loading={loading} />
      <ModelForecastSkillCard summary={modelSkill} />
      <AirQualityCard data={airQuality} loading={loading} />
      <ForecastUncertaintyCard report={uncertainty} loading={loading} />
      <MicroclimateCard current={current} />
      <HydrologicRiskCard
        precipitation={hydroPrecipitation}
        flood={floodContext}
        assessment={hydrologicAssessment}
        officialAlerts={officialAlerts}
        loading={loading}
      />
    </div>
  );
}
