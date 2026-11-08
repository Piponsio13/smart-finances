package io.github.piponsio.smartfinances_api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;

import io.github.piponsio.smartfinances_api.entity.RecurringTransaction;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.enums.RecurrenceFrequency;
import io.github.piponsio.smartfinances_api.repository.RecurringTransactionRepository;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import io.github.piponsio.smartfinances_api.service.recurring.RecurringTransactionServiceImpl;

class RecurringCatchUpTest {

    @Test
    void generatesEveryOverdueOccurrenceOnlyOnceAcrossRuns() {
        LocalDate today = LocalDate.now();
        RecurringTransaction recurring = new RecurringTransaction();
        recurring.setNextDueDate(today.minusDays(2));
        recurring.setFrequency(RecurrenceFrequency.DAILY);

        var recurringRepo = mock(RecurringTransactionRepository.class);
        var transactionRepo = mock(TransactionRepository.class);
        var generated = new ArrayList<LocalDate>();
        when(recurringRepo.findByActiveTrueAndNextDueDateLessThanEqual(any(LocalDate.class)))
                .thenAnswer(call -> recurring.getNextDueDate().isAfter(call.getArgument(0, LocalDate.class))
                        ? List.of() : List.of(recurring));
        when(transactionRepo.save(any(Transaction.class))).thenAnswer(call -> {
            Transaction transaction = call.getArgument(0);
            generated.add(transaction.getDate().toLocalDate());
            return transaction;
        });

        var service = new RecurringTransactionServiceImpl(recurringRepo, transactionRepo, null, null);
        service.generateDueTransactions();
        service.generateDueTransactions();

        assertThat(generated).containsExactly(today.minusDays(2), today.minusDays(1), today);
        assertThat(recurring.getNextDueDate()).isEqualTo(today.plusDays(1));
    }
}
