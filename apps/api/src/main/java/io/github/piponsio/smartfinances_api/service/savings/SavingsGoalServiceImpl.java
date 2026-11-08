package io.github.piponsio.smartfinances_api.service.savings;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.piponsio.smartfinances_api.dto.request.SavingsContributionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.SavingsGoalRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.SavingsContributionResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.SavingsGoalResponseDto;
import io.github.piponsio.smartfinances_api.entity.SavingsContribution;
import io.github.piponsio.smartfinances_api.entity.SavingsGoal;
import io.github.piponsio.smartfinances_api.entity.User;
import io.github.piponsio.smartfinances_api.exception.ResourceNotFoundException;
import io.github.piponsio.smartfinances_api.repository.SavingsContributionRepository;
import io.github.piponsio.smartfinances_api.repository.SavingsGoalRepository;
import io.github.piponsio.smartfinances_api.utils.AuthUser;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SavingsGoalServiceImpl implements SavingsGoalService {

    private final SavingsGoalRepository goalRepository;
    private final SavingsContributionRepository contributionRepository;
    private final AuthUser authUser;

    @Override
    @Transactional
    public SavingsGoalResponseDto create(SavingsGoalRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        SavingsGoal goal = new SavingsGoal();
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setSavedAmount(BigDecimal.ZERO);
        goal.setTargetDate(request.getTargetDate());
        goal.setCompleted(false);
        goal.setUser(user);
        return toDto(goalRepository.save(goal));
    }

    @Override
    public List<SavingsGoalResponseDto> getAll() {
        User user = authUser.getAuthenticatedUser();
        return goalRepository.findByUserId(user.getId()).stream().map(this::toDto).toList();
    }

    @Override
    public SavingsGoalResponseDto getById(Long id) {
        User user = authUser.getAuthenticatedUser();
        return toDto(findOwned(id, user.getId()));
    }

    @Override
    @Transactional
    public SavingsGoalResponseDto update(Long id, SavingsGoalRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        SavingsGoal goal = findOwned(id, user.getId());
        goal.setName(request.getName());
        goal.setTargetAmount(request.getTargetAmount());
        goal.setTargetDate(request.getTargetDate());
        return toDto(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = authUser.getAuthenticatedUser();
        goalRepository.delete(findOwned(id, user.getId()));
    }

    @Override
    @Transactional
    public SavingsContributionResponseDto addContribution(Long goalId, SavingsContributionRequestDto request) {
        User user = authUser.getAuthenticatedUser();
        SavingsGoal goal = findOwned(goalId, user.getId());

        SavingsContribution contribution = new SavingsContribution();
        contribution.setAmount(request.getAmount());
        contribution.setDate(request.getDate());
        contribution.setNote(request.getNote());
        contribution.setGoal(goal);
        contributionRepository.save(contribution);

        goal.setSavedAmount(goal.getSavedAmount().add(request.getAmount()));
        if (goal.getSavedAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompleted(true);
        }
        goalRepository.save(goal);

        return toContributionDto(contribution);
    }

    @Override
    public List<SavingsContributionResponseDto> getContributions(Long goalId) {
        User user = authUser.getAuthenticatedUser();
        findOwned(goalId, user.getId());
        return contributionRepository.findByGoalIdOrderByDateDesc(goalId)
                .stream().map(this::toContributionDto).toList();
    }

    private SavingsGoal findOwned(Long id, Long userId) {
        return goalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found"));
    }

    private SavingsGoalResponseDto toDto(SavingsGoal goal) {
        SavingsGoalResponseDto dto = new SavingsGoalResponseDto();
        dto.setId(goal.getId());
        dto.setName(goal.getName());
        dto.setTargetAmount(goal.getTargetAmount());
        dto.setSavedAmount(goal.getSavedAmount());
        dto.setRemaining(goal.getTargetAmount().subtract(goal.getSavedAmount()).max(BigDecimal.ZERO));
        dto.setCompleted(goal.isCompleted());
        dto.setTargetDate(goal.getTargetDate());

        if (goal.getTargetAmount().compareTo(BigDecimal.ZERO) > 0) {
            dto.setProgressPercent(
                    goal.getSavedAmount()
                            .divide(goal.getTargetAmount(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .min(BigDecimal.valueOf(100))
                            .setScale(2, RoundingMode.HALF_UP));
        } else {
            dto.setProgressPercent(BigDecimal.ZERO);
        }

        if (goal.getTargetDate() != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
            dto.setDaysRemaining(days);
        }

        return dto;
    }

    private SavingsContributionResponseDto toContributionDto(SavingsContribution c) {
        SavingsContributionResponseDto dto = new SavingsContributionResponseDto();
        dto.setId(c.getId());
        dto.setAmount(c.getAmount());
        dto.setDate(c.getDate());
        dto.setNote(c.getNote());
        return dto;
    }
}
