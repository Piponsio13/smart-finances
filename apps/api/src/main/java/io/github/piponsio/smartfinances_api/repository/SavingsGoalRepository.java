package io.github.piponsio.smartfinances_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.piponsio.smartfinances_api.entity.SavingsGoal;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
    List<SavingsGoal> findByUserId(Long userId);
    Optional<SavingsGoal> findByIdAndUserId(Long id, Long userId);
}
