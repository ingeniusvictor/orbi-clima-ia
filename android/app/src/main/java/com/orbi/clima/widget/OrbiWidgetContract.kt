package com.orbi.clima.widget

import org.json.JSONObject

data class OrbiWidgetContract(
    val version: String = "1.1.0",
    val appName: String = "ORBI Clima IA",
    val engineName: String = "Powered by ORBI SkyCore™",
    val tagline: String = "Tu núcleo climático inteligente.",
    val locationName: String = "Rancagua",
    val temperatureC: Int = 18,
    val feelsLikeC: Int = 18,
    val conditionLabel: String = "Nublado",
    val conditionCode: String = "cloudy",
    val globalDecisionLabel: String = "Favorable",
    val riskLevel: String = "low",
    val mainRiskLabel: String = "Condición estable",
    val shortNarrative: String = "Chaqueta temprano, UV al mediodía.",
    val bestWindow: String = "10:00–14:00",
    val sourceMode: String = "demo",
    val lastUpdated: String = "",
    val profile: String = "person",

    // Metric fields
    val humidity: Int = 50,
    val windSpeedKmh: Int = 10,
    val windGustKmh: Int = 15,
    val uvIndex: Int = 1,
    val rainProbability: Int = 0,
    val technicalRecommendation: String = "Siga protocolos estándar de terreno.",
    val personRecommendation: String = "Excelente jornada para exteriores.",

    // Micro timeline next 3 hours
    val nextHour1Label: String = "10h",
    val nextHour1Temp: Int = 18,
    val nextHour2Label: String = "11h",
    val nextHour2Temp: Int = 19,
    val nextHour3Label: String = "12h",
    val nextHour3Temp: Int = 20,

    val visualVariantHint: String = "skypanel",

    // New alert fields
    val mainAlertTitle: String = "",
    val mainAlertSeverity: String = "info",
    val mainAlertMessage: String = "",
    val mainAlertTimeLabel: String = "",

    // Snapshot engine fields
    val orbAssetKey: String = "",
    val weatherMood: String = "",
    val visualTheme: String = "premium"
) {
    companion object {
        fun fromJson(jsonStr: String): OrbiWidgetContract {
            return try {
                val json = JSONObject(jsonStr)
                OrbiWidgetContract(
                    version = json.optString("version", "1.1.0"),
                    appName = json.optString("appName", "ORBI Clima IA"),
                    engineName = json.optString("engineName", "Powered by ORBI SkyCore™"),
                    tagline = json.optString("tagline", "Tu núcleo climático inteligente."),
                    locationName = json.optString("locationName", "Rancagua"),
                    temperatureC = json.optInt("temperatureC", 18),
                    feelsLikeC = json.optInt("feelsLikeC", json.optInt("temperatureC", 18)),
                    conditionLabel = json.optString("conditionLabel", "Nublado"),
                    conditionCode = json.optString("conditionCode", "cloudy"),
                    globalDecisionLabel = json.optString("globalDecisionLabel", "Favorable"),
                    riskLevel = json.optString("riskLevel", "low"),
                    mainRiskLabel = json.optString("mainRiskLabel", "Condición estable"),
                    shortNarrative = json.optString("shortNarrative", "Chaqueta temprano, UV al mediodía."),
                    bestWindow = json.optString("bestWindow", "10:00–14:00"),
                    sourceMode = json.optString("sourceMode", "demo"),
                    lastUpdated = json.optString("lastUpdated", ""),
                    profile = json.optString("profile", "person"),

                    // v1.1.0 fields
                    humidity = json.optInt("humidity", 50),
                    windSpeedKmh = json.optInt("windSpeedKmh", 10),
                    windGustKmh = json.optInt("windGustKmh", 15),
                    uvIndex = json.optInt("uvIndex", 1),
                    rainProbability = json.optInt("rainProbability", 0),
                    technicalRecommendation = json.optString("technicalRecommendation", "Siga protocolos estándar de terreno."),
                    personRecommendation = json.optString("personRecommendation", "Excelente jornada para exteriores."),

                    nextHour1Label = json.optString("nextHour1Label", "10h"),
                    nextHour1Temp = json.optInt("nextHour1Temp", 18),
                    nextHour2Label = json.optString("nextHour2Label", "11h"),
                    nextHour2Temp = json.optInt("nextHour2Temp", 19),
                    nextHour3Label = json.optString("nextHour3Label", "12h"),
                    nextHour3Temp = json.optInt("nextHour3Temp", 20),

                    visualVariantHint = json.optString("visualVariantHint", "skypanel"),

                    // New alert fields
                    mainAlertTitle = json.optString("mainAlertTitle", ""),
                    mainAlertSeverity = json.optString("mainAlertSeverity", "info"),
                    mainAlertMessage = json.optString("mainAlertMessage", ""),
                    mainAlertTimeLabel = json.optString("mainAlertTimeLabel", ""),

                    // Snapshot engine fields
                    orbAssetKey = json.optString("orbAssetKey", ""),
                    weatherMood = json.optString("weatherMood", ""),
                    visualTheme = json.optString("visualTheme", "premium")
                )
            } catch (e: Exception) {
                OrbiWidgetContract(
                    sourceMode = "fallback",
                    shortNarrative = "Error al decodificar SkyCore v1.1.0"
                )
            }
        }
    }
}
