package com.example.ui.screens

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.CompanyProfile
import com.example.ui.components.ConfirmDialog
import com.example.ui.components.SectionHeader
import com.example.ui.theme.AmberAccent
import com.example.ui.theme.AmberContainerLight
import com.example.ui.theme.EmeraldContainerLight
import com.example.ui.theme.EmeraldDark
import com.example.ui.theme.EmeraldPrimary
import com.example.ui.theme.Slate100
import com.example.ui.theme.Slate200
import com.example.ui.theme.Slate500
import com.example.ui.theme.Slate700
import com.example.ui.theme.Slate900
import com.example.util.Formatters

@Composable
fun ProfileScreen(
    profile: CompanyProfile?,
    onSaveProfile: (CompanyProfile) -> Unit,
    onReloadSampleData: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isEditingProfile by remember { mutableStateOf(false) }
    var showTermsModal by remember { mutableStateOf(false) }
    var showPrivacyModal by remember { mutableStateOf(false) }
    var showResetConfirm by remember { mutableStateOf(false) }

    val scrollState = rememberScrollState()

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 20.dp, vertical = 14.dp)
                .verticalScroll(scrollState),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // User Header Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = CircleShape,
                        color = EmeraldContainerLight,
                        modifier = Modifier.size(56.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                Icons.Default.Person,
                                contentDescription = null,
                                tint = EmeraldDark,
                                modifier = Modifier.size(30.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = profile?.userName ?: "Gustavo",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = Slate900
                        )
                        Text(
                            text = "${profile?.userRole ?: "Proprietário"} • ${profile?.tradeName ?: "Boteco Central"}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Slate500
                        )
                    }
                }
            }

            // Company Data Section
            SectionHeader(
                title = "Dados da Empresa",
                actionText = "Editar",
                onActionClick = { isEditingProfile = true }
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    ProfileInfoRow(label = "Nome Fantasia", value = profile?.tradeName ?: "-")
                    ProfileInfoRow(label = "CNPJ", value = if (!profile?.cnpj.isNullOrBlank()) Formatters.formatCnpj(profile?.cnpj ?: "") else "Não informado")
                    ProfileInfoRow(label = "Razão Social", value = profile?.legalName ?: "-")
                    ProfileInfoRow(label = "Segmento", value = profile?.segment ?: "Bar")
                    ProfileInfoRow(label = "Porte da Equipe", value = "${profile?.employeeRange ?: "2–5"} pessoas")
                    ProfileInfoRow(label = "Localização", value = "${profile?.city ?: "São Paulo"} - ${profile?.state ?: "SP"}")
                }
            }

            // Legal & Terms Section
            SectionHeader(title = "Privacidade e Termos (LGPD)")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    SettingsMenuRow(
                        icon = Icons.Default.Security,
                        title = "Termos de Uso",
                        subtitle = "Termos e condições gerais de contratação",
                        onClick = { showTermsModal = true }
                    )
                    SettingsMenuRow(
                        icon = Icons.Default.Lock,
                        title = "Política de Privacidade (LGPD)",
                        subtitle = "Como seus dados e estoques são protegidos",
                        onClick = { showPrivacyModal = true }
                    )
                }
            }

            // Sample Data & Database Controls
            SectionHeader(title = "Dados de Demonstração")
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate100)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Recarregar Dados de Exemplo",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                        color = Slate900
                    )
                    Text(
                        text = "Restaura os insumos, fichas técnicas e histórico modelo para testes no app.",
                        style = MaterialTheme.typography.bodySmall,
                        color = Slate500,
                        modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                    )
                    Button(
                        onClick = { showResetConfirm = true },
                        colors = ButtonDefaults.buttonColors(containerColor = Slate900),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth().testTag("btn_reload_sample_data")
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Recarregar Dados Exemplo")
                    }
                }
            }
        }
    }

    // Edit Profile Modal
    if (isEditingProfile && profile != null) {
        EditProfileDialog(
            currentProfile = profile,
            onDismiss = { isEditingProfile = false },
            onSave = { updated ->
                onSaveProfile(updated)
                isEditingProfile = false
            }
        )
    }

    // Terms of Use Modal
    if (showTermsModal) {
        AlertDialog(
            onDismissRequest = { showTermsModal = false },
            title = { Text("Termos de Uso (Minuta)", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "1. OBJETO: O aplicativo Estoque & Ficha Técnica destina-se ao auxílio na gestão operacional, contagem de inventário e cálculo de custo e margem de produtos para o setor de alimentação e bebidas.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "2. ARMAZENAMENTO LOCAL: Todos os dados de insumos, receitas, contagens e valores financeiros são mantidos em banco de dados local seguro no dispositivo.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "3. RESPONSABILIDADE: Os cálculos de margem, CMV e markup são estimativas gerenciais baseadas nos preços e quantidades informadas pelo operador.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            },
            confirmButton = {
                Button(onClick = { showTermsModal = false }) {
                    Text("Fechar")
                }
            }
        )
    }

    // Privacy Policy Modal
    if (showPrivacyModal) {
        AlertDialog(
            onDismissRequest = { showPrivacyModal = false },
            title = { Text("Política de Privacidade (LGPD)", fontWeight = FontWeight.Bold) },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "1. COLETA DE DADOS: O aplicativo coleta nome, e-mail, telefone e dados do estabelecimento estritamente para identificação e emissão dos relatórios de contagem.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "2. CONFORMIDADE COM A LGPD (Lei nº 13.709/2018): Garantimos a transparência, finalidade e segurança dos dados cadastrais.",
                        style = MaterialTheme.typography.bodySmall
                    )
                    Text(
                        text = "3. DIREITOS DO TITULAR: Você pode editar ou excluir todos os seus dados e cadastros a qualquer momento através do menu Perfil.",
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            },
            confirmButton = {
                Button(onClick = { showPrivacyModal = false }) {
                    Text("Fechar")
                }
            }
        )
    }

    // Reset Confirmation Dialog
    if (showResetConfirm) {
        ConfirmDialog(
            title = "Restaurar Dados Exemplo?",
            message = "Isso irá substituir os dados atuais pelos insumos e fichas técnicas demonstrativas de bar e restaurante.",
            confirmText = "Restaurar",
            onConfirm = {
                showResetConfirm = false
                onReloadSampleData()
            },
            onDismiss = { showResetConfirm = false }
        )
    }
}

