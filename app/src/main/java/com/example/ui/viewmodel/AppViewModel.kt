package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.local.AppDatabase
import com.example.data.local.entity.CompanyProfile
import com.example.data.local.entity.Ingredient
import com.example.data.local.entity.InventoryCount
import com.example.data.local.entity.InventoryCountItem
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient
import com.example.data.repository.AppRepository
import com.example.model.InventoryComparison
import com.example.model.ProductDetail
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

enum class AppTab {
    DASHBOARD,
    INGREDIENTS,
    PRODUCTS,
    INVENTORY,
    HISTORY,
    PROFILE
}

data class CountItemDraft(
    val ingredientId: Long,
    val ingredientName: String,
    val category: String,
    val closedQuantity: Double,
    val fractionPercentage: Int, // 0, 25, 50, 75, 100
    val purchaseUnit: String,
    val packageQuantity: Double,
    val packagePrice: Double,
    val unitCost: Double
) {
    val fractionQuantity: Double get() = fractionPercentage / 100.0
    val totalQuantity: Double get() = closedQuantity + fractionQuantity
    val totalValue: Double get() = totalQuantity * packagePrice
}

data class DashboardStats(
    val totalInventoryValue: Double = 0.0,
    val ingredientCount: Int = 0,
    val productCount: Int = 0,
    val lastCountDate: Long = 0L,
    val lowMarginProducts: List<ProductDetail> = emptyList()
)

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val db = AppDatabase.getDatabase(application)
    private val repository = AppRepository(db)

    val companyProfile: StateFlow<CompanyProfile?> = repository.companyProfile
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val ingredients: StateFlow<List<Ingredient>> = repository.allIngredients
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val productsWithDetails: StateFlow<List<ProductDetail>> = repository.productsWithDetails
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val inventoryCounts: StateFlow<List<InventoryCount>> = repository.allCounts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val latestCount: StateFlow<InventoryCount?> = repository.latestCount
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    // Current Navigation Tab
    private val _currentTab = MutableStateFlow(AppTab.DASHBOARD)
    val currentTab = _currentTab.asStateFlow()

    // Search and filter states
    private val _ingredientSearchQuery = MutableStateFlow("")
    val ingredientSearchQuery = _ingredientSearchQuery.asStateFlow()

    private val _selectedIngredientCategory = MutableStateFlow<String?>(null)
    val selectedIngredientCategory = _selectedIngredientCategory.asStateFlow()

    private val _productSearchQuery = MutableStateFlow("")
    val productSearchQuery = _productSearchQuery.asStateFlow()

    private val _selectedProductCategory = MutableStateFlow<String?>(null)
    val selectedProductCategory = _selectedProductCategory.asStateFlow()

    // Active Inventory Counting State
    private val _isCountingActive = MutableStateFlow(false)
    val isCountingActive = _isCountingActive.asStateFlow()

    private val _countCurrentIndex = MutableStateFlow(0)
    val countCurrentIndex = _countCurrentIndex.asStateFlow()

    private val _activeCountDrafts = MutableStateFlow<Map<Long, CountItemDraft>>(emptyMap())
    val activeCountDrafts = _activeCountDrafts.asStateFlow()

    private val _countResponsibleName = MutableStateFlow("Gustavo")
    val countResponsibleName = _countResponsibleName.asStateFlow()

    private val _countStartedAt = MutableStateFlow(0L)
    val countStartedAt = _countStartedAt.asStateFlow()

    private val _isCountSummaryOpen = MutableStateFlow(false)
    val isCountSummaryOpen = _isCountSummaryOpen.asStateFlow()

    // Selected comparison state
    private val _selectedComparison = MutableStateFlow<InventoryComparison?>(null)
    val selectedComparison = _selectedComparison.asStateFlow()

    // Dashboard computed stats
    val dashboardStats: StateFlow<DashboardStats> = combine(
        ingredients,
        productsWithDetails,
        latestCount
    ) { ings, prods, lastCount ->
        val totalVal = ings.sumOf { it.currentStock * it.packagePrice }
        val lowMargins = prods.filter { it.costPercentage > 40.0 || (it.salePrice > 0 && it.grossMargin / it.salePrice < 0.50) }
        DashboardStats(
            totalInventoryValue = if (lastCount != null && lastCount.totalInventoryValue > 0) lastCount.totalInventoryValue else totalVal,
            ingredientCount = ings.size,
            productCount = prods.size,
            lastCountDate = lastCount?.finishedAt ?: lastCount?.startedAt ?: 0L,
            lowMarginProducts = lowMargins
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), DashboardStats())

    init {
        viewModelScope.launch {
            repository.checkAndSeedInitialDataIfEmpty()
        }
    }

    fun setTab(tab: AppTab) {
        _currentTab.value = tab
    }

    fun setIngredientSearch(query: String) {
        _ingredientSearchQuery.value = query
    }

    fun setIngredientCategory(category: String?) {
        _selectedIngredientCategory.value = if (_selectedIngredientCategory.value == category) null else category
    }

    fun setProductSearch(query: String) {
        _productSearchQuery.value = query
    }

    fun setProductCategory(category: String?) {
        _selectedProductCategory.value = if (_selectedProductCategory.value == category) null else category
    }

    // Company & Profile
    fun saveCompanyProfile(profile: CompanyProfile) {
        viewModelScope.launch {
            repository.saveCompanyProfile(profile)
        }
    }

    fun completeOnboarding(profile: CompanyProfile) {
        viewModelScope.launch {
            repository.saveCompanyProfile(profile.copy(onboardingCompleted = true))
            _currentTab.value = AppTab.DASHBOARD
        }
    }

    // Insumos CRUD
    fun saveIngredient(ingredient: Ingredient) {
        viewModelScope.launch {
            if (ingredient.id == 0L) {
                repository.insertIngredient(ingredient)
            } else {
                repository.updateIngredient(ingredient)
            }
        }
    }

    fun deleteIngredient(ingredient: Ingredient) {
        viewModelScope.launch {
            repository.deleteIngredient(ingredient)
        }
    }

    // Ficha Técnica & Produtos CRUD
    fun saveProductWithRecipe(product: Product, ingredients: List<ProductIngredient>) {
        viewModelScope.launch {
            repository.saveProductWithRecipe(product, ingredients)
        }
    }

    fun deleteProduct(product: Product) {
        viewModelScope.launch {
            repository.deleteProduct(product)
        }
    }

    // Inventory Counting Workflow
    fun startNewInventoryCount(responsible: String = "") {
        val user = companyProfile.value?.userName ?: "Responsável"
        val respName = if (responsible.isNotBlank()) responsible else user
        _countResponsibleName.value = respName
        _countStartedAt.value = System.currentTimeMillis()
        _countCurrentIndex.value = 0
        _isCountSummaryOpen.value = false

        val initialDrafts = mutableMapOf<Long, CountItemDraft>()
        for (ing in ingredients.value) {
            val closed = if (ing.purchaseUnit == "garrafa") 0.0 else 0.0
            initialDrafts[ing.id] = CountItemDraft(
                ingredientId = ing.id,
                ingredientName = ing.name,
                category = ing.category,
                closedQuantity = closed,
                fractionPercentage = 0,
                purchaseUnit = ing.purchaseUnit,
                packageQuantity = ing.packageQuantity,
                packagePrice = ing.packagePrice,
                unitCost = ing.unitCost
            )
        }
        _activeCountDrafts.value = initialDrafts
        _isCountingActive.value = true
    }

    fun updateCurrentItemCount(ingredientId: Long, closedQty: Double, fractionPct: Int) {
        val currentMap = _activeCountDrafts.value.toMutableMap()
        val existing = currentMap[ingredientId]
        if (existing != null) {
            currentMap[ingredientId] = existing.copy(
                closedQuantity = closedQty.coerceAtLeast(0.0),
                fractionPercentage = fractionPct
            )
            _activeCountDrafts.value = currentMap
        }
    }

    fun nextCountItem() {
        val total = ingredients.value.size
        if (_countCurrentIndex.value < total - 1) {
            _countCurrentIndex.value += 1
        } else {
            _isCountSummaryOpen.value = true
        }
    }

    fun previousCountItem() {
        if (_countCurrentIndex.value > 0) {
            _countCurrentIndex.value -= 1
        }
    }

    fun jumpToCountItem(index: Int) {
        if (index in 0 until ingredients.value.size) {
            _countCurrentIndex.value = index
        }
    }

    fun openCountSummary() {
        _isCountSummaryOpen.value = true
    }

    fun closeCountSummary() {
        _isCountSummaryOpen.value = false
    }

    fun cancelCount() {
        _isCountingActive.value = false
        _isCountSummaryOpen.value = false
        _activeCountDrafts.value = emptyMap()
    }

    fun finalizeInventoryCount(notes: String = "") {
        viewModelScope.launch {
            val drafts = _activeCountDrafts.value.values.toList()
            val totalVal = drafts.sumOf { it.totalValue }
            val countItems = drafts.map { draft ->
                InventoryCountItem(
                    inventoryCountId = 0,
                    ingredientId = draft.ingredientId,
                    ingredientName = draft.ingredientName,
                    category = draft.category,
                    closedQuantity = draft.closedQuantity,
                    fractionPercentage = draft.fractionPercentage,
                    fractionQuantity = draft.fractionQuantity,
                    totalQuantity = draft.totalQuantity,
                    purchaseUnit = draft.purchaseUnit,
                    packageQuantity = draft.packageQuantity,
                    unitCostAtCount = draft.unitCost,
                    packagePriceAtCount = draft.packagePrice,
                    totalValue = draft.totalValue
                )
            }

            val inventoryCount = InventoryCount(
                id = 0,
                startedAt = _countStartedAt.value,
                finishedAt = System.currentTimeMillis(),
                status = "COMPLETED",
                responsibleName = _countResponsibleName.value,
                totalInventoryValue = totalVal,
                totalItemsCounted = drafts.size,
                notes = notes
            )

            val countId = repository.saveInventoryCount(inventoryCount, countItems)
            _isCountingActive.value = false
            _isCountSummaryOpen.value = false
            _activeCountDrafts.value = emptyMap()

            // Open comparison against previous count immediately
            loadComparison(countId)
            _currentTab.value = AppTab.HISTORY
        }
    }

    fun loadComparison(countId: Long) {
        viewModelScope.launch {
            val comp = repository.getInventoryComparison(countId)
            _selectedComparison.value = comp
        }
    }

    fun clearSelectedComparison() {
        _selectedComparison.value = null
    }

    fun deleteCount(count: InventoryCount) {
        viewModelScope.launch {
            repository.deleteCount(count)
            if (_selectedComparison.value?.currentCount?.id == count.id) {
                _selectedComparison.value = null
            }
        }
    }

    fun reloadSampleData() {
        viewModelScope.launch {
            repository.populateSampleData()
        }
    }
}
