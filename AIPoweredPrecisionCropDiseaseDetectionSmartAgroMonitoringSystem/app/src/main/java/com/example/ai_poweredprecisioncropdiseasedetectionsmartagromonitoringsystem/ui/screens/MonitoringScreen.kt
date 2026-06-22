package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel
import androidx.navigation.NavController
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi

@Composable
fun MonitoringScreen(viewModel: AgroViewModel, navController: NavController? = null) {
    val sensorData by viewModel.sensorData.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf(
        stringResource(R.string.overview),
        stringResource(R.string.soil),
        stringResource(R.string.analysis),
        stringResource(R.string.weather),
        stringResource(R.string.sensors)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = stringResource(R.string.smart_monitoring),
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary
            )
            IconButton(
                onClick = { navController?.navigate("map") },
                modifier = Modifier.background(MaterialTheme.colorScheme.primaryContainer, CircleShape)
            ) {
                Icon(Icons.Default.Map, contentDescription = "Map", tint = MaterialTheme.colorScheme.primary)
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))

        ScrollableTabRow(
            selectedTabIndex = selectedTab,
            containerColor = Color.Transparent,
            divider = {},
            edgePadding = 0.dp
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { 
                        Text(
                            title, 
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                            fontSize = 14.sp
                        ) 
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        when (selectedTab) {
            0 -> OverviewTab(sensorData)
            1 -> SoilMoistureTab(sensorData?.soilMoisture ?: 0f)
            2 -> AnalysisTab()
            3 -> WeatherMonitoringTab()
            4 -> SensorsTab(sensorData)
        }
    }
}

@Composable
fun OverviewTab(sensorData: com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.SensorData?) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        // High-level Health Score
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Row(
                modifier = Modifier.padding(24.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(
                        progress = 0.85f,
                        modifier = Modifier.size(80.dp),
                        strokeWidth = 8.dp,
                        color = MaterialTheme.colorScheme.primary,
                        trackColor = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.1f)
                    )
                    Text("85", fontWeight = FontWeight.Bold, fontSize = 24.sp)
                }
                Column {
                    Text(stringResource(R.string.farm_health_score), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    Text(stringResource(R.string.excellent), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Medium)
                    Text("Based on all sensors", fontSize = 12.sp, color = Color.Gray)
                }
            }
        }

        Text(text = stringResource(R.string.environmental_data), fontSize = 20.sp, fontWeight = FontWeight.Bold)

        sensorData?.let { data ->
            val items = listOf(
                Triple(stringResource(R.string.moisture_level), "${data.soilMoisture.toInt()}%", Color(0xFF2196F3)),
                Triple(stringResource(R.string.temperature), "${data.temperature.toInt()}°C", Color(0xFFFF9800)),
                Triple(stringResource(R.string.humidity), "${data.humidity.toInt()}%", Color(0xFF4CAF50)),
                Triple(stringResource(R.string.soil_ph), "${data.soilPh}", Color(0xFF9C27B0))
            )
            
            items.forEach { (label, value, color) ->
                MonitoringItem(label, value, color)
            }
        }
    }
}

@Composable
fun AnalysisTab() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(text = stringResource(R.string.comprehensive_analysis), fontSize = 20.sp, fontWeight = FontWeight.Bold)
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(2.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(stringResource(R.string.historical_trends), fontWeight = FontWeight.Bold)
                Text(stringResource(R.string.last_7_days), fontSize = 12.sp, color = Color.Gray)
                Spacer(modifier = Modifier.height(20.dp))
                DetailedAreaChart(Color(0xFF2E7D32))
            }
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            InsightSmallCard(stringResource(R.string.risk_level), stringResource(R.string.low), Color(0xFF4CAF50), Modifier.weight(1f))
            InsightSmallCard(stringResource(R.string.prediction), stringResource(R.string.stable), Color(0xFF2196F3), Modifier.weight(1f))
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.3f))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.AutoAwesome, contentDescription = null, tint = MaterialTheme.colorScheme.tertiary)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(stringResource(R.string.ai_insights), fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    "Environmental conditions are perfect for growth. No disease risk detected for the upcoming 48 hours.",
                    fontSize = 14.sp,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SensorsTab(sensorData: com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.SensorData?) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(text = stringResource(R.string.sensor_breakdown), fontSize = 20.sp, fontWeight = FontWeight.Bold)
        
        if (sensorData != null) {
            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                maxItemsInEachRow = 2,
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SensorStatusCard("Moisture A1", "${sensorData.soilMoisture.toInt()}%", true, Modifier.weight(1f))
                SensorStatusCard("Moisture A2", "${(sensorData.soilMoisture + 2).toInt()}%", true, Modifier.weight(1f))
                SensorStatusCard("Temp Sensor", "${sensorData.temperature.toInt()}°C", true, Modifier.weight(1f))
                SensorStatusCard("pH Probe", "${sensorData.soilPh}", true, Modifier.weight(1f))
                SensorStatusCard("NPK Analyzer", "Active", false, Modifier.weight(1f))
                SensorStatusCard("Light Sensor", "12k Lux", true, Modifier.weight(1f))
            }
        }
    }
}

