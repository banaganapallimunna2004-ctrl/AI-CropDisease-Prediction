package com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.repository

import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.dao.*
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.local.entity.UserEntity
import com.example.ai_poweredprecisioncropdiseasedetectionsmartagromonitoringsystem.data.remote.AgroApiService
import io.mockk.*
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AgroRepositoryTest {

    private lateinit var repository: AgroRepositoryImpl
    private val apiService = mockk<AgroApiService>()
    private val userSettingsDao = mockk<UserSettingsDao>(relaxed = true)
    private val userDao = mockk<UserDao>(relaxed = true)
    private val userOtpDao = mockk<UserOtpDao>(relaxed = true)
    private val sensorDataDao = mockk<SensorDataDao>(relaxed = true)
    private val alertDao = mockk<AlertDao>(relaxed = true)
    private val cropDetectionDao = mockk<CropDetectionDao>(relaxed = true)

    @Before
    fun setup() {
        repository = AgroRepositoryImpl(
            apiService,
            userSettingsDao,
            userDao,
            userOtpDao,
            sensorDataDao,
            alertDao,
            cropDetectionDao
        )
    }

    @Test
    fun `loginWithGoogle fails for non-gmail address`() = runTest {
        val result = repository.loginWithGoogle("user@outlook.com", "User Name", true)
        assertFalse(result)
        coVerify(exactly = 0) { userDao.insertUser(any()) }
    }

    @Test
    fun `loginWithGoogle fails for unverified email`() = runTest {
        val result = repository.loginWithGoogle("user@gmail.com", "User Name", false)
        assertFalse(result)
        coVerify(exactly = 0) { userDao.insertUser(any()) }
    }

    @Test
    fun `loginWithGoogle succeeds for verified gmail address`() = runTest {
        coEvery { userDao.getUserByEmail("user@gmail.com") } returns null
        val result = repository.loginWithGoogle("user@gmail.com", "User Name", true)
        assertTrue(result)
        coVerify { userDao.insertUser(any()) }
    }

    @Test
    fun `login succeeds for correct credentials`() = runTest {
        val testUser = UserEntity(email = "test@agro.com", passwordHash = "correct_pass", fullName = "Test User", phone = "")
        coEvery { userDao.getUserByEmail("test@agro.com") } returns testUser
        
        val result = repository.login("test@agro.com", "correct_pass")
        assertTrue(result)
        coVerify { userDao.updateUser(match { it.isLoggedIn }) }
    }

    @Test
    fun `login fails for incorrect credentials`() = runTest {
        val testUser = UserEntity(email = "test@gmail.com", passwordHash = "correct_pass", fullName = "Test User", phone = "")
        coEvery { userDao.getUserByEmail("test@gmail.com") } returns testUser
        
        val result = repository.login("test@gmail.com", "wrong_pass")
        assertFalse(result)
    }

    @Test
    fun `register fails for non-gmail address`() = runTest {
        val result = repository.register(UserEntity(email = "user@other.com", passwordHash = "pass", fullName = "Name", phone = ""))
        assertFalse(result)
    }

    @Test
    fun `register succeeds for gmail address`() = runTest {
        coEvery { userDao.getUserByEmail("user@gmail.com") } returns null
        val result = repository.register(UserEntity(email = "user@gmail.com", passwordHash = "pass", fullName = "Name", phone = ""))
        assertTrue(result)
    }
}
