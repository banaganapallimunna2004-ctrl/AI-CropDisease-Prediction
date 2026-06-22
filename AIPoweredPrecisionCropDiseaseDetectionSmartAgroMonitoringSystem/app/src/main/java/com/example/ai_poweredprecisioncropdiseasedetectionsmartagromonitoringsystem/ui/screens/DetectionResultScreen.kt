package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Help
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.SubcomposeAsyncImage
import coil.compose.SubcomposeAsyncImageContent
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.R
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model.CropDisease
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetectionResultScreen(
    detectionResult: DetectionResult,
    onBack: () -> Unit,
    onShare: () -> Unit,
    onRetry: () -> Unit
) {
    Scaffold(
        topBar = {
            ProfessionalTopBar(
                titleRes = R.string.analysis_report,
                onBack = onBack,
                onShare = { if (detectionResult is DetectionResult.Success) onShare() }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 24.dp)
        ) {
            when (detectionResult) {
                is DetectionResult.Success -> ValidCropDiseaseDetection(
                    disease = detectionResult.disease,
                    confidence = detectionResult.confidence,
                    onShare = onShare
                )
                is DetectionResult.NonCropDetected -> NonCropDetectionError(onRetry)
                is DetectionResult.LowConfidence -> LowConfidenceError(onRetry)
                is DetectionResult.UnknownError -> UnknownDetectionError(onRetry)
            }
        }
    }
}

/**
 * Sealed class for robust detection result handling
 */
sealed class DetectionResult {
    data class Success(
        val disease: CropDisease,
        val confidence: Float
    ) : DetectionResult()

    object NonCropDetected : DetectionResult()
    object LowConfidence : DetectionResult()
    object UnknownError : DetectionResult()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProfessionalTopBar(
    titleRes: Int,
    onBack: () -> Unit,
    onShare: () -> Unit
) {
    CenterAlignedTopAppBar(
        title = {
            Text(
                text = stringResource(titleRes),
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.headlineSmall
            )
        },
        navigationIcon = {
            IconButton(onClick = onBack) {
                Icon(
                    Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = stringResource(R.string.back),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        },
        actions = {
            IconButton(onClick = onShare) {
                Icon(
                    Icons.Default.Share,
                    contentDescription = stringResource(R.string.share),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    )
}

@Composable
private fun ValidCropDiseaseDetection(
    disease: CropDisease,
    confidence: Float,
    onShare: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.padding(horizontal = 20.dp)) {
        // Hero Section
        CropDiseaseHeroSection(disease = disease, confidence = confidence)

        Spacer(modifier = Modifier.height(24.dp))

        // Detailed Analysis
        DiseaseAnalysisSections(disease = disease)

        Spacer(modifier = Modifier.height(32.dp))

        // Action Buttons
        ActionButtonsSection(onShare = onShare)

        Spacer(modifier = Modifier.height(16.dp))

        // Professional Disclaimer
        AiVerificationDisclaimer()
    }
}

@Composable
private fun CropDiseaseHeroSection(
    disease: CropDisease,
    confidence: Float
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column {
            // Disease Image with Severity Badge
            DiseaseImageWithSeverity(disease = disease)

            // Disease Header Info
            DiseaseHeaderInfo(disease = disease, confidence = confidence)
        }
    }
}

@Composable
private fun DiseaseImageWithSeverity(disease: CropDisease) {
    Box(modifier = Modifier.height(240.dp)) {
        if (disease.imageUrl.isNotBlank()) {
            SubcomposeAsyncImage(
                model = disease.imageUrl,
                contentDescription = "${disease.name} - ${stringResource(R.string.diseased_crop)}",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
                loading = {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                },
                error = {
                    EmptyImagePlaceholder()
                },
                success = {
                    SubcomposeAsyncImageContent()
                }
            )
        } else {
            EmptyImagePlaceholder()
        }

        // Severity Badge
        SeverityIndicator(severity = disease.severity)
    }
}

@Composable
private fun BoxScope.SeverityIndicator(severity: String) {
    val severityConfig = SeverityConfig.from(severity)

    Surface(
        color = severityConfig.color,
        contentColor = Color.White,
        shape = RoundedCornerShape(topStart = 24.dp, bottomStart = 24.dp),
        modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                severityConfig.icon,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = stringResource(severityConfig.labelRes),
                fontWeight = FontWeight.SemiBold,
                fontSize = 14.sp
            )
        }
    }
}

@Composable
private fun DiseaseHeaderInfo(disease: CropDisease, confidence: Float) {
    Column(
        modifier = Modifier.padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Source Info
        Text(
            text = "Source: Verified Agricultural Database (Kaggle/Cimmyt)",
            fontSize = 10.sp,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 4.dp)
        )

        // Disease Name
        Text(
            text = disease.name,
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Black,
            color = MaterialTheme.colorScheme.primary
        )

        // Scientific Name
        Text(
            text = disease.scientificName,
            style = MaterialTheme.typography.bodyLarge,
            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        // Confidence Score
        ConfidenceIndicator(confidence = confidence)
    }
}

@Composable
private fun ConfidenceIndicator(confidence: Float) {
    val confidenceColor = when {
        confidence >= 0.95f -> Color(0xFF1B5E20)
        confidence >= 0.85f -> Color(0xFF827717)
        else -> Color(0xFFE65100)
    }

    Card(
        colors = CardDefaults.cardColors(
            containerColor = confidenceColor.copy(alpha = 0.1f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Verified,
                contentDescription = null,
                tint = confidenceColor,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = stringResource(R.string.detection_confidence),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "${String.format(Locale.US, "%.1f", confidence * 100)}%",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = confidenceColor
                )
            }
        }
    }
}

@Composable
private fun DiseaseAnalysisSections(disease: CropDisease) {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        AnalysisSection(
            titleRes = R.string.symptoms_label,
            items = disease.symptoms,
            icon = Icons.Default.Info,
            color = Color(0xFF1976D2)
        )

        AnalysisSection(
            titleRes = R.string.treatment_plan,
            items = disease.treatmentSuggestions,
            icon = Icons.Default.LocalHospital,
            color = Color(0xFF388E3C)
        )

        if (disease.preventionTips.isNotEmpty()) {
            AnalysisSection(
                titleRes = R.string.prevention_tips,
                items = disease.preventionTips,
                icon = Icons.Default.Security,
                color = Color(0xFF7B1FA2)
            )
        }
    }
}

