package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.di

import android.content.Context
import androidx.room.Room
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.AgroDatabase
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.DatabaseSeeder
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.dao.*
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.repository.AgroRepositoryImpl
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.domain.repository.AgroRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.remote.AgroApiService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideAgroApiService(okHttpClient: OkHttpClient): AgroApiService {
        return Retrofit.Builder()
            .baseUrl("https://api.agroai-monitor.com/v1/") // Placeholder URL
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AgroApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideAgroDatabase(@ApplicationContext context: Context): AgroDatabase {
        return Room.databaseBuilder(
            context,
            AgroDatabase::class.java,
            "agro_db"
        )
        .addCallback(DatabaseSeeder(context))
        .fallbackToDestructiveMigration()
        .build()
    }

    @Provides
    fun provideUserSettingsDao(db: AgroDatabase): UserSettingsDao {
        return db.userSettingsDao()
    }

    @Provides
    fun provideUserDao(db: AgroDatabase): UserDao {
        return db.userDao()
    }

    @Provides
    fun provideUserOtpDao(db: AgroDatabase): UserOtpDao {
        return db.userOtpDao()
    }

    @Provides
    fun provideSensorDataDao(db: AgroDatabase): SensorDataDao {
        return db.sensorDataDao()
    }

    @Provides
    fun provideAlertDao(db: AgroDatabase): AlertDao {
        return db.alertDao()
    }

    @Provides
    fun provideCropDetectionDao(db: AgroDatabase): CropDetectionDao {
        return db.cropDetectionDao()
    }

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirebaseFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance()

    @Provides
    @Singleton
    fun provideAgroRepository(
        apiService: AgroApiService,
        userSettingsDao: UserSettingsDao,
        userDao: UserDao,
        userOtpDao: UserOtpDao,
        sensorDataDao: SensorDataDao,
        alertDao: AlertDao,
        cropDetectionDao: CropDetectionDao,
        firebaseAuth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): AgroRepository {
        return AgroRepositoryImpl(
            apiService, 
            userSettingsDao, 
            userDao, 
            userOtpDao,
            sensorDataDao,
            alertDao,
            cropDetectionDao,
            firebaseAuth,
            firestore
        )
    }
}
