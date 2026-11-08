package io.github.piponsio.smartfinances_api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.piponsio.smartfinances_api.dto.response.DashboardResponseDto;
import io.github.piponsio.smartfinances_api.service.dashboard.DashboardService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<CustomResponse<DashboardResponseDto>> getDashboard() {
        DashboardResponseDto dashboard = dashboardService.getDashboard();
        CustomResponse<DashboardResponseDto> response = CustomResponse.<DashboardResponseDto>builder()
                .data(dashboard)
                .message("Dashboard retrieved successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }
}
