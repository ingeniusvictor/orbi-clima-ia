import { WeatherLocation } from '../types/weatherTypes';

const SENAPRED_ARCGIS_BASE = 'https://services3.arcgis.com/CNzkI2T3GmfwkaAR/arcgis/rest/services';
const SENAPRED_PUBLIC_ALERTS_URL = 'https://senapred.cl/informate/eventos';
const REQUEST_TIMEOUT_MS = 9000;
const MAX_DATED_LAYER_AGE_DAYS = 21;

export type SenapredAlertLevel = 'temprana_preventiva' | 'amarilla' | 'roja';
export type SenapredQueryStatus = 'ok' | 'inactive_layer' | 'error';

export interface SenapredOfficialAlert {
  id: string;
  authority: 'SENAPRED';
  category: 'meteorologica';
  level: SenapredAlertLevel;
  levelLabel: string;
  causalidad: string;
  region: string;
  provincia: string | null;
  comuna: string | null;
  cutRegion: string | null;
  cutProvincia: string | null;
  cutComuna: string | null;
  startsAt: string | null;
  startsAtLabel: string | null;
  sourceService: string;
  machineSourceUrl: string;
  publicSourceUrl: string;
  matchedBy: 'polygon_intersection';
  severity: 'watch' | 'warning' | 'extreme';
}

export interface SenapredLayerQueryResult {
  service: string;
  level: SenapredAlertLevel;
  status: SenapredQueryStatus;
  httpStatus: number | null;
  alerts: SenapredOfficialAlert[];
  errorMessage: string | null;
}

export interface SenapredOfficialAlertsResult {
  alerts: SenapredOfficialAlert[];
  checkedAt: string;
  verifiedMachineFeed: true;
  hasVerifiedCoverage: boolean;
  isPartial: boolean;
  discoveryMode: 'directory' | 'canonical_fallback';
  queryResults: SenapredLayerQueryResult[];
  sourceLabel: string;
  publicSourceUrl: string;
  integrityMessage: string;
}

interface ArcGisFeature {
  attributes?: Record<string, unknown>;
}

interface ArcGisQueryResponse {
  features?: ArcGisFeature[];
  error?: {
    code?: number;
    message?: string;
    details?: string[];
  };
}

interface ArcGisServicesDirectory {
  services?: Array<{
    name?: string;
    type?: string;
  }>;
}

const LEVELS: Array<{
  serviceSuffix: 'VERDE' | 'AMARILLA' | 'ROJA';
  level: SenapredAlertLevel;
  label: string;
  severity: SenapredOfficialAlert['severity'];
  staleDays: number;
}> = [
  {
    serviceSuffix: 'VERDE',
    level: 'temprana_preventiva',
    label: 'Alerta Temprana Preventiva',
    severity: 'watch',
    staleDays: 365,
  },
  {
    serviceSuffix: 'AMARILLA',
    level: 'amarilla',
    label: 'Alerta Amarilla',
    severity: 'warning',
    staleDays: 120,
  },
  {
    serviceSuffix: 'ROJA',
    level: 'roja',
    label: 'Alerta Roja',
    severity: 'extreme',
    staleDays: 60,
  },
];

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function normalizeLevel(tipoAlert: unknown, fallback: SenapredAlertLevel): SenapredAlertLevel {
  const text = String(tipoAlert ?? '').trim().toLowerCase();
  if (text.includes('roja')) return 'roja';
  if (text.includes('amarilla')) return 'amarilla';
  if (text.includes('preventiva') || text.includes('temprana')) return 'temprana_preventiva';
  return fallback;
}

function levelLabel(level: SenapredAlertLevel): string {
  if (level === 'roja') return 'Alerta Roja';
  if (level === 'amarilla') return 'Alerta Amarilla';
  return 'Alerta Temprana Preventiva';
}

