package com.example.ui.screens

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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Liquor
import androidx.compose.material.icons.filled.MoreVert
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
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
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
import com.example.model.AppUnits
import com.example.ui.components.CategoryChipsRow
import com.example.ui.components.ConfirmDialog
import com.example.ui.components.EmptyState
import com.example.ui.components.SearchInput
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
fun IngredientsScreen(
    ingredients: List<Ingredient>,
    searchQuery: String,
    onSearchChange: (String) -> Unit,
    selectedCategory: String?,
    onCategorySelected: (String?) -> Unit,
    onSaveIngredient: (Ingredient) -> Unit,
    onDeleteIngredient: (Ingredient) -> Unit,
    modifier: Modifier = Modifier
) {
    var isDialogOpen by remember { mutableStateOf(false) }
    var editingIngredient by remember { mutableStateOf<Ingredient?>(null) }
    var ingredientToDelete by remember { mutableStateOf<Ingredient?>(null) }

    val filteredIngredients = remember(ingredients, searchQuery, selectedCategory) {
        ingredients.filter { ing ->
            val matchesQuery = searchQuery.isBlank() || ing.name.contains(searchQuery, ignoreCase = true) || ing.category.contains(searchQuery, ignoreCase = true)
            val matchesCat = selectedCategory == null || ing.category == selectedCategory
            matchesQuery && matchesCat
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    editingIngredient = null
                    isDialogOpen = true
                },
                containerColor = EmeraldPrimary,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("fab_add_ingredient")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Novo Insumo")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Search Bar
            SearchInput(
                query = searchQuery,
                onQueryChange = onSearchChange,
                placeholder = "Buscar insumos ou bebidas..."
            )
            Spacer(modifier = Modifier.height(10.dp))

            // Category filter chips
            CategoryChipsRow(
                categories = AppUnits.CATEGORIES,
                selectedCategory = selectedCategory,
                onCategorySelected = onCategorySelected
            )
            Spacer(modifier = Modifier.height(12.dp))

            // Insumos List or Empty State
            if (filteredIngredients.isEmpty()) {
                EmptyState(
                    icon = Icons.Default.Inventory2,
                    title = if (searchQuery.isNotEmpty()) "Nenhum insumo encontrado" else "Nenhum insumo cadastrado",
                    description = if (searchQuery.isNotEmpty()) "Tente buscar por outro termo ou limpe os filtros." else "Cadastre bebidas, ingredientes e itens para calcular o custo das fichas técnicas.",
                    buttonText = if (searchQuery.isEmpty()) "CADASTRAR PRIMEIRO INSUMO" else null,
                    onButtonClick = {
                        editingIngredient = null
                        isDialogOpen = true
                    }
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    contentPadding = PaddingValues(bottom = 80.dp)
                ) {
                    items(filteredIngredients, key = { it.id }) { ingredient ->
                        IngredientItemCard(
                            ingredient = ingredient,
                            onEdit = {
                                editingIngredient = ingredient
                                isDialogOpen = true
                            },
                            onDelete = {
                                ingredientToDelete = ingredient
                            }
                        )
                    }
                }
            }
        }
    }

    // Add / Edit Dialog
    if (isDialogOpen) {
        IngredientFormDialog(
            ingredient = editingIngredient,
            onDismiss = { isDialogOpen = false },
            onSave = { saved ->
                onSaveIngredient(saved)
                isDialogOpen = false
            }
        )
    }

    // Delete Confirmation Dialog
    if (ingredientToDelete != null) {
        ConfirmDialog(
            title = "Excluir Insumo?",
            message = "Tem certeza que deseja excluir ${ingredientToDelete?.name}? Ele será removido das fichas técnicas associadas.",
            confirmText = "Excluir",
            onConfirm = {
                ingredientToDelete?.let { onDeleteIngredient(it) }
                ingredientToDelete = null
            },
            onDismiss = { ingredientToDelete = null }
        )
    }
}

@Composable
fun IngredientItemCard(
    ingredient: Ingredient,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    var menuExpanded by remember { mutableStateOf(false) }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onEdit() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = ingredient.name,
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = Slate100,
                        modifier = Modifier.padding(top = 4.dp)
                    ) {
                        Text(
                            text = ingredient.category,
                            style = MaterialTheme.typography.labelSmall,
                            color = Slate700,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Box {
                    IconButton(onClick = { menuExpanded = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "Opções", tint = Slate500)
                    }
                    DropdownMenu(
                        expanded = menuExpanded,
                        onDismissRequest = { menuExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("Editar") },
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

            Spacer(modifier = Modifier.height(12.dp))

            // Highlighted Unit Cost & Package Info
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(EmeraldContainerLight, RoundedCornerShape(12.dp))
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "CUSTO UNITÁRIO",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        ),
                        color = EmeraldDark
                    )
                    Text(
                        text = Formatters.formatBrlPerUnit(ingredient.unitCost, ingredient.usageUnit),
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                        color = EmeraldDark
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Embalagem",
                        style = MaterialTheme.typography.labelSmall,
                        color = EmeraldDark.copy(alpha = 0.8f)
                    )
                    Text(
                        text = "${Formatters.formatBrl(ingredient.packagePrice)} (${Formatters.formatQuantity(ingredient.packageQuantity, ingredient.purchaseUnit)})",
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        color = EmeraldDark
                    )
                }
            }
        }
    }
}

