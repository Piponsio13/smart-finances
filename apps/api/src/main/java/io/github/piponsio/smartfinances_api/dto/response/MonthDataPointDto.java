package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MonthDataPointDto {
    private int month;
    private int year;
    private BigDecimal total;
}
