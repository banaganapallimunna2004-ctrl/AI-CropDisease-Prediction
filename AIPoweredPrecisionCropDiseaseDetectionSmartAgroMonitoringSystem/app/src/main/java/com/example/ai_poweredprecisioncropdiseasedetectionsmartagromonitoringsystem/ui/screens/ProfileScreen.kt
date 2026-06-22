package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.res.painterResource
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import coil.compose.AsyncImage
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.automirrored.filled.Logout
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.UserEntity
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel
import androidx.compose.ui.text.input.PasswordVisualTransformation
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: AgroViewModel,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val selectedLanguage by viewModel.selectedLanguage.collectAsState()
    val isDarkMode by viewModel.isDarkMode.collectAsState()
    val notificationsEnabled by viewModel.notificationsEnabled.collectAsState()
    val twoFactorEnabled by viewModel.twoFactorEnabled.collectAsState()
    val biometricLoginEnabled by viewModel.biometricLoginEnabled.collectAsState()
    val aiSensitivity by viewModel.aiSensitivity.collectAsState()
    val syncProgress by viewModel.syncProgress.collectAsState()
    val isSyncing by viewModel.isSyncing.collectAsState()
    val isExporting by viewModel.isExporting.collectAsState()
    val isCalibrating by viewModel.isCalibrating.collectAsState()
    val uiMessage by viewModel.uiMessage.collectAsState()
    val loggedInUserEntity by viewModel.loggedInUser.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(uiMessage) {
        uiMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearUiMessage()
        }
    }

    val loggedInUser = remember(loggedInUserEntity) {
        loggedInUserEntity?.let {
            UserData(
                fullName = it.fullName,
                phone = it.phone,
                farmName = it.farmName,
                farmLocation = it.farmLocation,
                farmSize = it.farmSize?.toDouble(),
                profileImageUri = it.profileImageUri,
                experienceYears = it.experienceYears,
                primaryCrops = it.primaryCrops ?: "Rice, Tomato, Cotton",
                soilType = it.soilType ?: "Black Soil",
                irrigationSystem = it.irrigationSystem ?: "Drip Irrigation"
            )
        }
    }

    var showLanguageDialog by remember { mutableStateOf(false) }
    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showSensitivityDialog by remember { mutableStateOf(false) }
    var showSecurityDialog by remember { mutableStateOf(false) }

    // Edit states
    var editMode by remember { mutableStateOf(false) }
    var profileImageUri by remember { mutableStateOf<String?>(loggedInUser?.profileImageUri) }

    val primaryGreen = MaterialTheme.colorScheme.primary
    val lightGreen = MaterialTheme.colorScheme.secondaryContainer

    // Image picker launcher
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.toString()?.let { imageUri ->
            profileImageUri = imageUri
            viewModel.updateProfileImage(imageUri)
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = stringResource(R.string.profile),
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    IconButton(onClick = { editMode = !editMode }) {
                        Icon(
                            imageVector = if (editMode) Icons.Default.Close else Icons.Default.Edit,
                            contentDescription = if (editMode) "Cancel Edit" else "Edit Profile",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = primaryGreen,
                    titleContentColor = Color.White
                )
            )
        },
        floatingActionButton = {
            if (editMode) {
                FloatingActionButton(
                    onClick = {
                        viewModel.updateProfile(
                            farmName = loggedInUser?.farmName ?: "",
                            farmLocation = loggedInUser?.farmLocation ?: "",
                            farmSize = loggedInUser?.farmSize ?: 0.0,
                            profileImageUri = profileImageUri,
                            experienceYears = loggedInUser?.experienceYears ?: 0,
                            primaryCrops = loggedInUser?.primaryCrops ?: "",
                            soilType = loggedInUser?.soilType ?: "",
                            irrigationSystem = loggedInUser?.irrigationSystem ?: ""
                        )
                        editMode = false
                    },
                    containerColor = primaryGreen
                ) {
                    Icon(Icons.Default.Save, contentDescription = stringResource(R.string.save_changes))
                }
            }
        }
    ) { padding ->

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background),
            horizontalAlignment = Alignment.CenterHorizontally,
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {

            item {
                ProfileHeaderCard(
                    user = loggedInUser,
                    editMode = editMode,
                    profileImageUri = profileImageUri,
                    onImagePick = {
                        imagePickerLauncher.launch("image/*")
                    }
                )
            }

            item {
                SectionHeader(stringResource(R.string.farm_information))
                FarmDetailsCard(
                    user = loggedInUser,
                    editMode = editMode,
                    onEditClick = { showEditProfileDialog = true }
                )
            }

            item {
                SectionHeader(stringResource(R.string.advanced_tools))
                AdvancedFeaturesCard(
                    isSyncing = isSyncing,
                    syncProgress = syncProgress,
                    isExporting = isExporting,
                    isCalibrating = isCalibrating,
                    onSensitivityClick = { showSensitivityDialog = true },
                    onSyncClick = { viewModel.startCloudSync() },
                    onExportClick = { viewModel.exportFarmReport() },
                    onCalibrationClick = { viewModel.calibrateSensors() }
                )
            }

            item {
                SectionHeader(stringResource(R.string.app_settings))
                QuickActionsCard(
                    selectedLanguage = selectedLanguage,
                    isDarkMode = isDarkMode,
                    notificationsEnabled = notificationsEnabled,
                    editMode = editMode,
                    onLanguageClick = { showLanguageDialog = true },
                    onDarkModeChange = { viewModel.setDarkMode(it) },
                    onNotificationsChange = { viewModel.setNotificationsEnabled(it) },
                    onSecurityClick = { showSecurityDialog = true },
                    onShareClick = { viewModel.shareApp(context) },
                    onLogout = onLogout
                )
            }
        }
    }

    // Dialogs
    AnimatedVisibility(visible = showLanguageDialog) {
        LanguageSelectionDialog(
            currentLanguage = selectedLanguage,
            onDismiss = { showLanguageDialog = false },
            onLanguageSelected = {
                viewModel.setLanguage(it)
                showLanguageDialog = false
            }
        )
    }

    AnimatedVisibility(visible = showEditProfileDialog) {
        EditProfileDialog(
            user = loggedInUser,
            onDismiss = { showEditProfileDialog = false },
            onSave = { farmName, location, size, exp, crops, soil, irrigation ->
                viewModel.updateProfile(
                    farmName,
                    location,
                    size,
                    profileImageUri,
                    exp,
                    crops,
                    soil,
                    irrigation
                )
                showEditProfileDialog = false
            }
        )
    }

    if (showSensitivityDialog) {
        SensitivityAdjustmentDialog(
            currentValue = aiSensitivity,
            onDismiss = { showSensitivityDialog = false },
            onValueChange = { viewModel.setAiSensitivity(it) }
        )
    }

    if (showSecurityDialog) {
        PrivacySecurityDialog(
            twoFactorEnabled = twoFactorEnabled,
            biometricEnabled = biometricLoginEnabled,
            onDismiss = { showSecurityDialog = false },
            onToggleTwoFactor = { viewModel.setTwoFactorEnabled(it) },
            onToggleBiometric = { viewModel.setBiometricLoginEnabled(it) },
            onChangePassword = { old, new -> viewModel.changePassword(old, new) }
        )
    }
}

