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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.CompanyProfile
import com.example.model.AppUnits
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
fun OnboardingScreen(
    initialProfile: CompanyProfile?,
    onComplete: (CompanyProfile) -> Unit,
    onOpenTerms: () -> Unit,
    modifier: Modifier = Modifier
) {
    var step by remember { mutableIntStateOf(1) }

    // Form fields
    var userName by remember { mutableStateOf(initialProfile?.userName ?: "") }
    var userEmail by remember { mutableStateOf(initialProfile?.userEmail ?: "") }
    var userPhone by remember { mutableStateOf(initialProfile?.userPhone ?: "") }
    var acceptTerms by remember { mutableStateOf(initialProfile?.acceptTerms ?: false) }
    var acceptMarketing by remember { mutableStateOf(initialProfile?.acceptMarketing ?: false) }

    var cnpj by remember { mutableStateOf(initialProfile?.cnpj ?: "") }
    var tradeName by remember { mutableStateOf(initialProfile?.tradeName ?: "") }
    var legalName by remember { mutableStateOf(initialProfile?.legalName ?: "") }
    var city by remember { mutableStateOf(initialProfile?.city ?: "") }
    var state by remember { mutableStateOf(initialProfile?.state ?: "SP") }

    var selectedSegment by remember { mutableStateOf(initialProfile?.segment ?: "Bar") }
    var selectedEmployees by remember { mutableStateOf(initialProfile?.employeeRange ?: "2–5") }
    var selectedRole by remember { mutableStateOf(initialProfile?.userRole ?: "Proprietário / Sócio") }

    var errorMessage by remember { mutableStateOf<String?>(null) }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (step > 1) {
                        IconButton(onClick = { step -= 1 }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Voltar")
                        }
                    } else {
                        Spacer(modifier = Modifier.size(48.dp))
                    }
                    Text(
                        text = "Etapa $step de 5",
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                        color = EmeraldPrimary
                    )
                    Spacer(modifier = Modifier.size(48.dp))
                }
                Spacer(modifier = Modifier.height(4.dp))
                LinearProgressIndicator(
                    progress = { step / 5f },
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
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            AnimatedContent(
                targetState = step,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "onboarding_step"
            ) { currentStep ->
                Column(modifier = Modifier.fillMaxWidth()) {
                    when (currentStep) {
                        1 -> {
                            // Step 1: User Account
                            Text(
                                text = "Criar sua Conta",
                                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
                                color = Slate900
                            )
                            Text(
                                text = "Preencha seus dados para gerenciar o estoque e as fichas técnicas do seu negócio.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                            )

                            OutlinedTextField(
                                value = userName,
                                onValueChange = { userName = it; errorMessage = null },
                                label = { Text("Nome completo") },
                                placeholder = { Text("Ex: Gustavo Almeida") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_user_name")
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = userEmail,
                                onValueChange = { userEmail = it; errorMessage = null },
                                label = { Text("E-mail") },
                                placeholder = { Text("seuemail@exemplo.com") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_user_email")
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = userPhone,
                                onValueChange = { userPhone = Formatters.formatPhone(it); errorMessage = null },
                                label = { Text("Telefone / WhatsApp") },
                                placeholder = { Text("(11) 99999-9999") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_user_phone")
                            )
                            Spacer(modifier = Modifier.height(16.dp))

                            // LGPD Terms and Privacy Consent
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Checkbox(
                                    checked = acceptTerms,
                                    onCheckedChange = { acceptTerms = it; errorMessage = null },
                                    colors = CheckboxDefaults.colors(checkedColor = EmeraldPrimary)
                                )
                                TextButton(onClick = onOpenTerms) {
                                    Text(
                                        text = "Li e aceito os Termos de Uso e a Política de Privacidade (LGPD)",
                                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                                        color = Slate700
                                    )
                                }
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Checkbox(
                                    checked = acceptMarketing,
                                    onCheckedChange = { acceptMarketing = it },
                                    colors = CheckboxDefaults.colors(checkedColor = EmeraldPrimary)
                                )
                                Text(
                                    text = "Quero receber novidades, dicas e informações sobre novos recursos.",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Slate500
                                )
                            }
                        }

                        2 -> {
                            // Step 2: Company Info
                            Text(
                                text = "Dados do Estabelecimento",
                                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
                                color = Slate900
                            )
                            Text(
                                text = "Informe o nome e os dados cadastrais do seu bar ou restaurante.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
                            )

                            OutlinedTextField(
                                value = tradeName,
                                onValueChange = { tradeName = it; errorMessage = null },
                                label = { Text("Nome Fantasia (Como o público conhece)") },
                                placeholder = { Text("Ex: Boteco Central") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_trade_name")
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = cnpj,
                                onValueChange = { cnpj = Formatters.formatCnpj(it) },
                                label = { Text("CNPJ (Opcional)") },
                                placeholder = { Text("00.000.000/0001-00") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_cnpj")
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            OutlinedTextField(
                                value = legalName,
                                onValueChange = { legalName = it },
                                label = { Text("Razão Social (Opcional)") },
                                placeholder = { Text("Ex: Boteco e Gastronomia LTDA") },
                                singleLine = true,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(modifier = Modifier.height(12.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                OutlinedTextField(
                                    value = city,
                                    onValueChange = { city = it },
                                    label = { Text("Cidade") },
                                    placeholder = { Text("São Paulo") },
                                    singleLine = true,
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.weight(2f)
                                )
                                OutlinedTextField(
                                    value = state,
                                    onValueChange = { if (it.length <= 2) state = it.uppercase() },
                                    label = { Text("UF") },
                                    placeholder = { Text("SP") },
                                    singleLine = true,
                                    shape = RoundedCornerShape(12.dp),
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        3 -> {
                            // Step 3: Segment
                            Text(
                                text = "Qual é o seu segmento?",
                                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
                                color = Slate900
                            )
                            Text(
                                text = "Qual opção melhor descreve seu estabelecimento?",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                            )

                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                AppUnits.SEGMENTS.forEach { segment ->
                                    val isSelected = selectedSegment == segment
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { selectedSegment = segment },
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) EmeraldContainerLight else Slate100
                                        ),
                                        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, EmeraldPrimary) else null
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(16.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = segment,
                                                style = MaterialTheme.typography.bodyLarge.copy(
                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                                ),
                                                color = if (isSelected) EmeraldDark else Slate900
                                            )
                                            if (isSelected) {
                                                Icon(
                                                    Icons.Default.CheckCircle,
                                                    contentDescription = null,
                                                    tint = EmeraldPrimary,
                                                    modifier = Modifier.size(22.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        4 -> {
                            // Step 4: Business Size
                            Text(
                                text = "Tamanho do Negócio",
                                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
                                color = Slate900
                            )
                            Text(
                                text = "Quantas pessoas trabalham no seu estabelecimento?",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                            )

                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                AppUnits.EMPLOYEE_RANGES.forEach { range ->
                                    val isSelected = selectedEmployees == range
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { selectedEmployees = range },
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) EmeraldContainerLight else Slate100
                                        ),
                                        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, EmeraldPrimary) else null
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(16.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = "$range pessoas",
                                                style = MaterialTheme.typography.bodyLarge.copy(
                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                                ),
                                                color = if (isSelected) EmeraldDark else Slate900
                                            )
                                            if (isSelected) {
                                                Icon(
                                                    Icons.Default.CheckCircle,
                                                    contentDescription = null,
                                                    tint = EmeraldPrimary,
                                                    modifier = Modifier.size(22.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        5 -> {
                            // Step 5: Role
                            Text(
                                text = "Sua Função",
                                style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.ExtraBold),
                                color = Slate900
                            )
                            Text(
                                text = "Qual é a sua função principal no estabelecimento?",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                            )

                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                AppUnits.ROLES.forEach { role ->
                                    val isSelected = selectedRole == role
                                    Card(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable { selectedRole = role },
                                        shape = RoundedCornerShape(14.dp),
                                        colors = CardDefaults.cardColors(
                                            containerColor = if (isSelected) EmeraldContainerLight else Slate100
                                        ),
                                        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, EmeraldPrimary) else null
                                    ) {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(16.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Text(
                                                text = role,
                                                style = MaterialTheme.typography.bodyLarge.copy(
                                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                                ),
                                                color = if (isSelected) EmeraldDark else Slate900
                                            )
                                            if (isSelected) {
                                                Icon(
                                                    Icons.Default.CheckCircle,
                                                    contentDescription = null,
                                                    tint = EmeraldPrimary,
                                                    modifier = Modifier.size(22.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (errorMessage != null) {
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = errorMessage ?: "",
                            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
            }

            // Bottom action buttons
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp)
            ) {
                Button(
                    onClick = {
                        when (step) {
                            1 -> {
                                if (userName.isBlank()) {
                                    errorMessage = "Por favor, informe seu nome."
                                } else if (!acceptTerms) {
                                    errorMessage = "É necessário aceitar os Termos de Uso para continuar."
                                } else {
                                    errorMessage = null
                                    step = 2
                                }
                            }
                            2 -> {
                                if (tradeName.isBlank()) {
                                    tradeName = "Meu Estabelecimento"
                                }
                                errorMessage = null
                                step = 3
                            }
                            3 -> {
                                step = 4
                            }
                            4 -> {
                                step = 5
                            }
                            5 -> {
                                val profile = CompanyProfile(
                                    id = 1,
                                    userName = userName.ifBlank { "Usuário" },
                                    userEmail = userEmail.ifBlank { "usuario@exemplo.com" },
                                    userPhone = userPhone,
                                    userRole = selectedRole,
                                    cnpj = cnpj,
                                    tradeName = tradeName.ifBlank { "Meu Negócio" },
                                    legalName = legalName.ifBlank { tradeName },
                                    segment = selectedSegment,
                                    employeeRange = selectedEmployees,
                                    city = city.ifBlank { "São Paulo" },
                                    state = state.ifBlank { "SP" },
                                    acceptTerms = acceptTerms,
                                    acceptMarketing = acceptMarketing,
                                    onboardingCompleted = true
                                )
                                onComplete(profile)
                            }
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldPrimary),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .testTag("btn_onboarding_next")
                ) {
                    Text(
                        text = if (step == 5) "CONCLUIR E COMEÇAR" else "CONTINUAR",
                        style = MaterialTheme.typography.labelLarge.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Icon(
                        if (step == 5) Icons.Default.Check else Icons.Default.ArrowForward,
                        contentDescription = null
                    )
                }
            }
        }
    }
}
