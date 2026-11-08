package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import io.github.piponsio.smartfinances_api.enums.RecurrenceFrequency;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecurringTransactionResponseDto {
    private Long id;
    private BigDecimal amount;
    private String description;
    private TransactionType type;
    private String categoryName;
    private RecurrenceFrequency frequency;
    private LocalDate startDate;
    private LocalDate nextDueDate;
    private boolean active;
}
