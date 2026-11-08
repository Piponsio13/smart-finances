package io.github.piponsio.smartfinances_api.service.budget;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.piponsio.smartfinances_api.dto.request.BudgetRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.BudgetUpdateRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.BudgetResponseDto;
import io.github.piponsio.smartfinances_api.entity.Budget;
import io.github.piponsio.smartfinances_api.entity.Category;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import io.github.piponsio.smartfinances_api.exception.ResourceNotFoundException;
import io.github.piponsio.smartfinances_api.repository.BudgetRepository;
import io.github.piponsio.smartfinances_api.repository.CategoryRepository;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final AuthUser authUser;

    @Override
    @Transactional
    public BudgetResponseDto createBudget(BudgetRequestDto requestDto) {
        User user = authUser.getAuthenticatedUser();

        Category category = categoryRepository.findByIdAndUserId(requestDto.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), requestDto.getCategoryId(), requestDto.getMonth(), requestDto.getYear()
        ).ifPresent(b -> {
            throw new IllegalStateException("A budget already exists for this category and period");
        });

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setCategory(category);
        budget.setMonthlyLimit(requestDto.getMonthlyLimit());
        budget.setMonth(requestDto.getMonth());
        budget.setYear(requestDto.getYear());
        budgetRepository.save(budget);

        return mapToResponseDto(budget);
    }

    @Override
    public List<BudgetResponseDto> getAllBudgets() {
        User user = authUser.getAuthenticatedUser();
        return budgetRepository.findByUserId(user.getId()).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public BudgetResponseDto updateBudget(Long id, BudgetUpdateRequestDto requestDto) {
        User user = authUser.getAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budget.setMonthlyLimit(requestDto.getMonthlyLimit());
        budgetRepository.save(budget);
        return mapToResponseDto(budget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        User user = authUser.getAuthenticatedUser();
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponseDto mapToResponseDto(Budget budget) {
        LocalDateTime start = LocalDateTime.of(budget.getYear(), budget.getMonth(), 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndDateBetween(budget.getUser().getId(), start, end);

        BigDecimal actualSpending = transactions.stream()
                .filter(t -> t.getCategory().getId().equals(budget.getCategory().getId())
                        && t.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = budget.getMonthlyLimit().subtract(actualSpending);

        BudgetResponseDto dto = new BudgetResponseDto();
        dto.setId(budget.getId());
        dto.setCategoryName(budget.getCategory().getName());
        dto.setMonthlyLimit(budget.getMonthlyLimit());
        dto.setActualSpending(actualSpending);
        dto.setRemaining(remaining);
        dto.setExceeded(remaining.compareTo(BigDecimal.ZERO) < 0);
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        return dto;
    }
}
