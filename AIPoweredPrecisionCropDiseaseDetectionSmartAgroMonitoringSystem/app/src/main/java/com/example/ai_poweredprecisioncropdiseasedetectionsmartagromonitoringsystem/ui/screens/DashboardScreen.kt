package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Cloud
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material.icons.filled.WaterDrop
import androidx.compose.material.icons.filled.WindPower
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.WeatherInfo
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel

@Composable
fun DashboardScreen(
    viewModel: AgroViewModel,
    onNavigateToAlerts: () -> Unit,
    onNavigateToScan: () -> Unit,
    onNavigateToMonitor: () -> Unit,
    onNavigateToChatbot: () -> Unit
) {
    val sensorData by viewModel.sensorData.collectAsState()
    val aiRecommendations by viewModel.aiRecommendations.collectAsState()
    val weatherInfo by viewModel.weatherInfo.collectAsState()
    val isWeatherLoading by viewModel.isWeatherLoading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .systemBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        DashboardTopBar(onNavigateToAlerts)

        AiHeroCard(
            recommendation = aiRecommendations.firstOrNull()
                ?: "AI is monitoring crop health, soil moisture, weather risk, and irrigation conditions.",
            onChatClick = onNavigateToChatbot
        )

        WeatherSection(
            weather = weatherInfo,
            isLoading = isWeatherLoading
        )

        CropHealthCard(onClick = onNavigateToMonitor)

        Text(
            text = stringResource(R.string.quick_stats),
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF1F2D22)
        )

        sensorData?.let { data ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                StatCard(
                    icon = Icons.Default.WaterDrop,
                    label = stringResource(R.string.soil_moisture),
                    value = "${data.soilMoisture.toInt()}%",
                    status = moistureStatus(data.soilMoisture),
                    containerColor = Color(0xFFE7F2FF),
                    iconColor = Color(0xFF1976D2),
                    modifier = Modifier.weight(1f).clickable { onNavigateToMonitor() }
                )
                StatCard(
                    icon = Icons.Default.Thermostat,
                    label = stringResource(R.string.temperature),
                    value = "${data.temperature.toInt()}°C",
                    status = temperatureStatus(data.temperature),
                    containerColor = Color(0xFFFFF1DF),
                    iconColor = Color(0xFFE65100),
                    modifier = Modifier.weight(1f).clickable { onNavigateToMonitor() }
                )
                StatCard(
                    icon = Icons.Default.Cloud,
                    label = stringResource(R.string.humidity),
                    value = "${data.humidity.toInt()}%",
                    status = humidityStatus(data.humidity),
                    containerColor = Color(0xFFE8F5E9),
                    iconColor = Color(0xFF2E7D32),
                    modifier = Modifier.weight(1f).clickable { onNavigateToMonitor() }
                )
            }
        } ?: SensorLoadingCard()

        ScanCropBanner(onScanClick = onNavigateToScan)
    }
}

@Composable
private fun DashboardTopBar(onNavigateToAlerts: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                text = stringResource(R.string.hello_farmer),
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16251A)
            )
            Text(
                text = "Smart farm overview",
                fontSize = 13.sp,
                color = Color(0xFF6D796F)
            )
        }

        IconButton(
            onClick = onNavigateToAlerts,
            modifier = Modifier
                .size(46.dp)
                .background(Color.White, CircleShape)
        ) {
            Icon(
                imageVector = Icons.Default.Notifications,
                contentDescription = stringResource(R.string.notifications),
                tint = Color(0xFF2E7D32)
            )
        }
    }
}

@Composable
private fun AiHeroCard(recommendation: String, onChatClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth().clickable { onChatClick() },
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color(0xFF12351B)),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 3.dp)
    ) {
        Box {
            Image(
                painter = painterResource(id = R.drawable.ai_crop_dashboard),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(210.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(210.dp)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.14f),
                                Color.Black.copy(alpha = 0.78f)
                            )
                        )
                    )
            )

            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                AssistChip(
                    onClick = onChatClick,
                    label = { Text("Advanced AI insight") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Psychology,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                )

                Text(
                    text = recommendation,
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    lineHeight = 24.sp,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )

                Text(
                    text = "Disease prediction, irrigation risk, and climate signals are combined for better decisions.",
                    color = Color.White.copy(alpha = 0.82f),
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }
    }
}

@Composable
private fun WeatherSection(
    weather: WeatherInfo?,
    isLoading: Boolean
) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stringResource(R.string.todays_weather),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1F2D22)
            )

            if (isLoading) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = Color(0xFF2E7D32)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Updating", fontSize = 12.sp, color = Color(0xFF6D796F))
                }
            }
        }

        if (isLoading) {
            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth(),
                color = Color(0xFF2E7D32),
                trackColor = Color(0xFFE0E8DD)
            )
        }

        WeatherCard(weather = weather)
    }
}

