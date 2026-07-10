package com.lungguard.service;

import com.lungguard.dto.DashboardResponse;
import com.lungguard.model.RiskAssessment;
import com.lungguard.model.User;
import com.lungguard.repository.RiskAssessmentRepository;
import com.lungguard.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DashboardService {

    private final RiskAssessmentRepository riskAssessmentRepository;
    private final UserRepository userRepository;

    public DashboardService(RiskAssessmentRepository riskAssessmentRepository, UserRepository userRepository) {
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.userRepository = userRepository;
    }

    public DashboardResponse getDashboardData() {
        // Retrieve the authenticated user's email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Retrieve latest assessment for the authenticated user
        Optional<RiskAssessment> latestAssessment =
                riskAssessmentRepository.findTopByUserOrderByCreatedAtDesc(user);

        if (latestAssessment.isEmpty()) {
            return DashboardResponse.builder()
                    .latestLungRiskScore(0)
                    .latestLiverRiskScore(0)
                    .latestRiskCategory("NO DATA")
                    .latestRecommendation("No assessments available. Please run your first health assessment!")
                    .totalAssessments(0L)
                    .build();
        }
        
        RiskAssessment assessment = latestAssessment.get();
        Long totalAssessments = riskAssessmentRepository.countByUser(user);

        return DashboardResponse.builder()
                .latestLungRiskScore(assessment.getLungRiskScore())
                .latestLiverRiskScore(assessment.getLiverRiskScore())
                .latestRiskCategory(assessment.getRiskCategory())
                .latestRecommendation(assessment.getRecommendation())
                .totalAssessments(totalAssessments)
                .build();
    }
}