function severityFor(level: SenapredAlertLevel): SenapredOfficialAlert['severity'] {
  if (level === 'roja') return 'extreme';
  if (level === 'amarilla') return 'warning';
  return 'watch';
}

function parseSenapredDate(value: unknown): { iso: string | null; label: string | null; epochMs: number | null } {
  const text = stringOrNull(value);
  if (!text) return { iso: null, label: null, epochMs: null };

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text);
  if (!match) return { iso: null, label: text, epochMs: null };
  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const epochMs = Date.parse(`${iso}T12:00:00-03:00`);
  return {
    iso,
    label: text,
    epochMs: Number.isFinite(epochMs) ? epochMs : null,
  };
}

function isStaleStartDate(value: unknown, level: SenapredAlertLevel): boolean {
  const parsed = parseSenapredDate(value);
  if (parsed.epochMs === null) return false;
  const rule = LEVELS.find(item => item.level === level);
  const staleDays = rule?.staleDays ?? 120;
  return Date.now() - parsed.epochMs > staleDays * 24 * 60 * 60 * 1000;
}

function encodeServicePath(service: string): string {
  return service.split('/').map(part => encodeURIComponent(part)).join('/');
}

function queryUrl(service: string, location: WeatherLocation): string {
  const endpoint = `${SENAPRED_ARCGIS_BASE}/${encodeServicePath(service)}/FeatureServer/0/query`;
  const geometry = JSON.stringify({
    x: location.longitude,
    y: location.latitude,
    spatialReference: { wkid: 4326 },
  });
  const params = new URLSearchParams({
    where: '1=1',
    geometry,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'FID,CUT_REG,CUT_PROV,CUT_COM,REGION,PROVINCIA,COMUNA,TIPO_ALERT,CAUSALIDAD,FECHA_INI',
    returnGeometry: 'false',
    f: 'json',
  });
  return `${endpoint}?${params.toString()}`;
}

function datedServiceEpoch(service: string, suffix: string): number | null {
  const finalName = service.split('/').at(-1) ?? service;
  const match = new RegExp(`^METEOROLOGICAS_${suffix}_(\\d{2})(\\d{2})(\\d{2})$`, 'i').exec(finalName);
  if (!match) return null;
  const [, day, month, shortYear] = match;
  const year = 2000 + Number(shortYear);
  const epoch = Date.parse(`${year}-${month}-${day}T12:00:00-03:00`);
  return Number.isFinite(epoch) ? epoch : null;
}

function chooseService(
  services: Array<{ name?: string; type?: string }>,
  suffix: 'VERDE' | 'AMARILLA' | 'ROJA',
): string | null {
  const exactName = `METEOROLOGICAS_${suffix}`;
  const featureServices = services
    .filter(service => String(service.type ?? '').toLowerCase() === 'featureserver')
    .map(service => String(service.name ?? '').trim())
    .filter(Boolean);

  const exact = featureServices.find(service => (service.split('/').at(-1) ?? service).toUpperCase() === exactName);
  if (exact) return exact;

  const cutoff = Date.now() - MAX_DATED_LAYER_AGE_DAYS * 24 * 60 * 60 * 1000;
  const futureTolerance = Date.now() + 2 * 24 * 60 * 60 * 1000;
  const recentDated = featureServices
    .map(service => ({ service, epoch: datedServiceEpoch(service, suffix) }))
    .filter((item): item is { service: string; epoch: number } => item.epoch !== null)
    .filter(item => item.epoch >= cutoff && item.epoch <= futureTolerance)
    .sort((a, b) => b.epoch - a.epoch);

  return recentDated[0]?.service ?? null;
}

