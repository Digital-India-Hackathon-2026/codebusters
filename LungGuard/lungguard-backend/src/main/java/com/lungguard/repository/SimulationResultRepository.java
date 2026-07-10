package com.lungguard.repository;

import com.lungguard.model.SimulationResult;
import com.lungguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {
    List<SimulationResult> findByUserOrderByCreatedAtDesc(User user);
}