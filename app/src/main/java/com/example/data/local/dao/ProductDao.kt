package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import androidx.room.Update
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient
import kotlinx.coroutines.flow.Flow

@Dao
interface ProductDao {
    @Query("SELECT * FROM products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<Product>>

    @Query("SELECT * FROM products WHERE id = :id")
    suspend fun getProductById(id: Long): Product?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProduct(product: Product): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllProducts(products: List<Product>): List<Long>

    @Update
    suspend fun updateProduct(product: Product)

    @Delete
    suspend fun deleteProduct(product: Product)

    @Query("DELETE FROM products")
    suspend fun deleteAllProducts()

    // Product Ingredients
    @Query("SELECT * FROM product_ingredients WHERE productId = :productId")
    fun getIngredientsForProduct(productId: Long): Flow<List<ProductIngredient>>

    @Query("SELECT * FROM product_ingredients WHERE productId = :productId")
    suspend fun getIngredientsForProductSync(productId: Long): List<ProductIngredient>

    @Query("SELECT * FROM product_ingredients")
    fun getAllProductIngredients(): Flow<List<ProductIngredient>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProductIngredient(productIngredient: ProductIngredient): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProductIngredients(productIngredients: List<ProductIngredient>)

    @Query("DELETE FROM product_ingredients WHERE productId = :productId")
    suspend fun deleteIngredientsForProduct(productId: Long)

    @Query("DELETE FROM product_ingredients")
    suspend fun deleteAllProductIngredients()

    @Transaction
    suspend fun saveProductWithIngredients(product: Product, ingredients: List<ProductIngredient>): Long {
        val prodId = if (product.id == 0L) {
            insertProduct(product)
        } else {
            updateProduct(product)
            product.id
        }
        deleteIngredientsForProduct(prodId)
        val linked = ingredients.map { it.copy(productId = prodId) }
        insertProductIngredients(linked)
        return prodId
    }
}