@Composable
fun SectionHeader(title: String) {
    Text(
        text = title,
        fontSize = 14.sp,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 24.dp, top = 24.dp, bottom = 8.dp)
    )
}

@Composable
fun ProfileHeaderCard(
    user: UserData?,
    editMode: Boolean,
    profileImageUri: String?,
    onImagePick: () -> Unit
) {
    val primaryGreen = MaterialTheme.colorScheme.primary

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        shape = RoundedCornerShape(32.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(primaryGreen, Color(0xFF1B5E20))
                    )
                )
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Profile Image with Edit Overlay
            Box(contentAlignment = Alignment.BottomEnd) {
                ProfileImageContainer(
                    imageUri = profileImageUri,
                    initials = user?.fullName?.take(2)?.uppercase() ?: "AG"
                )

                if (editMode) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .clickable { onImagePick() }
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Filled.PhotoCamera,
                            contentDescription = "Change",
                            tint = primaryGreen,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                } else {
                    // Verified Badge
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(Color.White)
                            .padding(2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Verified",
                            tint = Color(0xFF2196F3),
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = user?.fullName ?: "Smart Farmer",
                    color = Color.White,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Surface(
                    color = Color.White.copy(alpha = 0.2f),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    Text(
                        text = user?.phone ?: "+91 XXXXX XXXXX",
                        color = Color.White,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            FarmStatsRow()
        }
    }
}

@Composable
fun ProfileImageContainer(
    imageUri: String?,
    initials: String
) {
    Box(
        modifier = Modifier
            .size(110.dp)
            .clip(CircleShape)
            .background(Color.White),
        contentAlignment = Alignment.Center
    ) {
        if (!imageUri.isNullOrEmpty()) {
            AsyncImage(
                model = imageUri,
                contentDescription = "Profile Picture",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
            )
        } else {
            Text(
                text = initials,
                fontSize = 34.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun FarmStatsRow() {
    Row(
        horizontalArrangement = Arrangement.SpaceEvenly,
        modifier = Modifier.fillMaxWidth()
    ) {
        StatsItem(title = stringResource(R.string.fields), value = "12")
        StatsItem(title = stringResource(R.string.crops), value = "5")
        StatsItem(title = stringResource(R.string.alerts), value = "3")
    }
}

@Composable
fun FarmDetailsCard(
    user: UserData?,
    editMode: Boolean,
    onEditClick: () -> Unit
) {
    val primaryGreen = MaterialTheme.colorScheme.primary

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Agriculture, contentDescription = null, tint = primaryGreen)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = stringResource(R.string.farm_information),
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = primaryGreen
                    )
                }

                if (editMode) {
                    IconButton(onClick = onEditClick) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Edit Farm Details",
                            tint = primaryGreen
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            FarmDetailRow(label = stringResource(R.string.farm_name), value = user?.farmName ?: "My Smart Farm")
            FarmDetailRow(label = stringResource(R.string.location), value = user?.farmLocation ?: "Tamil Nadu")
            FarmDetailRow(
                label = stringResource(R.string.total_land),
                value = "${user?.farmSize ?: 0.0} ${stringResource(R.string.acres)}"
            )
            FarmDetailRow(label = stringResource(R.string.experience_years), value = "${user?.experienceYears ?: 0} ${stringResource(R.string.years)}")
            FarmDetailRow(label = stringResource(R.string.main_crops), value = user?.primaryCrops ?: "Rice, Tomato, Cotton")
            FarmDetailRow(label = stringResource(R.string.soil_type), value = user?.soilType ?: "Black Soil")
            FarmDetailRow(label = stringResource(R.string.irrigation), value = user?.irrigationSystem ?: "Drip Irrigation")
        }
    }
}

@Composable
fun AdvancedFeaturesCard(
    isSyncing: Boolean,
    syncProgress: Int?,
    isExporting: Boolean,
    isCalibrating: Boolean,
    onSensitivityClick: () -> Unit,
    onSyncClick: () -> Unit,
    onExportClick: () -> Unit,
    onCalibrationClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = stringResource(R.string.advanced_tools),
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(12.dp)
            )

            AdvancedSettingsItem(
                icon = Icons.Default.PrecisionManufacturing,
                title = stringResource(R.string.ai_sensitivity),
                subtitle = stringResource(R.string.ai_sensitivity_subtitle),
                onClick = onSensitivityClick
            )

            AdvancedSettingsItem(
                icon = Icons.Default.CloudSync,
                title = stringResource(R.string.cloud_sync),
                subtitle = if (isSyncing) "Syncing data... ${syncProgress ?: 0}%" else stringResource(R.string.cloud_sync_subtitle),
                enabled = !isSyncing,
                trailing = {
                    if (isSyncing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                onClick = onSyncClick
            )

            AdvancedSettingsItem(
                icon = Icons.Default.FileDownload,
                title = stringResource(R.string.export_reports),
                subtitle = if (isExporting) "Generating report..." else stringResource(R.string.export_reports_subtitle),
                enabled = !isExporting,
                trailing = {
                    if (isExporting) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp
                        )
                    }
                },
                onClick = onExportClick
            )

            AdvancedSettingsItem(
                icon = Icons.Default.Tune,
                title = stringResource(R.string.iot_calibration),
                subtitle = if (isCalibrating) "Calibrating sensors..." else stringResource(R.string.iot_calibration_subtitle),
                enabled = !isCalibrating,
                trailing = {
                    if (isCalibrating) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp
                        )
                    }
                },
                onClick = onCalibrationClick
            )
        }
    }
}

