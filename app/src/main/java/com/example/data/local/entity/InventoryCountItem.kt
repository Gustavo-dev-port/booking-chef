package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "inventory_count_items",
    foreignKeys = [
        ForeignKey(
            entity = InventoryCount::class,
            parentColumns = ["id"],
            childColumns = ["inventoryCountId"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = Ingredient::class,
            parentColumns = ["id"],
            childColumns = ["ingredientId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index("inventoryCountId"),
        Index("ingredientId")
    ]
)
data class InventoryCountItem(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val inventoryCountId: Long,
    val ingredientId: Long,
    val ingredientName: String,
    val category: String,
    val closedQuantity: Double = 0.0,
    val fractionPercentage: Int = 0, // 0, 25, 50, 75, 100
    val fractionQuantity: Double = 0.0,
    val totalQuantity: Double = 0.0,
    val purchaseUnit: String = "un",
    val packageQuantity: Double = 1.0,
    val unitCostAtCount: Double = 0.0,
    val packagePriceAtCount: Double = 0.0,
    val totalValue: Double = 0.0
)
