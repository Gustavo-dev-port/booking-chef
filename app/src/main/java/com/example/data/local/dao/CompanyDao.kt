package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entity.CompanyProfile
import kotlinx.coroutines.flow.Flow

@Dao
interface CompanyDao {
    @Query("SELECT * FROM company_profile WHERE id = 1 LIMIT 1")
    fun getCompanyProfile(): Flow<CompanyProfile?>

    @Query("SELECT * FROM company_profile WHERE id = 1 LIMIT 1")
    suspend fun getCompanyProfileSync(): CompanyProfile?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveCompanyProfile(profile: CompanyProfile)
}
