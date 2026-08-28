package com.example.data.repository

import com.example.data.SampleData
import com.example.data.local.AppDatabase
import com.example.data.local.entity.CompanyProfile
import com.example.data.local.entity.Ingredient
import com.example.data.local.entity.InventoryCount
import com.example.data.local.entity.InventoryCountItem
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient
import com.example.model.InventoryComparison
import com.example.model.ItemVariance
import com.example.model.ProductDetail
import com.example.model.RecipeIngredientDetail
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.withContext

class AppRepository(private val db: AppDatabase) {
    private val companyDao = db.companyDao()
    private val ingredientDao = db.ingredientDao()
    private val productDao = db.productDao()
    private val inventoryDao = db.inventoryDao()

    val companyProfile: Flow<CompanyProfile?> = companyDao.getCompanyProfile()
    val allIngredients: Flow<List<Ingredient>> = ingredientDao.getAllIngredients()
    val allProducts: Flow<List<Product>> = productDao.getAllProducts()
    val allCounts: Flow<List<InventoryCount>> = inventoryDao.getAllCounts()
    val latestCount: Flow<InventoryCount?> = inventoryDao.getLatestCount()

    val productsWithDetails: Flow<List<ProductDetail>> = combine(
        allProducts,
        allIngredients,
        productDao.getAllProductIngredients()
    ) { products, ingredients, recipeLinks ->
        val ingredientMap = ingredients.associateBy { it.id }
        val recipeByProduct = recipeLinks.groupBy { it.productId }

        products.map { product ->
            val links = recipeByProduct[product.id] ?: emptyList()
            val recipeDetails = links.mapNotNull { link ->
                val ingredient = ingredientMap[link.ingredientId] ?: return@mapNotNull null
                val cost = link.quantity * ingredient.unitCost
                RecipeIngredientDetail(
                    productIngredient = link,
                    ingredient = ingredient,
                    computedCost = cost
                )
            }
            val totalCost = recipeDetails.sumOf { it.computedCost }
            val salePrice = product.salePrice
            val costPercentage = if (salePrice > 0.0) (totalCost / salePrice) * 100.0 else 0.0
            val grossMargin = salePrice - totalCost
            val markup = if (totalCost > 0.0) salePrice / totalCost else 0.0

            ProductDetail(
                product = product,
                ingredients = recipeDetails,
                totalCost = totalCost,
                salePrice = salePrice,
                costPercentage = costPercentage,
                grossMargin = grossMargin,
                markup = markup
            )
        }
    }

    suspend fun saveCompanyProfile(profile: CompanyProfile) = withContext(Dispatchers.IO) {
        companyDao.saveCompanyProfile(profile)
    }

    suspend fun insertIngredient(ingredient: Ingredient): Long = withContext(Dispatchers.IO) {
        val cost = if (ingredient.packageQuantity > 0.0) ingredient.packagePrice / ingredient.packageQuantity else 0.0
        val sanitized = ingredient.copy(unitCost = cost, priceUpdatedAt = System.currentTimeMillis())
        ingredientDao.insertIngredient(sanitized)
    }

    suspend fun updateIngredient(ingredient: Ingredient) = withContext(Dispatchers.IO) {
        val cost = if (ingredient.packageQuantity > 0.0) ingredient.packagePrice / ingredient.packageQuantity else 0.0
        val sanitized = ingredient.copy(unitCost = cost, priceUpdatedAt = System.currentTimeMillis(), updatedAt = System.currentTimeMillis())
        ingredientDao.updateIngredient(sanitized)
    }

    suspend fun deleteIngredient(ingredient: Ingredient) = withContext(Dispatchers.IO) {
        ingredientDao.deleteIngredient(ingredient)
    }

    suspend fun saveProductWithRecipe(product: Product, ingredients: List<ProductIngredient>): Long = withContext(Dispatchers.IO) {
        productDao.saveProductWithIngredients(product, ingredients)
    }

    suspend fun deleteProduct(product: Product) = withContext(Dispatchers.IO) {
        productDao.deleteProduct(product)
    }

    suspend fun getRecipeForProduct(productId: Long): List<ProductIngredient> = withContext(Dispatchers.IO) {
        productDao.getIngredientsForProductSync(productId)
    }

