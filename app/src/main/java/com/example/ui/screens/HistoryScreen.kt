package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.CompareArrows
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.EventNote
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.InventoryCount
import com.example.model.InventoryComparison
import com.example.model.ItemVariance
import com.example.ui.components.ConfirmDialog
import com.example.ui.components.EmptyState
import com.example.ui.components.SectionHeader
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.AmberContainerLight
import com.example.ui.theme.EmeraldContainerLight
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.RedContainer
import com.example.ui.theme.RedCostAlert
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate900
import com.example.util.Formatters

@Composable
fun HistoryScreen(
    counts: List<InventoryCount>,
    selectedComparison: InventoryComparison?,
    onSelectCount: (Long) -> Unit,
    onBackToList: () -> Unit,
    onDeleteCount: (InventoryCount) -> Unit,
    modifier: Modifier = Modifier
) {
    var countToDelete by remember { mutableStateOf<InventoryCount?>(null) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            if (selectedComparison != null) {
                // Detailed Comparison Mode
                ComparisonDetailView(
                    comparison = selectedComparison,
                    onBack = onBackToList
                )
            } else {
                // List of Past Counts
                SectionHeader(
                    title = "Histórico de Contagens",
                    subtitle = "${counts.size} sessões registradas"
                )
                Spacer(modifier = Modifier.height(6.dp))

                if (counts.isEmpty()) {
                    EmptyState(
                        icon = Icons.Default.EventNote,
                        title = "Nenhuma contagem realizada",
                        description = "Ao concluir uma contagem no Estoque, ela aparecerá aqui para você comparar as variações."
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        contentPadding = PaddingValues(bottom = 80.dp)
                    ) {
                        items(counts, key = { it.id }) { count ->
                            CountHistoryCard(
                                count = count,
                                onClick = { onSelectCount(count.id) },
                                onDelete = { countToDelete = count }
                            )
                        }
                    }
                }
            }
        }
    }

    if (countToDelete != null) {
        ConfirmDialog(
            title = "Excluir Sessão de Contagem?",
            message = "Tem certeza que deseja apagar o registro desta contagem?",
            confirmText = "Excluir",
            onConfirm = {
                countToDelete?.let { onDeleteCount(it) }
                countToDelete = null
            },
            onDismiss = { countToDelete = null }
        )
    }
}

@Composable
fun CountHistoryCard(
    count: InventoryCount,
    onClick: () -> Unit,
    onDelete: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = Formatters.formatDate(count.finishedAt ?: count.startedAt),
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = Slate900
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "Responsável: ${count.responsibleName} • ${count.totalItemsCounted} itens",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500
                )
                if (count.notes.isNotBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Obs: ${count.notes}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate700
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = Formatters.formatBrl(count.totalInventoryValue),
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Black),
                    color = EmeraldPrimary
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = "Ver Variação",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = EmeraldDark
                    )
                    IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                        Icon(Icons.Default.Delete, contentDescription = "Excluir", tint = Slate500, modifier = Modifier.size(18.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ComparisonDetailView(
    comparison: InventoryComparison,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val cur = comparison.currentCount
    val prev = comparison.previousCount

    Column(modifier = modifier.fillMaxSize()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
            }
            Text(
                text = "Comparação de Contagens",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = Slate900
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Summary Card comparing current vs previous
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(18.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Contagem Atual", style = MaterialTheme.typography.labelSmall, color = Slate500)
                        Text(Formatters.formatDateShort(cur.finishedAt ?: cur.startedAt), style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = Color.White)
                        Text(Formatters.formatBrl(cur.totalInventoryValue), style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = EmeraldContainerLight)
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text("Contagem Anterior", style = MaterialTheme.typography.labelSmall, color = Slate500)
                        Text(if (prev != null) Formatters.formatDateShort(prev.finishedAt ?: prev.startedAt) else "Nenhuma", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = Color.White)
                        Text(if (prev != null) Formatters.formatBrl(prev.totalInventoryValue) else "-", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black), color = Slate200)
                    }
                }

                if (prev != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    val diff = comparison.totalDiffValue
                    val isPositive = diff >= 0.0
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isPositive) EmeraldContainerLight else RedContainer,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    if (isPositive) Icons.Default.TrendingUp else Icons.Default.TrendingDown,
                                    contentDescription = null,
                                    tint = if (isPositive) EmeraldDark else RedCostAlert,
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Variação Financeira Total",
                                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                                    color = if (isPositive) EmeraldDark else RedCostAlert
                                )
                            }
                            Text(
                                text = "${if (isPositive) "+" else ""}${Formatters.formatBrl(diff)}",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Black),
                                color = if (isPositive) EmeraldDark else RedCostAlert
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))
        Text(
            text = "Detalhamento por Insumo (${comparison.variances.size} itens)",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
            color = Slate900
        )
        Spacer(modifier = Modifier.height(6.dp))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            contentPadding = PaddingValues(bottom = 80.dp)
        ) {
            items(comparison.variances, key = { it.ingredientId }) { v ->
                VarianceItemRow(variance = v)
            }
        }
    }
}

@Composable
fun VarianceItemRow(
    variance: ItemVariance,
    modifier: Modifier = Modifier
) {
    val isDiffPositive = variance.diffQty >= 0.0

    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = variance.ingredientName,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                    color = Slate900
                )
                Text(
                    text = "Anterior: ${Formatters.formatQuantity(variance.previousQty, variance.unit)}  ➔  Atual: ${Formatters.formatQuantity(variance.currentQty, variance.unit)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate500
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = if (isDiffPositive) EmeraldContainerLight else RedContainer
                ) {
                    Text(
                        text = "${if (isDiffPositive) "+" else ""}${Formatters.formatQuantity(variance.diffQty, variance.unit)}",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = if (isDiffPositive) EmeraldDark else RedCostAlert,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${if (variance.diffValue >= 0) "+" else ""}${Formatters.formatBrl(variance.diffValue)}",
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                    color = if (variance.diffValue >= 0) EmeraldDark else RedCostAlert
                )
            }
        }
    }
}
