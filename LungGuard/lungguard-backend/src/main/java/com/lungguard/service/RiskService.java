package com.lungguard.service;

import com.lungguard.dto.RiskRequest;
import com.lungguard.dto.RiskResponse;
import com.lungguard.model.RiskAssessment;
import com.lungguard.model.User;
import com.lungguard.repository.RiskAssessmentRepository;
import com.lungguard.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class RiskService {

    private final RiskAssessmentRepository riskAssessmentRepository;
    private final UserRepository userRepository;
    private final AiClientService aiClientService;

    public RiskService(RiskAssessmentRepository riskAssessmentRepository,
                       UserRepository userRepository,
                       AiClientService aiClientService) {
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.userRepository = userRepository;
        this.aiClientService = aiClientService;
    }

    public RiskResponse calculateRisk(RiskRequest request) {
        // Get currently authenticated user's email
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RiskResponse aiResponse = aiClientService.predictRisk(request);

        RiskAssessment assessment = new RiskAssessment();

        assessment.setAge(request.getAge());
        assessment.setGender(request.getGender());
        assessment.setWeight(request.getWeight());
        assessment.setCigarettesPerDay(request.getCigarettesPerDay());
        assessment.setSmokingYears(request.getSmokingYears());
        assessment.setAlcoholFrequency(request.getAlcoholFrequency());
        assessment.setHasCough(request.isHasCough());
        assessment.setHasChestPain(request.isHasChestPain());
        assessment.setHasBreathlessness(request.isHasBreathlessness());

        assessment.setLungRiskScore(aiResponse.getLungRiskScore());
        assessment.setLiverRiskScore(aiResponse.getLiverRiskScore());
        assessment.setRiskCategory(aiResponse.getRiskCategory());
        assessment.setRecommendation(aiResponse.getRecommendation());
        assessment.setCreatedAt(LocalDateTime.now());
        assessment.setUser(user); // Set the association

        riskAssessmentRepository.save(assessment);

        return aiResponse;
    }
}