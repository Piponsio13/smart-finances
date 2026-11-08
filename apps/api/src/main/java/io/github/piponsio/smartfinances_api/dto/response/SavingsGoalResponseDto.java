package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SavingsGoalResponseDto {
    private Long id;
    private String name;
    private BigDecimal targetAmount;
    private BigDecimal savedAmount;
    private BigDecimal remaining;
    private BigDecimal progressPercent;
    private LocalDate targetDate;
    private Long daysRemaining;
    private boolean completed;
}
