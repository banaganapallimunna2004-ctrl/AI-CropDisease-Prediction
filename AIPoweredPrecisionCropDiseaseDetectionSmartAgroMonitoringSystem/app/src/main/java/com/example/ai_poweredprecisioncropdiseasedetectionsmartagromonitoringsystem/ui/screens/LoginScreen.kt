package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.ArrowDropDown
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AuthMode
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import androidx.compose.material.icons.filled.Fingerprint
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import android.app.Activity
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.theme.PrimaryGreen
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.theme.SecondaryGreen
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroAuthUiState
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.util.isValidEmail
import kotlin.math.pow
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Country codes for global support
 */
val CountryCodes = listOf(
    "+91" to "India",
    "+1" to "USA",
    "+44" to "UK",
    "+61" to "Australia",
    "+86" to "China",
    "+81" to "Japan",
    "+49" to "Germany",
    "+33" to "France"
)

/**
 * Enterprise-Grade Login Screen for AI-Powered Precision Crop Disease Detection System
 * Fully accessible, animated, and production-ready
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AgroViewModel = hiltViewModel(),
    onLoginSuccess: () -> Unit,
    onNavigateToSignup: () -> Unit,
    onForgotPassword: () -> Unit = {}
) {
    val uiState by viewModel.authUiState.collectAsState()
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    val credentialManager = remember { CredentialManager.create(context) }

    // Biometric Check
    val biometricManager = remember { BiometricManager.from(context) }
    val isBiometricAvailable = remember {
        biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) == BiometricManager.BIOMETRIC_SUCCESS
    }

    // Notification permission launcher
    val notificationPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        // Handle permission result if needed
    }

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    // Form state
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var selectedCountryCode by remember { mutableStateOf(CountryCodes[0]) }
    var otpCode by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var showForgotPasswordDialog by remember { mutableStateOf(false) }
    var forgotPasswordEmail by remember { mutableStateOf("") }

    val isFormValid by remember {
        derivedStateOf {
            when (uiState.authMode) {
                AuthMode.EMAIL -> email.isValidEmail() && password.length >= 6
                AuthMode.OTP -> if (uiState.isOtpSent) otpCode.length == 6 else phone.isNotEmpty()
            }
        }
    }

    // Forgot Password Dialog
    if (showForgotPasswordDialog) {
        AlertDialog(
            onDismissRequest = { showForgotPasswordDialog = false },
            title = { Text("Forgot Password") },
            text = {
                Column {
                    Text("Enter your email address to receive a password reset link.")
                    Spacer(modifier = Modifier.height(16.dp))
                    OutlinedTextField(
                        value = forgotPasswordEmail,
                        onValueChange = { forgotPasswordEmail = it },
                        label = { Text("Email") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.forgotPassword(forgotPasswordEmail)
                        showForgotPasswordDialog = false
                    },
                    enabled = forgotPasswordEmail.isValidEmail()
                ) {
                    Text("Send Link")
                }
            },
            dismissButton = {
                TextButton(onClick = { showForgotPasswordDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Shake animation for errors
    val shakeAnimation = produceState(
        initialValue = 0f,
        key1 = uiState.errorMessage
    ) {
        if (uiState.errorMessage != null) {
            repeat(3) {
                for (i in 0..10) {
                    value = (-1f).pow(i) * 5f
                    delay(50)
                }
            }
            value = 0f
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
    ) {
        // Creative Background: Farmer using tablet for precision monitoring
        AsyncImage(
            model = "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?q=80&w=2000&auto=format&fit=crop",
            contentDescription = null,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop,
            alpha = 0.4f
        )

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.7f),
                            Color.Black.copy(alpha = 0.4f),
                            Color.Black.copy(alpha = 0.8f)
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .systemBarsPadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 40.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Spacer(modifier = Modifier.height(20.dp))
            AgroAuthLogo()
            Spacer(modifier = Modifier.height(32.dp))
            AgroAuthWelcomeSection()
            Spacer(modifier = Modifier.height(40.dp))
            AgroAuthForm(
                email = email,
                password = password,
                phone = phone,
                selectedCountryCode = selectedCountryCode,
                otpCode = otpCode,
                passwordVisible = passwordVisible,
                isFormValid = isFormValid,
                shakeOffset = shakeAnimation.value,
                uiState = uiState,
                onEmailChange = { email = it },
                onPasswordChange = { password = it },
                onPhoneChange = { phone = it },
                onCountryCodeChange = { selectedCountryCode = it },
                onOtpChange = { otpCode = it },
                onPasswordVisibilityToggle = { passwordVisible = !passwordVisible },
                onForgotPassword = {
                    if (email.isValidEmail()) {
                        forgotPasswordEmail = email
                    }
                    showForgotPasswordDialog = true
                },
                onBiometricLogin = {
                    val activity = context as? FragmentActivity
                    if (activity != null) {
                        showBiometricPrompt(
                            activity = activity,
                            onSuccess = onLoginSuccess,
                            onError = { /* Error handled by prompt usually, or we can show a toast */ }
                        )
                    }
                },
                isBiometricAvailable = isBiometricAvailable,
                onLogin = {
                    when (uiState.authMode) {
                        AuthMode.EMAIL -> viewModel.login(email, password, onLoginSuccess)
                        AuthMode.OTP -> {
                            if (uiState.isOtpSent) {
                                viewModel.verifyFirebaseOtp(otpCode, onLoginSuccess)
                            } else {
                                val fullPhone = "${selectedCountryCode.first}$phone"
                                viewModel.sendFirebaseOtp(fullPhone, context as Activity) {
                                    // Firebase OTP initiated
                                }
                            }
                        }
                    }
                },
                onSwitchMode = {
                    viewModel.setAuthMode(
                        if (uiState.authMode == AuthMode.EMAIL) AuthMode.OTP else AuthMode.EMAIL
                    )
                }
            )
            Spacer(modifier = Modifier.height(32.dp))
            AgroAuthSocialLogin(
                onGoogleLogin = {
                    coroutineScope.launch {
                        try {
                            val googleIdOption = GetGoogleIdOption.Builder()
                                .setFilterByAuthorizedAccounts(false)
                                .setServerClientId(context.getString(R.string.google_client_id))
                                .setAutoSelectEnabled(true)
                                .build()

                            val request = GetCredentialRequest.Builder()
                                .addCredentialOption(googleIdOption)
                                .build()

                            val result = credentialManager.getCredential(
                                context = context,
                                request = request
                            )

                            val credential = result.credential
                            if (credential is GoogleIdTokenCredential) {
                                viewModel.loginWithGoogleToken(credential.idToken, onLoginSuccess)
                            }
                        } catch (e: Exception) {
                            Log.e("LoginScreen", "Google Sign-In failed", e)
                            // You might want to show a Snackbar here
                        }
                    }
                }
            )
            Spacer(modifier = Modifier.height(32.dp))
            AgroAuthSignupPrompt(onNavigateToSignup = onNavigateToSignup)
            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

