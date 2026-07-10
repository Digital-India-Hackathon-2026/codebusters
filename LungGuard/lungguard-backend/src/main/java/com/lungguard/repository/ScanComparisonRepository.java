package com.lungguard.repository;

import com.lungguard.model.ScanComparison;
import com.lungguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanComparisonRepository extends JpaRepository<ScanComparison, Long> {
    List<ScanComparison> findByUserOrderByCreatedAtDesc(User user);
}
