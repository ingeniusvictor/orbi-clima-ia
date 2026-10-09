import { useState, useEffect, useMemo } from 'react';
import { mockLocationsData } from './data/mockWeatherData';
import { WeatherProfile, WeatherLocation, CurrentWeather, HourlyForecast, DailyForecast, WeatherSourceState, LocationSearchResult, PreferredWidgetVariant } from './types/weatherTypes';
import { buildClimateRisks } from './utils/weatherRiskEngine';
import { buildSkyCoreSummary } from './utils/orbiSkyCoreNarrative';

// Services & Utilities
import { fetchOpenMeteoForecast } from './services/openMeteoClient';
import { requestCurrentPosition, reverseGeocode } from './services/geolocationService';
import { adaptOpenMeteoCurrent, adaptOpenMeteoHourly, adaptOpenMeteoDaily } from './services/weatherDataAdapter';
import { saveLastWeatherBundle, loadLastWeatherBundle } from './services/weatherCacheService';
import { ComparisonReport, runSkyCoreComparison } from './services/skyCoreMultiSourceService';
import { Capacitor } from '@capacitor/core';
import { SavedWeatherLocation } from './types/weatherTypes';
import { 
  getSavedLocations, 
  addSavedLocation, 
  updateSavedLocation, 
  deleteSavedLocation, 
  markLocationAsUsed, 
  findNearbySavedLocation 
} from './services/savedLocationsService';

// Components
import OrbiClimateCore from './components/OrbiClimateCore';
import ProfileSelector from './components/ProfileSelector';
import PersonProfilePanel from './components/PersonProfilePanel';
import FieldTechProfilePanel from './components/FieldTechProfilePanel';
import HourlyForecastStrip from './components/HourlyForecastStrip';
import DailyForecastList from './components/DailyForecastList';
import ClimateRiskPanel from './components/ClimateRiskPanel';
import SkyCoreSummaryCard from './components/SkyCoreSummaryCard';
import WidgetsPreviews from './components/WidgetsPreviews';
import WeatherSourceReadinessPanel from './components/WeatherSourceReadinessPanel';
import OrbiSignatureClimate from './components/OrbiSignatureClimate';

import LocationSearchPanel from './components/LocationSearchPanel';
import LiveWeatherStatusBadge from './components/LiveWeatherStatusBadge';
import WeatherDataModeBanner from './components/WeatherDataModeBanner';

import AndroidWidgetReadinessPanel from './components/AndroidWidgetReadinessPanel';
import { buildAndroidWidgetContract, syncAndroidWidgetContract, OrbiWidgetContract } from './services/androidWidgetService';
import { buildAdvancedSkyCoreAnalysis } from './utils/weatherRiskEngine';
import { buildSmartWeatherAlerts } from './utils/skyCoreAlertEngine';
import SmartAlertsPanel from './components/SmartAlertsPanel';
import NotificationSettingsPanel, { PREFS_STORAGE_KEY, DEFAULT_PREFERENCES } from './components/NotificationSettingsPanel';
import SmartSchedulerPanel from './components/SmartSchedulerPanel';
import { loadUserPreferences } from './services/userPreferencesService';
import { initializePreferencesSync } from './services/preferencesSyncService';
import UserPreferencesPanel from './components/UserPreferencesPanel';

// Módulo 8A - Premium Store Experience Components
import FirstLaunchOnboarding from './components/FirstLaunchOnboarding';
import WelcomeHeroSection from './components/WelcomeHeroSection';
import ProfileExplanationCards from './components/ProfileExplanationCards';
import WidgetShowcaseCard from './components/WidgetShowcaseCard';
import PublicPolishChecklist from './components/PublicPolishChecklist';
import StoreReadinessPanel from './components/StoreReadinessPanel';
import ReleaseCandidateQaCenter from './components/ReleaseCandidateQaCenter';
import AndroidPackagingReadinessPanel from './components/AndroidPackagingReadinessPanel';

// Módulo 9C - Mobile Screens & Bottom Navigation Imports
import MobileBottomNav, { MobileTab } from './components/MobileBottomNav';
import MobileHomeScreen from './components/MobileHomeScreen';
import MobileAlertsScreen from './components/MobileAlertsScreen';
import MobileWidgetsScreen from './components/MobileWidgetsScreen';
import MobileSettingsScreen from './components/MobileSettingsScreen';
import AdvancedOrbiConsole from './components/AdvancedOrbiConsole';
import { isDeveloperModeEnabled } from './components/DeveloperModeGate';

