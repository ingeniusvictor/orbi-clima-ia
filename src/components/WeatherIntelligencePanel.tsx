import { useEffect, useMemo, useState } from 'react';
import { CurrentWeather, WeatherLocation } from '../types/weatherTypes';
import { AirQualitySnapshot, fetchOpenMeteoAirQuality } from '../services/openMeteoAirQualityService';
import { ForecastUncertaintyReport, fetchForecastUncertainty } from '../services/openMeteoEnsembleService';
import { FloodContextSnapshot, fetchOpenMeteoFloodContext } from '../services/openMeteoFloodService';
import { HydroPrecipSnapshot, fetchHydroPrecipContext } from '../services/openMeteoHydroPrecipService';
import { OfficialAlertsResult, fetchOfficialWeatherAlerts } from '../services/officialWeatherAlertsService';
import { buildHydrologicRiskAssessment } from '../utils/hydrologicRiskEngine';
import AirQualityCard from './AirQualityCard';
import ForecastUncertaintyCard from './ForecastUncertaintyCard';
import HydrologicRiskCard from './HydrologicRiskCard';
import MicroclimateCard from './MicroclimateCard';

interface WeatherIntelligencePanelProps {
  location: WeatherLocation;
  current: CurrentWeather;
  enabled: boolean;
}

export default function WeatherIntelligencePanel({ location, current, enabled }: WeatherIntelligencePanelProps) {
  const [airQuality, setAirQuality] = useState<AirQualitySnapshot | null>(null);
  const [uncertainty, setUncertainty] = useState<ForecastUncertaintyReport | null>(null);
  const [hydroPrecipitation, setHydroPrecipitation] = useState<HydroPrecipSnapshot | null>(null);
  const [floodContext, setFloodContext] = useState<FloodContextSnapshot | null>(null);
  const [officialAlerts, setOfficialAlerts] = useState<OfficialAlertsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const hydrologicAssessment = useMemo(() => {
    if (!hydroPrecipitation) return null;
    return buildHydrologicRiskAssessment({
      precipitation: hydroPrecipitation,
      flood: floodContext,
    });
  }, [hydroPrecipitation, floodContext]);

  useEffect(() => {
    let active = true;

    if (!enabled) {
      setAirQuality(null);
      setUncertainty(null);
      setHydroPrecipitation(null);
      setFloodContext(null);
      setOfficialAlerts(null);
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

      const [airResult, ensembleResult, hydroResult, floodResult, officialResult] = await Promise.allSettled([
        fetchOpenMeteoAirQuality(params),
        fetchForecastUncertainty(params),
        fetchHydroPrecipContext(params),
        fetchOpenMeteoFloodContext(params),
        fetchOfficialWeatherAlerts(location),
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
          <p className="text-xs text-slate-400 mt-0.5">Aire · microclima · ensemble · HydroWatch</p>
        </div>
        <span className="text-[9px] font-mono uppercase text-slate-500">OC-03</span>
      </div>

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
