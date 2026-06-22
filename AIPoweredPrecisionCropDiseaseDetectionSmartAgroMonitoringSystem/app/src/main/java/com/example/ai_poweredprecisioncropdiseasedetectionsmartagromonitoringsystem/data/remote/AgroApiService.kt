package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.remote

import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.CropDisease
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.SensorData
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.WeatherInfo
import retrofit2.http.*

interface AgroApiService {
    @GET("sensors/current")
    suspend fun getLatestSensorData(): SensorData

    @POST("disease/detect")
    suspend fun detectDisease(@Body imageBase64: String): CropDisease

    @GET("alerts")
    suspend fun getAlerts(): List<String>

    @GET("weather")
    suspend fun getWeather(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double
    ): WeatherInfo

    @POST("sync/cloud")
    suspend fun syncCloudData(@Body data: Map<String, String>): SyncResponse

    @POST("reports/export")
    suspend fun exportReport(): ExportResponse

    @POST("sensors/calibrate")
    suspend fun calibrateSensors(): CalibrationResponse

    @POST("ai/chat")
    suspend fun chatWithAi(@Body message: Map<String, String>): ChatResponse

    @GET("ai/recommendations")
    suspend fun getAiRecommendations(): List<String>
}

data class SyncResponse(val status: String, val progress: Int)
data class ExportResponse(val fileName: String, val downloadUrl: String)
data class CalibrationResponse(val success: Boolean, val message: String)
data class ChatResponse(val reply: String)
