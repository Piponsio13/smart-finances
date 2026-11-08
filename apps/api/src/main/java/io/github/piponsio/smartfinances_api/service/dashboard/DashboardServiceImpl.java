package io.github.piponsio.smartfinances_api.service.dashboard;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import io.github.piponsio.smartfinances_api.dto.response.CategoryBreakdownDto;
import io.github.piponsio.smartfinances_api.dto.response.DashboardResponseDto;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final AuthUser authUser;

    @Override
    public DashboardResponseDto getDashboard() {
        User user = authUser.getAuthenticatedUser();
        LocalDate today = LocalDate.now();

        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        List<Transaction> transactions = transactionRepository
                .findByUserIdAndDateBetween(user.getId(), start, end);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;
        Map<String, BigDecimal> expensesByCategory = new LinkedHashMap<>();

        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpenses = totalExpenses.add(t.getAmount());
                expensesByCategory.merge(t.getCategory().getName(), t.getAmount(), BigDecimal::add);
            }
        }

        final BigDecimal expensesTotal = totalExpenses;
        List<CategoryBreakdownDto> breakdown = expensesByCategory.entrySet().stream()
                .map(e -> {
                    CategoryBreakdownDto dto = new CategoryBreakdownDto();
                    dto.setCategoryName(e.getKey());
                    dto.setTotal(e.getValue());
                    double pct = expensesTotal.compareTo(BigDecimal.ZERO) == 0 ? 0.0
                            : e.getValue().divide(expensesTotal, 4, RoundingMode.HALF_UP).doubleValue() * 100;
                    dto.setPercentage(Math.round(pct * 100.0) / 100.0);
                    return dto;
                })
                .sorted(Comparator.comparing(CategoryBreakdownDto::getTotal).reversed())
                .toList();

        DashboardResponseDto dashboard = new DashboardResponseDto();
        dashboard.setMonth(today.getMonthValue());
        dashboard.setYear(today.getYear());
        dashboard.setTotalIncome(totalIncome);
        dashboard.setTotalExpenses(totalExpenses);
        dashboard.setBalance(totalIncome.subtract(totalExpenses));
        dashboard.setTransactionCount(transactions.size());
        dashboard.setSpendingByCategory(breakdown);

        return dashboard;
    }
}