@Composable
private fun AnalysisSection(
    titleRes: Int,
    items: List<String>,
    icon: ImageVector,
    color: Color
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            // Section Header
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = stringResource(titleRes),
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }

            // Items List
            items.forEach { item ->
                Row(
                    modifier = Modifier.padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "⟐",
                        color = color,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = item,
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 22.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun ActionButtonsSection(onShare: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Share Button
        OutlinedButton(
            onClick = onShare,
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.Default.Share, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(stringResource(R.string.share_report))
        }

        // Save Button (Optional)
        Button(
            onClick = { /* Handle save */ },
            modifier = Modifier.weight(1f),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(Icons.Default.Download, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(stringResource(R.string.save_report))
        }
    }
}

@Composable
private fun AiVerificationDisclaimer() {
    Card(
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Psychology,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = stringResource(R.string.professional_consultation_required),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = stringResource(R.string.ai_verification_message),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

// Error States
@Composable
private fun NonCropDetectionError(onRetry: () -> Unit) {
    ErrorState(
        icon = Icons.Default.Nature,
        titleRes = R.string.non_crop_detected,
        messageRes = R.string.only_crop_diseases_supported,
        onRetry = onRetry
    )
}

@Composable
private fun LowConfidenceError(onRetry: () -> Unit) {
    ErrorState(
        icon = Icons.AutoMirrored.Filled.Help,
        titleRes = R.string.low_confidence_detection,
        messageRes = R.string.low_confidence_retry_message,
        onRetry = onRetry
    )
}

@Composable
private fun UnknownDetectionError(onRetry: () -> Unit) {
    ErrorState(
        icon = Icons.Default.Error,
        titleRes = R.string.detection_failed,
        messageRes = R.string.unknown_error_message,
        onRetry = onRetry
    )
}

@Composable
private fun ErrorState(
    icon: ImageVector,
    titleRes: Int,
    messageRes: Int,
    onRetry: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier
                .size(96.dp)
                .clip(CircleShape),
            tint = MaterialTheme.colorScheme.error
        )

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = stringResource(titleRes),
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.error,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = stringResource(messageRes),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(40.dp))

        Button(
            onClick = onRetry,
            modifier = Modifier
                .fillMaxWidth(0.7f)
                .height(56.dp),
            shape = RoundedCornerShape(28.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.error
            )
        ) {
            Icon(Icons.Default.RestartAlt, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = stringResource(R.string.try_another_scan),
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun EmptyImagePlaceholder() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                MaterialTheme.colorScheme.surfaceVariant
            ),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            Icons.Default.Agriculture,
            contentDescription = null,
            modifier = Modifier.size(72.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// Severity Configuration
private data class SeverityConfig(
    val color: Color,
    val icon: ImageVector,
    val labelRes: Int
) {
    companion object {
        fun from(severity: String): SeverityConfig = when (severity.uppercase()) {
            "HIGH" -> SeverityConfig(
                color = Color(0xFFD32F2F),
                icon = Icons.Default.PriorityHigh,
                labelRes = R.string.severity_high
            )
            "MEDIUM" -> SeverityConfig(
                color = Color(0xFFF57C00),
                icon = Icons.Default.Warning,
                labelRes = R.string.severity_medium
            )
            else -> SeverityConfig(
                color = Color(0xFF388E3C),
                icon = Icons.Default.CheckCircle,
                labelRes = R.string.severity_low
            )
        }
    }
}
