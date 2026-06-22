package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.model

/**
 * Data class representing a single chat message in the chatbot
 */
data class ChatMessage(
    val id: String = System.currentTimeMillis().toString() + (1000..9999).random(),
    val text: String,
    val isUser: Boolean,
    val time: String = java.text.SimpleDateFormat("HH:mm", java.util.Locale.getDefault()).format(java.util.Date())
)