// Notification Imports
import { buildNotificationCandidatesFromAlerts } from './services/notificationCandidateBuilder';
import { shouldSendNotification } from './utils/notificationDedupEngine';
import { sendOrbiLocalNotification } from './services/orbiNotificationService';
import { loadNotificationHistory } from './services/notificationHistoryService';
import { checkOrbiNotificationPermission } from './services/notificationPermissionService';

import { CloudRain, MapPin, Sparkles, Sliders, Info, HelpCircle, Bell } from 'lucide-react';

export default function App() {
  // Synchronously load cache on startup to avoid any layout flicker on boot (Requirement 2 & 3)
  const initialBundle = useMemo(() => {
    try {
      const raw = localStorage.getItem('orbi_clima_last_weather_bundle_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.data && parsed.data.location && parsed.data.current) {
          return parsed.data;
        }
      }
    } catch (e) {
      console.warn('Cache read failed on startup:', e);
    }
    return null;
  }, []);

  const initialSourceState = useMemo(() => {
    try {
      const raw = localStorage.getItem('orbi_weather_source_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) return parsed;
      }
    } catch (e) {}
    return null;
  }, []);

  const [isBootHydratingWeather, setIsBootHydratingWeather] = useState(true);

  const [selectedLocationId, setSelectedLocationId] = useState<string>(() => {
    if (initialBundle) {
      return initialBundle.location.id === 'gps_location' ? 'gps_location' : 'custom_search';
    }
    return 'initial_setup';
  });

  const [currentLocation, setCurrentLocation] = useState<WeatherLocation>(() => {
    if (initialBundle) {
      return initialBundle.location;
    }
    return {
      id: 'initial_setup',
      name: 'Configurar ubicación',
      region: 'Sin ubicación activa',
      country: 'Chile',
      latitude: -34.1708,
      longitude: -70.7444,
      timezone: 'America/Santiago'
    };
  });

  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(() => {
    if (initialBundle) {
      return initialBundle.current;
    }
    return {
      ...mockLocationsData[0].current,
      condition: 'setup' as any, // Neutral aesthetic theme (Requirement 4)
    };
  });

  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>(() => {
    if (initialBundle) {
      return initialBundle.hourly;
    }
    return mockLocationsData[0].hourly;
  });

  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>(() => {
    if (initialBundle) {
      return initialBundle.daily;
    }
    return mockLocationsData[0].daily;
  });

  const [activeProfile, setActiveProfile] = useState<WeatherProfile>('person');
  const [skyCoreComparison, setSkyCoreComparison] = useState<ComparisonReport | null>(null);
  
  // Weather source state - default to live API mode rather than mock
  const [weatherSourceState, setWeatherSourceState] = useState<WeatherSourceState>(() => {
    if (initialSourceState) {
      return initialSourceState;
    }
    return {
      provider: 'open_meteo',
      mode: 'live',
      status: 'success',
      lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      isLive: true
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [locationOrigin, setLocationOrigin] = useState<'gps' | 'manual' | 'saved' | 'destination' | 'demo' | 'cache' | 'setup'>(() => {
    if (initialBundle) {
      return initialBundle.location.id === 'gps_location' ? 'gps' : 'saved';
    }
    return 'setup';
  });

  // Smart Locations State (Módulo 1.0.6A)
  const [savedLocations, setSavedLocations] = useState<SavedWeatherLocation[]>(() => getSavedLocations());
  const [nearbyMatch, setNearbyMatch] = useState<{ location: SavedWeatherLocation; distanceKm: number } | null>(null);
  const [showSaveSuggestion, setShowSaveSuggestion] = useState<boolean>(false);
  const [preferredWidgetVariant, setPreferredWidgetVariant] = useState<PreferredWidgetVariant>(() => loadUserPreferences().preferredWidgetVariant);

  // Módulo 9C Mobile Shell States
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [advancedConsoleOpen, setAdvancedConsoleOpen] = useState(false);

  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('orbi_clima_first_launch_completed_v1') === 'true';
  });

  const [isMobileScreen, setIsMobileScreen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const isNative = useMemo(() => {
    try {
      return Capacitor.isNativePlatform();
    } catch (e) {
      return false;
    }
  }, []);

  // Mount effect to initialize notification channels (Módulo 5) and preferences sync (Módulo 7A)
  useEffect(() => {
    // Platform detection for Android WebView flicker guard
    try {
      const platform = Capacitor.getPlatform();
      const isAndroidDevice = platform === 'android' || navigator.userAgent.toLowerCase().includes('android');
      if (isAndroidDevice) {
        document.documentElement.classList.add('capacitor-android', 'android-webview');
      }
    } catch (e) {
      console.warn('Flicker guard platform check skipped:', e);
    }

    const initNotifications = async () => {
      const { initializeOrbiNotificationChannels } = await import('./services/orbiNotificationService');
      await initializeOrbiNotificationChannels();
    };
    initNotifications();

    // Start preferences bidirectional sync
    const cleanupSync = initializePreferencesSync();

    // Load initial user preferences on startup
    const prefs = loadUserPreferences();
    if (prefs.preferredProfile) {
      setActiveProfile(prefs.preferredProfile);
    }

    const defaultRancagua: WeatherLocation = {
      id: 'initial_setup',
      name: 'Configurar ubicación',
      region: 'Sin ubicación activa',
      country: 'Chile',
      latitude: -34.1708,
      longitude: -70.7444,
      timezone: 'America/Santiago'
    };

    const cached = loadLastWeatherBundle();
    if (cached) {
      // Warm boot: Already hydrated synchronously, let's trigger a soft background refresh (Requirement 3)
      loadWeatherForLocation(cached.location, false).finally(() => {
        setIsBootHydratingWeather(false);
      });
    } else if (prefs.preferredLocation) {
      const loc: WeatherLocation = {
        id: prefs.preferredLocation.id,
        name: prefs.preferredLocation.name,
        region: prefs.preferredLocation.region || '',
        country: prefs.preferredLocation.country,
        latitude: prefs.preferredLocation.latitude,
        longitude: prefs.preferredLocation.longitude,
        timezone: 'America/Santiago'
      };
      setSelectedLocationId(loc.id === 'gps_location' ? 'gps_location' : 'custom_search');
      // No cache, but preferred location: Load with foreground loader (Requirement 2)
      loadWeatherForLocation(loc, true).finally(() => {
        setIsBootHydratingWeather(false);
      });
      setLocationOrigin(loc.id === 'gps_location' ? 'gps' : 'saved');
    } else {
      // Cold boot: First install or cleared data (Requirement 4)
      setSelectedLocationId('initial_setup');
      setLocationOrigin('setup');
      setIsBootHydratingWeather(false);
    }

    const handlePrefsChange = () => {
      const p = loadUserPreferences();
      setPreferredWidgetVariant(p.preferredWidgetVariant);
      if (p.preferredProfile) {
        setActiveProfile(p.preferredProfile);
      }
    };
    window.addEventListener('orbi-user-preferences-changed', handlePrefsChange);

    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cleanupSync();
      window.removeEventListener('orbi-user-preferences-changed', handlePrefsChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-GPS on startup if permission is already granted (Módulo 1.0.6A-FIX1)
  useEffect(() => {
    const autoFetchGpsOnStartup = async () => {
      // Small delay to ensure startup loading doesn't freeze UI
      await new Promise(resolve => setTimeout(resolve, 800));
      try {
        const { checkGeolocationPermissionOnly } = await import('./services/geolocationService');
        const hasGpsPermission = await checkGeolocationPermissionOnly();
        if (hasGpsPermission) {
          console.log('GPS permission already granted, attempting silent foreground refresh...');
          await handleUseMyLocation();
        }
      } catch (e) {
        console.warn('Auto-GPS startup update skipped:', e);
      }
    };
    
    const prefs = loadUserPreferences();
    if (!prefs.preferredLocation || prefs.preferredLocation.id === 'gps_location') {
      autoFetchGpsOnStartup();
    }
  }, []);

  // Synchronize weatherSourceState with localStorage for orbiNotificationService
  useEffect(() => {
    localStorage.setItem('orbi_weather_source_state', JSON.stringify(weatherSourceState));
  }, [weatherSourceState]);

  // Record profile use in local memory (Módulo 7B)
  useEffect(() => {
    import('./services/weatherMemoryService').then(({ recordProfileUse }) => {
      recordProfileUse(activeProfile);
    });
  }, [activeProfile]);

  // Trigger Multi-Source weather comparison when weather data updates
  useEffect(() => {
    let active = true;
    const computeComparison = async () => {
      try {
        const report = await runSkyCoreComparison(currentLocation, {
          current: currentWeather,
          hourly: hourlyForecast,
          daily: dailyForecast
        });
        if (active) {
          setSkyCoreComparison(report);
        }
      } catch (e) {
        console.error('Error computing SkyCore comparison report:', e);
      }
    };
    computeComparison();
    return () => {
      active = false;
    };
  }, [currentLocation, currentWeather, hourlyForecast, dailyForecast]);

  const loadWeatherForLocation = async (loc: WeatherLocation, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setGpsError(null);
    try {
      const rawData = await fetchOpenMeteoForecast({
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone || 'America/Santiago'
      });

      const currentAdapted = adaptOpenMeteoCurrent(rawData);
      const hourlyAdapted = adaptOpenMeteoHourly(rawData);
      const dailyAdapted = adaptOpenMeteoDaily(rawData);

      setCurrentLocation(loc);
      setCurrentWeather(currentAdapted);
      setHourlyForecast(hourlyAdapted);
      setDailyForecast(dailyAdapted);

      // Record location use in memory (Módulo 7B)
      if (loc.id !== 'gps_location') {
        const sourceVal = (loc.id.startsWith('custom_') || !isNaN(Number(loc.id))) ? 'manual' : 'demo';
        import('./services/weatherMemoryService').then(({ recordLocationUse }) => {
          recordLocationUse({
            id: loc.id,
            name: loc.name,
            region: loc.region || '',
            country: loc.country || 'Chile',
            source: sourceVal
          });
        });
      }

      const bundle = {
        location: loc,
        current: currentAdapted,
        hourly: hourlyAdapted,
        daily: dailyAdapted
      };
      saveLastWeatherBundle(bundle);

      setWeatherSourceState({
        provider: 'open_meteo',
        mode: 'live',
        status: 'success',
        lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        isLive: true
      });
    } catch (err: any) {
      console.error('Failed to fetch OpenMeteo:', err);
      
      // Attempt cache load
      const cached = loadLastWeatherBundle();
      if (cached) {
        setCurrentLocation(cached.location);
        setCurrentWeather(cached.current);
        setHourlyForecast(cached.hourly);
        setDailyForecast(cached.daily);
        setWeatherSourceState({
          provider: 'open_meteo',
          mode: 'cached',
          status: 'cached',
          lastUpdated: new Date(cached.timestamp || Date.now()).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          errorMessage: err.message || 'Error de conexión',
          isLive: true
        });
      } else {
        // Fallback to mock
        const matchedMock = mockLocationsData.find(m => m.location.id === loc.id) || mockLocationsData[0];
        setCurrentLocation(matchedMock.location);
        setCurrentWeather(matchedMock.current);
        setHourlyForecast(matchedMock.hourly);
        setDailyForecast(matchedMock.daily);
        setWeatherSourceState({
          provider: 'mock',
          mode: 'fallback',
          status: 'fallback',
          lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          errorMessage: err.message || 'Error de conexión',
          isLive: false
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownChange = async (locId: string) => {
    setSelectedLocationId(locId);
    if (locId === 'custom_search' || locId === 'gps_location') return;

    const matchedMock = mockLocationsData.find(l => l.location.id === locId);
    if (matchedMock) {
      await loadWeatherForLocation(matchedMock.location);
      setLocationOrigin(locId === 'rancagua' ? 'demo' : 'manual');
    }
  };

  const handleSelectCustomLocation = async (locResult: LocationSearchResult) => {
    setSelectedLocationId('custom_search');
    const mappedLoc: WeatherLocation = {
      id: String(locResult.id),
      name: locResult.name,
      region: locResult.region || '',
      country: locResult.country,
      latitude: locResult.latitude,
      longitude: locResult.longitude,
      timezone: locResult.timezone || 'America/Santiago'
    };
    await loadWeatherForLocation(mappedLoc);
    setLocationOrigin('manual');
    setNearbyMatch(null);
    setShowSaveSuggestion(false);
  };

  const handleUseMyLocation = async () => {
    setIsGpsLoading(true);
    setGpsError(null);
    setNearbyMatch(null);
    setShowSaveSuggestion(false);
    try {
      const pos = await requestCurrentPosition();
      let resolvedName = 'Mi Ubicación';
      let resolvedRegion = 'GPS Detectado';
      try {
        const geo = await reverseGeocode(pos.latitude, pos.longitude);
        if (geo && geo.name) {
          resolvedName = geo.name;
          resolvedRegion = geo.region;
        }
      } catch (e) {
        console.warn('Geocoding failed, using default', e);
      }

      const customLoc: WeatherLocation = {
        id: 'gps_location',
        name: resolvedName,
        region: resolvedRegion,
        country: 'Chile',
        latitude: pos.latitude,
        longitude: pos.longitude,
        timezone: 'America/Santiago'
      };
      setSelectedLocationId('gps_location');
      await loadWeatherForLocation(customLoc);
      setLocationOrigin('gps');

      // 6. Proximity check for smart locations
      const matched = findNearbySavedLocation(pos.latitude, pos.longitude, 5.0);
      if (matched) {
        setNearbyMatch(matched);
      } else {
        // Sugerencia de guardar ubicación nueva si no coincide con ninguna guardada
        setShowSaveSuggestion(true);
      }
    } catch (err: any) {
      setGpsError(err.message || 'No se pudo acceder a tu ubicación.');
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Smart Locations Handlers
  const handleSaveLocation = (label: string, type: 'home' | 'work' | 'solar_park' | 'custom') => {
    addSavedLocation({
      name: currentLocation.name,
      label: label,
      type: type,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      region: currentLocation.region || '',
      country: currentLocation.country || 'Chile',
      source: locationOrigin === 'gps' ? 'gps' : 'manual'
    });
    const updated = getSavedLocations();
    setSavedLocations(updated);
    setShowSaveSuggestion(false);
    setLocationOrigin('saved');
  };

  const handleDeleteLocation = (id: string) => {
    deleteSavedLocation(id);
    setSavedLocations(getSavedLocations());
  };

  const handleUpdateLocation = (id: string, updates: Partial<SavedWeatherLocation>) => {
    updateSavedLocation(id, updates);
    setSavedLocations(getSavedLocations());
  };

  const handleSelectSavedLocation = async (loc: SavedWeatherLocation) => {
    const mappedLoc: WeatherLocation = {
      id: loc.id,
      name: loc.name,
      region: loc.region,
      country: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: 'America/Santiago'
    };
    setSelectedLocationId('custom_search');
    await loadWeatherForLocation(mappedLoc);
    setLocationOrigin('saved');
    markLocationAsUsed(loc.id);
    setSavedLocations(getSavedLocations());
    setNearbyMatch(null);
    setShowSaveSuggestion(false);
  };

  const handleSetAsDestination = () => {
    setLocationOrigin('destination');
  };

  const handleAcceptNearbyMatch = async () => {
    if (nearbyMatch) {
      await handleSelectSavedLocation(nearbyMatch.location);
      setNearbyMatch(null);
    }
  };

  const handleRejectNearbyMatch = () => {
    setNearbyMatch(null);
    setShowSaveSuggestion(true);
  };

  const handleAcceptSaveSuggestion = () => {
    setShowSaveSuggestion(false);
    // Find the save button/form and open it
    const saveTrigger = document.querySelector('[id="smart-locations-panel"] button');
    if (saveTrigger) {
      (saveTrigger as HTMLButtonElement).click();
    }
  };

  const handleRejectSaveSuggestion = () => {
    setShowSaveSuggestion(false);
  };

  const resetToDemo = () => {
    const defaultMock = mockLocationsData[0];
    setCurrentLocation(defaultMock.location);
    setCurrentWeather(defaultMock.current);
    setHourlyForecast(defaultMock.hourly);
    setDailyForecast(defaultMock.daily);
    setSelectedLocationId('rancagua');
    setLocationOrigin('demo');
    setWeatherSourceState({
      provider: 'mock',
      mode: 'mock',
      status: 'success',
      lastUpdated: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      isLive: false
    });
  };

  // Execute Local Engines
  const activeRisks = buildClimateRisks(currentWeather, hourlyForecast, dailyForecast, activeProfile);
  const skyCoreSummary = buildSkyCoreSummary(currentWeather, hourlyForecast, dailyForecast, activeProfile);

  // Compute live advanced analysis
  const advancedAnalysis = useMemo(() => buildAdvancedSkyCoreAnalysis({
    current: currentWeather,
    hourly: hourlyForecast,
    daily: dailyForecast,
    profile: activeProfile,
  }), [currentWeather, hourlyForecast, dailyForecast, activeProfile]);

  // Compute smart alerts
  const smartAlerts = useMemo(() => buildSmartWeatherAlerts({
    current: currentWeather,
    hourly: hourlyForecast,
    daily: dailyForecast,
    profile: activeProfile,
    advancedAnalysis,
  }), [currentWeather, hourlyForecast, dailyForecast, activeProfile, advancedAnalysis]);

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

  // Compute active widget contract directly during render (derived state) to avoid state sync infinite loops
  const activeContract = useMemo(() => {
    const topAlert = smartAlerts[0];
    return buildAndroidWidgetContract({
      locationName: currentLocation.name,
      currentTemperatureC: currentWeather.temperatureC,
      conditionLabel: getConditionNameSpanish(currentWeather.condition),
      conditionCode: currentWeather.condition,
      advancedAnalysis,
      sourceMode: weatherSourceState.mode,
      lastUpdated: weatherSourceState.lastUpdated || '',
      profile: activeProfile,
      currentFeelsLikeC: currentWeather.feelsLikeC,
      currentHumidity: currentWeather.humidity,
      currentWindSpeedKmh: currentWeather.windSpeedKmh,
      currentWindGustKmh: currentWeather.windGustKmh,
      currentUvIndex: currentWeather.uvIndex,
      hourlyList: hourlyForecast,
      visualVariantHint: preferredWidgetVariant,
      mainAlertTitle: topAlert?.title || '',
      mainAlertSeverity: topAlert?.severity || 'info',
      mainAlertMessage: topAlert?.message || '',
      mainAlertTimeLabel: topAlert?.timeLabel || '',
    });
  }, [currentLocation, currentWeather, activeProfile, weatherSourceState.mode, weatherSourceState.lastUpdated, hourlyForecast, smartAlerts, advancedAnalysis, preferredWidgetVariant]);

  // Sync contract via effect without triggering state updates
  useEffect(() => {
    syncAndroidWidgetContract(activeContract);
  }, [activeContract]);

  // --- MÓDULO 5: Web Toast Simulation State ---
  const [activeToast, setActiveToast] = useState<{ title: string; body: string; severity: string } | null>(null);

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      setActiveToast({
        title: data.title,
        body: data.body,
        severity: data.severity
      });
    };

    window.addEventListener('orbi-web-notification', handleNotification);
    return () => {
      window.removeEventListener('orbi-web-notification', handleNotification);
    };
  }, []);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // --- MÓDULO 5: Controlled Local Notifications Trigger ---
  useEffect(() => {
    const checkAndSend = async () => {
      const perm = await checkOrbiNotificationPermission();
      if (perm !== 'granted') {
        console.log('Notifications skipped: permission not granted.');
        return;
      }

      // Load user preferences
      let prefs = DEFAULT_PREFERENCES;
      try {
        const saved = localStorage.getItem(PREFS_STORAGE_KEY);
        if (saved) {
          prefs = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error reading preferences in notification trigger:', e);
      }

      const activeUserPrefs = loadUserPreferences();

      // Filter alerts according to active preferences and sensitivity level
      const filteredAlerts = smartAlerts.filter(alert => {
        if (alert.profile !== activeProfile) return false;

        // Apply sensitivity filtering (Low filters out info and watch)
        if (activeUserPrefs.alertSensitivity === 'low') {
          if (alert.severity === 'info' || alert.severity === 'watch') return false;
        }

        if (activeProfile === 'person') {
          if (alert.category === 'rain') return prefs.person.rain;
          if (alert.category === 'uv') return prefs.person.uv;
          if (alert.category === 'cold' || alert.category === 'heat') return prefs.person.temp;
          if (alert.category === 'wind' || alert.category === 'gusts') return prefs.person.wind;
          return true; // default other categories to true
        } else {
          if (alert.category === 'humidity') return prefs.field_tech.humidity;
          if (alert.category === 'wind' || alert.category === 'gusts') return prefs.field_tech.wind;
          if (alert.category === 'rain') return prefs.field_tech.rain;
          if (alert.category === 'storm') return prefs.field_tech.storm;
          if (alert.category === 'uv') return prefs.field_tech.uv;
          return true; // default other categories to true
        }
      });

      if (filteredAlerts.length === 0) return;

      // Build candidates
      const candidates = buildNotificationCandidatesFromAlerts({
        alerts: filteredAlerts,
        profile: activeProfile,
        allowWatch: true,
      });

      if (candidates.length === 0) return;

      const candidate = candidates[0];

      // Check data freshness (Rule: Max 90 mins old)
      const lastUpdatedStr = currentWeather.updatedAt || weatherSourceState.lastUpdated;
      if (lastUpdatedStr) {
        const lastUpdated = new Date(lastUpdatedStr);
        const ageMs = Date.now() - lastUpdated.getTime();
        const ageMinutes = ageMs / (1000 * 60);
        if (ageMinutes > 90) {
          console.log(`Weather data is too old (${Math.round(ageMinutes)} mins). Automatic notifications suppressed.`);
          return;
        }
      }

      // Check deduplication & frequency caps
      const history = loadNotificationHistory();
      const isDemo = weatherSourceState.mode === 'mock';
      const isFallback = weatherSourceState.mode === 'fallback';

      if (isFallback) {
        console.log('Notification suppressed: active Weather Mode is Fallback.');
        return;
      }

      const shouldSend = shouldSendNotification({
        candidate,
        history,
        cooldownMinutes: 90,
        isDemo,
      });

      if (shouldSend) {
        await sendOrbiLocalNotification(candidate);
      }
    };

    checkAndSend();
  }, [smartAlerts, activeProfile, weatherSourceState.mode, weatherSourceState.lastUpdated, currentWeather.updatedAt]);

  const handleGoToPreferences = () => {
    setActiveTab('settings');
  };

  const showSimulatedStatusBar = !isMobileScreen && !isNative;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center font-sans selection:bg-cyan-500/30 selection:text-cyan-200 py-0 md:py-8 px-0 sm:px-4 relative overflow-hidden">
      
      {!onboardingCompleted && (
        <FirstLaunchOnboarding onComplete={() => setOnboardingCompleted(true)} />
      )}
      
      {/* Top ambient aura lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 
        This is a responsive wrapper:
        - On desktop / tablet: centers a gorgeous simulated Android device container with metal borders and realistic details.
        - On mobile/small screen: runs borderless, native full screen.
      */}
      <div className="w-full max-w-md md:max-w-md min-h-screen md:min-h-[850px] md:h-[850px] flex flex-col bg-[#050914] md:rounded-[40px] md:border-[10px] md:border-slate-800/90 md:shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden transition-all duration-300">
        
        {/* Simulated Android Status Bar */}
        {showSimulatedStatusBar && (
          <div 
            className="bg-black/35 backdrop-blur-md px-5 flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 select-none z-30 shrink-0 border-b border-white/5 relative"
            style={{ paddingTop: 'calc(10px + env(safe-area-inset-top))', paddingBottom: '10px' }}
          >
            <div className="flex items-center gap-1.5">
              <span>ORBI Clima <span className="text-emerald-400 font-extrabold">IA</span></span>
              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1 py-0.5 rounded scale-90">5G</span>
            </div>
            <div className="w-16 h-3 bg-black rounded-full absolute left-1/2 -translate-x-1/2 hidden md:block" /> {/* Simulated camera notch */}
            <div className="flex items-center gap-2">
              <span>{new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</span>
              <span>🔋 99%</span>
            </div>
          </div>
        )}

        {/* Scrollable Container Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 text-left scrollbar-thin flex flex-col gap-4 z-10 relative"
          style={{ 
            paddingTop: showSimulatedStatusBar ? '16px' : 'calc(16px + env(safe-area-inset-top))',
            paddingBottom: 'calc(96px + env(safe-area-inset-bottom))' 
          }}
        >
          {/* Banner notification mode if live data mode changed */}
          <WeatherDataModeBanner 
            state={weatherSourceState} 
            onResetToDemo={resetToDemo} 
            onRetry={() => loadWeatherForLocation(currentLocation)}
          />

          {advancedConsoleOpen && isDeveloperModeEnabled() ? (
            <AdvancedOrbiConsole onBack={() => setAdvancedConsoleOpen(false)} />
          ) : (
            <>
              {activeTab === 'home' && (
                <MobileHomeScreen
                  currentLocation={currentLocation}
                  currentWeather={currentWeather}
                  hourlyForecast={hourlyForecast}
                  dailyForecast={dailyForecast}
                  activeProfile={activeProfile}
                  setActiveProfile={setActiveProfile}
                  skyCoreSummary={skyCoreSummary}
                  activeRisks={activeRisks}
                  selectedLocationId={selectedLocationId}
                  handleDropdownChange={handleDropdownChange}
                  resetToDemo={resetToDemo}
                  weatherSourceState={weatherSourceState}
                  handleSelectCustomLocation={handleSelectCustomLocation}
                  handleUseMyLocation={handleUseMyLocation}
                  isGpsLoading={isGpsLoading}
                  gpsError={gpsError}
                  isLoading={isLoading}
                  onNavigateToWidgets={() => setActiveTab('widgets')}
                  onNavigateToAlerts={() => setActiveTab('alerts')}
                  onRefresh={() => loadWeatherForLocation(currentLocation)}
                  comparisonReport={skyCoreComparison}
                  locationOrigin={locationOrigin}
                  savedLocations={savedLocations}
                  onSaveLocation={handleSaveLocation}
                  onDeleteLocation={handleDeleteLocation}
                  onUpdateLocation={handleUpdateLocation}
                  onSelectSavedLocation={handleSelectSavedLocation}
                  onSetAsDestination={handleSetAsDestination}
                  nearbyMatch={nearbyMatch}
                  onAcceptNearbyMatch={handleAcceptNearbyMatch}
                  onRejectNearbyMatch={handleRejectNearbyMatch}
                  showSaveSuggestion={showSaveSuggestion}
                  onAcceptSaveSuggestion={handleAcceptSaveSuggestion}
                  onRejectSaveSuggestion={handleRejectSaveSuggestion}
                />
              )}

              {activeTab === 'alerts' && (
                <MobileAlertsScreen
                  smartAlerts={smartAlerts}
                  hourlyForecast={hourlyForecast}
                  activeProfile={activeProfile}
                  weatherSourceState={weatherSourceState}
                />
              )}

              {activeTab === 'widgets' && (
                <MobileWidgetsScreen
                  currentWeather={currentWeather}
                  hourlyForecast={hourlyForecast}
                  currentLocationName={currentLocation.name}
                  skyCoreSummary={skyCoreSummary}
                  activeProfile={activeProfile}
                  weatherSourceState={weatherSourceState}
                />
              )}

              {activeTab === 'settings' && (
                <MobileSettingsScreen
                  currentLocation={currentLocation}
                  weatherSourceState={weatherSourceState}
                  onOpenAdvancedConsole={() => setAdvancedConsoleOpen(true)}
                />
              )}

              {/* Orbi Signature at the bottom of the scroll inside the shell */}
              <div className="mt-2.5">
                <OrbiSignatureClimate />
              </div>
            </>
          )}
        </div>

        {/* Navigation Bar at the bottom */}
        {!advancedConsoleOpen && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            alertsCount={smartAlerts.length}
          />
        )}
      </div>

      {/* Signature and Credits outside the phone on wider viewports */}
      <div className="mt-4 text-center text-slate-500 text-[10px] hidden md:block z-10">
        <OrbiSignatureClimate />
      </div>

      {/* Dynamic simulated Android Notification Toast (Módulo 5) */}
      {activeToast && (
        <div className="fixed bottom-20 md:bottom-24 right-5 z-50 max-w-sm w-full bg-[#0d162a] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 flex flex-col gap-2 animate-fade-in text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">Notificación Local</span>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/5 cursor-pointer focus:outline-none"
            >
              ✕
            </button>
          </div>
          <div>
            <h4 className="font-bold text-xs text-slate-100">{activeToast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-normal">{activeToast.body}</p>
          </div>
          <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1 mt-1 justify-between">
            <span>Canal: {activeToast.severity === 'critical' ? 'field_alerts' : 'weather_alerts'}</span>
            <span>Hace un instante</span>
          </div>
        </div>
      )}
    </div>
  );
}
