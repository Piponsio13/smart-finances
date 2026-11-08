package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BudgetResponseDto {
    private Long id;
    private String categoryName;
    private BigDecimal monthlyLimit;
    private BigDecimal actualSpending;
    private BigDecimal remaining;
    private boolean exceeded;
    private int month;
    private int year;
}
