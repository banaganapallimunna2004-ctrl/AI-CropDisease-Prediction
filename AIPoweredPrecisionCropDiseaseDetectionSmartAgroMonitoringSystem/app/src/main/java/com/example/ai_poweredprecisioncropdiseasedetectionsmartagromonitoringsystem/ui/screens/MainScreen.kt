package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.material.icons.outlined.Chat
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.compose.ui.res.stringResource
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel

@Composable
fun MainScreen(viewModel: AgroViewModel, rootNavController: NavController) {
    val navController = rememberNavController()
    val uiMessage by viewModel.uiMessage.collectAsState()

    LaunchedEffect(uiMessage) {
        when (uiMessage) {
            "NAVIGATE_SCAN" -> {
                navController.navigate("scan")
                viewModel.clearUiMessage()
            }
            "NAVIGATE_MONITOR" -> {
                navController.navigate("monitor")
                viewModel.clearUiMessage()
            }
            "NAVIGATE_ALERTS" -> {
                navController.navigate("alerts")
                viewModel.clearUiMessage()
            }
            "NAVIGATE_PROFILE" -> {
                navController.navigate("profile")
                viewModel.clearUiMessage()
            }
        }
    }

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            BottomNavigationBar(navController)
        },
        floatingActionButton = {
            if (currentRoute != "chatbot" && currentRoute != "map") {
                FloatingActionButton(
                    onClick = { navController.navigate("chatbot") },
                    containerColor = Color(0xFF2E7D32),
                    contentColor = Color.White
                ) {
                    Icon(Icons.Outlined.Chat, contentDescription = stringResource(R.string.ai_assistant))
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = BottomNavItem.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(BottomNavItem.Home.route) { 
                DashboardScreen(
                    viewModel = viewModel,
                    onNavigateToAlerts = { navController.navigate(BottomNavItem.Alerts.route) },
                    onNavigateToScan = { navController.navigate(BottomNavItem.Scan.route) },
                    onNavigateToMonitor = { navController.navigate(BottomNavItem.Monitor.route) },
                    onNavigateToChatbot = { navController.navigate("chatbot") }
                ) 
            }
            composable(BottomNavItem.Scan.route) { ScanScreen(viewModel) }
            composable(BottomNavItem.Monitor.route) { MonitoringScreen(viewModel, navController) }
            composable(BottomNavItem.Alerts.route) { AlertsScreen() }
            composable(BottomNavItem.Profile.route) { 
                ProfileScreen(
                    viewModel = viewModel,
                    onLogout = {
                        rootNavController.navigate("login") {
                            popUpTo("main") { inclusive = true }
                        }
                    }
                )
            }
            composable("chatbot") { 
                ChatbotScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                ) 
            }
            composable("map") { FarmMapScreen(viewModel) }
        }
    }
}

@Composable
fun BottomNavigationBar(navController: NavHostController) {
    val items = listOf(
        BottomNavItem.Home,
        BottomNavItem.Scan,
        BottomNavItem.Monitor,
        BottomNavItem.Alerts,
        BottomNavItem.Profile
    )
    NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
        val navBackStackEntry by navController.currentBackStackEntryAsState()
        val currentRoute = navBackStackEntry?.destination?.route
        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = stringResource(item.titleRes)) },
                label = { Text(stringResource(item.titleRes)) },
                selected = currentRoute == item.route,
                onClick = {
                    navController.navigate(item.route) {
                        popUpTo(navController.graph.startDestinationId)
                        launchSingleTop = true
                    }
                }
            )
        }
    }
}

sealed class BottomNavItem(val titleRes: Int, val icon: ImageVector, val route: String) {
    object Home : BottomNavItem(R.string.nav_home, Icons.Default.Home, "home")
    object Scan : BottomNavItem(R.string.nav_scan, Icons.Default.Search, "scan")
    object Monitor : BottomNavItem(R.string.nav_monitor, Icons.Default.Info, "monitor")
    object Alerts : BottomNavItem(R.string.nav_alerts, Icons.Default.Notifications, "alerts")
    object Profile : BottomNavItem(R.string.nav_profile, Icons.Default.Person, "profile")
}
