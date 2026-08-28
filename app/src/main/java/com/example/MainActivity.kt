package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.screens.ActiveCountScreen
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.HistoryScreen
import com.example.ui.screens.IngredientsScreen
import com.example.ui.screens.InventoryScreen
import com.example.ui.screens.OnboardingScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.ProductsScreen
import com.example.ui.theme.EmeraldContainerLight
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate900
import com.example.ui.viewmodel.AppTab
import com.example.ui.viewmodel.AppViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                MainApp()
            }
        }
    }
}

data class NavItem(
    val tab: AppTab,
    val label: String,
    val icon: ImageVector
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainApp(viewModel: AppViewModel = viewModel()) {
    val profile by viewModel.companyProfile.collectAsState()
    val ingredients by viewModel.ingredients.collectAsState()
    val productsWithDetails by viewModel.productsWithDetails.collectAsState()
    val counts by viewModel.inventoryCounts.collectAsState()
    val latestCount by viewModel.latestCount.collectAsState()
    val stats by viewModel.dashboardStats.collectAsState()

    val currentTab by viewModel.currentTab.collectAsState()
    val ingredientSearch by viewModel.ingredientSearchQuery.collectAsState()
    val ingredientCategory by viewModel.selectedIngredientCategory.collectAsState()
    val productSearch by viewModel.productSearchQuery.collectAsState()
    val productCategory by viewModel.selectedProductCategory.collectAsState()

    val isCountingActive by viewModel.isCountingActive.collectAsState()
    val countIndex by viewModel.countCurrentIndex.collectAsState()
    val draftsMap by viewModel.activeCountDrafts.collectAsState()
    val countResponsible by viewModel.countResponsibleName.collectAsState()
    val isCountSummaryOpen by viewModel.isCountSummaryOpen.collectAsState()

    val selectedComparison by viewModel.selectedComparison.collectAsState()

    // If onboarding has not been completed, present Onboarding Flow
    if (profile != null && !profile!!.onboardingCompleted) {
        OnboardingScreen(
            initialProfile = profile,
            onComplete = { completedProfile ->
                viewModel.completeOnboarding(completedProfile)
            },
            onOpenTerms = {
                viewModel.setTab(AppTab.PROFILE)
            }
        )
        return
    }

    // If an inventory count session is currently running, lock to active count screen
    if (isCountingActive) {
        ActiveCountScreen(
            ingredients = ingredients,
            currentIndex = countIndex,
            draftsMap = draftsMap,
            responsibleName = countResponsible,
            isSummaryOpen = isCountSummaryOpen,
            onUpdateCount = { id, closed, frac ->
                viewModel.updateCurrentItemCount(id, closed, frac)
            },
            onNext = { viewModel.nextCountItem() },
            onPrevious = { viewModel.previousCountItem() },
            onJumpToIndex = { viewModel.jumpToCountItem(it) },
            onOpenSummary = { viewModel.openCountSummary() },
            onCloseSummary = { viewModel.closeCountSummary() },
            onFinalize = { notes -> viewModel.finalizeInventoryCount(notes) },
            onCancel = { viewModel.cancelCount() }
        )
        return
    }

    val navItems = listOf(
        NavItem(AppTab.DASHBOARD, "Início", Icons.Default.Dashboard),
        NavItem(AppTab.INGREDIENTS, "Insumos", Icons.Default.Inventory2),
        NavItem(AppTab.PRODUCTS, "Fichas", Icons.Default.ReceiptLong),
        NavItem(AppTab.INVENTORY, "Estoque", Icons.Default.Inventory),
        NavItem(AppTab.HISTORY, "Histórico", Icons.Default.History)
    )

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = when (currentTab) {
                            AppTab.DASHBOARD -> "Estoque & Ficha"
                            AppTab.INGREDIENTS -> "Insumos e Preços"
                            AppTab.PRODUCTS -> "Fichas Técnicas"
                            AppTab.INVENTORY -> "Estoque & Inventário"
                            AppTab.HISTORY -> "Histórico de Contagens"
                            AppTab.PROFILE -> "Perfil do Negócio"
                        },
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = Slate900
                    )
                },
                actions = {
                    IconButton(
                        onClick = { viewModel.setTab(AppTab.PROFILE) },
                        modifier = Modifier.testTag("btn_top_profile")
                    ) {
                        Icon(
                            Icons.Default.AccountCircle,
                            contentDescription = "Perfil",
                            tint = if (currentTab == AppTab.PROFILE) EmeraldPrimary else Slate500,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                navItems.forEach { item ->
                    val isSelected = currentTab == item.tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = {
                            viewModel.clearSelectedComparison()
                            viewModel.setTab(item.tab)
                        },
                        icon = {
                            Icon(
                                item.icon,
                                contentDescription = item.label,
                                modifier = Modifier.size(22.dp)
                            )
                        },
                        label = {
                            Text(
                                text = item.label,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                )
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = EmeraldDark,
                            selectedTextColor = EmeraldDark,
                            indicatorColor = EmeraldContainerLight,
                            unselectedIconColor = Slate500,
                            unselectedTextColor = Slate500
                        ),
                        modifier = Modifier.testTag("nav_${item.tab.name.lowercase()}")
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            AnimatedContent(
                targetState = currentTab,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "tab_transition"
            ) { tab ->
                when (tab) {
                    AppTab.DASHBOARD -> DashboardScreen(
                        profile = profile,
                        stats = stats,
                        onStartCount = { viewModel.startNewInventoryCount() },
                        onAddIngredient = { viewModel.setTab(AppTab.INGREDIENTS) },
                        onAddProduct = { viewModel.setTab(AppTab.PRODUCTS) },
                        onViewIngredients = { viewModel.setTab(AppTab.INGREDIENTS) },
                        onViewProducts = { viewModel.setTab(AppTab.PRODUCTS) },
                        onViewHistory = { viewModel.setTab(AppTab.HISTORY) }
                    )

                    AppTab.INGREDIENTS -> IngredientsScreen(
                        ingredients = ingredients,
                        searchQuery = ingredientSearch,
                        onSearchChange = { viewModel.setIngredientSearch(it) },
                        selectedCategory = ingredientCategory,
                        onCategorySelected = { viewModel.setIngredientCategory(it) },
                        onSaveIngredient = { viewModel.saveIngredient(it) },
                        onDeleteIngredient = { viewModel.deleteIngredient(it) }
                    )

                    AppTab.PRODUCTS -> ProductsScreen(
                        productsWithDetails = productsWithDetails,
                        allIngredients = ingredients,
                        searchQuery = productSearch,
                        onSearchChange = { viewModel.setProductSearch(it) },
                        selectedCategory = productCategory,
                        onCategorySelected = { viewModel.setProductCategory(it) },
                        onSaveProduct = { prod, rec -> viewModel.saveProductWithRecipe(prod, rec) },
                        onDeleteProduct = { viewModel.deleteProduct(it) }
                    )

                    AppTab.INVENTORY -> InventoryScreen(
                        ingredients = ingredients,
                        latestCount = latestCount,
                        onStartNewCount = { viewModel.startNewInventoryCount() },
                        onViewHistory = { viewModel.setTab(AppTab.HISTORY) }
                    )

                    AppTab.HISTORY -> HistoryScreen(
                        counts = counts,
                        selectedComparison = selectedComparison,
                        onSelectCount = { countId -> viewModel.loadComparison(countId) },
                        onBackToList = { viewModel.clearSelectedComparison() },
                        onDeleteCount = { viewModel.deleteCount(it) }
                    )

                    AppTab.PROFILE -> ProfileScreen(
                        profile = profile,
                        onSaveProfile = { viewModel.saveCompanyProfile(it) },
                        onReloadSampleData = { viewModel.reloadSampleData() }
                    )
                }
            }
        }
    }
}