@Composable
fun ProfileInfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, style = MaterialTheme.typography.bodySmall, color = Slate500)
        Text(text = value, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold), color = Slate900)
    }
}

@Composable
fun SettingsMenuRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                shape = CircleShape,
                color = Slate100,
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(icon, contentDescription = null, tint = Slate700, modifier = Modifier.size(20.dp))
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(text = title, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = Slate900)
                Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = Slate500)
            }
        }
        Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Slate500)
    }
}

@Composable
fun EditProfileDialog(
    currentProfile: CompanyProfile,
    onDismiss: () -> Unit,
    onSave: (CompanyProfile) -> Unit
) {
    var userName by remember { mutableStateOf(currentProfile.userName) }
    var userPhone by remember { mutableStateOf(currentProfile.userPhone) }
    var tradeName by remember { mutableStateOf(currentProfile.tradeName) }
    var legalName by remember { mutableStateOf(currentProfile.legalName) }
    var cnpj by remember { mutableStateOf(currentProfile.cnpj) }
    var city by remember { mutableStateOf(currentProfile.city) }
    var state by remember { mutableStateOf(currentProfile.state) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar Perfil e Empresa", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = userName,
                    onValueChange = { userName = it },
                    label = { Text("Seu Nome") },
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = userPhone,
                    onValueChange = { userPhone = it },
                    label = { Text("Telefone / WhatsApp") },
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = tradeName,
                    onValueChange = { tradeName = it },
                    label = { Text("Nome Fantasia") },
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = cnpj,
                    onValueChange = { cnpj = it },
                    label = { Text("CNPJ") },
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("Cidade") },
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(
                        currentProfile.copy(
                            userName = userName,
                            userPhone = userPhone,
                            tradeName = tradeName,
                            legalName = legalName,
                            cnpj = cnpj,
                            city = city,
                            state = state,
                            updatedAt = System.currentTimeMillis()
                        )
                    )
                },
                colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary)
            ) {
                Text("Salvar")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