/** Logo Section */
@Composable
private fun AgroAuthLogo() {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Card(
            modifier = Modifier
                .size(100.dp)
                .shadow(24.dp, RoundedCornerShape(30.dp)),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(30.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Agriculture,
                    contentDescription = "AgroAI Precision Farming",
                    modifier = Modifier.size(50.dp),
                    tint = PrimaryGreen
                )
            }
        }
    }
}

/** Welcome Section */
@Composable
private fun AgroAuthWelcomeSection() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White.copy(alpha = 0.1f))
            .padding(16.dp)
    ) {
        Text(
            text = stringResource(R.string.agro_auth_welcome_title),
            style = MaterialTheme.typography.headlineLarge.copy(
                fontSize = 30.sp,
                letterSpacing = 0.5.sp
            ),
            fontWeight = FontWeight.ExtraBold,
            color = Color.White,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = stringResource(R.string.agro_auth_welcome_subtitle),
            style = MaterialTheme.typography.bodyMedium.copy(
                lineHeight = 20.sp
            ),
            color = Color.White.copy(alpha = 0.9f),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 8.dp)
        )
    }
}

/** Professional Form */
@Composable
private fun AgroAuthForm(
    email: String,
    password: String,
    phone: String,
    selectedCountryCode: Pair<String, String>,
    otpCode: String,
    passwordVisible: Boolean,
    isFormValid: Boolean,
    shakeOffset: Float,
    uiState: AgroAuthUiState,
    onEmailChange: (String) -> Unit,
    onPasswordChange: (String) -> Unit,
    onPhoneChange: (String) -> Unit,
    onCountryCodeChange: (Pair<String, String>) -> Unit,
    onOtpChange: (String) -> Unit,
    onPasswordVisibilityToggle: () -> Unit,
    onForgotPassword: () -> Unit,
    onBiometricLogin: () -> Unit,
    isBiometricAvailable: Boolean,
    onLogin: () -> Unit,
    onSwitchMode: () -> Unit
) {
    Column(
        modifier = Modifier
            .offset(x = shakeOffset.dp)
            .animateContentSize()
    ) {
        if (uiState.authMode == AuthMode.EMAIL) {
            AgroAuthTextField(
                value = email,
                onValueChange = onEmailChange,
                label = stringResource(R.string.email_or_phone),
                icon = Icons.Default.Email,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                isError = !email.isValidEmail() && email.isNotEmpty()
            )

            Spacer(modifier = Modifier.height(16.dp))

            AgroAuthPasswordField(
                value = password,
                onValueChange = onPasswordChange,
                passwordVisible = passwordVisible,
                onVisibilityToggle = onPasswordVisibilityToggle,
                isError = password.length < 6 && password.isNotEmpty()
            )

            Spacer(modifier = Modifier.height(16.dp))
            AgroAuthForgotPassword(onForgotPassword = onForgotPassword)
        } else {
            if (!uiState.isOtpSent) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CountryCodePicker(
                        selectedCode = selectedCountryCode,
                        onCodeSelected = onCountryCodeChange,
                        modifier = Modifier.weight(0.4f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    AgroAuthTextField(
                        value = phone,
                        onValueChange = onPhoneChange,
                        label = stringResource(R.string.phone_number),
                        icon = Icons.Default.Phone,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        isError = false, // Allow any phone number entry
                        modifier = Modifier.weight(0.6f)
                    )
                }
            } else {
                AgroAuthTextField(
                    value = otpCode,
                    onValueChange = onOtpChange,
                    label = stringResource(R.string.otp_code),
                    icon = Icons.Default.Lock,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    isError = otpCode.length != 6 && otpCode.isNotEmpty()
                )
            }
        }

        AnimatedVisibility(
            visible = uiState.errorMessage != null || uiState.successMessage != null,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Column {
                uiState.errorMessage?.let {
                    ErrorMessage(message = it)
                }
                uiState.successMessage?.let {
                    SuccessMessage(message = it)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            AgroAuthLoginButton(
                isEnabled = isFormValid && !uiState.isLoading,
                isLoading = uiState.isLoading,
                text = when {
                    uiState.authMode == AuthMode.EMAIL -> stringResource(R.string.login)
                    !uiState.isOtpSent -> stringResource(R.string.send_otp)
                    else -> stringResource(R.string.verify_otp)
                },
                onClick = onLogin,
                modifier = Modifier.weight(1f)
            )

            if (isBiometricAvailable) {
                Spacer(modifier = Modifier.width(12.dp))
                IconButton(
                    onClick = onBiometricLogin,
                    modifier = Modifier
                        .size(56.dp)
                        .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                ) {
                    Icon(
                        imageVector = Icons.Default.Fingerprint,
                        contentDescription = "Biometric Login",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(
            onClick = onSwitchMode,
            modifier = Modifier.align(Alignment.CenterHorizontally)
        ) {
            Text(
                text = if (uiState.authMode == AuthMode.EMAIL)
                    stringResource(R.string.login_with_otp)
                else
                    stringResource(R.string.login_with_email),
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

/** Success Message */
@Composable
private fun SuccessMessage(message: String) {
    Text(
        text = message,
        color = Color(0xFF4CAF50),
        style = MaterialTheme.typography.bodySmall,
        modifier = Modifier.padding(horizontal = 4.dp)
    )
}

/** Reusable TextField */
@Composable
private fun AgroAuthTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    icon: ImageVector,
    keyboardOptions: KeyboardOptions,
    isError: Boolean,
    modifier: Modifier = Modifier.fillMaxWidth()
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        leadingIcon = {
            Icon(icon, contentDescription = null, tint = Color.White)
        },
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        keyboardOptions = keyboardOptions,
        singleLine = true,
        isError = isError,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Color.White,
            unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
            focusedLabelColor = Color.White,
            unfocusedLabelColor = Color.White.copy(alpha = 0.7f),
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            errorBorderColor = MaterialTheme.colorScheme.error,
            cursorColor = Color.White
        )
    )
}

/** Creative Country Code Picker */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CountryCodePicker(
    selectedCode: Pair<String, String>,
    onCodeSelected: (Pair<String, String>) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = !expanded },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = selectedCode.first,
            onValueChange = {},
            readOnly = true,
            label = { Text("Code") },
            trailingIcon = { Icon(Icons.Default.ArrowDropDown, null) },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.White,
                unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
                focusedLabelColor = Color.White,
                unfocusedLabelColor = Color.White.copy(alpha = 0.7f),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.menuAnchor()
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            CountryCodes.forEach { code ->
                DropdownMenuItem(
                    text = {
                        Row {
                            Text(text = code.first, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(text = code.second)
                        }
                    },
                    onClick = {
                        onCodeSelected(code)
                        expanded = false
                    }
                )
            }
        }
    }
}

/** Password Field with Toggle */
@Composable
private fun AgroAuthPasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    passwordVisible: Boolean,
    onVisibilityToggle: () -> Unit,
    isError: Boolean
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(stringResource(R.string.password)) },
        visualTransformation = if (passwordVisible)
            VisualTransformation.None
        else
            PasswordVisualTransformation(),
        leadingIcon = {
            Icon(Icons.Default.Lock, contentDescription = null, tint = Color.White)
        },
        trailingIcon = {
            IconButton(onClick = onVisibilityToggle) {
                Icon(
                    imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                    contentDescription = if (passwordVisible)
                        stringResource(R.string.hide_password)
                    else
                        stringResource(R.string.show_password),
                    tint = Color.White.copy(alpha = 0.7f)
                )
            }
        },
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        singleLine = true,
        isError = isError,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Color.White,
            unfocusedBorderColor = Color.White.copy(alpha = 0.4f),
            focusedLabelColor = Color.White,
            unfocusedLabelColor = Color.White.copy(alpha = 0.7f),
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            errorBorderColor = MaterialTheme.colorScheme.error,
            cursorColor = Color.White
        )
    )
}

/** Error Message */
@Composable
private fun ErrorMessage(message: String) {
    Text(
        text = message,
        color = MaterialTheme.colorScheme.error,
        style = MaterialTheme.typography.bodySmall,
        modifier = Modifier.padding(horizontal = 4.dp)
    )
}

/** Forgot Password */
@Composable
private fun ColumnScope.AgroAuthForgotPassword(onForgotPassword: () -> Unit) {
    Text(
        text = stringResource(R.string.forgot_password),
        color = Color.White.copy(alpha = 0.8f),
        fontWeight = FontWeight.Medium,
        modifier = Modifier
            .align(Alignment.End)
            .clickable { onForgotPassword() }
    )
}

/** Primary Login Button */
@Composable
private fun AgroAuthLoginButton(
    isEnabled: Boolean,
    isLoading: Boolean,
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp),
        enabled = isEnabled,
        colors = ButtonDefaults.buttonColors(
            containerColor = PrimaryGreen,
            disabledContainerColor = PrimaryGreen.copy(alpha = 0.5f)
        ),
        shape = RoundedCornerShape(16.dp),
        contentPadding = PaddingValues(horizontal = 32.dp)
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp,
                color = Color.White
            )
        } else {
            Text(
                text = text,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

/** Social Login */
@Composable
private fun ColumnScope.AgroAuthSocialLogin(
    onGoogleLogin: () -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            HorizontalDivider(modifier = Modifier.weight(1f), color = Color.White.copy(alpha = 0.2f))
            Text(
                text = "  " + stringResource(R.string.or_continue_with) + "  ",
                color = Color.White.copy(alpha = 0.6f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            HorizontalDivider(modifier = Modifier.weight(1f), color = Color.White.copy(alpha = 0.2f))
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Professional Google Button
        Surface(
            onClick = onGoogleLogin,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .shadow(8.dp, RoundedCornerShape(28.dp)),
            shape = RoundedCornerShape(28.dp),
            color = Color.White,
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE0E0E0))
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                // Creative Google Logo representation
                Box(modifier = Modifier.size(22.dp)) {
                    Column(modifier = Modifier.fillMaxSize()) {
                        Row(modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.weight(1f).fillMaxHeight().background(Color(0xFFEA4335)))
                            Box(modifier = Modifier.weight(1f).fillMaxHeight().background(Color(0xFFFBBC05)))
                        }
                        Row(modifier = Modifier.weight(1f)) {
                            Box(modifier = Modifier.weight(1f).fillMaxHeight().background(Color(0xFF4285F4)))
                            Box(modifier = Modifier.weight(1f).fillMaxHeight().background(Color(0xFF34A853)))
                        }
                    }
                }
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Text(
                    text = stringResource(R.string.continue_with_google),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF3C4043)
                )
            }
        }
    }
}

