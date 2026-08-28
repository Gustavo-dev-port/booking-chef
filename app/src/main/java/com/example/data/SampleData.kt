package com.example.data

import com.example.data.local.entity.CompanyProfile
import com.example.data.local.entity.Ingredient
import com.example.data.local.entity.InventoryCount
import com.example.data.local.entity.InventoryCountItem
import com.example.data.local.entity.Product
import com.example.data.local.entity.ProductIngredient

object SampleData {
    val defaultCompany = CompanyProfile(
        id = 1,
        userName = "Gustavo",
        userEmail = "gustavo@botecocentral.com.br",
        userPhone = "(11) 98765-4321",
        userRole = "Proprietário / Sócio",
        cnpj = "12.345.678/0001-90",
        legalName = "Gastronomia & Eventos Central LTDA",
        tradeName = "Boteco & Grill Central",
        segment = "Bar",
        employeeRange = "2–5",
        city = "São Paulo",
        state = "SP",
        acceptTerms = true,
        acceptMarketing = false,
        onboardingCompleted = true
    )

    fun getSampleIngredients(): List<Ingredient> {
        val now = System.currentTimeMillis()
        return listOf(
            Ingredient(
                name = "Gin Tanqueray",
                category = "Destilados",
                purchaseUnit = "garrafa",
                usageUnit = "ml",
                packageQuantity = 750.0,
                packagePrice = 109.90,
                unitCost = 109.90 / 750.0,
                currentStock = 4.5,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Vodka Absolut",
                category = "Destilados",
                purchaseUnit = "garrafa",
                usageUnit = "ml",
                packageQuantity = 750.0,
                packagePrice = 89.90,
                unitCost = 89.90 / 750.0,
                currentStock = 3.25,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Cerveja Heineken 330ml",
                category = "Cervejas",
                purchaseUnit = "cx",
                usageUnit = "un",
                packageQuantity = 24.0,
                packagePrice = 112.80,
                unitCost = 112.80 / 24.0,
                currentStock = 42.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Água Tônica Antarctica",
                category = "Refrigerantes",
                purchaseUnit = "cx",
                usageUnit = "un",
                packageQuantity = 12.0,
                packagePrice = 40.80,
                unitCost = 40.80 / 12.0,
                currentStock = 28.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Coca-Cola Lata 350ml",
                category = "Refrigerantes",
                purchaseUnit = "cx",
                usageUnit = "un",
                packageQuantity = 12.0,
                packagePrice = 39.60,
                unitCost = 39.60 / 12.0,
                currentStock = 18.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Limão Taiti",
                category = "Hortifruti",
                purchaseUnit = "kg",
                usageUnit = "un",
                packageQuantity = 10.0, // ~10 limões por kg
                packagePrice = 16.00,
                unitCost = 1.60,
                currentStock = 34.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Açúcar Refinado",
                category = "Mercearia",
                purchaseUnit = "pct",
                usageUnit = "g",
                packageQuantity = 1000.0,
                packagePrice = 4.50,
                unitCost = 4.50 / 1000.0,
                currentStock = 5000.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Xarope de Gengibre",
                category = "Destilados",
                purchaseUnit = "garrafa",
                usageUnit = "ml",
                packageQuantity = 700.0,
                packagePrice = 42.00,
                unitCost = 42.00 / 700.0,
                currentStock = 2.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Espuma de Gengibre",
                category = "Destilados",
                purchaseUnit = "garrafa",
                usageUnit = "ml",
                packageQuantity = 500.0,
                packagePrice = 38.00,
                unitCost = 38.00 / 500.0,
                currentStock = 1.5,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Hambúrguer Angus 180g",
                category = "Carnes",
                purchaseUnit = "cx",
                usageUnit = "un",
                packageQuantity = 10.0,
                packagePrice = 65.00,
                unitCost = 6.50,
                currentStock = 35.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Queijo Cheddar Fatiado",
                category = "Laticínios",
                purchaseUnit = "pct",
                usageUnit = "un",
                packageQuantity = 40.0,
                packagePrice = 48.00,
                unitCost = 1.20,
                currentStock = 80.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Bacon em Fatias",
                category = "Carnes",
                purchaseUnit = "pct",
                usageUnit = "g",
                packageQuantity = 1000.0,
                packagePrice = 38.00,
                unitCost = 38.00 / 1000.0,
                currentStock = 2500.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Pão Brioche Artesanal",
                category = "Mercearia",
                purchaseUnit = "pct",
                usageUnit = "un",
                packageQuantity = 6.0,
                packagePrice = 12.00,
                unitCost = 2.00,
                currentStock = 24.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Batata Palito Congelada",
                category = "Congelados",
                purchaseUnit = "pct",
                usageUnit = "g",
                packageQuantity = 2000.0,
                packagePrice = 26.00,
                unitCost = 26.00 / 2000.0,
                currentStock = 8000.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Massa de Pizza Artesanal",
                category = "Mercearia",
                purchaseUnit = "pct",
                usageUnit = "un",
                packageQuantity = 5.0,
                packagePrice = 22.50,
                unitCost = 4.50,
                currentStock = 15.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Queijo Mussarela Peça",
                category = "Laticínios",
                purchaseUnit = "pct",
                usageUnit = "g",
                packageQuantity = 1000.0,
                packagePrice = 42.00,
                unitCost = 42.00 / 1000.0,
                currentStock = 4000.0,
                priceUpdatedAt = now
            ),
            Ingredient(
                name = "Linguiça Calabresa Defumada",
                category = "Carnes",
                purchaseUnit = "pct",
                usageUnit = "g",
                packageQuantity = 1000.0,
                packagePrice = 32.00,
                unitCost = 32.00 / 1000.0,
                currentStock = 3000.0,
                priceUpdatedAt = now
            )
        )
    }

