package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.RemoveCircleOutline
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.Ingredient
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient
import com.example.model.AppUnits
import com.example.model.ProductDetail
import com.example.model.RecipeIngredientDetail
import com.example.ui.components.CategoryChipsRow
import com.example.ui.components.ConfirmDialog
import com.example.ui.components.CostMarginBadge
import com.example.ui.components.EmptyState
import com.example.ui.components.SearchInput
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.AmberContainerLight
import com.example.ui.theme.EmeraldContainerLight
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.RedCostAlert
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate900
import com.example.util.Formatters

@Composable
fun ProductsScreen(
    productsWithDetails: List<ProductDetail>,
    allIngredients: List<Ingredient>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    selectedCategory: String?,
    onCategorySelected: (String?) -> Unit,
    onSaveProduct: (Product, List<ProductIngredient>) -> Unit,
    onDeleteProduct: (Product) -> Unit,
    modifier: Modifier = Modifier
) {
    var isDialogOpen by remember { mutableStateOf(false) }
    var editingProductDetail by remember { mutableStateOf<ProductDetail?>(null) }
    var productToDelete by remember { mutableStateOf<Product?>(null) }

    val filteredProducts = remember(productsWithDetails, searchQuery, selectedCategory) {
        productsWithDetails.filter { pd ->
            val matchesQuery = searchQuery.isBlank() || pd.product.name.contains(searchQuery, ignoreCase = true) || pd.product.category.contains(searchQuery, ignoreCase = true)
            val matchesCat = selectedCategory == null || pd.product.category == selectedCategory
            matchesQuery && matchesCat
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingProductDetail = null
                    isDialogOpen = true
                },
                containerColor = EmeraldPrimary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("fab_add_product")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Nova Ficha Técnica")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Search input
            SearchInput(
                query = searchQuery,
                onQueryChange = onSearchChange,
                placeholder = "Buscar produtos ou fichas..."
            )
            Spacer(modifier = Modifier.height(10.dp))

            // Category filter chips
            CategoryChipsRow(
                categories = AppUnits.PRODUCT_CATEGORIES,
                selectedCategory = selectedCategory,
                onCategorySelected = onCategorySelected
            )
            Spacer(modifier = Modifier.height(12.dp))

            if (filteredProducts.isEmpty()) {
                EmptyState(
                    icon = Icons.Default.ReceiptLong,
                    title = if (searchQuery.isNotEmpty()) "Nenhum produto encontrado" else "Nenhuma ficha técnica cadastrada",
                    description = if (searchQuery.isNotEmpty()) "Tente buscar por outro termo ou limpar os filtros." else "Crie sua primeira ficha técnica para calcular automaticamente o custo do drink, prato ou lanche.",
                    buttonText = if (searchQuery.isEmpty()) "CRIAR PRIMEIRA FICHA TÉCNICA" else null,
                    onButtonClick = {
                        editingProductDetail = null
                        isDialogOpen = true
                    }
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 80.dp)
                ) {
                    items(filteredProducts, key = { it.product.id }) { item ->
                        ProductRecipeCard(
                            detail = item,
                            onEdit = {
                                editingProductDetail = item
                                isDialogOpen = true
                            },
                            onDelete = {
                                productToDelete = item.product
                            }
                        )
                    }
                }
            }
        }
    }

    // Add / Edit Recipe Dialog
    if (isDialogOpen) {
        RecipeBuilderDialog(
            initialDetail = editingProductDetail,
            availableIngredients = allIngredients,
            onDismiss = { isDialogOpen = false },
            onSave = { prod, recItems ->
                onSaveProduct(prod, recItems)
                isDialogOpen = false
            }
        )
    }

    // Delete Confirmation
    if (productToDelete != null) {
        ConfirmDialog(
            title = "Excluir Ficha Técnica?",
            message = "Tem certeza que deseja excluir ${productToDelete?.name}?",
            confirmText = "Excluir",
            onConfirm = {
                productToDelete?.let { onDeleteProduct(it) }
                productToDelete = null
            },
            onDismiss = { productToDelete = null }
        )
    }
}

