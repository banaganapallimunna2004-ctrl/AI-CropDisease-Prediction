package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MyLocation
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Terrain
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WindPower
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.WeatherInfo
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("MissingPermission")
@Composable
fun FarmMapScreen(
    viewModel: AgroViewModel
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    val currentLocation by viewModel.currentLocation.collectAsState()
    val weatherInfo by viewModel.weatherInfo.collectAsState()
    val isWeatherLoading by viewModel.isWeatherLoading.collectAsState()

    var mapType by remember { mutableStateOf(MapType.NORMAL) }
    var showMapTypeMenu by remember { mutableStateOf(false) }
    var pickedLocation by remember { mutableStateOf<LatLng?>(null) }

    val defaultFarmCenter = LatLng(11.0168, 76.9558)

    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(currentLocation ?: defaultFarmCenter, 15f)
    }

    val fusedLocationClient = remember {
        LocationServices.getFusedLocationProviderClient(context)
    }

    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { granted ->
        hasLocationPermission = granted
        if (granted) {
            fetchDeviceLocation(
                fusedLocationClient = fusedLocationClient,
                onLocationFound = { location ->
                    viewModel.updateLocation(location)
                    coroutineScope.launch {
                        cameraPositionState.animate(
                            CameraUpdateFactory.newLatLngZoom(location, 16f)
                        )
                    }
                }
            )
        }
    }

    LaunchedEffect(hasLocationPermission) {
        if (hasLocationPermission) {
            if (currentLocation == null) {
                fetchDeviceLocation(
                    fusedLocationClient = fusedLocationClient,
                    onLocationFound = { location ->
                        viewModel.updateLocation(location)
                        coroutineScope.launch {
                            cameraPositionState.animate(
                                CameraUpdateFactory.newLatLngZoom(location, 16f)
                            )
                        }
                    }
                )
            }
        } else {
            permissionLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        }
    }

    LaunchedEffect(currentLocation) {
        currentLocation?.let { location ->
            cameraPositionState.animate(
                CameraUpdateFactory.newLatLngZoom(location, 16f)
            )
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.view_map), fontWeight = FontWeight.SemiBold) },
                actions = {
                    Box {
                        IconButton(onClick = { showMapTypeMenu = true }) {
                            Icon(Icons.Default.Layers, contentDescription = "Map type")
                        }
                        DropdownMenu(
                            expanded = showMapTypeMenu,
                            onDismissRequest = { showMapTypeMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Normal") },
                                onClick = {
                                    mapType = MapType.NORMAL
                                    showMapTypeMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.Map, contentDescription = null) }
                            )
                            DropdownMenuItem(
                                text = { Text("Satellite") },
                                onClick = {
                                    mapType = MapType.SATELLITE
                                    showMapTypeMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.Cloud, contentDescription = null) }
                            )
                            DropdownMenuItem(
                                text = { Text("Terrain") },
                                onClick = {
                                    mapType = MapType.TERRAIN
                                    showMapTypeMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.Terrain, contentDescription = null) }
                            )
                        }
                    }
                }
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            GoogleMap(
                modifier = Modifier.fillMaxSize(),
                cameraPositionState = cameraPositionState,
                properties = MapProperties(
                    isMyLocationEnabled = hasLocationPermission,
                    mapType = mapType
                ),
                uiSettings = MapUiSettings(
                    myLocationButtonEnabled = false,
                    zoomControlsEnabled = false,
                    mapToolbarEnabled = false
                ),
                onMapClick = { pickedLocation = it }
            ) {
                pickedLocation?.let { location ->
                    Marker(
                        state = MarkerState(position = location),
                        title = "Selected Farm Area",
                        snippet = "Tap verify to fetch weather",
                        icon = BitmapDescriptorFactory.defaultMarker(
                            BitmapDescriptorFactory.HUE_GREEN
                        )
                    )
                }

                currentLocation?.let { location ->
                    Marker(
                        state = MarkerState(position = location),
                        title = "Current Location",
                        snippet = "GPS position",
                        icon = BitmapDescriptorFactory.defaultMarker(
                            BitmapDescriptorFactory.HUE_AZURE
                        )
                    )
                }

                currentLocation?.let { loc ->
                    val demoNearbyFields = listOf(
                        LatLng(loc.latitude + 0.002, loc.longitude + 0.002),
                        LatLng(loc.latitude - 0.001, loc.longitude + 0.003)
                    )

                    demoNearbyFields.forEachIndexed { index, farm ->
                        Marker(
                            state = MarkerState(position = farm),
                            title = "Nearby Field ${index + 1}",
                            snippet = "Health: Stable",
                            icon = BitmapDescriptorFactory.defaultMarker(
                                BitmapDescriptorFactory.HUE_ORANGE
                            ),
                            alpha = 0.7f
                        )
                    }
                }
            }

            MapSearchHeader(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(16.dp)
            )

            if (weatherInfo != null) {
                WeatherOverlay(
                    weather = weatherInfo!!,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 92.dp, start = 16.dp, end = 16.dp)
                )
            } else {
                LocationPrompt(
                    text = if (pickedLocation != null) {
                        "Location selected. Verify to see live weather."
                    } else {
                        "Tap on the map to mark your farm."
                    },
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .padding(top = 92.dp, start = 16.dp, end = 16.dp)
                )
            }

            LegendCard(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(start = 16.dp, bottom = 104.dp)
            )

            FloatingActionButton(
                onClick = {
                    currentLocation?.let { location ->
                        coroutineScope.launch {
                            cameraPositionState.animate(
                                CameraUpdateFactory.newLatLngZoom(location, 17f)
                            )
                        }
                    }
                },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 16.dp, bottom = 104.dp),
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = MaterialTheme.colorScheme.primary,
                shape = CircleShape
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = "Center map")
            }

            BottomFarmActions(
                isWeatherLoading = isWeatherLoading,
                enabled = pickedLocation != null || currentLocation != null,
                onVerify = {
                    val target = pickedLocation ?: currentLocation
                    target?.let { viewModel.updateLocation(it) }
                },
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(16.dp)
            )
        }
    }
}

