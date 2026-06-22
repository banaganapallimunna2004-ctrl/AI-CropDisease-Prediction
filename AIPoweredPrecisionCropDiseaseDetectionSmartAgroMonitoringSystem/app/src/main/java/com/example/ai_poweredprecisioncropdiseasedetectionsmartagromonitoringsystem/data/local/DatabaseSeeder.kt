package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local

import android.content.ContentValues
import android.content.Context
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.CropDetectionEntity
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.io.InputStreamReader

class DatabaseSeeder(
    private val context: Context
) : RoomDatabase.Callback() {

    override fun onCreate(db: SupportSQLiteDatabase) {
        super.onCreate(db)
        CoroutineScope(Dispatchers.IO).launch {
            seedDatabase(db)
        }
    }

    private fun seedDatabase(db: SupportSQLiteDatabase) {
        try {
            val inputStream = context.assets.open("diseases_seed.json")
            val reader = InputStreamReader(inputStream)
            val type = object : TypeToken<List<CropDetectionEntity>>() {}.type
            val diseases: List<CropDetectionEntity> = Gson().fromJson(reader, type)

            diseases.forEach { disease ->
                val values = ContentValues().apply {
                    put("diseaseName", disease.diseaseName)
                    put("scientificName", disease.scientificName)
                    put("severity", disease.severity)
                    put("confidence", disease.confidence)
                    put("imageUrl", disease.imageUrl)
                    
                    // Correctly use Room's expected format (JSON via Converters)
                    val gson = Gson()
                    put("symptoms", gson.toJson(disease.symptoms))
                    put("treatmentSuggestions", gson.toJson(disease.treatmentSuggestions))
                    put("preventionTips", gson.toJson(disease.preventionTips))

                    put("timestamp", disease.timestamp)
                }
                db.insert("crop_detections", android.database.sqlite.SQLiteDatabase.CONFLICT_REPLACE, values)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
