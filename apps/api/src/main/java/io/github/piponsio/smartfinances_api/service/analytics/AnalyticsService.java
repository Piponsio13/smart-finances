package io.github.piponsio.smartfinances_api.service.analytics;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.response.CategoryTrendDto;
import io.github.piponsio.smartfinances_api.dto.response.ForecastResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.MonthlyTrendDto;

public interface AnalyticsService {
    List<MonthlyTrendDto> getMonthlyTrends(int months);

    List<CategoryTrendDto> getCategoryTrends(int months);

    ForecastResponseDto getForecast(int months);
}
