package io.github.piponsio.smartfinances_api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.github.piponsio.smartfinances_api.dto.response.CategoryTrendDto;
import io.github.piponsio.smartfinances_api.dto.response.ForecastResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.MonthlyTrendDto;
import io.github.piponsio.smartfinances_api.service.analytics.AnalyticsService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/trends")
    public ResponseEntity<CustomResponse<List<MonthlyTrendDto>>> getMonthlyTrends(
            @RequestParam(defaultValue = "6") int months) {
        List<MonthlyTrendDto> trends = analyticsService.getMonthlyTrends(months);
        CustomResponse<List<MonthlyTrendDto>> response = CustomResponse.<List<MonthlyTrendDto>>builder()
                .data(trends)
                .message("Monthly trends retrieved successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category-trends")
    public ResponseEntity<CustomResponse<List<CategoryTrendDto>>> getCategoryTrends(
            @RequestParam(defaultValue = "6") int months) {
        List<CategoryTrendDto> trends = analyticsService.getCategoryTrends(months);
        CustomResponse<List<CategoryTrendDto>> response = CustomResponse.<List<CategoryTrendDto>>builder()
                .data(trends)
                .message("Category trends retrieved successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/forecast")
    public ResponseEntity<CustomResponse<ForecastResponseDto>> getForecast(
            @RequestParam(defaultValue = "3") int months) {
        ForecastResponseDto forecast = analyticsService.getForecast(months);
        CustomResponse<ForecastResponseDto> response = CustomResponse.<ForecastResponseDto>builder()
                .data(forecast)
                .message("Forecast retrieved successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }
}