    fun getSampleProducts(): List<Product> {
        return listOf(
            Product(name = "Gin Tônica Clássica", category = "Drinks & Coquetéis", salePrice = 32.00),
            Product(name = "Caipirinha de Vodka", category = "Drinks & Coquetéis", salePrice = 26.00),
            Product(name = "Moscow Mule", category = "Drinks & Coquetéis", salePrice = 34.00),
            Product(name = "Burger X-Bacon Artesanal", category = "Hambúrgueres", salePrice = 38.00),
            Product(name = "Porção Batata com Cheddar e Bacon", category = "Porções & Petiscos", salePrice = 28.00),
            Product(name = "Pizza Calabresa Especial", category = "Pizzas", salePrice = 58.00)
        )
    }

    fun getSampleRecipeItems(
        products: List<Product>,
        ingredients: List<Ingredient>
    ): List<ProductIngredient> {
        val prodMap = products.associateBy { it.name }
        val ingMap = ingredients.associateBy { it.name }

        val items = mutableListOf<ProductIngredient>()

        // Gin Tônica: 50ml Gin, 1 un Tonica, 0.25 un Limão
        prodMap["Gin Tônica Clássica"]?.let { p ->
            ingMap["Gin Tanqueray"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 50.0, unit = "ml")) }
            ingMap["Água Tônica Antarctica"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 1.0, unit = "un")) }
            ingMap["Limão Taiti"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 0.25, unit = "un")) }
        }

        // Caipirinha: 60ml Vodka, 1 un Limão, 15g Açúcar
        prodMap["Caipirinha de Vodka"]?.let { p ->
            ingMap["Vodka Absolut"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 60.0, unit = "ml")) }
            ingMap["Limão Taiti"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 1.0, unit = "un")) }
            ingMap["Açúcar Refinado"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 15.0, unit = "g")) }
        }

        // Moscow Mule: 50ml Vodka, 20ml Xarope Gengibre, 30ml Espuma, 0.5 un Limão
        prodMap["Moscow Mule"]?.let { p ->
            ingMap["Vodka Absolut"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 50.0, unit = "ml")) }
            ingMap["Xarope de Gengibre"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 20.0, unit = "ml")) }
            ingMap["Espuma de Gengibre"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 30.0, unit = "ml")) }
            ingMap["Limão Taiti"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 0.5, unit = "un")) }
        }

        // Burger X-Bacon: Pão (1 un), Hambúrguer (1 un), Cheddar (2 un), Bacon (40g)
        prodMap["Burger X-Bacon Artesanal"]?.let { p ->
            ingMap["Pão Brioche Artesanal"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 1.0, unit = "un")) }
            ingMap["Hambúrguer Angus 180g"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 1.0, unit = "un")) }
            ingMap["Queijo Cheddar Fatiado"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 2.0, unit = "un")) }
            ingMap["Bacon em Fatias"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 40.0, unit = "g")) }
        }

        // Batata Cheddar Bacon: Batata 400g, Cheddar 2 un, Bacon 30g
        prodMap["Porção Batata com Cheddar e Bacon"]?.let { p ->
            ingMap["Batata Palito Congelada"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 400.0, unit = "g")) }
            ingMap["Queijo Cheddar Fatiado"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 2.0, unit = "un")) }
            ingMap["Bacon em Fatias"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 30.0, unit = "g")) }
        }

        // Pizza Calabresa: Massa (1 un), Mussarela (250g), Calabresa (200g)
        prodMap["Pizza Calabresa Especial"]?.let { p ->
            ingMap["Massa de Pizza Artesanal"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 1.0, unit = "un")) }
            ingMap["Queijo Mussarela Peça"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 250.0, unit = "g")) }
            ingMap["Linguiça Calabresa Defumada"]?.let { items.add(ProductIngredient(productId = p.id, ingredientId = it.id, quantity = 200.0, unit = "g")) }
        }

        return items
    }

    fun getSampleHistoricalCounts(ingredients: List<Ingredient>): Pair<InventoryCount, List<InventoryCountItem>> {
        val threeDaysAgo = System.currentTimeMillis() - (3 * 24 * 60 * 60 * 1000L)
        val items = ingredients.map { ing ->
            val closed = when (ing.purchaseUnit) {
                "garrafa" -> 3.0
                "cx" -> 1.0
                else -> 10.0
            }
            val fractionPct = if (ing.purchaseUnit == "garrafa") 50 else 0
            val fractionQty = fractionPct / 100.0
            val totalQty = closed + fractionQty
            val totalVal = totalQty * ing.packagePrice

            InventoryCountItem(
                inventoryCountId = 0,
                ingredientId = ing.id,
                ingredientName = ing.name,
                category = ing.category,
                closedQuantity = closed,
                fractionPercentage = fractionPct,
                fractionQuantity = fractionQty,
                totalQuantity = totalQty,
                purchaseUnit = ing.purchaseUnit,
                packageQuantity = ing.packageQuantity,
                unitCostAtCount = ing.unitCost,
                packagePriceAtCount = ing.packagePrice,
                totalValue = totalVal
            )
        }

        val totalValue = items.sumOf { it.totalValue }
        val count = InventoryCount(
            id = 0,
            startedAt = threeDaysAgo,
            finishedAt = threeDaysAgo + (35 * 60 * 1000L),
            status = "COMPLETED",
            responsibleName = "Gustavo",
            totalInventoryValue = totalValue,
            totalItemsCounted = items.size,
            notes = "Contagem regular semanal da adega e cozinha."
        )

        return Pair(count, items)
    }
}