@Composable
fun ProductRecipeCard(
    detail: ProductDetail,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }
    var menuExpanded by remember { mutableStateOf(false) }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { expanded = !expanded },
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Name, Category, Menu
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = detail.product.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = Slate900
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Slate100,
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        Text(
                            text = detail.product.category,
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate700,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    CostMarginBadge(costPercentage = detail.costPercentage)
                    Box {
                        IconButton(onClick = { menuExpanded = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "Mais opções", tint = Slate500)
                        }
                        DropdownMenu(
                            expanded = menuExpanded,
                            onDismissRequest = { menuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Editar Ficha") },
                                leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onEdit()
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Excluir", color = RedCostAlert) },
                                leadingIcon = { Icon(Icons.Default.Delete, contentDescription = null, tint = RedCostAlert) },
                                onClick = {
                                    menuExpanded = false
                                    onDelete()
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Financial Breakdown Grid
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Slate100, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "PREÇO VENDA",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Slate500
                    )
                    Text(
                        text = Formatters.formatBrl(detail.salePrice),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                        color = Slate900
                    )
                }

                Column {
                    Text(
                        text = "CUSTO TOTAL",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Slate500
                    )
                    Text(
                        text = Formatters.formatBrl(detail.totalCost),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                        color = RedCostAlert
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "MARGEM BRUTA",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Slate500
                    )
                    Text(
                        text = Formatters.formatBrl(detail.grossMargin),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.ExtraBold),
                        color = EmeraldPrimary
                    )
                }
            }

            // Expandable Ingredients List
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${detail.ingredients.size} ingrediente(s) na composição",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500
                )
                Icon(
                    if (expanded) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                    contentDescription = null,
                    tint = Slate500
                )
            }

            AnimatedVisibility(
                visible = expanded,
                enter = expandVertically(),
                exit = shrinkVertically()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    detail.ingredients.forEach { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color.White, RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = item.ingredient.name,
                                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                    color = Slate900
                                )
                                Text(
                                    text = "${Formatters.formatQuantity(item.productIngredient.quantity, item.productIngredient.unit)} (${Formatters.formatBrlPerUnit(item.ingredient.unitCost, item.ingredient.usageUnit)})",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Slate500
                                )
                            }
                            Text(
                                text = Formatters.formatBrl(item.computedCost),
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
                                color = Slate900
                            )
                        }
                    }
                }
            }
        }
    }
}

data class RecipeDraftItem(
    val ingredientId: Long,
    val quantityStr: String,
    val unit: String
)

