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

import io.github.piponsio.smartfinances_api.dto.request.BudgetRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.BudgetUpdateRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.BudgetResponseDto;
import io.github.piponsio.smartfinances_api.service.budget.BudgetService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<CustomResponse<BudgetResponseDto>> createBudget(
            @Valid @RequestBody BudgetRequestDto requestDto) {
        BudgetResponseDto budget = budgetService.createBudget(requestDto);
        CustomResponse<BudgetResponseDto> response = CustomResponse.<BudgetResponseDto>builder()
                .data(budget)
                .message("Budget created successfully")
                .statusCode(HttpStatus.CREATED.value())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<CustomResponse<List<BudgetResponseDto>>> getAllBudgets() {
        List<BudgetResponseDto> budgets = budgetService.getAllBudgets();
        CustomResponse<List<BudgetResponseDto>> response = CustomResponse.<List<BudgetResponseDto>>builder()
                .data(budgets)
                .message("Budgets retrieved successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomResponse<BudgetResponseDto>> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetUpdateRequestDto requestDto) {
        BudgetResponseDto budget = budgetService.updateBudget(id, requestDto);
        CustomResponse<BudgetResponseDto> response = CustomResponse.<BudgetResponseDto>builder()
                .data(budget)
                .message("Budget updated successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CustomResponse<Void>> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        CustomResponse<Void> response = CustomResponse.<Void>builder()
                .data(null)
                .message("Budget deleted successfully")
                .statusCode(HttpStatus.OK.value())
                .build();
        return ResponseEntity.ok(response);
    }
}
