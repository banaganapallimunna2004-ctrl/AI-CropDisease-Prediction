package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R

data class AgroAlert(
    val id: String,
    val title: String,
    val description: String,
    val time: String,
    val type: AlertType,
    val severity: AlertSeverity,
    val isRead: Boolean = false
)

enum class AlertType {
    DISEASE, WEATHER, IRRIGATION, SYSTEM
}

enum class AlertSeverity {
    CRITICAL, WARNING, INFO
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertsScreen() {
    val allAlerts = remember {
        mutableStateListOf(
            AgroAlert("1", "Early Blight Detected", "Tomato Field 4: High risk of spreading.", "2 min ago", AlertType.DISEASE, AlertSeverity.CRITICAL),
            AgroAlert("2", "High Temperature Alert", "Heat stress predicted for tomorrow.", "1 hour ago", AlertType.WEATHER, AlertSeverity.WARNING),
            AgroAlert("3", "Irrigation Recommended", "Soil moisture at 22% in North Sector.", "3 hours ago", AlertType.IRRIGATION, AlertSeverity.INFO),
            AgroAlert("4", "Heavy Rain Warning", "Strong winds and 40mm rain expected.", "Yesterday", AlertType.WEATHER, AlertSeverity.WARNING),
            AgroAlert("5", "Sensor Node Offline", "Device A12 is not reporting data.", "Yesterday", AlertType.SYSTEM, AlertSeverity.CRITICAL)
        )
    }

    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf(
        stringResource(R.string.all),
        stringResource(R.string.disease),
        stringResource(R.string.weather),
        stringResource(R.string.irrigation_alerts)
    )

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Text(
                        stringResource(R.string.nav_alerts), 
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 1.sp
                    ) 
                },
                actions = {
                    TextButton(onClick = { /* Mark all read logic */ }) {
                        Text(stringResource(R.string.mark_all_read), fontSize = 12.sp)
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Filter Section
            ScrollableTabRow(
                selectedTabIndex = filters.indexOf(selectedFilter).coerceAtLeast(0),
                containerColor = Color.Transparent,
                edgePadding = 16.dp,
                divider = {},
                indicator = {}
            ) {
                filters.forEach { filter ->
                    val isSelected = selectedFilter == filter
                    Box(
                        modifier = Modifier
                            .padding(vertical = 12.dp, horizontal = 4.dp)
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (isSelected) MaterialTheme.colorScheme.primary 
                                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                            )
                            .clickable { selectedFilter = filter }
                            .padding(horizontal = 20.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = filter,
                            color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 14.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            val filteredAlerts = remember(selectedFilter, allAlerts.toList()) {
                if (selectedFilter == "All" || selectedFilter == "सभी") allAlerts
                else allAlerts.filter { 
                    it.type.name.equals(selectedFilter, ignoreCase = true) || 
                    (selectedFilter == "Irrigation" && it.type == AlertType.IRRIGATION) ||
                    (selectedFilter == "Weather" && it.type == AlertType.WEATHER) ||
                    (selectedFilter == "Disease" && it.type == AlertType.DISEASE)
                }
            }

            if (filteredAlerts.isEmpty()) {
                EmptyAlertsState()
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(filteredAlerts, key = { it.id }) { alert ->
                        ProfessionalAlertItem(alert)
                    }
                }
            }
        }
    }
}

@Composable
fun ProfessionalAlertItem(alert: AgroAlert) {
    val (icon, baseColor) = when (alert.type) {
        AlertType.DISEASE -> Icons.Default.BugReport to Color(0xFFE53935)
        AlertType.WEATHER -> Icons.Default.WbSunny to Color(0xFFF9A825)
        AlertType.IRRIGATION -> Icons.Default.WaterDrop to Color(0xFF1E88E5)
        AlertType.SYSTEM -> Icons.Default.SettingsInputAntenna to Color(0xFF546E7A)
    }

    val severityColor = when (alert.severity) {
        AlertSeverity.CRITICAL -> Color(0xFFB71C1C)
        AlertSeverity.WARNING -> Color(0xFFEF6C00)
        AlertSeverity.INFO -> Color(0xFF0D47A1)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp)),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            // Icon Container with Severity Badge
            Box(contentAlignment = Alignment.BottomEnd) {
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .background(baseColor.copy(alpha = 0.12f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = baseColor, modifier = Modifier.size(28.dp))
                }
                
                // Small dot for severity
                Box(
                    modifier = Modifier
                        .size(14.dp)
                        .background(Color.White, CircleShape)
                        .padding(2.dp)
                ) {
                    Box(modifier = Modifier.fillMaxSize().background(severityColor, CircleShape))
                }
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = alert.title,
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 16.sp,
                        color = Color(0xFF1A237E)
                    )
                    Text(
                        text = alert.time,
                        fontSize = 11.sp,
                        color = Color.Gray
                    )
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = alert.description,
                    color = Color(0xFF5C6BC0),
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Severity Chip
                    Surface(
                        color = severityColor.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = alert.severity.name,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            color = severityColor,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Text(
                        text = stringResource(R.string.take_action),
                        color = MaterialTheme.colorScheme.primary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.clickable { /* Handle action */ }
                    )
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun EmptyAlertsState() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(120.dp)
                .background(MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                Icons.Default.NotificationsNone,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = MaterialTheme.colorScheme.primary
            )
        }
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = stringResource(R.string.no_alerts_title),
            fontWeight = FontWeight.Bold,
            fontSize = 20.sp,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = stringResource(R.string.no_alerts_subtitle),
            color = Color.Gray,
            fontSize = 14.sp,
            textAlign = TextAlign.Center
        )
    }
}