@Composable
fun WeatherCard(weather: WeatherInfo?) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color.White),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = weatherImageFor(weather?.condition)),
                contentDescription = weather?.condition ?: stringResource(R.string.partly_cloudy),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(108.dp)
                    .clip(RoundedCornerShape(18.dp))
            )

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = weather?.locationName ?: stringResource(R.string.todays_weather),
                    color = Color(0xFF6D796F),
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = if (weather != null) "${weather.temperature.toInt()}°C" else "29°C",
                    fontSize = 34.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF16251A)
                )
                Text(
                    text = weather?.condition ?: stringResource(R.string.partly_cloudy),
                    color = Color(0xFF4E5D52),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    WeatherInfoItem(
                        icon = Icons.Default.WaterDrop,
                        label = stringResource(R.string.humidity),
                        value = if (weather != null) "${weather.humidity}%" else "65%"
                    )
                    WeatherInfoItem(
                        icon = Icons.Default.WindPower,
                        label = stringResource(R.string.wind),
                        value = if (weather != null) "${weather.windSpeed.toInt()} km/h" else "12 km/h"
                    )
                    WeatherInfoItem(
                        icon = Icons.Default.WaterDrop,
                        label = stringResource(R.string.rain),
                        value = "10%"
                    )
                }
            }
        }
    }
}

@Composable
fun WeatherInfoItem(
    icon: ImageVector,
    label: String,
    value: String
) {
    Column(
        horizontalAlignment = Alignment.Start,
        verticalArrangement = Arrangement.spacedBy(2.dp),
        modifier = Modifier.widthIn(min = 48.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(15.dp),
                tint = Color(0xFF6D796F)
            )
            Spacer(modifier = Modifier.width(3.dp))
            Text(label, fontSize = 10.sp, color = Color(0xFF6D796F), maxLines = 1)
        }
        Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1F2D22))
    }
}

@Composable
fun CropHealthCard(onClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color.White),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = R.drawable.healthy_crop_leaf),
                contentDescription = stringResource(R.string.crop_health_overview),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(86.dp)
                    .clip(RoundedCornerShape(18.dp))
            )

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.HealthAndSafety,
                        contentDescription = null,
                        tint = Color(0xFF2E7D32),
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = stringResource(R.string.crop_health_overview),
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = Color(0xFF1F2D22)
                    )
                }
                Text(
                    text = stringResource(R.string.all_crops_healthy),
                    color = Color(0xFF2E7D32),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = stringResource(R.string.keep_monitoring),
                    color = Color(0xFF6D796F),
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
            }
        }
    }
}

@Composable
fun StatCard(
    icon: ImageVector,
    label: String,
    value: String,
    status: String,
    containerColor: Color,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(7.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .background(Color.White.copy(alpha = 0.82f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(19.dp))
            }
            Text(
                text = label,
                fontSize = 11.sp,
                color = Color(0xFF4F5C52),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = value,
                fontSize = 21.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF16251A)
            )
            Text(
                text = status,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = iconColor,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun SensorLoadingCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(22.dp),
                strokeWidth = 2.dp,
                color = Color(0xFF2E7D32)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text("Reading live sensor data...", color = Color(0xFF6D796F), fontSize = 14.sp)
        }
    }
}

@Composable
private fun ScanCropBanner(onScanClick: () -> Unit) {
    ElevatedCard(
        modifier = Modifier.fillMaxWidth().clickable { onScanClick() },
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.elevatedCardColors(containerColor = Color(0xFF2E7D32)),
        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 3.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = R.drawable.crop_scan_preview),
                contentDescription = stringResource(R.string.scan_your_crop),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(96.dp)
                    .clip(RoundedCornerShape(18.dp))
            )

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = stringResource(R.string.scan_your_crop),
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
                Text(
                    text = stringResource(R.string.scan_subtitle),
                    color = Color.White.copy(alpha = 0.84f),
                    fontSize = 12.sp,
                    lineHeight = 17.sp
                )
                FilledTonalButton(
                    onClick = onScanClick,
                    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CameraAlt,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Scan now")
                }
            }
        }
    }
}

private fun weatherImageFor(condition: String?): Int {
    val normalized = condition.orEmpty().lowercase()
    return when {
        "rain" in normalized || "drizzle" in normalized -> R.drawable.weather_rain
        "cloud" in normalized || "overcast" in normalized -> R.drawable.weather_cloud
        "storm" in normalized || "thunder" in normalized -> R.drawable.weather_rain
        else -> R.drawable.weather_sunny
    }
}

private fun moistureStatus(value: Number): String = when {
    value.toDouble() < 35 -> "Needs water"
    value.toDouble() > 75 -> "Too wet"
    else -> "Optimal"
}

private fun temperatureStatus(value: Number): String = when {
    value.toDouble() < 18 -> "Cool"
    value.toDouble() > 34 -> "Heat risk"
    else -> "Normal"
}

private fun humidityStatus(value: Number): String = when {
    value.toDouble() < 35 -> "Dry air"
    value.toDouble() > 80 -> "Disease risk"
    else -> "Normal"
}