    suspend fun saveInventoryCount(
        count: InventoryCount,
        items: List<InventoryCountItem>
    ): Long = withContext(Dispatchers.IO) {
        val countId = inventoryDao.saveCompletedCount(count, items)
        // Also update the currentStock in ingredients table with the counted numbers
        for (item in items) {
            ingredientDao.updateStock(item.ingredientId, item.totalQuantity)
        }
        countId
    }

    suspend fun deleteCount(count: InventoryCount) = withContext(Dispatchers.IO) {
        inventoryDao.deleteCount(count)
    }

    fun getItemsForCount(countId: Long): Flow<List<InventoryCountItem>> {
        return inventoryDao.getItemsForCount(countId)
    }

    suspend fun getInventoryComparison(currentCountId: Long): InventoryComparison? = withContext(Dispatchers.IO) {
        val currentCount = inventoryDao.getCountById(currentCountId) ?: return@withContext null
        val currentItems = inventoryDao.getItemsForCountSync(currentCountId)
        
        // Find previous completed count
        val allCountsList = inventoryDao.getAllCounts().firstOrNull() ?: emptyList()
        val sortedCounts = allCountsList.filter { it.status == "COMPLETED" }.sortedByDescending { it.startedAt }
        val currentIndex = sortedCounts.indexOfFirst { it.id == currentCountId }
        val previousCount = if (currentIndex >= 0 && currentIndex + 1 < sortedCounts.size) {
            sortedCounts[currentIndex + 1]
        } else null

        val previousItems = if (previousCount != null) {
            inventoryDao.getItemsForCountSync(previousCount.id)
        } else emptyList()

        val prevMap = previousItems.associateBy { it.ingredientId }
        val currentMap = currentItems.associateBy { it.ingredientId }

        val allIngredientIds = (currentMap.keys + prevMap.keys).distinct()
        val variances = allIngredientIds.mapNotNull { id ->
            val cur = currentMap[id]
            val prev = prevMap[id]
            val name = cur?.ingredientName ?: prev?.ingredientName ?: return@mapNotNull null
            val category = cur?.category ?: prev?.category ?: "Outros"
            val unit = cur?.purchaseUnit ?: prev?.purchaseUnit ?: "un"

            val curQty = cur?.totalQuantity ?: 0.0
            val prevQty = prev?.totalQuantity ?: 0.0
            val diffQty = curQty - prevQty

            val curVal = cur?.totalValue ?: 0.0
            val prevVal = prev?.totalValue ?: 0.0
            val diffVal = curVal - prevVal

            ItemVariance(
                ingredientId = id,
                ingredientName = name,
                category = category,
                previousQty = prevQty,
                currentQty = curQty,
                diffQty = diffQty,
                previousValue = prevVal,
                currentValue = curVal,
                diffValue = diffVal,
                unit = unit
            )
        }

        val totalDiff = variances.sumOf { it.diffValue }

        InventoryComparison(
            currentCount = currentCount,
            previousCount = previousCount,
            currentItems = currentItems,
            previousItems = previousItems,
            variances = variances,
            totalDiffValue = totalDiff
        )
    }

    suspend fun checkAndSeedInitialDataIfEmpty() = withContext(Dispatchers.IO) {
        val profile = companyDao.getCompanyProfileSync()
        if (profile == null) {
            populateSampleData()
        }
    }

    suspend fun populateSampleData() = withContext(Dispatchers.IO) {
        // Clear old
        productDao.deleteAllProductIngredients()
        productDao.deleteAllProducts()
        ingredientDao.deleteAll()
        inventoryDao.deleteAllCounts()

        // Company
        companyDao.saveCompanyProfile(SampleData.defaultCompany)

        // Ingredients
        val ingredients = SampleData.getSampleIngredients()
        ingredientDao.insertAll(ingredients)
        val loadedIngredients = ingredientDao.getAllIngredients().firstOrNull() ?: emptyList()

        // Products
        val products = SampleData.getSampleProducts()
        productDao.insertAllProducts(products)
        val loadedProducts = productDao.getAllProducts().firstOrNull() ?: emptyList()

        // Product Ingredients
        val recipes = SampleData.getSampleRecipeItems(loadedProducts, loadedIngredients)
        productDao.insertProductIngredients(recipes)

        // Seed 1 previous inventory count
        val (histCount, histItems) = SampleData.getSampleHistoricalCounts(loadedIngredients)
        saveInventoryCount(histCount, histItems)
    }
}