/**
 * Shows the Biometric Prompt
 */
private fun showBiometricPrompt(
    activity: FragmentActivity,
    onSuccess: () -> Unit,
    onError: (String) -> Unit
) {
    val executor = ContextCompat.getMainExecutor(activity)
    val biometricPrompt = BiometricPrompt(activity, executor,
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                super.onAuthenticationError(errorCode, errString)
                onError(errString.toString())
            }

            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                super.onAuthenticationSucceeded(result)
                onSuccess()
            }

            override fun onAuthenticationFailed() {
                super.onAuthenticationFailed()
                onError("Authentication failed")
            }
        })

    val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Biometric Login")
        .setSubtitle("Log in using your fingerprint or face ID")
        .setNegativeButtonText("Cancel")
        .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
        .build()

    biometricPrompt.authenticate(promptInfo)
}

/** Signup Prompt */
@Composable
private fun AgroAuthSignupPrompt(onNavigateToSignup: () -> Unit) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp)
    ) {
        Text(
            text = stringResource(R.string.dont_have_account),
            color = Color.White.copy(alpha = 0.7f),
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = stringResource(R.string.sign_up),
            color = Color.White,
            fontWeight = FontWeight.ExtraBold,
            fontSize = 15.sp,
            modifier = Modifier.clickable { onNavigateToSignup() }
        )
    }
}