package io.github.piponsio.smartfinances_api.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryTrendDto {
    private String categoryName;
    private BigDecimal total;
    private List<MonthDataPointDto> data;
}
