package io.github.piponsio.smartfinances_api.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.github.piponsio.smartfinances_api.enums.TransactionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionFilterDto {
    private Long categoryId;
    private TransactionType type;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private String description;
}
