package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryForecastDto {
    private String categoryName;
    private BigDecimal projectedAmount;
}
