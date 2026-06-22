package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "user_otps")
data class UserOtpEntity(
    @PrimaryKey val phoneNumber: String,
    val otpCode: String,
    val expiryTime: Long
)
