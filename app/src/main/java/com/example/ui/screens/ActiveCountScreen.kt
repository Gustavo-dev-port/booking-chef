package com.example.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.Ingredient
import com.example.ui.components.ConfirmDialog
import com.example.ui.components.FractionSelector
import com.example.ui.components.NumericStepCounter
import com.example.ui.theme.EmeraldContainerDark
import com.example.ui.theme.EmeraldContainerLight
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.RedCostAlert
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate900
import com.example.ui.viewmodel.CountItemDraft
import com.example.util.Formatters

@Composable
fun ActiveCountScreen(
    ingredients: List<Ingredient>,
    currentIndex: Int,
    draftsMap: Map<Long, CountItemDraft>,
    responsibleName: String,
    isSummaryOpen: Boolean,
    onUpdateCount: (Long, Double, Int) -> Unit,
    onNext: () -> Unit,
    onPrevious: () -> Unit,
    onJumpToIndex: (Int) -> Unit,
    onOpenSummary: () -> Unit,
    onCloseSummary: () -> Unit,
    onFinalize: (notes: String) -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showCancelConfirm by remember { mutableStateOf(false) }
    val currentIngredient = ingredients.getOrNull(currentIndex)
    val currentDraft = currentIngredient?.let { draftsMap[it.id] }

    val totalItems = ingredients.size
    val progress = if (totalItems > 0) (currentIndex + 1).toFloat() / totalItems else 0f

    val totalCountValue = draftsMap.values.sumOf { it.totalValue }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { showCancelConfirm = true }) {
                        Icon(Icons.Default.Close, contentDescription = "Cancelar Contagem", tint = Slate500)
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Contagem em Andamento",
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                            color = Slate900
                        )
                        Text(
                            text = "Item ${currentIndex + 1} de $totalItems • $responsibleName",
                            style = MaterialTheme.typography.labelSmall,
                            color = EmeraldPrimary
                        )
                    }

                    TextButton(onClick = onOpenSummary) {
                        Text("Revisar", fontWeight = FontWeight.Bold, color = EmeraldPrimary)
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = EmeraldPrimary,
                    trackColor = Slate200
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 18.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            if (currentIngredient != null && currentDraft != null) {
                AnimatedContent(
                    targetState = currentIngredient,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "count_step"
                ) { item ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Quick Mini Step Chips (jump quickly between items)
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            itemsIndexed(ingredients) { idx, ing ->
                                val isSelected = idx == currentIndex
                                val draft = draftsMap[ing.id]
                                val hasCount = (draft?.totalQuantity ?: 0.0) > 0.0

                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(
                                            when {
                                                isSelected -> EmeraldPrimary
                                                hasCount -> EmeraldContainerLight
                                                else -> Slate100
                                            }
                                        )
                                        .clickable { onJumpToIndex(idx) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${idx + 1}",
                                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                                        color = when {
                                            isSelected -> Color.White
                                            hasCount -> EmeraldDark
                                            else -> Slate700
                                        }
                                    )
                                }
                            }
                        }

                        // Hero Card for active ingredient
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                        ) {
                            Column(modifier = Modifier.padding(18.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = Slate100
                                    ) {
                                        Text(
                                            text = item.category.uppercase(),
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.Bold,
                                                letterSpacing = 0.5.sp
                                            ),
                                            color = Slate700,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                        )
                                    }

                                    Text(
                                        text = "${Formatters.formatBrl(item.packagePrice)} / ${item.purchaseUnit}",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                        color = Slate500
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = item.name,
                                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Black),
                                    color = Slate900
                                )
                                Text(
                                    text = "Embalagem com ${Formatters.formatQuantity(item.packageQuantity, item.usageUnit)} (${Formatters.formatBrlPerUnit(item.unitCost, item.usageUnit)})",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Slate500
                                )
                            }
                        }

                        // 1. Closed Units Counter
                        NumericStepCounter(
                            value = currentDraft.closedQuantity,
                            onValueChange = { newQty ->
                                onUpdateCount(item.id, newQty, currentDraft.fractionPercentage)
                            },
                            step = 1.0,
                            unit = item.purchaseUnit,
                            label = "1. Unidades / Garrafas Fechadas"
                        )

                        // 2. Open Bottle Fraction Selector (0%, 25%, 50%, 75%, 100%)
                        FractionSelector(
                            selectedPercentage = currentDraft.fractionPercentage,
                            onPercentageSelected = { newPct ->
                                onUpdateCount(item.id, currentDraft.closedQuantity, newPct)
                            }
                        )

                        // Real-time calculation formula badge
                        val totalQty = currentDraft.totalQuantity
                        val totalMlG = totalQty * item.packageQuantity
                        val totalItemVal = currentDraft.totalValue

                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = EmeraldContainerLight)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Text(
                                    text = "SUBTOTAL DESTE ITEM:",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 0.5.sp
                                    ),
                                    color = EmeraldDark
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "${Formatters.formatQuantity(totalQty, item.purchaseUnit)} (${Formatters.formatQuantity(totalMlG, item.usageUnit)})",
                                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                                        color = EmeraldDark
                                    )
                                    Text(
                                        text = Formatters.formatBrl(totalItemVal),
                                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                                        color = EmeraldDark
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Bottom Navigation Actions
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (currentIndex > 0) {
                        OutlinedButton(
                            onClick = onPrevious,
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .weight(1f)
                                .height(52.dp)
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = null)
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Anterior")
                        }
                    }

                    Button(
                        onClick = onNext,
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                        modifier = Modifier
                            .weight(1.5f)
                            .height(52.dp)
                            .testTag("btn_count_next")
                    ) {
                        Text(
                            text = if (currentIndex == totalItems - 1) "FINALIZAR CONTAGEM" else "PRÓXIMO ITEM",
                            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            if (currentIndex == totalItems - 1) Icons.Default.DoneAll else Icons.Default.ArrowForward,
                            contentDescription = null
                        )
                    }
                }
            }
        }
    }

    // Summary & Finalize Modal
    if (isSummaryOpen) {
        CountFinalSummaryDialog(
            drafts = draftsMap.values.toList(),
            responsibleName = responsibleName,
            totalValue = totalCountValue,
            onDismiss = onCloseSummary,
            onConfirmFinalize = { notes ->
                onFinalize(notes)
            }
        )
    }

    // Cancel Confirmation Dialog
    if (showCancelConfirm) {
        ConfirmDialog(
            title = "Cancelar Contagem?",
            message = "Você perderá o progresso desta contagem não salva. Deseja realmente sair?",
            confirmText = "Sim, Cancelar",
            cancelText = "Continuar Contando",
            onConfirm = {
                showCancelConfirm = false
                onCancel()
            },
            onDismiss = { showCancelConfirm = false }
        )
    }
}

@Composable
fun CountFinalSummaryDialog(
    drafts: List<CountItemDraft>,
    responsibleName: String,
    totalValue: Double,
    onDismiss: () -> Unit,
    onConfirmFinalize: (notes: String) -> Unit
) {
    var notes by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Resumo da Contagem",
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
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "VALOR TOTAL APURADO",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            ),
                            color = EmeraldContainerLight
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = Formatters.formatBrl(totalValue),
                            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Black),
                            color = Color.White
                        )
                        Text(
                            text = "${drafts.size} itens verificados • Resp: $responsibleName",
                            style = MaterialTheme.typography.bodySmall,
                            color = Slate500
                        )
                    }
                }

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Observações (Opcional)") },
                    placeholder = { Text("Ex: Quebra de 1 garrafa de gin, estoque reposto...") },
                    maxLines = 3,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onConfirmFinalize(notes) },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                modifier = Modifier.testTag("btn_confirm_finalize_count")
            ) {
                Text("Confirmar e Salvar", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Voltar")
            }
        }
    )
}
