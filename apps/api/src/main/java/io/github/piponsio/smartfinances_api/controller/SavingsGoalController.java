package io.github.piponsio.smartfinances_api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.piponsio.smartfinances_api.dto.request.SavingsContributionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.SavingsGoalRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.SavingsContributionResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.SavingsGoalResponseDto;
import io.github.piponsio.smartfinances_api.service.savings.SavingsGoalService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/savings")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    @PostMapping
    public ResponseEntity<CustomResponse<SavingsGoalResponseDto>> create(
            @Valid @RequestBody SavingsGoalRequestDto request) {
        SavingsGoalResponseDto data = savingsGoalService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                CustomResponse.<SavingsGoalResponseDto>builder()
                        .data(data).message("Savings goal created successfully")
                        .statusCode(HttpStatus.CREATED.value()).build());
    }

    @GetMapping
    public ResponseEntity<CustomResponse<List<SavingsGoalResponseDto>>> getAll() {
        List<SavingsGoalResponseDto> data = savingsGoalService.getAll();
        return ResponseEntity.ok(
                CustomResponse.<List<SavingsGoalResponseDto>>builder()
                        .data(data).message("Savings goals retrieved successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomResponse<SavingsGoalResponseDto>> getById(@PathVariable Long id) {
        SavingsGoalResponseDto data = savingsGoalService.getById(id);
        return ResponseEntity.ok(
                CustomResponse.<SavingsGoalResponseDto>builder()
                        .data(data).message("Savings goal retrieved successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomResponse<SavingsGoalResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody SavingsGoalRequestDto request) {
        SavingsGoalResponseDto data = savingsGoalService.update(id, request);
        return ResponseEntity.ok(
                CustomResponse.<SavingsGoalResponseDto>builder()
                        .data(data).message("Savings goal updated successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CustomResponse<Void>> delete(@PathVariable Long id) {
        savingsGoalService.delete(id);
        return ResponseEntity.ok(
                CustomResponse.<Void>builder()
                        .data(null).message("Savings goal deleted successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @PostMapping("/{id}/contributions")
    public ResponseEntity<CustomResponse<SavingsContributionResponseDto>> addContribution(
            @PathVariable Long id,
            @Valid @RequestBody SavingsContributionRequestDto request) {
        SavingsContributionResponseDto data = savingsGoalService.addContribution(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                CustomResponse.<SavingsContributionResponseDto>builder()
                        .data(data).message("Contribution added successfully")
                        .statusCode(HttpStatus.CREATED.value()).build());
    }

    @GetMapping("/{id}/contributions")
    public ResponseEntity<CustomResponse<List<SavingsContributionResponseDto>>> getContributions(
            @PathVariable Long id) {
        List<SavingsContributionResponseDto> data = savingsGoalService.getContributions(id);
        return ResponseEntity.ok(
                CustomResponse.<List<SavingsContributionResponseDto>>builder()
                        .data(data).message("Contributions retrieved successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }
}
