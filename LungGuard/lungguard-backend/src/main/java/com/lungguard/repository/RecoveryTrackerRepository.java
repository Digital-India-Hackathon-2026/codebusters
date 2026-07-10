package com.lungguard.repository;

import com.lungguard.model.RecoveryTracker;
import com.lungguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RecoveryTrackerRepository extends JpaRepository<RecoveryTracker, Long> {
    Optional<RecoveryTracker> findByUser(User user);
}
