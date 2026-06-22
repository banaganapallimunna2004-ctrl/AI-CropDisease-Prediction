package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.navigation

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens.LoginScreen
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens.SignupScreen
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens.MainScreen
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens.SplashScreen
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.viewmodel.AgroViewModel

@Composable
fun AppNavigation(modifier: Modifier = Modifier) {
    val navController = rememberNavController()
    val viewModel: AgroViewModel = hiltViewModel()
    val loggedInUser by viewModel.loggedInUser.collectAsState()

    NavHost(navController = navController, startDestination = "splash") {
        composable("splash") {
            SplashScreen(onTimeout = {
                navController.navigate("login") {
                    popUpTo("splash") { inclusive = true }
                }
            })
        }
        composable("login") {
            LoginScreen(
                viewModel = viewModel,
                onLoginSuccess = {
                    navController.navigate("main") {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onNavigateToSignup = {
                    navController.navigate("signup")
                }
            )
        }
        composable("signup") {
            SignupScreen(
                viewModel = viewModel,
                onSignupSuccess = {
                    navController.navigate("main") {
                        popUpTo("signup") { inclusive = true }
                    }
                },
                onBackToLogin = {
                    navController.popBackStack()
                }
            )
        }
        composable("main") {
            MainScreen(viewModel = viewModel, rootNavController = navController)
        }
    }
}