@Composable
fun RecipeBuilderDialog(
    initialDetail: ProductDetail?,
    availableIngredients: List<Ingredient>,
    onDismiss: () -> Unit,
    onSave: (Product, List<ProductIngredient>) -> Unit
) {
    val isEdit = initialDetail != null
    var name by remember { mutableStateOf(initialDetail?.product?.name ?: "") }
    var selectedCategory by remember { mutableStateOf(initialDetail?.product?.category ?: "Drinks & Coquetéis") }
    var salePriceStr by remember { mutableStateOf(if (initialDetail != null) String.format(java.util.Locale.US, "%.2f", initialDetail.product.salePrice) else "32.00") }

    val recipeItems = remember {
        mutableStateListOf<RecipeDraftItem>().apply {
            if (initialDetail != null) {
                addAll(initialDetail.ingredients.map {
                    RecipeDraftItem(
                        ingredientId = it.ingredient.id,
                        quantityStr = if (it.productIngredient.quantity % 1.0 == 0.0) it.productIngredient.quantity.toInt().toString() else it.productIngredient.quantity.toString(),
                        unit = it.productIngredient.unit
                    )
                })
            } else {
                // Initial 1 row if available
                if (availableIngredients.isNotEmpty()) {
                    val first = availableIngredients.first()
                    add(RecipeDraftItem(first.id, "50", first.usageUnit))
                }
            }
        }
    }

    var errorMessage by remember { mutableStateOf<String?>(null) }
    val ingredientMap = remember(availableIngredients) { availableIngredients.associateBy { it.id } }

    val salePrice = salePriceStr.replace(",", ".").toDoubleOrNull() ?: 0.0
    val totalCost = recipeItems.sumOf { item ->
        val ing = ingredientMap[item.ingredientId]
        val qty = item.quantityStr.replace(",", ".").toDoubleOrNull() ?: 0.0
        if (ing != null) qty * ing.unitCost else 0.0
    }
    val grossMargin = salePrice - totalCost
    val costPercent = if (salePrice > 0.0) (totalCost / salePrice) * 100.0 else 0.0

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (isEdit) "Editar Ficha Técnica" else "Nova Ficha Técnica",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; errorMessage = null },
                    label = { Text("Nome do produto / drink / prato") },
                    placeholder = { Text("Ex: Gin Tônica, Burger X-Bacon") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().testTag("input_product_name")
                )

                // Category chips
                Text("Categoria", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold))
                CategoryChipsRow(
                    categories = AppUnits.PRODUCT_CATEGORIES,
                    selectedCategory = selectedCategory,
                    onCategorySelected = { if (it != null) selectedCategory = it }
                )

                // Sale Price input
                OutlinedTextField(
                    value = salePriceStr,
                    onValueChange = { salePriceStr = it },
                    label = { Text("Preço de Venda (R$)") },
                    placeholder = { Text("32.00") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().testTag("input_sale_price")
                )

                // Live Margin / Cost Summary Card
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = EmeraldContainerLight),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Custo Calculado", style = MaterialTheme.typography.labelSmall, color = EmeraldDark)
                            Text(Formatters.formatBrl(totalCost), style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = EmeraldDark)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Margem Bruta", style = MaterialTheme.typography.labelSmall, color = EmeraldDark)
                            Text("${Formatters.formatBrl(grossMargin)} (${Formatters.formatPercent(100 - costPercent)})", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = EmeraldDark)
                        }
                    }
                }

                // Recipe Ingredients header & add button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ingredientes da Ficha",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold)
                    )
                    TextButton(
                        onClick = {
                            if (availableIngredients.isNotEmpty()) {
                                val def = availableIngredients.first()
                                recipeItems.add(RecipeDraftItem(def.id, "1", def.usageUnit))
                            }
                        }
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Adicionar")
                    }
                }

                // Ingredient Rows
                if (recipeItems.isEmpty()) {
                    Text("Nenhum ingrediente adicionado ainda.", style = MaterialTheme.typography.bodySmall, color = Slate500)
                } else {
                    recipeItems.forEachIndexed { index, item ->
                        RecipeItemEditorRow(
                            item = item,
                            availableIngredients = availableIngredients,
                            onUpdate = { updated -> recipeItems[index] = updated },
                            onRemove = { recipeItems.removeAt(index) }
                        )
                    }
                }

                if (errorMessage != null) {
                    Text(
                        text = errorMessage ?: "",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isBlank()) {
                        errorMessage = "Informe o nome do produto."
                        return@Button
                    }
                    if (salePrice <= 0.0) {
                        errorMessage = "Informe um preço de venda válido."
                        return@Button
                    }
                    if (recipeItems.isEmpty()) {
                        errorMessage = "Adicione ao menos um ingrediente."
                        return@Button
                    }
                    val now = System.currentTimeMillis()
                    val prod = Product(
                        id = initialDetail?.product?.id ?: 0L,
                        name = name.trim(),
                        category = selectedCategory,
                        salePrice = salePrice,
                        createdAt = initialDetail?.product?.createdAt ?: now,
                        updatedAt = now
                    )
                    val recLinks = recipeItems.mapNotNull { item ->
                        val qty = item.quantityStr.replace(",", ".").toDoubleOrNull() ?: 0.0
                        if (qty > 0.0) {
                            ProductIngredient(
                                productId = prod.id,
                                ingredientId = item.ingredientId,
                                quantity = qty,
                                unit = item.unit
                            )
                        } else null
                    }
                    onSave(prod, recLinks)
                },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                modifier = Modifier.testTag("btn_save_product")
            ) {
                Text(if (isEdit) "Salvar" else "Criar Ficha", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
fun RecipeItemEditorRow(
    item: RecipeDraftItem,
    availableIngredients: List<Ingredient>,
    onUpdate: (RecipeDraftItem) -> Unit,
    onRemove: () -> Unit
) {
    var menuOpen by remember { mutableStateOf(false) }
    val currentIng = availableIngredients.firstOrNull { it.id == item.ingredientId }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Slate100)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Dropdown to pick ingredient
                Box(modifier = Modifier.weight(1f)) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color.White,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { menuOpen = true }
                            .padding(horizontal = 10.dp, vertical = 8.dp)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentIng?.name ?: "Selecionar insumo",
                                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = Slate900
                            )
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null, tint = Slate500)
                        }
                    }

                    DropdownMenu(
                        expanded = menuOpen,
                        onDismissRequest = { menuOpen = false }
                    ) {
                        availableIngredients.forEach { ing ->
                            DropdownMenuItem(
                                text = { Text("${ing.name} (${Formatters.formatBrlPerUnit(ing.unitCost, ing.usageUnit)})") },
                                onClick = {
                                    menuOpen = false
                                    onUpdate(item.copy(ingredientId = ing.id, unit = ing.usageUnit))
                                }
                            )
                        }
                    }
                }

                IconButton(onClick = onRemove) {
                    Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Remover", tint = RedCostAlert)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Quantity and Unit
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = item.quantityStr,
                    onValueChange = { onUpdate(item.copy(quantityStr = it)) },
                    label = { Text("Qtd. consumida") },
                    placeholder = { Text("50") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                )

                OutlinedTextField(
                    value = item.unit,
                    onValueChange = { onUpdate(item.copy(unit = it)) },
                    label = { Text("Unidade") },
                    placeholder = { Text("ml") },
                    singleLine = true,
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}
