package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val email: String,
    val passwordHash: String,
    val fullName: String,
    val phone: String,
    val farmName: String? = null,
    val farmLocation: String? = null,
    val farmSize: Float? = null,
    val profileImageUri: String? = null,
    val isLoggedIn: Boolean = false,
    val experienceYears: Int = 0,
    val primaryCrops: String? = "Rice, Tomato, Cotton",
    val soilType: String? = "Black Soil",
    val irrigationSystem: String? = "Drip Irrigation"
)
