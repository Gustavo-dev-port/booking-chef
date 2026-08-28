package com.example.model

data class UnitDefinition(
    val code: String,
    val name: String,
    val defaultUsageUnit: String,
    val conversionFactorToUsage: Double
)

object AppUnits {
    val PURCHASE_UNITS = listOf(
        "un" to "Unidade (un)",
        "cx" to "Caixa (cx)",
        "pct" to "Pacote (pct)",
        "garrafa" to "Garrafa (garrafa)",
        "lata" to "Lata (lata)",
        "kg" to "Quilo (kg)",
        "g" to "Grama (g)",
        "l" to "Litro (l)",
        "ml" to "Mililitro (ml)"
    )

    val USAGE_UNITS = listOf(
        "ml" to "Mililitro (ml)",
        "g" to "Grama (g)",
        "un" to "Unidade (un)"
    )

    val CATEGORIES = listOf(
        "Cervejas",
        "Destilados",
        "Refrigerantes",
        "Sucos",
        "Frutas",
        "Hortifruti",
        "Carnes",
        "Laticínios",
        "Congelados",
        "Mercearia",
        "Embalagens",
        "Outros"
    )

    val PRODUCT_CATEGORIES = listOf(
        "Drinks & Coquetéis",
        "Cervejas & Chopp",
        "Doses & Shots",
        "Sem Álcool",
        "Hambúrgueres",
        "Porções & Petiscos",
        "Pizzas",
        "Sobremesas",
        "Outros"
    )

    val SEGMENTS = listOf(
        "Bar",
        "Restaurante",
        "Lanchonete",
        "Hamburgueria",
        "Pizzaria",
        "Adega",
        "Cafeteria",
        "Food Truck",
        "Casa Noturna",
        "Outro"
    )

    val EMPLOYEE_RANGES = listOf(
        "Só eu",
        "2–5",
        "6–10",
        "11–20",
        "Mais de 20"
    )

    val ROLES = listOf(
        "Proprietário / Sócio",
        "Gerente",
        "Administrativo / Financeiro",
        "Responsável pelo estoque",
        "Bartender / Cozinha",
        "Funcionário",
        "Outro"
    )

    fun calculateUnitCost(packagePrice: Double, packageQuantity: Double): Double {
        if (packageQuantity <= 0.0) return 0.0
        return packagePrice / packageQuantity
    }
}