@Composable
fun SensitivityAdjustmentDialog(
    currentValue: Float,
    onDismiss: () -> Unit,
    onValueChange: (Float) -> Unit
) {
    var sliderValue by remember { mutableStateOf(currentValue) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.ai_sensitivity)) },
        text = {
            Column {
                Text("Higher sensitivity may result in more frequent but less precise alerts.")
                Spacer(modifier = Modifier.height(16.dp))
                Slider(
                    value = sliderValue,
                    onValueChange = { sliderValue = it },
                    valueRange = 0f..1f,
                    steps = 10,
                    onValueChangeFinished = { onValueChange(sliderValue) }
                )
                Text(
                    text = "Current: ${(sliderValue * 100).toInt()}%",
                    modifier = Modifier.align(Alignment.End)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.close)) }
        }
    )
}

@Composable
fun PrivacySecurityDialog(
    twoFactorEnabled: Boolean,
    biometricEnabled: Boolean,
    onDismiss: () -> Unit,
    onToggleTwoFactor: (Boolean) -> Unit,
    onToggleBiometric: (Boolean) -> Unit,
    onChangePassword: (String, String) -> Unit
) {
    var showPasswordFields by remember { mutableStateOf(false) }
    var oldPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.privacy_security), fontWeight = FontWeight.Bold) },
        text = {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Two-Factor Authentication")
                    Switch(checked = twoFactorEnabled, onCheckedChange = onToggleTwoFactor)
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Biometric Login")
                    Switch(checked = biometricEnabled, onCheckedChange = onToggleBiometric)
                }
                Spacer(modifier = Modifier.height(16.dp))
                
                if (!showPasswordFields) {
                    Button(
                        onClick = { showPasswordFields = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Change Password")
                    }
                } else {
                    OutlinedTextField(
                        value = oldPassword,
                        onValueChange = { oldPassword = it },
                        label = { Text("Current Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Button(
                        onClick = { 
                            onChangePassword(oldPassword, newPassword)
                            showPasswordFields = false
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Update Password")
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.close)) }
        }
    )
}

