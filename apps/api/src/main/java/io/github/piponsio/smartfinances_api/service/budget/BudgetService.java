package io.github.piponsio.smartfinances_api.service.budget;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.request.BudgetRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.BudgetUpdateRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.BudgetResponseDto;

public interface BudgetService {
    BudgetResponseDto createBudget(BudgetRequestDto requestDto);

    List<BudgetResponseDto> getAllBudgets();

    BudgetResponseDto updateBudget(Long id, BudgetUpdateRequestDto requestDto);

    void deleteBudget(Long id);
}