@SuppressLint("MissingPermission")
private fun fetchDeviceLocation(
    fusedLocationClient: FusedLocationProviderClient,
    onLocationFound: (LatLng) -> Unit
) {
    fusedLocationClient.lastLocation.addOnSuccessListener { location ->
        location?.let {
            onLocationFound(LatLng(it.latitude, it.longitude))
        }
    }
}

@Composable
private fun MapSearchHeader(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(6.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Search, contentDescription = null, tint = Color.Gray)
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = "Search field location...",
                color = Color.Gray,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.weight(1f))
            Icon(Icons.Default.Mic, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
        }
    }
}

@Composable
private fun LocationPrompt(
    text: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.96f)),
        elevation = CardDefaults.cardElevation(4.dp),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.LocationOn, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = text, fontSize = 13.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun LegendCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.92f)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(10.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            LegendItem("My Farm", Color(0xFF2E7D32))
            LegendItem("Current", Color(0xFF007BFF))
            LegendItem("Nearby", Color(0xFFFFA000))
        }
    }
}

@Composable
private fun BottomFarmActions(
    isWeatherLoading: Boolean,
    enabled: Boolean,
    onVerify: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(10.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Farm Information",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Verify location to load live weather and AI insights.",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }

            if (isWeatherLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    strokeWidth = 2.dp
                )
            }

            Button(
                onClick = onVerify,
                enabled = enabled && !isWeatherLoading,
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Verify")
            }
        }
    }
}

@Composable
fun WeatherOverlay(
    weather: WeatherInfo,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2E7D32).copy(alpha = 0.96f)),
        elevation = CardDefaults.cardElevation(6.dp),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Live Weather: ${weather.locationName}",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                WeatherStat(Icons.Default.Thermostat, "${weather.temperature}°C", "Temp")
                WeatherStat(Icons.Default.WaterDrop, "${weather.humidity}%", "Humidity")
                WeatherStat(Icons.Default.WindPower, "${weather.windSpeed} km/h", "Wind")
                WeatherStat(Icons.Default.LocationOn, weather.condition, "Sky")
            }
        }
    }
}

@Composable
fun WeatherStat(icon: ImageVector, value: String, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
        Text(value, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
        Text(label, color = Color.White.copy(alpha = 0.7f), fontSize = 10.sp)
    }
}

@Composable
fun LegendItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color, shape = RoundedCornerShape(2.dp))
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(label, fontSize = 12.sp)
    }
}