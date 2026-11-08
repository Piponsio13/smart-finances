package io.github.piponsio.smartfinances_api.service.transaction;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.request.TransactionFilterDto;
import io.github.piponsio.smartfinances_api.dto.request.TransactionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.TransactionSummaryRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.CategorySuggestionDto;
import io.github.piponsio.smartfinances_api.dto.response.TransactionResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.TransactionSummaryDto;
import io.github.piponsio.smartfinances_api.enums.TransactionType;

public interface TransactionService {
    void createTransaction(TransactionRequestDto request);

    CategorySuggestionDto suggestCategory(String description, TransactionType type);

    List<TransactionResponseDto> getAllTransactions(TransactionFilterDto filterDto);

    TransactionResponseDto getTransaction(Long id);

    void updateTransaction(Long id, TransactionRequestDto request);

    void deleteTransaction(Long id);

    TransactionSummaryDto getSummary(TransactionSummaryRequestDto requestDto);

    String exportToCsv(TransactionFilterDto filterDto);

    byte[] exportToPdf(TransactionFilterDto filterDto);
}
