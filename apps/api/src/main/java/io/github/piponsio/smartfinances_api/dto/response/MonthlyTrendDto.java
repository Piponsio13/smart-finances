package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MonthlyTrendDto {
    private int month;
    private int year;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal balance;
    private int transactionCount;
    private BigDecimal incomeChangePercent;
    private BigDecimal expenseChangePercent;
}
