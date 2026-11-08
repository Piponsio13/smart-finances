package io.github.piponsio.smartfinances_api.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.github.piponsio.smartfinances_api.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransactionRequestDto {
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Date is required")
    private LocalDateTime date;

    private String currency = "USD";
}