@Composable
fun FarmDetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = Color.Gray, fontWeight = FontWeight.Medium)
        Text(
            text = value,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun QuickActionsCard(
    selectedLanguage: String,
    isDarkMode: Boolean,
    notificationsEnabled: Boolean,
    editMode: Boolean,
    onLanguageClick: () -> Unit,
    onDarkModeChange: (Boolean) -> Unit,
    onNotificationsChange: (Boolean) -> Unit,
    onSecurityClick: () -> Unit,
    onShareClick: () -> Unit,
    onLogout: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = stringResource(R.string.quick_actions),
                fontWeight = FontWeight.Bold,
                fontSize = 20.sp,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(12.dp)
            )

            val languageName = when (selectedLanguage) {
                "hi" -> stringResource(R.string.hindi)
                "ta" -> stringResource(R.string.tamil)
                "te" -> stringResource(R.string.telugu)
                "mr" -> stringResource(R.string.marathi)
                "es" -> stringResource(R.string.spanish)
                "kn" -> stringResource(R.string.kannada)
                "bn" -> stringResource(R.string.bengali)
                "or" -> stringResource(R.string.odia)
                "pa" -> stringResource(R.string.punjabi)
                else -> stringResource(R.string.english)
            }

            AdvancedSettingsItem(
                icon = Icons.Default.Language,
                title = stringResource(R.string.language),
                subtitle = stringResource(R.string.change_language),
                value = languageName,
                onClick = onLanguageClick
            )

            AdvancedSettingsItem(
                icon = Icons.Default.Brightness4,
                title = stringResource(R.string.display),
                subtitle = stringResource(R.string.dark_mode),
                trailing = {
                    Switch(
                        checked = isDarkMode,
                        onCheckedChange = onDarkModeChange,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = MaterialTheme.colorScheme.primary
                        )
                    )
                }
            )

            AdvancedSettingsItem(
                icon = Icons.Default.Notifications,
                title = stringResource(R.string.notifications),
                subtitle = stringResource(R.string.notifications_subtitle),
                trailing = {
                    Switch(
                        checked = notificationsEnabled,
                        onCheckedChange = onNotificationsChange,
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = MaterialTheme.colorScheme.primary
                        )
                    )
                }
            )

            AdvancedSettingsItem(
                icon = Icons.Default.Security,
                title = stringResource(R.string.privacy_security),
                subtitle = stringResource(R.string.privacy_subtitle),
                onClick = onSecurityClick
            )

            AdvancedSettingsItem(
                icon = Icons.Default.Share,
                title = stringResource(R.string.share_app),
                subtitle = stringResource(R.string.share_app_subtitle),
                onClick = onShareClick
            )

            if (!editMode) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))
                AdvancedSettingsItem(
                    icon = Icons.AutoMirrored.Filled.Logout,
                    title = stringResource(R.string.logout),
                    subtitle = stringResource(R.string.logout_subtitle),
                    iconColor = Color.Red,
                    titleColor = Color.Red,
                    onClick = onLogout
                )
            }
        }
    }
}

