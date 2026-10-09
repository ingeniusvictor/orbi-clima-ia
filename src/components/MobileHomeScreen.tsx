import React, { useState } from 'react';
import { WeatherProfile, WeatherLocation, CurrentWeather, HourlyForecast, DailyForecast, WeatherSourceState, SavedWeatherLocation } from '../types/weatherTypes';
import { ComparisonReport } from '../services/skyCoreMultiSourceService';
import WelcomeHeroSection from './WelcomeHeroSection';
import SkyCoreSummaryCard from './SkyCoreSummaryCard';
import SkyCoreTrustCard from './SkyCoreTrustCard';
import HourlyForecastStrip from './HourlyForecastStrip';
import DailyForecastList from './DailyForecastList';
import ClimateRiskPanel from './ClimateRiskPanel';
import LocationSearchPanel from './LocationSearchPanel';
import CompactSectionCard from './CompactSectionCard';
import SmartLocationsPanel from './SmartLocationsPanel';
import WeatherIntelligencePanel from './WeatherIntelligencePanel';
import {
  MapPin,
  CloudSun,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
  UserRound,
  HardHat,
  Umbrella,
  Sun,
  Droplets,
  Wind,
  Sparkles,
  LayoutGrid
} from 'lucide-react';

interface MobileHomeScreenProps {
  currentLocation: WeatherLocation;
  currentWeather: CurrentWeather;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  activeProfile: WeatherProfile;
  setActiveProfile: (profile: WeatherProfile) => void;
  skyCoreSummary: any;
  activeRisks: any[];
  selectedLocationId: string;
  handleDropdownChange: (id: string) => void;
  resetToDemo: () => void;
  weatherSourceState: WeatherSourceState;
  handleSelectCustomLocation: (loc: any) => void;
  handleUseMyLocation: () => void;
  isGpsLoading: boolean;
  gpsError: string | null;
  isLoading: boolean;
  onNavigateToWidgets: () => void;
  onNavigateToAlerts?: () => void;
  onRefresh?: () => void;
  comparisonReport?: ComparisonReport | null;
  locationOrigin: 'gps' | 'manual' | 'saved' | 'destination' | 'demo' | 'cache' | 'setup';
  savedLocations: SavedWeatherLocation[];
  onSaveLocation: (label: string, type: 'home' | 'work' | 'solar_park' | 'custom') => void;
  onDeleteLocation: (id: string) => void;
  onUpdateLocation: (id: string, updates: Partial<SavedWeatherLocation>) => void;
  onSelectSavedLocation: (loc: SavedWeatherLocation) => void;
  onSetAsDestination: () => void;
  nearbyMatch: { location: SavedWeatherLocation; distanceKm: number } | null;
  onAcceptNearbyMatch: () => void;
  onRejectNearbyMatch: () => void;
  showSaveSuggestion: boolean;
  onAcceptSaveSuggestion: () => void;
  onRejectSaveSuggestion: () => void;
}

