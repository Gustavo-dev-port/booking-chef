package com.example.util

import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object Formatters {
    private val brLocale = Locale("pt", "BR")
    private val currencyFormat: NumberFormat = NumberFormat.getCurrencyInstance(brLocale)

    fun formatBrl(value: Double): String {
        return currencyFormat.format(value)
    }

    fun formatBrlPerUnit(value: Double, unit: String): String {
        return if (value < 1.0) {
            val formatted = String.format(brLocale, "R$ %.4f", value)
            "$formatted / $unit"
        } else {
            val formatted = String.format(brLocale, "R$ %.2f", value)
            "$formatted / $unit"
        }
    }

    fun formatQuantity(quantity: Double, unit: String): String {
        val formatted = if (quantity % 1.0 == 0.0) {
            String.format(brLocale, "%.0f", quantity)
        } else {
            String.format(brLocale, "%.2f", quantity)
        }
        return "$formatted $unit"
    }

    fun formatPercent(value: Double): String {
        return String.format(brLocale, "%.1f%%", value)
    }

    fun formatDate(timestamp: Long): String {
        if (timestamp == 0L) return "-"
        val sdf = SimpleDateFormat("dd/MM/yyyy HH:mm", brLocale)
        return sdf.format(Date(timestamp))
    }

    fun formatDateShort(timestamp: Long): String {
        if (timestamp == 0L) return "-"
        val sdf = SimpleDateFormat("dd/MM/yyyy", brLocale)
        return sdf.format(Date(timestamp))
    }

    fun formatCnpj(cnpj: String): String {
        val digits = cnpj.filter { it.isDigit() }
        return when {
            digits.length == 14 -> {
                "${digits.substring(0, 2)}.${digits.substring(2, 5)}.${digits.substring(5, 8)}/${digits.substring(8, 12)}-${digits.substring(12, 14)}"
            }
            else -> cnpj
        }
    }

    fun formatPhone(phone: String): String {
        val digits = phone.filter { it.isDigit() }
        return when {
            digits.length == 11 -> "(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}"
            digits.length == 10 -> "(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6, 10)}"
            else -> phone
        }
    }
}
