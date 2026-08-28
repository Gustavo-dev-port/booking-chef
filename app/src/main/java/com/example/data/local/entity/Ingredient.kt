package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "ingredients")
data class Ingredient(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val category: String,
    val purchaseUnit: String, // 'un', 'cx', 'pct', 'garrafa', 'lata', 'kg', 'g', 'l', 'ml'
    val usageUnit: String,    // 'un', 'g', 'ml'
    val packageQuantity: Double, // e.g. 750, 24, 1000
    val packagePrice: Double,    // e.g. 109.90, 112.80
    val unitCost: Double,        // e.g. 0.1465, 4.70
    val currentStock: Double = 0.0,
    val priceUpdatedAt: Long = System.currentTimeMillis(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)