export default function MobileHomeScreen({
  currentLocation,
  currentWeather,
  hourlyForecast,
  dailyForecast,
  activeProfile,
  setActiveProfile,
  skyCoreSummary,
  activeRisks,
  selectedLocationId,
  handleDropdownChange,
  resetToDemo,
  weatherSourceState,
  handleSelectCustomLocation,
  handleUseMyLocation,
  isGpsLoading,
  gpsError,
  isLoading,
  onNavigateToWidgets,
  onNavigateToAlerts,
  onRefresh,
  comparisonReport,
  locationOrigin,
  savedLocations,
  onSaveLocation,
  onDeleteLocation,
  onUpdateLocation,
  onSelectSavedLocation,
  onSetAsDestination,
  nearbyMatch,
  onAcceptNearbyMatch,
  onRejectNearbyMatch,
  showSaveSuggestion,
  onAcceptSaveSuggestion,
  onRejectSaveSuggestion
}: MobileHomeScreenProps) {
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [showFullForecast, setShowFullForecast] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getConditionNameSpanish = (cond: string) => {
    switch (cond) {
      case 'sunny': return 'Soleado';
      case 'partly_cloudy': return 'Parcial';
      case 'cloudy': return 'Nublado';
      case 'rain': return 'Lluvia';
      case 'storm': return 'Tormenta';
      case 'wind': return 'Ventoso';
      case 'cold': return 'Fresco';
      case 'hot': return 'Caluroso';
      case 'night': return 'Despejado';
      default: return 'Estable';
    }
  };

  const exactConditionLabel = (currentWeather as CurrentWeather & { conditionLabel?: string }).conditionLabel
    || getConditionNameSpanish(currentWeather.condition);

  const handleRefreshClick = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const handleCityChangeClick = () => {
    setIsLocationExpanded(true);
    setTimeout(() => {
      const el = document.getElementById('location-stations-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  const compactHourlyForecast = hourlyForecast.slice(0, 4);
  const intelligenceEnabled = weatherSourceState.provider !== 'mock'
    && weatherSourceState.mode !== 'mock'
    && weatherSourceState.mode !== 'fallback';

  const bestWindowRaw = skyCoreSummary?.bestWindow;
  const bestWindowText = typeof bestWindowRaw === 'string'
    ? bestWindowRaw
    : bestWindowRaw?.startTime && bestWindowRaw?.endTime
      ? `${bestWindowRaw.startTime}–${bestWindowRaw.endTime}`
      : 'según evolución del día';

  const isRainy = currentWeather.precipitationMm > 0
    || currentWeather.condition === 'rain'
    || currentWeather.condition === 'storm'
    || (dailyForecast[0]?.precipitationProbability ?? 0) > 40;

  const jacketLabel = currentWeather.temperatureC < 13
    ? 'Sí'
    : currentWeather.temperatureC < 18
      ? 'Ligera'
      : 'No';

  const umbrellaLabel = isRainy ? 'Sí' : 'No';
  const uvLabel = currentWeather.uvIndex >= 6
    ? 'Alto'
    : currentWeather.uvIndex >= 3
      ? 'Moderado'
      : 'Bajo';

  const personRecommendation = isRainy
    ? `Hay posibilidad de lluvia. Lleva paraguas y prioriza una salida cómoda en la ventana ${bestWindowText}.`
    : currentWeather.temperatureC < 13
      ? `Mañana fresca. Lleva una chaqueta y aprovecha la mejor ventana ${bestWindowText}.`
      : currentWeather.uvIndex >= 6
        ? `Día favorable, con radiación alta. Prefiere la ventana ${bestWindowText} y usa protección solar.`
        : `Condiciones agradables para salir. La mejor ventana estimada es ${bestWindowText}.`;

  const technicalState = currentWeather.condition === 'storm'
    || currentWeather.precipitationMm > 2
    || currentWeather.windSpeedKmh >= 35
      ? 'No recomendado'
      : currentWeather.windSpeedKmh >= 20
        || currentWeather.humidity >= 80
        || currentWeather.uvIndex >= 6
        || currentWeather.precipitationMm > 0
        ? 'Precaución'
        : 'Apto';

  const technicalRecommendation = technicalState === 'No recomendado'
    ? 'Condición operativa desfavorable. Revisa riesgos antes de cualquier maniobra en terreno.'
    : technicalState === 'Precaución'
      ? `Operación con precaución. Vigila humedad, viento y evolución del tiempo durante ${bestWindowText}.`
      : `Condición operativa favorable. Mantén controles estándar y seguimiento del pronóstico ${bestWindowText}.`;

  const riskPriority: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const mainRisk = [...activeRisks].sort((a, b) => {
    return (riskPriority[b?.level] || 0) - (riskPriority[a?.level] || 0);
  })[0];

  const riskBadge = mainRisk?.level === 'critical'
    ? 'Crítico'
    : mainRisk?.level === 'high'
      ? 'Alto'
      : mainRisk?.level === 'medium'
        ? 'Moderado'
        : mainRisk
          ? 'Estable'
          : 'Revisar';

  const riskTone = mainRisk?.level === 'critical'
    ? 'text-rose-300 border-rose-500/25 bg-rose-500/10'
    : mainRisk?.level === 'high'
      ? 'text-orange-300 border-orange-500/25 bg-orange-500/10'
      : mainRisk?.level === 'medium'
        ? 'text-amber-300 border-amber-500/25 bg-amber-500/10'
        : 'text-emerald-300 border-emerald-500/20 bg-emerald-500/10';

  return (
    <div
      className="space-y-4 animate-fade-in text-left"
      id="orbi-mobile-home-screen"
      style={{
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        paddingTop: 'env(safe-area-inset-top)'
      }}
    >
      <WelcomeHeroSection
        location={currentLocation}
        temperature={currentWeather.temperatureC}
        feelsLike={currentWeather.feelsLikeC}
        conditionText={exactConditionLabel}
        conditionCode={currentWeather.condition}
        skyCoreStatus={skyCoreSummary.generalSummary || ''}
        bestWindow={skyCoreSummary.bestWindow}
        sourceMode={weatherSourceState.provider === 'mock' ? 'mock' : (weatherSourceState.mode === 'cached' ? 'cache' : (weatherSourceState.mode === 'fallback' ? 'fallback' : 'api'))}
        activeProfile={activeProfile}
        isLoading={isLoading}
        currentWeather={currentWeather}
        locationOrigin={locationOrigin}
        onUseMyLocation={handleUseMyLocation}
        onCityChangeClick={handleCityChangeClick}
        isGpsLoading={isGpsLoading}
        gpsError={gpsError}
        onRefresh={onRefresh}
      />

      <section
        className="p-4 rounded-2xl bg-[#090f1e]/55 border border-white/5 space-y-3"
        aria-labelledby="home-forecast-title"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
              <span id="home-forecast-title">Próximas horas</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Lo esencial para planificar tu día.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleRefreshClick}
              disabled={!onRefresh || isRefreshing}
              aria-label="Actualizar clima"
              className="w-8 h-8 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/20 transition-all flex items-center justify-center disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowFullForecast(!showFullForecast)}
              className="h-8 flex items-center gap-1 text-[9px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-all uppercase bg-cyan-500/5 px-2.5 rounded-lg border border-cyan-500/10"
            >
              <span>{showFullForecast ? 'Menos' : '7 días'}</span>
              {showFullForecast ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <HourlyForecastStrip hourly={compactHourlyForecast} />

        {showFullForecast && (
          <div className="pt-3 border-t border-white/5 space-y-4 animate-fadeIn">
            {hourlyForecast.length > 4 && (
              <HourlyForecastStrip hourly={hourlyForecast.slice(4, 10)} />
            )}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[9px] font-mono text-slate-500 block uppercase">Perspectiva semanal</span>
              <DailyForecastList daily={dailyForecast} />
            </div>
          </div>
        )}
      </section>

      <section
        className={`p-4 rounded-2xl border ${activeProfile === 'field_tech' ? 'bg-amber-950/10 border-amber-500/15' : 'bg-cyan-950/10 border-cyan-500/15'}`}
        aria-labelledby="home-recommendation-title"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg ${activeProfile === 'field_tech' ? 'bg-amber-500/10 text-amber-300' : 'bg-cyan-500/10 text-cyan-300'}`}>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 id="home-recommendation-title" className="text-sm font-bold text-slate-100">Para hoy</h3>
              <p className="text-[10px] text-slate-500">Recomendación rápida ORBI</p>
            </div>
          </div>

          <div className="flex p-1 rounded-xl bg-black/20 border border-white/5 shrink-0" aria-label="Perfil de recomendación">
            <button
              onClick={() => setActiveProfile('person')}
              aria-pressed={activeProfile === 'person'}
              className={`h-7 px-2.5 rounded-lg flex items-center gap-1 text-[9px] font-bold transition-all ${activeProfile === 'person' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20' : 'text-slate-500 border border-transparent'}`}
            >
              <UserRound className="w-3 h-3" />
              Persona
            </button>
            <button
              onClick={() => setActiveProfile('field_tech')}
              aria-pressed={activeProfile === 'field_tech'}
              className={`h-7 px-2.5 rounded-lg flex items-center gap-1 text-[9px] font-bold transition-all ${activeProfile === 'field_tech' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20' : 'text-slate-500 border border-transparent'}`}
            >
              <HardHat className="w-3 h-3" />
              Técnico
            </button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-slate-200 font-medium">
          {activeProfile === 'field_tech' ? technicalRecommendation : personRecommendation}
        </p>

        {activeProfile === 'field_tech' ? (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-xl bg-white/[0.035] border border-white/5 p-2.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400 mb-1.5" />
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Viento</span>
              <strong className="text-xs text-slate-200">{Math.round(currentWeather.windSpeedKmh)} km/h</strong>
            </div>
            <div className="rounded-xl bg-white/[0.035] border border-white/5 p-2.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 mb-1.5" />
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Humedad</span>
              <strong className="text-xs text-slate-200">{Math.round(currentWeather.humidity)}%</strong>
            </div>
            <div className="rounded-xl bg-white/[0.035] border border-white/5 p-2.5">
              <Sun className="w-3.5 h-3.5 text-amber-400 mb-1.5" />
              <span className="text-[9px] text-slate-500 block uppercase font-mono">UV</span>
              <strong className="text-xs text-slate-200">{Math.round(currentWeather.uvIndex)}</strong>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="rounded-xl bg-white/[0.035] border border-white/5 p-2.5">
              <CloudSun className="w-3.5 h-3.5 text-cyan-400 mb-1.5" />
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Abrigo</span>
              <strong className="text-xs text-slate-200">{jacketLabel}</strong>
            </div>
            <div className="rounded-xl bg-white/[0.035] border border-white/5 p-2.5">
              <Umbrella className="w-3.5 h-3.5 text-cyan-400 mb-1.5" />
              <span className="text-[9px] text-slate-500 block uppercase font-mono">Paraguas</span>
              <strong className="text-xs text-slate-200">{umbrellaLabel}</strong>
            </div>
            <div className="rounded-xl bg-white/[0.035] border border-white/5 p-2.5">
              <Sun className="w-3.5 h-3.5 text-amber-400 mb-1.5" />
              <span className="text-[9px] text-slate-500 block uppercase font-mono">UV</span>
              <strong className="text-xs text-slate-200">{uvLabel}</strong>
            </div>
          </div>
        )}
      </section>

      <section className="p-4 rounded-2xl bg-[#090f1e]/65 border border-white/5" aria-labelledby="home-risk-title">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-white/5 text-amber-300 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 id="home-risk-title" className="text-sm font-bold text-slate-100">Alertas y riesgos</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {mainRisk ? mainRisk.label : 'Sin riesgo local destacado'}
              </p>
              <p className="text-[9px] text-slate-600 mt-1">La pestaña Alertas concentra avisos oficiales y detalles.</p>
            </div>
          </div>
          <span className={`text-[9px] font-mono font-bold uppercase px-2 py-1 rounded-lg border shrink-0 ${riskTone}`}>
            {riskBadge}
          </span>
        </div>
        <button
          onClick={() => onNavigateToAlerts?.()}
          className="w-full mt-3 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold text-slate-300 transition-all"
        >
          Ver alertas y detalles
        </button>
      </section>

      <section className="rounded-2xl bg-[#090f1e]/55 border border-white/5 overflow-hidden" id="home-advanced-analysis">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          className="w-full p-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.025] transition-all"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-bold text-slate-200">Análisis avanzado</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              SENAPRED, fuentes, AQI, ensemble, microclima, HydroWatch y SkyCore.
            </p>
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
        </button>

        {showAdvanced && (
          <div className="px-3 pb-4 pt-1 border-t border-white/5 space-y-4 animate-fadeIn">
            <WeatherIntelligencePanel
              location={currentLocation}
              current={currentWeather}
              enabled={intelligenceEnabled}
            />

            <ClimateRiskPanel risks={activeRisks} />

            <SkyCoreSummaryCard
              summary={skyCoreSummary}
              profile={activeProfile}
              comparisonReport={comparisonReport}
            />

            <SkyCoreTrustCard
              sourceState={weatherSourceState}
              location={currentLocation}
            />

            <button
              onClick={onNavigateToWidgets}
              className="w-full h-10 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/15 text-indigo-300 text-[10px] font-bold flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Ir a Widgets
            </button>
          </div>
        )}
      </section>

      {isLocationExpanded && (
        <div id="location-stations-card" className="animate-fadeIn">
          <CompactSectionCard
            title="Ubicación y estaciones"
            subtitle={`${currentLocation.name} · Cambiar o buscar coordenadas`}
            status={weatherSourceState.provider === 'mock' ? 'DEMO' : 'EN VIVO'}
            icon={<MapPin className="w-4 h-4 text-cyan-400" />}
            expanded={isLocationExpanded}
            onToggle={setIsLocationExpanded}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Estaciones disponibles</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedLocationId}
                      onChange={(e) => handleDropdownChange(e.target.value)}
                      className="w-full bg-[#050914] border border-white/10 hover:border-cyan-500/30 text-xs text-white rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer transition-all font-sans font-medium appearance-none"
                    >
                      <option value="rancagua">Rancagua · Live</option>
                      <option value="santiago">Santiago · Live</option>
                      <option value="parque_fotovoltaico_orbi">Parque Fotovoltaico Demo (Radiación UV)</option>
                      {selectedLocationId === 'gps_location' && (
                        <option value="gps_location">📍 Mi Ubicación (GPS)</option>
                      )}
                      {selectedLocationId === 'custom_search' && (
                        <option value="custom_search">🔍 {currentLocation.name}</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40 text-[10px]">
                      ▼
                    </div>
                  </div>

                  {weatherSourceState.provider !== 'mock' && (
                    <button
                      onClick={resetToDemo}
                      className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 active:bg-amber-500/30 border border-amber-500/20 text-amber-400 text-[10px] font-mono rounded-xl transition-all cursor-pointer font-bold uppercase"
                    >
                      Demo
                    </button>
                  )}
                </div>
              </div>

              <LocationSearchPanel
                onSelectLocation={handleSelectCustomLocation}
                onUseMyLocation={handleUseMyLocation}
                isGpsLoading={isGpsLoading}
                gpsError={gpsError}
                currentLocationName={currentLocation.name}
              />

              <div className="border-t border-white/5 pt-4">
                <SmartLocationsPanel
                  currentLocation={currentLocation}
                  locationOrigin={locationOrigin}
                  savedLocations={savedLocations}
                  onSaveLocation={onSaveLocation}
                  onDeleteLocation={onDeleteLocation}
                  onUpdateLocation={onUpdateLocation}
                  onSelectSavedLocation={onSelectSavedLocation}
                  onSetAsDestination={onSetAsDestination}
                  onUseMyLocation={handleUseMyLocation}
                  isGpsLoading={isGpsLoading}
                  gpsError={gpsError}
                  nearbyMatch={nearbyMatch}
                  onAcceptNearbyMatch={onAcceptNearbyMatch}
                  onRejectNearbyMatch={onRejectNearbyMatch}
                  showSaveSuggestion={showSaveSuggestion}
                  onAcceptSaveSuggestion={onAcceptSaveSuggestion}
                  onRejectSaveSuggestion={onRejectSaveSuggestion}
                />
              </div>
            </div>
          </CompactSectionCard>
        </div>
      )}
    </div>
  );
}
