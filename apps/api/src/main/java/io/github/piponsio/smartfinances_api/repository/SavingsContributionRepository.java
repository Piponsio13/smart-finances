package io.github.piponsio.smartfinances_api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.piponsio.smartfinances_api.entity.SavingsContribution;

public interface SavingsContributionRepository extends JpaRepository<SavingsContribution, Long> {
    List<SavingsContribution> findByGoalIdOrderByDateDesc(Long goalId);
}
