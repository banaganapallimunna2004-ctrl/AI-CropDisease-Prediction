package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel

import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.CropDisease
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.SensorData
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.ChatMessage
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.WeatherInfo
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.repository.AgroRepository
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.UserEntity
import com.google.android.gms.maps.model.LatLng
import com.google.firebase.FirebaseException
import com.google.firebase.auth.PhoneAuthCredential
import com.google.firebase.auth.PhoneAuthProvider
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import android.content.Context
import android.util.Log
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.util.NotificationHelper
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AgroAuthUiState(
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
    val isOtpSent: Boolean = false,
    val authMode: AuthMode = AuthMode.EMAIL,
    val phoneNumber: String = "",
    val verificationId: String? = null
)

enum class AuthMode {
    EMAIL, OTP
}

data class ChatbotUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false
)

@HiltViewModel
class AgroViewModel @Inject constructor(
    private val repository: AgroRepository,
    @ApplicationContext private val context: Context
) : ViewModel() {

    private val _sensorData = MutableStateFlow<SensorData?>(null)
    val sensorData: StateFlow<SensorData?> = _sensorData.asStateFlow()

    private val _detectionResult = MutableStateFlow<CropDisease?>(null)
    val detectionResult: StateFlow<CropDisease?> = _detectionResult.asStateFlow()

    private val _isDetecting = MutableStateFlow(false)
    val isDetecting: StateFlow<Boolean> = _isDetecting.asStateFlow()

    private val _isValidating = MutableStateFlow(false)
    val isValidating: StateFlow<Boolean> = _isValidating.asStateFlow()

    private val _isImageRejected = MutableStateFlow(false)
    val isImageRejected: StateFlow<Boolean> = _isImageRejected.asStateFlow()

    private val _rejectionReason = MutableStateFlow<String?>(null)
    val rejectionReason: StateFlow<String?> = _rejectionReason.asStateFlow()

    private val _selectedLanguage = MutableStateFlow("en")
    val selectedLanguage: StateFlow<String> = _selectedLanguage.asStateFlow()

    private val _isDarkMode = MutableStateFlow(false)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _notificationsEnabled = MutableStateFlow(true)
    val notificationsEnabled: StateFlow<Boolean> = _notificationsEnabled.asStateFlow()

    private val _twoFactorEnabled = MutableStateFlow(false)
    val twoFactorEnabled: StateFlow<Boolean> = _twoFactorEnabled.asStateFlow()

    private val _biometricLoginEnabled = MutableStateFlow(false)
    val biometricLoginEnabled: StateFlow<Boolean> = _biometricLoginEnabled.asStateFlow()

    private val _aiSensitivity = MutableStateFlow(0.5f)
    val aiSensitivity: StateFlow<Float> = _aiSensitivity.asStateFlow()

    private val _syncProgress = MutableStateFlow<Int?>(null)
    val syncProgress: StateFlow<Int?> = _syncProgress.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    private val _isExporting = MutableStateFlow(false)
    val isExporting: StateFlow<Boolean> = _isExporting.asStateFlow()

    private val _isCalibrating = MutableStateFlow(false)
    val isCalibrating: StateFlow<Boolean> = _isCalibrating.asStateFlow()

    private val _uiMessage = MutableStateFlow<String?>(null)
    val uiMessage: StateFlow<String?> = _uiMessage.asStateFlow()

    private val _loggedInUser = MutableStateFlow<UserEntity?>(null)
    val loggedInUser: StateFlow<UserEntity?> = _loggedInUser.asStateFlow()

    private val _aiRecommendations = MutableStateFlow<List<String>>(emptyList())
    val aiRecommendations: StateFlow<List<String>> = _aiRecommendations.asStateFlow()

    private val _authError = MutableStateFlow<String?>(null)
    val authError: StateFlow<String?> = _authError.asStateFlow()

    private val _authUiState = MutableStateFlow(AgroAuthUiState())
    val authUiState: StateFlow<AgroAuthUiState> = _authUiState.asStateFlow()

    private val _currentLocation = MutableStateFlow<LatLng?>(null)
    val currentLocation: StateFlow<LatLng?> = _currentLocation.asStateFlow()

    private val _weatherInfo = MutableStateFlow<WeatherInfo?>(null)
    val weatherInfo: StateFlow<WeatherInfo?> = _weatherInfo.asStateFlow()

    private val _isWeatherLoading = MutableStateFlow(false)
    val isWeatherLoading: StateFlow<Boolean> = _isWeatherLoading.asStateFlow()

    private val _uiState = MutableStateFlow(ChatbotUiState())
    val uiState: StateFlow<ChatbotUiState> = _uiState.asStateFlow()

    init {
        observeSensorData()
        observeLanguage()
        observeUser()
        observeSettings()
        fetchAiRecommendations()
    }

    private fun observeUser() {
        viewModelScope.launch {
            repository.getLoggedInUser().collect {
                _loggedInUser.value = it
            }
        }
    }

    private fun fetchAiRecommendations() {
        viewModelScope.launch {
            _aiRecommendations.value = repository.getAiRecommendations()
        }
    }

    fun login(email: String, password: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(
                isLoading = true, 
                errorMessage = null,
                successMessage = null
            )
            if (repository.login(email, password)) {
                _authUiState.value = _authUiState.value.copy(isLoading = false)
                onSuccess()
            } else {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false,
                    errorMessage = "Invalid email or password"
                )
            }
        }
    }

    fun loginWithGoogleToken(idToken: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(isLoading = true, errorMessage = null)
            
            // In a real app, you would send this idToken to your backend for verification
            // and security merging.
            Log.d("AgroViewModel", "Google ID Token: $idToken")
            
            delay(1500) // Simulate network request
            
            // For demo purposes, we'll proceed if token is not empty
            if (idToken.isNotEmpty()) {
                // In a real implementation, you'd extract these from the verified ID Token
                val email = "google.user@gmail.com" 
                val name = "Google User"
                val isVerified = true // In real app, check 'email_verified' claim from token
                
                if (repository.loginWithGoogle(email, name, isVerified)) {
                    _authUiState.value = _authUiState.value.copy(isLoading = false)
                    onSuccess()
                } else {
                    _authUiState.value = _authUiState.value.copy(
                        isLoading = false,
                        errorMessage = "Access Denied: Only verified Gmail accounts are allowed."
                    )
                }
            } else {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false,
                    errorMessage = "Invalid Google Security Token"
                )
            }
        }
    }

    fun loginWithGoogle(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(isLoading = true, errorMessage = null)
            // Simulation of Google account selection and authentication
            delay(1500)
            val demoGoogleEmail = "farmer.demo@gmail.com"
            val demoGoogleName = "Agro Farmer"
            val isVerified = true
            
            if (repository.loginWithGoogle(demoGoogleEmail, demoGoogleName, isVerified)) {
                _authUiState.value = _authUiState.value.copy(isLoading = false)
                onSuccess()
            } else {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false,
                    errorMessage = "Access Denied: Only verified Gmail accounts are allowed."
                )
            }
        }
    }

    fun register(user: UserEntity, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _authError.value = null
            if (!user.email.lowercase().endsWith("@gmail.com")) {
                _authError.value = "Only Gmail accounts are allowed"
                return@launch
            }
            if (repository.register(user)) {
                repository.login(user.email, user.passwordHash)
                onSuccess()
            } else {
                _authError.value = "Registration failed: User may already exist"
            }
        }
    }

    fun forgotPassword(email: String) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(
                isLoading = true, 
                errorMessage = null,
                successMessage = null
            )
            if (repository.forgotPassword(email)) {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false,
                    successMessage = "Password reset link sent to your email"
                )
            } else {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false,
                    errorMessage = "Email not found"
                )
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            repository.logout()
        }
    }

    fun setAuthMode(mode: AuthMode) {
        _authUiState.value = _authUiState.value.copy(authMode = mode, errorMessage = null)
    }

    fun sendFirebaseOtp(phone: String, activity: android.app.Activity, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(isLoading = true, errorMessage = null)
            
            val callbacks = object : PhoneAuthProvider.OnVerificationStateChangedCallbacks() {
                override fun onVerificationCompleted(credential: PhoneAuthCredential) {
                    // Auto-verification or instant validation
                    viewModelScope.launch {
                        // We could automatically sign in here if we wanted
                    }
                }

                override fun onVerificationFailed(e: FirebaseException) {
                    _authUiState.value = _authUiState.value.copy(
                        isLoading = false,
                        errorMessage = "Verification Failed: ${e.localizedMessage}"
                    )
                }

                override fun onCodeSent(
                    verificationId: String,
                    token: PhoneAuthProvider.ForceResendingToken
                ) {
                    _authUiState.value = _authUiState.value.copy(
                        isLoading = false,
                        isOtpSent = true,
                        verificationId = verificationId,
                        phoneNumber = phone,
                        successMessage = "OTP sent to $phone"
                    )
                    onSuccess()
                }
            }

            repository.sendFirebaseOtp(phone, activity, callbacks)
        }
    }

    fun verifyFirebaseOtp(code: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            val verificationId = _authUiState.value.verificationId
            if (verificationId == null) {
                _authUiState.value = _authUiState.value.copy(errorMessage = "Verification ID missing")
                return@launch
            }

            _authUiState.value = _authUiState.value.copy(isLoading = true, errorMessage = null)
            val success = repository.verifyFirebaseOtp(verificationId, code)
            
            if (success) {
                _authUiState.value = _authUiState.value.copy(isLoading = false)
                onSuccess()
            } else {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false,
                    errorMessage = "Invalid OTP code"
                )
            }
        }
    }

    fun sendOtp(phone: String) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(
                isLoading = true, 
                errorMessage = null,
                successMessage = null,
                phoneNumber = phone
            )
            
            val generatedOtp = (100000..999999).random().toString()
            repository.saveOtp(phone, generatedOtp)
            
            kotlinx.coroutines.delay(1500)
            
            // Professional Simulated Delivery
            NotificationHelper.showOtpNotification(context, generatedOtp)
            
            _authUiState.value = _authUiState.value.copy(
                isLoading = false, 
                isOtpSent = true,
                successMessage = "OTP sent to $phone. Please check your notifications."
            )
        }
    }

    fun verifyOtp(otpCode: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _authUiState.value = _authUiState.value.copy(isLoading = true, errorMessage = null)
            
            val phone = _authUiState.value.phoneNumber
            val isValid = repository.verifyOtp(phone, otpCode)
            
            if (isValid) {
                _authUiState.value = _authUiState.value.copy(isLoading = false)
                // Execute onSuccess immediately to trigger navigation
                onSuccess()
            } else {
                _authUiState.value = _authUiState.value.copy(
                    isLoading = false, 
                    errorMessage = "Invalid or expired OTP. Please try again."
                )
            }
        }
    }

    fun updateLocation(latLng: LatLng) {
        _currentLocation.value = latLng
        fetchWeather(latLng.latitude, latLng.longitude)
    }

    private fun fetchWeather(lat: Double, lng: Double) {
        viewModelScope.launch {
            _isWeatherLoading.value = true
            try {
                _weatherInfo.value = repository.getWeatherData(lat, lng)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isWeatherLoading.value = false
            }
        }
    }

    private fun observeLanguage() {
        viewModelScope.launch {
            repository.getSelectedLanguage().collect {
                _selectedLanguage.value = it
                val currentLocale = AppCompatDelegate.getApplicationLocales().toLanguageTags()
                if (it != currentLocale && it.isNotEmpty()) {
                    val appLocale: LocaleListCompat = LocaleListCompat.forLanguageTags(it)
                    AppCompatDelegate.setApplicationLocales(appLocale)
                }
            }
        }
    }

    fun setLanguage(languageCode: String) {
        viewModelScope.launch {
            repository.saveLanguage(languageCode)
            val appLocale: LocaleListCompat = LocaleListCompat.forLanguageTags(languageCode)
            AppCompatDelegate.setApplicationLocales(appLocale)
        }
    }

    private fun observeSettings() {
        viewModelScope.launch {
            repository.getDarkMode().collect {
                _isDarkMode.value = it
            }
        }
        viewModelScope.launch {
            repository.getNotificationsEnabled().collect {
                _notificationsEnabled.value = it
            }
        }
        viewModelScope.launch {
            repository.getAiSensitivity().collect {
                _aiSensitivity.value = it
            }
        }
        viewModelScope.launch {
            repository.getTwoFactorEnabled().collect {
                _twoFactorEnabled.value = it
            }
        }
        viewModelScope.launch {
            repository.getBiometricLoginEnabled().collect {
                _biometricLoginEnabled.value = it
            }
        }
    }

    fun setDarkMode(enabled: Boolean) {
        viewModelScope.launch {
            repository.setDarkMode(enabled)
        }
    }

    fun setNotificationsEnabled(enabled: Boolean) {
        viewModelScope.launch {
            repository.setNotificationsEnabled(enabled)
        }
    }

    fun setAiSensitivity(value: Float) {
        viewModelScope.launch {
            repository.setAiSensitivity(value)
        }
    }

    fun setTwoFactorEnabled(enabled: Boolean) {
        viewModelScope.launch {
            repository.setTwoFactorEnabled(enabled)
        }
    }

    fun setBiometricLoginEnabled(enabled: Boolean) {
        viewModelScope.launch {
            repository.setBiometricLoginEnabled(enabled)
        }
    }

    fun changePassword(old: String, new: String) {
        viewModelScope.launch {
            val success = repository.changePassword(old, new)
            _uiMessage.value = if (success) "Password Changed Successfully" else "Incorrect Current Password"
        }
    }

    fun startCloudSync() {
        viewModelScope.launch {
            _isSyncing.value = true
            repository.syncCloudData().collect {
                _syncProgress.value = it
            }
            _isSyncing.value = false
            _syncProgress.value = null
            _uiMessage.value = "Cloud Data Sync Completed Successfully"
        }
    }

    fun exportFarmReport() {
        viewModelScope.launch {
            _isExporting.value = true
            val fileName = repository.exportReport()
            _isExporting.value = false
            _uiMessage.value = "Report exported: $fileName"
        }
    }

    fun calibrateSensors() {
        viewModelScope.launch {
            _isCalibrating.value = true
            val success = repository.calibrateIoT()
            _isCalibrating.value = false
            _uiMessage.value = if (success) "IoT Sensors Calibrated Successfully" else "Calibration Failed"
        }
    }

    fun clearUiMessage() {
        _uiMessage.value = null
    }

    fun shareApp(context: android.content.Context) {
        val shareText = context.getString(R.string.share_text)
        val sendIntent = android.content.Intent().apply {
            action = android.content.Intent.ACTION_SEND
            putExtra(android.content.Intent.EXTRA_TEXT, shareText)
            type = "text/plain"
        }
        val shareIntent = android.content.Intent.createChooser(sendIntent, null)
        context.startActivity(shareIntent)
    }

    fun shareDetectionResult(context: android.content.Context, disease: CropDisease) {
        val shareText = """
            AgroAI Analysis Report
            ----------------------
            Disease: ${disease.name}
            Scientific Name: ${disease.scientificName}
            Severity: ${disease.severity}
            
            Symptoms:
            ${disease.symptoms.joinToString("\n• ", prefix = "• ")}
            
            Treatment Plan:
            ${disease.treatmentSuggestions.joinToString("\n• ", prefix = "• ")}
            
            Analyzed by AgroAI Agent.
        """.trimIndent()

        val sendIntent = android.content.Intent().apply {
            action = android.content.Intent.ACTION_SEND
            putExtra(android.content.Intent.EXTRA_TEXT, shareText)
            type = "text/plain"
        }
        val shareIntent = android.content.Intent.createChooser(sendIntent, "Share Analysis Report")
        context.startActivity(shareIntent)
    }

    fun updateProfile(
        farmName: String,
        farmLocation: String,
        farmSize: Double,
        profileImageUri: String?,
        experienceYears: Int,
        primaryCrops: String,
        soilType: String,
        irrigationSystem: String
    ) {
        viewModelScope.launch {
            repository.updateProfile(
                farmName,
                farmLocation,
                farmSize,
                profileImageUri,
                experienceYears,
                primaryCrops,
                soilType,
                irrigationSystem
            )
        }
    }

    fun updateProfileImage(uri: String) {
        viewModelScope.launch {
            repository.updateProfileImage(uri)
        }
    }

    private fun observeSensorData() {
        viewModelScope.launch {
            repository.getSensorData().collect {
                _sensorData.value = it
            }
        }
    }

    fun scanCrop(imagePath: String) {
        viewModelScope.launch {
            try {
                _isValidating.value = true
                _isImageRejected.value = false
                _rejectionReason.value = null
                
                // AI Agent Strict Topic Validation
                delay(1200) 
                val isValid = repository.validateCropImage(imagePath)
                _isValidating.value = false

                if (isValid) {
                    _isDetecting.value = true
                    // Professional handshaking with AI database
                    delay(800)
                    val result = repository.detectDisease(imagePath)
                    _detectionResult.value = result
                } else {
                    _isImageRejected.value = true
                    _rejectionReason.value = context.getString(R.string.image_rejected_subtitle)
                    _uiMessage.value = context.getString(R.string.image_rejected)
                }
            } catch (e: Exception) {
                Log.e("AgroViewModel", "Scanning error", e)
                _isValidating.value = false
                _isDetecting.value = false
                _uiMessage.value = "Professional Analysis System Error: ${e.localizedMessage ?: "Unknown Error"}"
            } finally {
                _isValidating.value = false
                _isDetecting.value = false
            }
        }
    }
    
    fun clearDetection() {
        _detectionResult.value = null
        _isImageRejected.value = false
        _rejectionReason.value = null
    }

    // Chatbot logic
    fun initializeChat() {
        if (_uiState.value.messages.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                messages = listOf(
                    ChatMessage(
                        text = "Hello! I'm your Agro Assistant. How can I help you today?",
                        isUser = false
                    )
                )
            )
        }
    }

    suspend fun sendMessage(text: String) {
        if (text.isBlank()) return

        // Add user message
        val userMessage = ChatMessage(text = text, isUser = true)
        _uiState.value = _uiState.value.copy(
            messages = listOf(userMessage) + _uiState.value.messages,
            isLoading = true
        )

        // Process Voice Commands (Basic Intent Parsing)
        val lowerText = text.lowercase()
        when {
            lowerText.contains("scan") || lowerText.contains("crop") -> {
                _uiMessage.value = "NAVIGATE_SCAN"
            }
            lowerText.contains("monitor") || lowerText.contains("soil") -> {
                _uiMessage.value = "NAVIGATE_MONITOR"
            }
            lowerText.contains("alert") -> {
                _uiMessage.value = "NAVIGATE_ALERTS"
            }
            lowerText.contains("profile") || lowerText.contains("farm") -> {
                _uiMessage.value = "NAVIGATE_PROFILE"
            }
        }

        try {
            val response = repository.chatWithAi(text)
            val aiMessage = ChatMessage(text = response, isUser = false)
            _uiState.value = _uiState.value.copy(
                messages = listOf(aiMessage) + _uiState.value.messages,
                isLoading = false
            )
        } catch (e: Exception) {
            val errorMessage = ChatMessage(text = "Sorry, I encountered an error: ${e.message}", isUser = false)
            _uiState.value = _uiState.value.copy(
                messages = listOf(errorMessage) + _uiState.value.messages,
                isLoading = false
            )
        }
    }
}
