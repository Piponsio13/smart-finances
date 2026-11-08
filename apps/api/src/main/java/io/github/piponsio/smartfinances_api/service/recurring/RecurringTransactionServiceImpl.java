package io.github.piponsio.smartfinances_api.service.recurring;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.piponsio.smartfinances_api.dto.request.RecurringTransactionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.RecurringTransactionUpdateRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.RecurringTransactionResponseDto;
import io.github.piponsio.smartfinances_api.entity.Category;
import io.github.piponsio.smartfinances_api.entity.RecurringTransaction;
import io.github.piponsio.smartfinances_api.entity.Transaction;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.enums.RecurrenceFrequency;
import io.github.piponsio.smartfinances_api.exception.ResourceNotFoundException;
import io.github.piponsio.smartfinances_api.repository.CategoryRepository;
import io.github.piponsio.smartfinances_api.repository.RecurringTransactionRepository;
import io.github.piponsio.smartfinances_api.repository.TransactionRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringTransactionServiceImpl implements RecurringTransactionService {

    private final RecurringTransactionRepository recurringRepo;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final AuthUser authUser;

    @Override
    @Transactional
    public RecurringTransactionResponseDto create(RecurringTransactionRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        LocalDate today = LocalDate.now();
        LocalDate nextDueDate = request.getStartDate();
        while (nextDueDate.isBefore(today)) {
            nextDueDate = advance(nextDueDate, request.getFrequency());
        }

        RecurringTransaction rt = new RecurringTransaction();
        rt.setAmount(request.getAmount());
        rt.setDescription(request.getDescription());
        rt.setType(request.getType());
        rt.setFrequency(request.getFrequency());
        rt.setStartDate(request.getStartDate());
        rt.setNextDueDate(nextDueDate);
        rt.setActive(true);
        rt.setUser(user);
        rt.setCategory(category);

        return toDto(recurringRepo.save(rt));
    }

    @Override
    public List<RecurringTransactionResponseDto> getAll() {
        User user = authUser.getAuthenticatedUser();
        return recurringRepo.findByUserId(user.getId()).stream().map(this::toDto).toList();
    }

    @Override
    public RecurringTransactionResponseDto getById(Long id) {
        User user = authUser.getAuthenticatedUser();
        return toDto(findOwned(id, user.getId()));
    }

    @Override
    @Transactional
    public RecurringTransactionResponseDto update(Long id, RecurringTransactionUpdateRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        RecurringTransaction rt = findOwned(id, user.getId());

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        rt.setAmount(request.getAmount());
        rt.setDescription(request.getDescription());
        rt.setType(request.getType());
        rt.setFrequency(request.getFrequency());
        rt.setActive(request.getActive());
        rt.setCategory(category);

        return toDto(recurringRepo.save(rt));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = authUser.getAuthenticatedUser();
        recurringRepo.delete(findOwned(id, user.getId()));
    }

    @Override
    @Transactional
    public void generateDueTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> due = recurringRepo.findByActiveTrueAndNextDueDateLessThanEqual(today);
        for (RecurringTransaction rt : due) {
            Transaction t = new Transaction();
            t.setAmount(rt.getAmount());
            t.setDescription(rt.getDescription());
            t.setType(rt.getType());
            t.setCategory(rt.getCategory());
            t.setUser(rt.getUser());
            t.setDate(rt.getNextDueDate().atTime(12, 0));
            transactionRepository.save(t);

            LocalDate next = advance(rt.getNextDueDate(), rt.getFrequency());
            while (!next.isAfter(today)) {
                next = advance(next, rt.getFrequency());
            }
            rt.setNextDueDate(next);
            recurringRepo.save(rt);
        }
    }

    private LocalDate advance(LocalDate date, RecurrenceFrequency frequency) {
        return switch (frequency) {
            case DAILY -> date.plusDays(1);
            case WEEKLY -> date.plusWeeks(1);
            case MONTHLY -> date.plusMonths(1);
            case YEARLY -> date.plusYears(1);
        };
    }

    private RecurringTransaction findOwned(Long id, Long userId) {
        return recurringRepo.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring transaction not found"));
    }

    private RecurringTransactionResponseDto toDto(RecurringTransaction rt) {
        RecurringTransactionResponseDto dto = new RecurringTransactionResponseDto();
        dto.setId(rt.getId());
        dto.setAmount(rt.getAmount());
        dto.setDescription(rt.getDescription());
        dto.setType(rt.getType());
        dto.setCategoryName(rt.getCategory().getName());
        dto.setFrequency(rt.getFrequency());
        dto.setStartDate(rt.getStartDate());
        dto.setNextDueDate(rt.getNextDueDate());
        dto.setActive(rt.isActive());
        return dto;
    }
}
