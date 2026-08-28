package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.data.local.dao.CompanyDao
import com.example.data.local.dao.IngredientDao
import com.example.data.local.dao.InventoryDao
import com.example.data.local.dao.ProductDao
import com.example.data.local.entity.CompanyProfile
import com.example.data.local.entity.Ingredient
import com.example.data.local.entity.InventoryCount
import com.example.data.local.entity.InventoryCountItem
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient

@Database(
    entities = [
        CompanyProfile::class,
        Ingredient::class,
        Product::class,
        ProductIngredient::class,
        InventoryCount::class,
        InventoryCountItem::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun companyDao(): CompanyDao
    abstract fun ingredientDao(): IngredientDao
    abstract fun productDao(): ProductDao
    abstract fun inventoryDao(): InventoryDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "estoque_ficha_database"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
