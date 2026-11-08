package io.github.piponsio.smartfinances_api.service.savings;

import java.util.List;

import io.github.piponsio.smartfinances_api.dto.request.SavingsContributionRequestDto;
import io.github.piponsio.smartfinances_api.dto.request.SavingsGoalRequestDto;
import io.github.piponsio.smartfinances_api.dto.response.SavingsContributionResponseDto;
import io.github.piponsio.smartfinances_api.dto.response.SavingsGoalResponseDto;

public interface SavingsGoalService {
    SavingsGoalResponseDto create(SavingsGoalRequestDto request);
    List<SavingsGoalResponseDto> getAll();
    SavingsGoalResponseDto getById(Long id);
    SavingsGoalResponseDto update(Long id, SavingsGoalRequestDto request);
    void delete(Long id);
    SavingsContributionResponseDto addContribution(Long goalId, SavingsContributionRequestDto request);
    List<SavingsContributionResponseDto> getContributions(Long goalId);
}