@Composable
fun SoilMoistureTab(moisture: Float) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = stringResource(R.string.soil_monitoring),
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.fillMaxWidth()
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        SoilMoistureGauge(moisture)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        val status = when {
            moisture < 30f -> stringResource(R.string.irrigation_needed)
            moisture < 70f -> stringResource(R.string.optimal_moisture)
            else -> stringResource(R.string.over_watered)
        }
        
        val statusColor = when {
            moisture < 30f -> Color.Red
            moisture < 70f -> Color(0xFF2E7D32)
            else -> Color(0xFF1976D2)
        }

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = statusColor.copy(alpha = 0.1f))
        ) {
            Column(modifier = Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(Icons.Default.WaterDrop, contentDescription = null, tint = statusColor, modifier = Modifier.size(32.dp))
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = status, color = statusColor, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = stringResource(R.string.keep_monitoring),
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
        }
        
        Spacer(modifier = Modifier.height(20.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            DetailStatCard(stringResource(R.string.soil_ph), "6.5", Modifier.weight(1f))
            DetailStatCard(stringResource(R.string.soil_temp), "24°C", Modifier.weight(1f))
        }
    }
}

@Composable
fun SoilMoistureGauge(moisture: Float) {
    val animatedMoisture by animateFloatAsState(
        targetValue = moisture / 100f,
        animationSpec = tween(durationMillis = 1000)
    )

    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(200.dp)) {
        Canvas(modifier = Modifier.size(200.dp)) {
            val strokeWidth = 15.dp.toPx()
            
            // Background track
            drawArc(
                color = Color.LightGray.copy(alpha = 0.3f),
                startAngle = 135f,
                sweepAngle = 270f,
                useCenter = false,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
            
            // Progress
            drawArc(
                brush = Brush.sweepGradient(
                    colors = listOf(Color.Red, Color.Yellow, Color(0xFF2E7D32), Color.Blue),
                    center = center
                ),
                startAngle = 135f,
                sweepAngle = 270f * animatedMoisture,
                useCenter = false,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }
        
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "${moisture.toInt()}%", fontSize = 48.sp, fontWeight = FontWeight.ExtraBold)
            Text(text = stringResource(R.string.moisture_level), color = Color.Gray, fontSize = 14.sp)
        }
    }
}

@Composable
fun DetailStatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, color = Color.Gray, fontSize = 12.sp)
            Text(value, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
    }
}

@Composable
fun WeatherMonitoringTab() {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text(text = stringResource(R.string.todays_weather), fontSize = 20.sp, fontWeight = FontWeight.Bold)
        // Re-using the Dashboard's WeatherCard style but more expanded
        WeatherCard(weather = null) // Replace with real data in viewmodel
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Wind & Precipitation", fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(12.dp))
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    WeatherStat("Wind Speed", "14 km/h", Icons.Default.Air)
                    WeatherStat("UV Index", "6 (High)", Icons.Default.WbSunny)
                    WeatherStat("Visibility", "10 km", Icons.Default.Visibility)
                }
            }
        }
    }
}

@Composable
fun WeatherStat(label: String, value: String, icon: ImageVector) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(icon, contentDescription = null, tint = Color.Gray, modifier = Modifier.size(20.dp))
        Text(label, fontSize = 10.sp, color = Color.Gray)
        Text(value, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SensorStatusCard(name: String, value: String, active: Boolean, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(if (active) Color(0xFF4CAF50) else Color.Red)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(name, fontSize = 12.sp, color = Color.Gray)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(value, fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
    }
}

@Composable
fun InsightSmallCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, fontSize = 12.sp, color = Color.Gray)
            Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = color)
        }
    }
}

@Composable
fun DetailedAreaChart(color: Color) {
    Canvas(modifier = Modifier.fillMaxWidth().height(120.dp)) {
        val path = Path()
        val fillPath = Path()
        val points = listOf(0.4f, 0.6f, 0.3f, 0.8f, 0.5f, 0.7f, 0.9f)
        val width = size.width
        val height = size.height
        val step = width / (points.size - 1)

        points.forEachIndexed { index, point ->
            val x = index * step
            val y = height - (point * height)
            if (index == 0) {
                path.moveTo(x, y)
                fillPath.moveTo(x, height)
                fillPath.lineTo(x, y)
            } else {
                path.lineTo(x, y)
                fillPath.lineTo(x, y)
            }
            if (index == points.size - 1) {
                fillPath.lineTo(x, height)
                fillPath.close()
            }
        }

        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(color.copy(alpha = 0.3f), Color.Transparent)
            )
        )
        
        drawPath(
            path = path,
            color = color,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}

@Composable
fun MonitoringItem(label: String, value: String, color: Color) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(32.dp).background(color.copy(alpha = 0.1f), CircleShape), contentAlignment = Alignment.Center) {
                        val icon = when(label) {
                            stringResource(R.string.moisture_level) -> Icons.Default.WaterDrop
                            stringResource(R.string.temperature) -> Icons.Default.Thermostat
                            stringResource(R.string.humidity) -> Icons.Default.Cloud
                            else -> Icons.Default.SettingsInputAntenna
                        }
                        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(16.dp))
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(label, fontWeight = FontWeight.Medium)
                }
                Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp, color = color)
            }
            Spacer(modifier = Modifier.height(16.dp))
            SimpleLineChart(color = color)
        }
    }
}

@Composable
fun SimpleLineChart(color: Color) {
    Canvas(modifier = Modifier.fillMaxWidth().height(40.dp)) {
        val path = Path()
        val points = listOf(0.4f, 0.6f, 0.3f, 0.8f, 0.5f, 0.7f, 0.9f)
        val width = size.width
        val height = size.height
        val step = width / (points.size - 1)

        points.forEachIndexed { index, point ->
            val x = index * step
            val y = height - (point * height)
            if (index == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }

        drawPath(
            path = path,
            color = color,
            style = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
        )
    }
}
