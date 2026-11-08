package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForecastResponseDto {
    private int forecastMonth;
    private int forecastYear;
    private BigDecimal projectedIncome;
    private BigDecimal projectedExpenses;
    private BigDecimal projectedBalance;
    private int basedOnMonths;
    private List<CategoryForecastDto> categoryForecasts;
}
