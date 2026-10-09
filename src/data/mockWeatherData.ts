import { WeatherLocation, CurrentWeather, HourlyForecast, DailyForecast } from '../types/weatherTypes';

export interface LocationWeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export const mockLocationsData: LocationWeatherData[] = [
  {
    location: {
      id: 'rancagua',
      name: 'Rancagua',
      region: 'O\'Higgins',
      country: 'Chile',
      latitude: -34.1708,
      longitude: -70.7444,
      timezone: 'America/Santiago',
    },
    current: {
      temperatureC: 13,
      feelsLikeC: 11,
      humidity: 78,
      windSpeedKmh: 14,
      windGustKmh: 22,
      pressureHpa: 1018,
      cloudCover: 35,
      precipitationMm: 0,
      uvIndex: 4, // Moderado
      condition: 'partly_cloudy',
      updatedAt: '12:45 PM',
    },
    hourly: [
      { time: '08:00 AM', temperatureC: 4, precipitationProbability: 5, precipitationMm: 0, windSpeedKmh: 8, humidity: 89, cloudCover: 20, uvIndex: 0, condition: 'cold' },
      { time: '10:00 AM', temperatureC: 9, precipitationProbability: 5, precipitationMm: 0, windSpeedKmh: 10, humidity: 82, cloudCover: 30, uvIndex: 2, condition: 'partly_cloudy' },
      { time: '12:00 PM', temperatureC: 14, precipitationProbability: 5, precipitationMm: 0, windSpeedKmh: 12, humidity: 70, cloudCover: 40, uvIndex: 4, condition: 'partly_cloudy' },
      { time: '02:00 PM', temperatureC: 16, precipitationProbability: 10, precipitationMm: 0, windSpeedKmh: 15, humidity: 62, cloudCover: 35, uvIndex: 5, condition: 'partly_cloudy' },
      { time: '04:00 PM', temperatureC: 15, precipitationProbability: 15, precipitationMm: 0, windSpeedKmh: 13, humidity: 65, cloudCover: 50, uvIndex: 3, condition: 'partly_cloudy' },
      { time: '06:00 PM', temperatureC: 11, precipitationProbability: 10, precipitationMm: 0, windSpeedKmh: 9, humidity: 75, cloudCover: 60, uvIndex: 0, condition: 'cloudy' },
      { time: '08:00 PM', temperatureC: 8, precipitationProbability: 5, precipitationMm: 0, windSpeedKmh: 7, humidity: 80, cloudCover: 45, uvIndex: 0, condition: 'night' },
      { time: '10:00 PM', temperatureC: 6, precipitationProbability: 5, precipitationMm: 0, windSpeedKmh: 6, humidity: 84, cloudCover: 20, uvIndex: 0, condition: 'night' },
    ],
    daily: [
      { date: 'Hoy', minTempC: 3, maxTempC: 16, precipitationProbability: 10, windMaxKmh: 18, uvMax: 5, sunrise: '07:42 AM', sunset: '05:58 PM', condition: 'partly_cloudy' },
      { date: 'Miércoles', minTempC: 4, maxTempC: 15, precipitationProbability: 20, windMaxKmh: 15, uvMax: 4, sunrise: '07:42 AM', sunset: '05:59 PM', condition: 'cloudy' },
      { date: 'Jueves', minTempC: 2, maxTempC: 14, precipitationProbability: 5, windMaxKmh: 12, uvMax: 5, sunrise: '07:42 AM', sunset: '05:59 PM', condition: 'cold' },
      { date: 'Viernes', minTempC: 5, maxTempC: 17, precipitationProbability: 15, windMaxKmh: 20, uvMax: 6, sunrise: '07:41 AM', sunset: '06:00 PM', condition: 'sunny' },
      { date: 'Sábado', minTempC: 6, maxTempC: 18, precipitationProbability: 5, windMaxKmh: 10, uvMax: 6, sunrise: '07:41 AM', sunset: '06:01 PM', condition: 'sunny' },
      { date: 'Domingo', minTempC: 5, maxTempC: 15, precipitationProbability: 60, windMaxKmh: 28, uvMax: 3, sunrise: '07:41 AM', sunset: '06:02 PM', condition: 'rain' },
      { date: 'Lunes', minTempC: 3, maxTempC: 12, precipitationProbability: 80, windMaxKmh: 35, uvMax: 2, sunrise: '07:40 AM', sunset: '06:02 PM', condition: 'storm' },
    ],
  },
  {
    location: {
      id: 'santiago',
      name: 'Santiago',
      region: 'Metropolitana',
      country: 'Chile',
      latitude: -33.4489,
      longitude: -70.6693,
      timezone: 'America/Santiago',
    },
    current: {
      temperatureC: 17,
      feelsLikeC: 16,
      humidity: 58,
      windSpeedKmh: 28, // Viento moderado-alto
      windGustKmh: 42,
      pressureHpa: 1015,
      cloudCover: 80,
      precipitationMm: 0.2,
      uvIndex: 3,
      condition: 'wind',
      updatedAt: '12:45 PM',
    },
    hourly: [
      { time: '08:00 AM', temperatureC: 9, precipitationProbability: 10, precipitationMm: 0, windSpeedKmh: 15, humidity: 75, cloudCover: 90, uvIndex: 0, condition: 'cloudy' },
      { time: '10:00 AM', temperatureC: 12, precipitationProbability: 15, precipitationMm: 0, windSpeedKmh: 22, humidity: 68, cloudCover: 85, uvIndex: 1, condition: 'wind' },
      { time: '12:00 PM', temperatureC: 16, precipitationProbability: 20, precipitationMm: 0.1, windSpeedKmh: 29, humidity: 60, cloudCover: 80, uvIndex: 3, condition: 'wind' },
      { time: '02:00 PM', temperatureC: 18, precipitationProbability: 25, precipitationMm: 0.2, windSpeedKmh: 32, humidity: 55, cloudCover: 75, uvIndex: 3, condition: 'wind' },
      { time: '04:00 PM', temperatureC: 17, precipitationProbability: 30, precipitationMm: 0.1, windSpeedKmh: 30, humidity: 58, cloudCover: 70, uvIndex: 2, condition: 'partly_cloudy' },
      { time: '06:00 PM', temperatureC: 14, precipitationProbability: 20, precipitationMm: 0, windSpeedKmh: 25, humidity: 65, cloudCover: 60, uvIndex: 0, condition: 'partly_cloudy' },
      { time: '08:00 PM', temperatureC: 11, precipitationProbability: 10, precipitationMm: 0, windSpeedKmh: 18, humidity: 70, cloudCover: 40, uvIndex: 0, condition: 'night' },
      { time: '10:00 PM', temperatureC: 9, precipitationProbability: 5, precipitationMm: 0, windSpeedKmh: 14, humidity: 74, cloudCover: 30, uvIndex: 0, condition: 'night' },
    ],
    daily: [
      { date: 'Hoy', minTempC: 8, maxTempC: 18, precipitationProbability: 30, windMaxKmh: 42, uvMax: 3, sunrise: '07:44 AM', sunset: '05:56 PM', condition: 'wind' },
      { date: 'Miércoles', minTempC: 7, maxTempC: 16, precipitationProbability: 15, windMaxKmh: 20, uvMax: 4, sunrise: '07:44 AM', sunset: '05:57 PM', condition: 'partly_cloudy' },
      { date: 'Jueves', minTempC: 6, maxTempC: 15, precipitationProbability: 5, windMaxKmh: 12, uvMax: 5, sunrise: '07:44 AM', sunset: '05:57 PM', condition: 'sunny' },
      { date: 'Viernes', minTempC: 5, maxTempC: 17, precipitationProbability: 10, windMaxKmh: 15, uvMax: 5, sunrise: '07:43 AM', sunset: '05:58 PM', condition: 'sunny' },
      { date: 'Sábado', minTempC: 8, maxTempC: 19, precipitationProbability: 5, windMaxKmh: 11, uvMax: 6, sunrise: '07:43 AM', sunset: '05:59 PM', condition: 'sunny' },
      { date: 'Domingo', minTempC: 9, maxTempC: 16, precipitationProbability: 40, windMaxKmh: 24, uvMax: 3, sunrise: '07:42 AM', sunset: '05:59 PM', condition: 'cloudy' },
      { date: 'Lunes', minTempC: 7, maxTempC: 14, precipitationProbability: 70, windMaxKmh: 30, uvMax: 2, sunrise: '07:42 AM', sunset: '06:00 PM', condition: 'rain' },
    ],
  },
  {
    location: {
      id: 'parque_fotovoltaico_orbi',
      name: 'Parque Fotovoltaico Demo ORBI',
      region: 'Atacama',
      country: 'Chile',
      latitude: -27.3667,
      longitude: -70.3333,
      timezone: 'America/Santiago',
    },
    current: {
      temperatureC: 28,
      feelsLikeC: 27,
      humidity: 32,
      windSpeedKmh: 12,
      windGustKmh: 18,
      pressureHpa: 1012,
      cloudCover: 5,
      precipitationMm: 0,
      uvIndex: 10, // UV Muy Alto / Extremo
      condition: 'hot',
      updatedAt: '12:45 PM',
    },
    hourly: [
      { time: '08:00 AM', temperatureC: 14, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 6, humidity: 88, cloudCover: 10, uvIndex: 1, condition: 'cloudy' }, // Humedad alta al amanecer para pruebas
      { time: '10:00 AM', temperatureC: 22, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 9, humidity: 55, cloudCover: 5, uvIndex: 4, condition: 'sunny' },
      { time: '12:00 PM', temperatureC: 27, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 12, humidity: 36, cloudCover: 0, uvIndex: 9, condition: 'hot' },
      { time: '02:00 PM', temperatureC: 30, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 15, humidity: 28, cloudCover: 0, uvIndex: 10, condition: 'hot' },
      { time: '04:00 PM', temperatureC: 29, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 14, humidity: 30, cloudCover: 0, uvIndex: 8, condition: 'hot' },
      { time: '06:00 PM', temperatureC: 24, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 11, humidity: 45, cloudCover: 0, uvIndex: 2, condition: 'sunny' },
      { time: '08:00 PM', temperatureC: 18, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 8, humidity: 62, cloudCover: 0, uvIndex: 0, condition: 'night' },
      { time: '10:00 PM', temperatureC: 15, precipitationProbability: 0, precipitationMm: 0, windSpeedKmh: 7, humidity: 70, cloudCover: 0, uvIndex: 0, condition: 'night' },
    ],
    daily: [
      { date: 'Hoy', minTempC: 13, maxTempC: 30, precipitationProbability: 0, windMaxKmh: 20, uvMax: 10, sunrise: '07:22 AM', sunset: '06:18 PM', condition: 'hot' },
      { date: 'Miércoles', minTempC: 12, maxTempC: 29, precipitationProbability: 0, windMaxKmh: 18, uvMax: 10, sunrise: '07:22 AM', sunset: '06:19 PM', condition: 'sunny' },
      { date: 'Jueves', minTempC: 14, maxTempC: 31, precipitationProbability: 0, windMaxKmh: 22, uvMax: 11, sunrise: '07:21 AM', sunset: '06:19 PM', condition: 'hot' },
      { date: 'Viernes', minTempC: 13, maxTempC: 28, precipitationProbability: 0, windMaxKmh: 16, uvMax: 9, sunrise: '07:21 AM', sunset: '06:20 PM', condition: 'sunny' },
      { date: 'Sábado', minTempC: 11, maxTempC: 27, precipitationProbability: 0, windMaxKmh: 14, uvMax: 9, sunrise: '07:20 AM', sunset: '06:20 PM', condition: 'sunny' },
      { date: 'Domingo', minTempC: 12, maxTempC: 29, precipitationProbability: 0, windMaxKmh: 17, uvMax: 10, sunrise: '07:20 AM', sunset: '06:21 PM', condition: 'sunny' },
      { date: 'Lunes', minTempC: 13, maxTempC: 30, precipitationProbability: 0, windMaxKmh: 19, uvMax: 10, sunrise: '07:19 AM', sunset: '06:22 PM', condition: 'hot' },
    ],
  },
];