async function discoverMeteorologicalServices(): Promise<Map<SenapredAlertLevel, string> | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${SENAPRED_ARCGIS_BASE}?f=json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const directory = await response.json() as ArcGisServicesDirectory;
    if (!Array.isArray(directory.services)) return null;

    const result = new Map<SenapredAlertLevel, string>();
    for (const definition of LEVELS) {
      const service = chooseService(directory.services, definition.serviceSuffix);
      if (service) result.set(definition.level, service);
    }
    return result;
  } catch (error) {
    console.warn('SENAPRED ArcGIS service discovery unavailable; using canonical layer fallback.', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function queryLayer(
  location: WeatherLocation,
  definition: (typeof LEVELS)[number],
  discoveredService?: string | null,
): Promise<SenapredLayerQueryResult> {
  if (discoveredService === null) {
    return {
      service: `METEOROLOGICAS_${definition.serviceSuffix}`,
      level: definition.level,
      status: 'inactive_layer',
      httpStatus: null,
      alerts: [],
      errorMessage: null,
    };
  }

  const service = discoveredService ?? `METEOROLOGICAS_${definition.serviceSuffix}`;
  const url = queryUrl(service, location);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (response.status === 400 || response.status === 404) {
      return {
        service,
        level: definition.level,
        status: 'inactive_layer',
        httpStatus: response.status,
        alerts: [],
        errorMessage: null,
      };
    }

    if (!response.ok) {
      return {
        service,
        level: definition.level,
        status: 'error',
        httpStatus: response.status,
        alerts: [],
        errorMessage: `SENAPRED ArcGIS HTTP ${response.status}`,
      };
    }

    const payload = await response.json() as ArcGisQueryResponse;
    if (payload.error) {
      const code = Number(payload.error.code);
      if (code === 400 || code === 404) {
        return {
          service,
          level: definition.level,
          status: 'inactive_layer',
          httpStatus: code,
          alerts: [],
          errorMessage: null,
        };
      }
      return {
        service,
        level: definition.level,
        status: 'error',
        httpStatus: Number.isFinite(code) ? code : null,
        alerts: [],
        errorMessage: payload.error.message || 'Respuesta de error ArcGIS sin detalle.',
      };
    }

    const alerts = (payload.features ?? [])
      .flatMap((feature, index): SenapredOfficialAlert[] => {
        const attrs = feature.attributes ?? {};
        const normalizedLevel = normalizeLevel(attrs.TIPO_ALERT, definition.level);
        if (isStaleStartDate(attrs.FECHA_INI, normalizedLevel)) return [];

        const date = parseSenapredDate(attrs.FECHA_INI);
        const causalidad = stringOrNull(attrs.CAUSALIDAD) ?? 'Evento meteorológico';
        const region = stringOrNull(attrs.REGION) ?? location.region ?? 'Chile';
        const comuna = stringOrNull(attrs.COMUNA);
        const fid = stringOrNull(attrs.FID) ?? `${index}`;

        return [{
          id: `senapred:${service}:${fid}`,
          authority: 'SENAPRED',
          category: 'meteorologica',
          level: normalizedLevel,
          levelLabel: levelLabel(normalizedLevel),
          causalidad,
          region,
          provincia: stringOrNull(attrs.PROVINCIA),
          comuna,
          cutRegion: stringOrNull(attrs.CUT_REG),
          cutProvincia: stringOrNull(attrs.CUT_PROV),
          cutComuna: stringOrNull(attrs.CUT_COM),
          startsAt: date.iso,
          startsAtLabel: date.label,
          sourceService: service,
          machineSourceUrl: url,
          publicSourceUrl: SENAPRED_PUBLIC_ALERTS_URL,
          matchedBy: 'polygon_intersection',
          severity: severityFor(normalizedLevel),
        }];
      });

    return {
      service,
      level: definition.level,
      status: 'ok',
      httpStatus: response.status,
      alerts,
      errorMessage: null,
    };
  } catch (error) {
    return {
      service,
      level: definition.level,
      status: 'error',
      httpStatus: null,
      alerts: [],
      errorMessage: error instanceof Error ? error.message : 'Error de red desconocido',
    };
  } finally {
    clearTimeout(timeout);
  }
}

function deduplicateAlerts(alerts: SenapredOfficialAlert[]): SenapredOfficialAlert[] {
  const byKey = new Map<string, SenapredOfficialAlert>();
  for (const alert of alerts) {
    const key = [
      alert.level,
      alert.causalidad.toLowerCase(),
      alert.region.toLowerCase(),
      (alert.comuna ?? '').toLowerCase(),
      alert.startsAt ?? '',
    ].join('|');
    if (!byKey.has(key)) byKey.set(key, alert);
  }
  return Array.from(byKey.values()).sort((a, b) => {
    const priority: Record<SenapredAlertLevel, number> = {
      roja: 0,
      amarilla: 1,
      temprana_preventiva: 2,
    };
    return priority[a.level] - priority[b.level];
  });
}

export async function fetchSenapredOfficialAlerts(
  location: WeatherLocation,
): Promise<SenapredOfficialAlertsResult> {
  if ((location.country || '').trim().toLowerCase() !== 'chile') {
    return {
      alerts: [],
      checkedAt: new Date().toISOString(),
      verifiedMachineFeed: true,
      hasVerifiedCoverage: false,
      isPartial: false,
      discoveryMode: 'canonical_fallback',
      queryResults: [],
      sourceLabel: 'SENAPRED · dashboard oficial ArcGIS',
      publicSourceUrl: SENAPRED_PUBLIC_ALERTS_URL,
      integrityMessage: 'La fuente SENAPRED integrada corresponde a territorio chileno; no se consultó fuera de Chile.',
    };
  }

  const discovered = await discoverMeteorologicalServices();
  const discoveryMode: SenapredOfficialAlertsResult['discoveryMode'] = discovered ? 'directory' : 'canonical_fallback';
  const queryResults = await Promise.all(LEVELS.map(definition => {
    const service = discovered ? (discovered.get(definition.level) ?? null) : undefined;
    return queryLayer(location, definition, service);
  }));

  const successfulQueries = queryResults.filter(result => result.status === 'ok').length;
  const errors = queryResults.filter(result => result.status === 'error').length;
  const inactiveLayers = queryResults.filter(result => result.status === 'inactive_layer').length;
  const alerts = deduplicateAlerts(queryResults.flatMap(result => result.alerts));

  // Conservative coverage rule: at least one real FeatureServer layer must answer
  // successfully. If all alert layers are absent/renamed we refuse to conclude
  // that there are zero alerts, even when the ArcGIS host itself is reachable.
  const hasVerifiedCoverage = successfulQueries > 0;
  const isPartial = hasVerifiedCoverage && errors > 0;

  let integrityMessage: string;
  if (!hasVerifiedCoverage) {
    integrityMessage = errors > 0
      ? 'No fue posible verificar ninguna capa meteorológica SENAPRED en esta consulta. ORBI no puede afirmar ausencia de alertas oficiales.'
      : `Las ${inactiveLayers} capas meteorológicas consultadas no estaban activas o verificables. ORBI no interpreta esto como ausencia confirmada de alertas.`;
  } else if (isPartial) {
    integrityMessage = 'SENAPRED respondió parcialmente. Las alertas mostradas son oficiales y geográficamente coincidentes, pero alguna capa no pudo verificarse.';
  } else {
    integrityMessage = `Cobertura SENAPRED verificada mediante intersección del punto consultado con polígonos oficiales del dashboard ArcGIS (${discoveryMode === 'directory' ? 'capas descubiertas dinámicamente' : 'rutas canónicas'}).`;
  }

  return {
    alerts,
    checkedAt: new Date().toISOString(),
    verifiedMachineFeed: true,
    hasVerifiedCoverage,
    isPartial,
    discoveryMode,
    queryResults,
    sourceLabel: 'SENAPRED · dashboard oficial ArcGIS',
    publicSourceUrl: SENAPRED_PUBLIC_ALERTS_URL,
    integrityMessage,
  };
}
