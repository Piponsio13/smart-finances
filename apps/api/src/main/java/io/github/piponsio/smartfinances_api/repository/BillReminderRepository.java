package io.github.piponsio.smartfinances_api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.piponsio.smartfinances_api.entity.BillReminder;

public interface BillReminderRepository extends JpaRepository<BillReminder, Long> {
    List<BillReminder> findByUserId(Long userId);
    Optional<BillReminder> findByIdAndUserId(Long id, Long userId);
}
