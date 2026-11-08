package io.github.piponsio.smartfinances_api.service.recurring;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.request.RecurringTransactionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.RecurringTransactionUpdateRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.RecurringTransactionResponseDto;

public interface RecurringTransactionService {
    RecurringTransactionResponseDto create(RecurringTransactionRequestDto request);
    List<RecurringTransactionResponseDto> getAll();
    RecurringTransactionResponseDto getById(Long id);
    RecurringTransactionResponseDto update(Long id, RecurringTransactionUpdateRequestDto request);
    void delete(Long id);
    void generateDueTransactions();
}
