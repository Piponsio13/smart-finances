package io.github.piponsio.smartfinances_api.service.recurring;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class RecurringTransactionScheduler {

    private final RecurringTransactionService recurringTransactionService;

    // Spring's cron trigger doesn't catch up on runs missed while the app was down
    // (e.g. local Docker not running at midnight), so also run once at startup.
    @EventListener(ApplicationReadyEvent.class)
    public void generateOnStartup() {
        recurringTransactionService.generateDueTransactions();
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyTransactions() {
        recurringTransactionService.generateDueTransactions();
    }
}
