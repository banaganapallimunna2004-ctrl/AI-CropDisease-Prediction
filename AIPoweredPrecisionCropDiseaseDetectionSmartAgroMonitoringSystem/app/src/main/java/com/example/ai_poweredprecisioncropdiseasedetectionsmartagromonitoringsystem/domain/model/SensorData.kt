package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model

data class SensorData(
    val temperature: Float,
    val humidity: Float,
    val soilMoisture: Float,
    val soilPh: Float,
    val timestamp: Long = System.currentTimeMillis()
)