@Composable
fun IngredientFormDialog(
    ingredient: Ingredient?,
    onDismiss: () -> Unit,
    onSave: (Ingredient) -> Unit
) {
    val isEdit = ingredient != null
    var name by remember { mutableStateOf(ingredient?.name ?: "") }
    var selectedCategory by remember { mutableStateOf(ingredient?.category ?: "Destilados") }
    var purchaseUnit by remember { mutableStateOf(ingredient?.purchaseUnit ?: "garrafa") }
    var usageUnit by remember { mutableStateOf(ingredient?.usageUnit ?: "ml") }
    var packageQtyStr by remember { mutableStateOf(if (ingredient != null) ingredient.packageQuantity.toString() else "750") }
    var packagePriceStr by remember { mutableStateOf(if (ingredient != null) String.format(java.util.Locale.US, "%.2f", ingredient.packagePrice) else "109.90") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val packageQty = packageQtyStr.replace(",", ".").toDoubleOrNull() ?: 0.0
    val packagePrice = packagePriceStr.replace(",", ".").toDoubleOrNull() ?: 0.0
    val computedUnitCost = if (packageQty > 0.0) packagePrice / packageQty else 0.0

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = if (isEdit) "Editar Insumo" else "Novo Insumo",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
            )
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it; errorMessage = null },
                    label = { Text("Nome do insumo") },
                    placeholder = { Text("Ex: Gin Tanqueray, Coca-Cola, Limão") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth().testTag("input_ingredient_name")
                )

                // Category selector
                Text(
                    text = "Categoria",
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold)
                )
                CategoryChipsRow(
                    categories = AppUnits.CATEGORIES,
                    selectedCategory = selectedCategory,
                    onCategorySelected = { if (it != null) selectedCategory = it }
                )

                // Purchase unit & Usage unit
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = purchaseUnit,
                        onValueChange = { purchaseUnit = it },
                        label = { Text("Un. Compra") },
                        placeholder = { Text("garrafa / cx") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = usageUnit,
                        onValueChange = { usageUnit = it },
                        label = { Text("Un. Uso") },
                        placeholder = { Text("ml / un / g") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    )
                }

                // Package Quantity & Price
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = packageQtyStr,
                        onValueChange = { packageQtyStr = it },
                        label = { Text("Qtd. Embalagem") },
                        placeholder = { Text("750") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f).testTag("input_package_qty")
                    )
                    OutlinedTextField(
                        value = packagePriceStr,
                        onValueChange = { packagePriceStr = it },
                        label = { Text("Preço Pago (R$)") },
                        placeholder = { Text("109.90") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f).testTag("input_package_price")
                    )
                }

                // Live Preview of Unit Cost
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = EmeraldContainerLight),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Custo Calculado:",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                            color = EmeraldDark
                        )
                        Text(
                            text = Formatters.formatBrlPerUnit(computedUnitCost, usageUnit.ifBlank { "un" }),
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                            color = EmeraldDark
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
                        errorMessage = "Informe o nome do insumo."
                        return@Button
                    }
                    if (packageQty <= 0.0 || packagePrice <= 0.0) {
                        errorMessage = "Informe quantidade e preço válidos."
                        return@Button
                    }
                    val now = System.currentTimeMillis()
                    val toSave = Ingredient(
                        id = ingredient?.id ?: 0L,
                        name = name.trim(),
                        category = selectedCategory,
                        purchaseUnit = purchaseUnit.trim().lowercase(),
                        usageUnit = usageUnit.trim().lowercase(),
                        packageQuantity = packageQty,
                        packagePrice = packagePrice,
                        unitCost = computedUnitCost,
                        currentStock = ingredient?.currentStock ?: 0.0,
                        priceUpdatedAt = now,
                        createdAt = ingredient?.createdAt ?: now,
                        updatedAt = now
                    )
                    onSave(toSave)
                },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                modifier = Modifier.testTag("btn_save_ingredient")
            ) {
                Text(if (isEdit) "Salvar" else "Cadastrar", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