// Data class for user (add this to your model)
data class UserData(
    val fullName: String? = null,
    val phone: String? = null,
    val farmName: String? = null,
    val farmLocation: String? = null,
    val farmSize: Double? = null,
    val profileImageUri: String? = null,
    val experienceYears: Int = 0,
    val primaryCrops: String = "",
    val soilType: String = "",
    val irrigationSystem: String = ""
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileDialog(
    user: UserData?,
    onDismiss: () -> Unit,
    onSave: (String, String, Double, Int, String, String, String) -> Unit
) {
    var farmName by remember { mutableStateOf(user?.farmName ?: "") }
    var location by remember { mutableStateOf(user?.farmLocation ?: "") }
    var farmSize by remember { mutableStateOf(user?.farmSize ?: 0.0) }
    var experience by remember { mutableStateOf(user?.experienceYears ?: 0) }
    var crops by remember { mutableStateOf(user?.primaryCrops ?: "") }
    var soil by remember { mutableStateOf(user?.soilType ?: "") }
    var irrigation by remember { mutableStateOf(user?.irrigationSystem ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = stringResource(R.string.edit_full_details),
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Box(modifier = Modifier.heightIn(max = 400.dp)) {
                LazyColumn {
                    item {
                        OutlinedTextField(
                            value = farmName,
                            onValueChange = { farmName = it },
                            label = { Text(stringResource(R.string.farm_name)) },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = location,
                            onValueChange = { location = it },
                            label = { Text(stringResource(R.string.location)) },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = farmSize.toString(),
                            onValueChange = { farmSize = it.toDoubleOrNull() ?: 0.0 },
                            label = { Text(stringResource(R.string.farm_size_acres)) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = experience.toString(),
                            onValueChange = { experience = it.toIntOrNull() ?: 0 },
                            label = { Text(stringResource(R.string.experience_years)) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = crops,
                            onValueChange = { crops = it },
                            label = { Text(stringResource(R.string.primary_crops)) },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = soil,
                            onValueChange = { soil = it },
                            label = { Text(stringResource(R.string.soil_type_label)) },
                            modifier = Modifier.fillMaxWidth()
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = irrigation,
                            onValueChange = { irrigation = it },
                            label = { Text(stringResource(R.string.irrigation_system)) },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = {
                    onSave(farmName, location, farmSize, experience, crops, soil, irrigation)
                }
            ) {
                Text(stringResource(R.string.save_changes))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.cancel))
            }
        }
    )
}

// Keep your existing composables: StatsItem, AdvancedSettingsItem, LanguageSelectionDialog, etc.
@Composable
fun StatsItem(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 22.sp)
        Text(text = title, color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
    }
}

@Composable
fun AdvancedSettingsItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    value: String? = null,
    iconColor: Color = MaterialTheme.colorScheme.primary,
    titleColor: Color = Color.Black,
    enabled: Boolean = true,
    trailing: @Composable (() -> Unit)? = null,
    onClick: () -> Unit = {}
) {
    val primaryGreen = MaterialTheme.colorScheme.primary

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = enabled) { onClick() }
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.secondaryContainer),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, contentDescription = null, tint = iconColor)
        }

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(text = title, fontWeight = FontWeight.SemiBold, color = titleColor, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = subtitle, color = Color.Gray, fontSize = 13.sp)
        }

        if (value != null) {
            Text(text = value, color = Color.Gray, modifier = Modifier.padding(end = 8.dp))
        }

        if (trailing != null) {
            trailing()
        } else {
            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
        }
    }
}

