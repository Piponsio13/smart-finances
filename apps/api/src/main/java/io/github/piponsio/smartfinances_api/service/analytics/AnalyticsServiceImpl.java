package io.github.piponsio.smartfinances_api.service.analytics;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import io.github.piponsio.smartfinances_api.dto.response.CategoryForecastDto;
import io.github.piponsio.smartfinances_api.dto.response.CategoryTrendDto;
import io.github.piponsio.smartfinances_api.dto.response.ForecastResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.MonthDataPointDto;
import io.github.piponsio.smartfinances_api.dto.response.MonthlyTrendDto;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.TransactionType;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final AuthUser authUser;

    @Override
    public List<MonthlyTrendDto> getMonthlyTrends(int months) {
        User user = authUser.getAuthenticatedUser();
        LocalDateTime firstOfCurrent = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<MonthlyTrendDto> trends = new ArrayList<>();
        BigDecimal previousIncome = null;
        BigDecimal previousExpenses = null;

        for (int i = months - 1; i >= 0; i--) {
            LocalDateTime start = firstOfCurrent.minusMonths(i);
            LocalDateTime end = start.plusMonths(1);

            List<Transaction> txs = transactionRepository.findByUserIdAndDateBetween(user.getId(), start, end);

            BigDecimal income = txs.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expenses = txs.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            MonthlyTrendDto dto = new MonthlyTrendDto();
            dto.setMonth(start.getMonthValue());
            dto.setYear(start.getYear());
            dto.setTotalIncome(income);
            dto.setTotalExpenses(expenses);
            dto.setBalance(income.subtract(expenses));
            dto.setTransactionCount(txs.size());

            if (previousIncome != null && previousIncome.compareTo(BigDecimal.ZERO) != 0) {
                dto.setIncomeChangePercent(
                        income.subtract(previousIncome)
                                .divide(previousIncome, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(2, RoundingMode.HALF_UP));
            }

            if (previousExpenses != null && previousExpenses.compareTo(BigDecimal.ZERO) != 0) {
                dto.setExpenseChangePercent(
                        expenses.subtract(previousExpenses)
                                .divide(previousExpenses, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .setScale(2, RoundingMode.HALF_UP));
            }

            previousIncome = income;
            previousExpenses = expenses;
            trends.add(dto);
        }

        return trends;
    }

    @Override
    public List<CategoryTrendDto> getCategoryTrends(int months) {
        User user = authUser.getAuthenticatedUser();
        LocalDateTime firstOfCurrent = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime rangeStart = firstOfCurrent.minusMonths(months - 1);
        LocalDateTime rangeEnd = firstOfCurrent.plusMonths(1);

        List<Transaction> all = transactionRepository.findByUserIdAndDateBetween(user.getId(), rangeStart, rangeEnd);
        List<MonthDataPointDto> monthKeys = buildMonthKeys(rangeStart, months);

        Map<String, Map<String, BigDecimal>> categoryMonthTotals = new LinkedHashMap<>();

        for (Transaction t : all) {
            if (t.getType() != TransactionType.EXPENSE) continue;
            String category = t.getCategory().getName();
            String key = t.getDate().getYear() + "-" + t.getDate().getMonthValue();
            categoryMonthTotals
                    .computeIfAbsent(category, k -> new LinkedHashMap<>())
                    .merge(key, t.getAmount(), BigDecimal::add);
        }

        return categoryMonthTotals.entrySet().stream()
                .map(entry -> {
                    List<MonthDataPointDto> data = monthKeys.stream()
                            .map(mk -> {
                                String key = mk.getYear() + "-" + mk.getMonth();
                                MonthDataPointDto point = new MonthDataPointDto();
                                point.setMonth(mk.getMonth());
                                point.setYear(mk.getYear());
                                point.setTotal(entry.getValue().getOrDefault(key, BigDecimal.ZERO));
                                return point;
                            })
                            .toList();

                    BigDecimal total = entry.getValue().values().stream()
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    CategoryTrendDto dto = new CategoryTrendDto();
                    dto.setCategoryName(entry.getKey());
                    dto.setTotal(total);
                    dto.setData(data);
                    return dto;
                })
                .sorted(Comparator.comparing(CategoryTrendDto::getTotal).reversed())
                .toList();
    }

    @Override
    public ForecastResponseDto getForecast(int months) {
        User user = authUser.getAuthenticatedUser();
        LocalDateTime firstOfCurrent = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);

        List<BigDecimal> incomes = new ArrayList<>();
        List<BigDecimal> expenses = new ArrayList<>();
        List<Map<String, BigDecimal>> categoryPerMonth = new ArrayList<>();

        for (int i = months; i >= 1; i--) {
            LocalDateTime start = firstOfCurrent.minusMonths(i);
            LocalDateTime end = start.plusMonths(1);
            List<Transaction> txs = transactionRepository.findByUserIdAndDateBetween(user.getId(), start, end);

            BigDecimal income = txs.stream()
                    .filter(t -> t.getType() == TransactionType.INCOME)
                    .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal expense = txs.stream()
                    .filter(t -> t.getType() == TransactionType.EXPENSE)
                    .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

            incomes.add(income);
            expenses.add(expense);

            Map<String, BigDecimal> catTotals = new LinkedHashMap<>();
            for (Transaction t : txs) {
                if (t.getType() != TransactionType.EXPENSE) continue;
                String cat = t.getCategory().getName();
                catTotals.merge(cat, t.getAmount(), BigDecimal::add);
            }
            categoryPerMonth.add(catTotals);
        }

        BigDecimal totalWeight = BigDecimal.valueOf((long) months * (months + 1) / 2);
        BigDecimal projectedIncome = weightedAverage(incomes, totalWeight);
        BigDecimal projectedExpenses = weightedAverage(expenses, totalWeight);

        Map<String, List<BigDecimal>> categoryAmounts = new LinkedHashMap<>();
        for (Map<String, BigDecimal> monthMap : categoryPerMonth) {
            monthMap.forEach((cat, amt) ->
                    categoryAmounts.computeIfAbsent(cat, k -> new ArrayList<>()).add(amt));
        }

        List<CategoryForecastDto> categoryForecasts = categoryAmounts.entrySet().stream()
                .map(e -> {
                    List<BigDecimal> vals = new ArrayList<>(e.getValue());
                    while (vals.size() < months) vals.add(0, BigDecimal.ZERO);
                    CategoryForecastDto cf = new CategoryForecastDto();
                    cf.setCategoryName(e.getKey());
                    cf.setProjectedAmount(weightedAverage(vals, totalWeight));
                    return cf;
                })
                .sorted(Comparator.comparing(CategoryForecastDto::getProjectedAmount).reversed())
                .toList();

        LocalDateTime nextMonth = firstOfCurrent.plusMonths(1);
        ForecastResponseDto dto = new ForecastResponseDto();
        dto.setForecastMonth(nextMonth.getMonthValue());
        dto.setForecastYear(nextMonth.getYear());
        dto.setProjectedIncome(projectedIncome);
        dto.setProjectedExpenses(projectedExpenses);
        dto.setProjectedBalance(projectedIncome.subtract(projectedExpenses));
        dto.setBasedOnMonths(months);
        dto.setCategoryForecasts(categoryForecasts);
        return dto;
    }

    private BigDecimal weightedAverage(List<BigDecimal> values, BigDecimal totalWeight) {
        if (totalWeight.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        BigDecimal sum = BigDecimal.ZERO;
        for (int i = 0; i < values.size(); i++) {
            sum = sum.add(values.get(i).multiply(BigDecimal.valueOf(i + 1)));
        }
        return sum.divide(totalWeight, 2, RoundingMode.HALF_UP);
    }

    private List<MonthDataPointDto> buildMonthKeys(LocalDateTime start, int months) {
        List<MonthDataPointDto> keys = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            LocalDateTime m = start.plusMonths(i);
            MonthDataPointDto dto = new MonthDataPointDto();
            dto.setMonth(m.getMonthValue());
            dto.setYear(m.getYear());
            keys.add(dto);
        }
        return keys;
    }
}
