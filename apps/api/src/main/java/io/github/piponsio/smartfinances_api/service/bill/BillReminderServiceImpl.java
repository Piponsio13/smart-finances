package io.github.piponsio.smartfinances_api.service.bill;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.piponsio.smartfinances_api.dto.request.BillReminderRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.BillReminderResponseDto;
import io.github.piponsio.smartfinances_api.entity.BillReminder;
import io.github.piponsio.smartfinances_api.entity.Category;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.exception.ResourceNotFoundException;
import io.github.piponsio.smartfinances_api.repository.BillReminderRepository;
import io.github.piponsio.smartfinances_api.repository.CategoryRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BillReminderServiceImpl implements BillReminderService {

    private final BillReminderRepository billRepository;
    private final CategoryRepository categoryRepository;
    private final AuthUser authUser;

    @Override
    @Transactional
    public BillReminderResponseDto create(BillReminderRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        BillReminder bill = new BillReminder();
        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setDueDay(request.getDueDay());
        bill.setActive(request.getActive() != null ? request.getActive() : true);
        bill.setUser(user);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            bill.setCategory(category);
        }

        return toDto(billRepository.save(bill));
    }

    @Override
    public List<BillReminderResponseDto> getAll() {
        User user = authUser.getAuthenticatedUser();
        return billRepository.findByUserId(user.getId()).stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public BillReminderResponseDto update(Long id, BillReminderRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        BillReminder bill = billRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill reminder not found"));

        bill.setName(request.getName());
        bill.setAmount(request.getAmount());
        bill.setDueDay(request.getDueDay());
        bill.setActive(request.getActive() != null ? request.getActive() : bill.isActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            bill.setCategory(category);
        } else {
            bill.setCategory(null);
        }

        return toDto(billRepository.save(bill));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = authUser.getAuthenticatedUser();
        BillReminder bill = billRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill reminder not found"));
        billRepository.delete(bill);
    }

    private BillReminderResponseDto toDto(BillReminder bill) {
        BillReminderResponseDto dto = new BillReminderResponseDto();
        dto.setId(bill.getId());
        dto.setName(bill.getName());
        dto.setAmount(bill.getAmount());
        dto.setDueDay(bill.getDueDay());
        dto.setActive(bill.isActive());
        dto.setCategoryName(bill.getCategory() != null ? bill.getCategory().getName() : null);

        LocalDate today = LocalDate.now();
        int lastDay = today.lengthOfMonth();
        int effectiveDueDay = Math.min(bill.getDueDay(), lastDay);
        LocalDate dueDate = today.withDayOfMonth(effectiveDueDay);
        long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);

        dto.setDaysUntilDue(daysUntilDue);
        if (daysUntilDue < 0) {
            dto.setStatus("OVERDUE");
        } else if (daysUntilDue == 0) {
            dto.setStatus("DUE_TODAY");
        } else if (daysUntilDue <= 3) {
            dto.setStatus("DUE_SOON");
        } else {
            dto.setStatus("UPCOMING");
        }

        return dto;
    }
}
