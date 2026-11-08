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

import io.github.piponsio.smartfinances_api.dto.request.RecurringTransactionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.RecurringTransactionUpdateRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.RecurringTransactionResponseDto;
import io.github.piponsio.smartfinances_api.service.recurring.RecurringTransactionService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;

    @PostMapping
    public ResponseEntity<CustomResponse<RecurringTransactionResponseDto>> create(
            @Valid @RequestBody RecurringTransactionRequestDto request) {
        RecurringTransactionResponseDto data = recurringService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                CustomResponse.<RecurringTransactionResponseDto>builder()
                        .data(data).message("Recurring transaction created successfully")
                        .statusCode(HttpStatus.CREATED.value()).build());
    }

    @GetMapping
    public ResponseEntity<CustomResponse<List<RecurringTransactionResponseDto>>> getAll() {
        List<RecurringTransactionResponseDto> data = recurringService.getAll();
        return ResponseEntity.ok(
                CustomResponse.<List<RecurringTransactionResponseDto>>builder()
                        .data(data).message("Recurring transactions retrieved successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomResponse<RecurringTransactionResponseDto>> getById(@PathVariable Long id) {
        RecurringTransactionResponseDto data = recurringService.getById(id);
        return ResponseEntity.ok(
                CustomResponse.<RecurringTransactionResponseDto>builder()
                        .data(data).message("Recurring transaction retrieved successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomResponse<RecurringTransactionResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody RecurringTransactionUpdateRequestDto request) {
        RecurringTransactionResponseDto data = recurringService.update(id, request);
        return ResponseEntity.ok(
                CustomResponse.<RecurringTransactionResponseDto>builder()
                        .data(data).message("Recurring transaction updated successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CustomResponse<Void>> delete(@PathVariable Long id) {
        recurringService.delete(id);
        return ResponseEntity.ok(
                CustomResponse.<Void>builder()
                        .data(null).message("Recurring transaction deleted successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }
}
