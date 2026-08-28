package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "product_ingredients",
    foreignKeys = [
        ForeignKey(
            entity = Product::class,
            parentColumns = ["id"],
            childColumns = ["productId"],
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
        Index("productId"),
        Index("ingredientId")
    ]
)
data class ProductIngredient(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val productId: Long,
    val ingredientId: Long,
    val quantity: Double, // e.g. 50 (ml), 1 (un), 0.25 (un)
    val unit: String      // e.g. "ml", "un", "g"
)
