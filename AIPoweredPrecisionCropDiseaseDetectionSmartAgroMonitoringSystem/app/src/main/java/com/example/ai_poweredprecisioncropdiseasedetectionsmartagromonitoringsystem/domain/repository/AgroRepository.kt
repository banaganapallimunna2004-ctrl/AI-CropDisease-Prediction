package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.repository

import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.CropDisease
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.SensorData
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.WeatherInfo
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.UserEntity
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.AlertEntity
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.CropDetectionEntity
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.SensorDataEntity
import com.google.firebase.auth.PhoneAuthProvider
import kotlinx.coroutines.flow.Flow

interface AgroRepository {
    fun getSensorData(): Flow<SensorData>
    fun getHistoricalSensorData(): Flow<List<SensorDataEntity>>
    suspend fun saveSensorData(data: SensorDataEntity)

    suspend fun detectDisease(imagePath: String): CropDisease
    suspend fun validateCropImage(imagePath: String): Boolean
    fun getDetectionHistory(): Flow<List<CropDetectionEntity>>
    suspend fun saveDetection(detection: CropDetectionEntity)

    suspend fun getAlerts(): List<String>
    fun getAllAlerts(): Flow<List<AlertEntity>>
    suspend fun markAlertsRead()
    
    fun getSelectedLanguage(): Flow<String>
    suspend fun saveLanguage(languageCode: String)

    fun getDarkMode(): Flow<Boolean>
    suspend fun setDarkMode(enabled: Boolean)

    fun getNotificationsEnabled(): Flow<Boolean>
    suspend fun setNotificationsEnabled(enabled: Boolean)

    fun getAiSensitivity(): Flow<Float>
    suspend fun setAiSensitivity(value: Float)

    suspend fun syncCloudData(): Flow<Int>
    suspend fun exportReport(): String
    suspend fun calibrateIoT(): Boolean

    fun getTwoFactorEnabled(): Flow<Boolean>
    suspend fun setTwoFactorEnabled(enabled: Boolean)
    fun getBiometricLoginEnabled(): Flow<Boolean>
    suspend fun setBiometricLoginEnabled(enabled: Boolean)
    suspend fun changePassword(old: String, new: String): Boolean

    fun getCustomLogo(): Flow<String?>
    suspend fun saveCustomLogo(uri: String)

    // Auth
    suspend fun login(email: String, password: String): Boolean
    suspend fun loginWithGoogle(email: String, name: String, isEmailVerified: Boolean = false): Boolean
    suspend fun register(user: UserEntity): Boolean
    suspend fun forgotPassword(email: String): Boolean
    suspend fun logout()
    fun getLoggedInUser(): Flow<UserEntity?>

    // Firebase Phone Auth
    suspend fun sendFirebaseOtp(
        phone: String,
        activity: android.app.Activity,
        callbacks: PhoneAuthProvider.OnVerificationStateChangedCallbacks
    )
    suspend fun verifyFirebaseOtp(verificationId: String, code: String): Boolean

    suspend fun saveOtp(phone: String, otp: String)
    suspend fun verifyOtp(phone: String, otp: String): Boolean
    suspend fun updateProfile(
        farmName: String, 
        farmLocation: String, 
        farmSize: Double, 
        profileImageUri: String?,
        experienceYears: Int,
        primaryCrops: String,
        soilType: String,
        irrigationSystem: String
    )
    suspend fun updateProfileImage(uri: String)

    // AI Advanced
    suspend fun getAiRecommendations(): List<String>
    suspend fun chatWithAi(message: String): String

    // Weather
    suspend fun getWeatherData(lat: Double, lng: Double): WeatherInfo
}
