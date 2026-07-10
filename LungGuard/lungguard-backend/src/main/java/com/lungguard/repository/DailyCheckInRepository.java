package com.lungguard.repository;

import com.lungguard.model.DailyCheckIn;
import com.lungguard.model.RecoveryTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyCheckInRepository extends JpaRepository<DailyCheckIn, Long> {
    Optional<DailyCheckIn> findByTrackerAndCheckInDate(RecoveryTracker tracker, LocalDate date);
    List<DailyCheckIn> findByTrackerOrderByCheckInDateAsc(RecoveryTracker tracker);
    List<DailyCheckIn> findByTrackerAndCheckInDateBetweenOrderByCheckInDateAsc(RecoveryTracker tracker, LocalDate startDate, LocalDate endDate);
}
