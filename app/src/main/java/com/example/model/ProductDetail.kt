package com.example.model

import com.example.data.local.entity.Ingredient
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient

data class RecipeIngredientDetail(
    val productIngredient: ProductIngredient,
    val ingredient: Ingredient,
    val computedCost: Double
)

data class ProductDetail(
    val product: Product,
    val ingredients: List<RecipeIngredientDetail>,
    val totalCost: Double,
    val salePrice: Double,
    val costPercentage: Double, // (totalCost / salePrice) * 100
    val grossMargin: Double,     // salePrice - totalCost
    val markup: Double          // if totalCost > 0: salePrice / totalCost else 0.0
)
