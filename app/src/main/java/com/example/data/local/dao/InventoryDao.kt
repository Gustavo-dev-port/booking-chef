package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.example.data.local.entity.InventoryCount
import com.example.data.local.entity.InventoryCountItem
import kotlinx.coroutines.flow.Flow

@Dao
interface InventoryDao {
    @Query("SELECT * FROM inventory_counts ORDER BY startedAt DESC")
    fun getAllCounts(): Flow<List<InventoryCount>>

    @Query("SELECT * FROM inventory_counts WHERE id = :id")
    suspend fun getCountById(id: Long): InventoryCount?

    @Query("SELECT * FROM inventory_counts ORDER BY startedAt DESC LIMIT 1")
    fun getLatestCount(): Flow<InventoryCount?>

    @Query("SELECT * FROM inventory_counts ORDER BY startedAt DESC LIMIT 2")
    suspend fun getLatestTwoCounts(): List<InventoryCount>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCount(count: InventoryCount): Long

    @Delete
    suspend fun deleteCount(count: InventoryCount)

    // Items
    @Query("SELECT * FROM inventory_count_items WHERE inventoryCountId = :countId")
    fun getItemsForCount(countId: Long): Flow<List<InventoryCountItem>>

    @Query("SELECT * FROM inventory_count_items WHERE inventoryCountId = :countId")
    suspend fun getItemsForCountSync(countId: Long): List<InventoryCountItem>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCountItems(items: List<InventoryCountItem>)

    @Query("DELETE FROM inventory_counts")
    suspend fun deleteAllCounts()

    @Transaction
    suspend fun saveCompletedCount(
        count: InventoryCount,
        items: List<InventoryCountItem>
    ): Long {
        val countId = insertCount(count)
        val attachedItems = items.map { it.copy(inventoryCountId = countId) }
        insertCountItems(attachedItems)
        return countId
    }
}
