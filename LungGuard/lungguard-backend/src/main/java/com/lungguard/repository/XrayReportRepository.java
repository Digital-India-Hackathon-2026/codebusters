package com.lungguard.repository;

import com.lungguard.model.XrayReport;
import com.lungguard.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface XrayReportRepository extends JpaRepository<XrayReport, Long> {
    List<XrayReport> findByUserOrderByUploadedAtDesc(User user);
}