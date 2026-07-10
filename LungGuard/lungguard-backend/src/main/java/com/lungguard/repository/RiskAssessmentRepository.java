package com.lungguard.repository;

import com.lungguard.model.RiskAssessment;
import com.lungguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    Optional<RiskAssessment> findTopByUserOrderByCreatedAtDesc(User user);
    Long countByUser(User user);
    List<RiskAssessment> findByUserOrderByCreatedAtDesc(User user);
}