// Keep your existing LanguageSelectionDialog and ProfessionalLanguageOption composables unchanged
@Composable
fun LanguageSelectionDialog(
    currentLanguage: String,
    onDismiss: () -> Unit,
    onLanguageSelected: (String) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(text = stringResource(R.string.select_language), fontWeight = FontWeight.Bold)
        },
        text = {
            Column {
                ProfessionalLanguageOption(stringResource(R.string.english), "en", currentLanguage == "en", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.hindi), "hi", currentLanguage == "hi", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.kannada), "kn", currentLanguage == "kn", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.bengali), "bn", currentLanguage == "bn", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.telugu), "te", currentLanguage == "te", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.tamil), "ta", currentLanguage == "ta", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.marathi), "mr", currentLanguage == "mr", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.odia), "or", currentLanguage == "or", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.punjabi), "pa", currentLanguage == "pa", onLanguageSelected)
                ProfessionalLanguageOption(stringResource(R.string.spanish), "es", currentLanguage == "es", onLanguageSelected)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.close))
            }
        }
    )
}

@androidx.compose.ui.tooling.preview.Preview(showBackground = true)
@Composable
fun LanguageSelectionDialogPreview() {
    LanguageSelectionDialog(
        currentLanguage = "en",
        onDismiss = {},
        onLanguageSelected = {}
    )
}

@Composable
fun ProfessionalLanguageOption(
    name: String,
    code: String,
    selected: Boolean,
    onSelect: (String) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
            .clickable { onSelect(code) },
        colors = CardDefaults.cardColors(
            containerColor = if (selected) MaterialTheme.colorScheme.secondaryContainer else Color.White
        ),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(selected = selected, onClick = { onSelect(code) })
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = name, fontWeight = FontWeight.Medium)
        }
    }
}