package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "company_profile")
data class CompanyProfile(
    @PrimaryKey val id: Int = 1,
    val userName: String = "Gustavo",
    val userEmail: String = "gustavo@exemplo.com",
    val userPhone: String = "(11) 98765-4321",
    val userRole: String = "Proprietário / Sócio",
    val cnpj: String = "12.345.678/0001-90",
    val legalName: String = "Bar & Gastronomia LTDA",
    val tradeName: String = "Boteco Central",
    val segment: String = "Bar",
    val employeeRange: String = "2–5",
    val city: String = "São Paulo",
    val state: String = "SP",
    val acceptTerms: Boolean = true,
    val acceptMarketing: Boolean = false,
    val onboardingCompleted: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
