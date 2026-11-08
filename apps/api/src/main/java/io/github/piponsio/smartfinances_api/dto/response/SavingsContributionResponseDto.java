package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SavingsContributionResponseDto {
    private Long id;
    private BigDecimal amount;
    private LocalDate date;
    private String note;
}
