package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "inventory_counts")
data class InventoryCount(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startedAt: Long = System.currentTimeMillis(),
    val finishedAt: Long? = null,
    val status: String = "COMPLETED", // "IN_PROGRESS", "COMPLETED"
    val responsibleName: String = "Gustavo",
    val totalInventoryValue: Double = 0.0,
    val totalItemsCounted: Int = 0,
    val notes: String = ""
)
