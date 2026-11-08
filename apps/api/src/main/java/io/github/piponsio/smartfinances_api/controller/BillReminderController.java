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

import io.github.piponsio.smartfinances_api.dto.request.BillReminderRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.BillReminderResponseDto;
import io.github.piponsio.smartfinances_api.service.bill.BillReminderService;
import io.github.piponsio.smartfinances_api.utils.CustomResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillReminderController {

    private final BillReminderService billReminderService;

    @PostMapping
    public ResponseEntity<CustomResponse<BillReminderResponseDto>> create(
            @Valid @RequestBody BillReminderRequestDto request) {
        BillReminderResponseDto data = billReminderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                CustomResponse.<BillReminderResponseDto>builder()
                        .data(data).message("Bill reminder created successfully")
                        .statusCode(HttpStatus.CREATED.value()).build());
    }

    @GetMapping
    public ResponseEntity<CustomResponse<List<BillReminderResponseDto>>> getAll() {
        List<BillReminderResponseDto> data = billReminderService.getAll();
        return ResponseEntity.ok(
                CustomResponse.<List<BillReminderResponseDto>>builder()
                        .data(data).message("Bill reminders retrieved successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomResponse<BillReminderResponseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody BillReminderRequestDto request) {
        BillReminderResponseDto data = billReminderService.update(id, request);
        return ResponseEntity.ok(
                CustomResponse.<BillReminderResponseDto>builder()
                        .data(data).message("Bill reminder updated successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<CustomResponse<Void>> delete(@PathVariable Long id) {
        billReminderService.delete(id);
        return ResponseEntity.ok(
                CustomResponse.<Void>builder()
                        .data(null).message("Bill reminder deleted successfully")
                        .statusCode(HttpStatus.OK.value()).build());
    }
}
