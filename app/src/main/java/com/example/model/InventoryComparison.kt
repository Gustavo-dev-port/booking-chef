package com.example.model

import com.example.data.local.entity.InventoryCount
import com.example.data.local.entity.InventoryCountItem

data class ItemVariance(
    val ingredientId: Long,
    val ingredientName: String,
    val category: String,
    val previousQty: Double,
    val currentQty: Double,
    val diffQty: Double,
    val previousValue: Double,
    val currentValue: Double,
    val diffValue: Double,
    val unit: String
)

data class InventoryComparison(
    val currentCount: InventoryCount,
    val previousCount: InventoryCount?,
    val currentItems: List<InventoryCountItem>,
    val previousItems: List<InventoryCountItem>,
    val variances: List<ItemVariance>,
    val totalDiffValue: Double
)
