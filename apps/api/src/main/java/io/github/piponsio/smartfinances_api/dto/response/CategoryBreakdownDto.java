package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryBreakdownDto {
    private String categoryName;
    private BigDecimal total;
    private double percentage;
}
