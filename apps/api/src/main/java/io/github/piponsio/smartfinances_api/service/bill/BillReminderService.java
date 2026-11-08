package io.github.piponsio.smartfinances_api.service.bill;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.request.BillReminderRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.BillReminderResponseDto;

public interface BillReminderService {
    BillReminderResponseDto create(BillReminderRequestDto request);
    List<BillReminderResponseDto> getAll();
    BillReminderResponseDto update(Long id, BillReminderRequestDto request);
    void delete(Long id);
}
