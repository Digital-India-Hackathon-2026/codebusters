package com.lungguard.service;

import com.lungguard.dto.SimulationRequest;
import com.lungguard.dto.SimulationResponse;
import com.lungguard.model.SimulationResult;
import com.lungguard.model.User;
import com.lungguard.repository.SimulationResultRepository;
import com.lungguard.repository.UserRepository;
import org.jetbrains.annotations.Contract;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SimulationService {

    private final SimulationResultRepository simulationResultRepository;
    private final UserRepository userRepository;

    public SimulationService(SimulationResultRepository simulationResultRepository, UserRepository userRepository) {
        this.simulationResultRepository = simulationResultRepository;
        this.userRepository = userRepository;
    }

    public SimulationResponse simulateHealthImpact(SimulationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int lungCapacity5 = calculateLungCapacity(request, 5);
        int lungCapacity10 = calculateLungCapacity(request, 10);

        int copdRisk5 = calculateCopdRisk(request, 5);
        int copdRisk10 = calculateCopdRisk(request, 10);

        int cancerRisk5 = calculateCancerRisk(request, 5);
        int cancerRisk10 = calculateCancerRisk(request, 10);

        double moneyBurned = calculateMoneyBurned(request);

        String recommendation = getRecommendation(lungCapacity10, copdRisk10, cancerRisk10);

        SimulationResult result = new SimulationResult();

        result.setAge(request.getAge());
        result.setCigarettesPerDay(request.getCigarettesPerDay());
        result.setSmokingYears(request.getSmokingYears());
        result.setAlcoholFrequency(request.getAlcoholFrequency());

        result.setLungCapacityAfter5Years(lungCapacity5);
        result.setCopdRiskAfter5Years(copdRisk5);
        result.setCancerRiskAfter5Years(cancerRisk5);

        result.setLungCapacityAfter10Years(lungCapacity10);
        result.setCopdRiskAfter10Years(copdRisk10);
        result.setCancerRiskAfter10Years(cancerRisk10);

        result.setMoneyBurned(moneyBurned);
        result.setRecommendation(recommendation);
        result.setCreatedAt(LocalDateTime.now());
        result.setUser(user); // Associate simulation with the authenticated user

        simulationResultRepository.save(result);

        return SimulationResponse.builder()
                .lungCapacityAfter5Years(lungCapacity5)
                .copdRiskAfter5Years(copdRisk5)
                .cancerRiskAfter5Years(cancerRisk5)
                .lungCapacityAfter10Years(lungCapacity10)
                .copdRiskAfter10Years(copdRisk10)
                .cancerRiskAfter10Years(cancerRisk10)
                .moneyBurned(moneyBurned)
                .recommendation(recommendation)
                .build();
    }

    private int calculateLungCapacity(SimulationRequest request, int futureYears) {
        int score = 100;

        score -= request.getCigarettesPerDay() * futureYears;
        score -= request.getSmokingYears() * 2;

        return Math.max(score, 30);
    }

    private int calculateCopdRisk(SimulationRequest request, int futureYears) {
        int score = 0;

        score += request.getCigarettesPerDay() * 2;
        score += request.getSmokingYears() * 3;
        score += futureYears * 2;

        return Math.min(score, 100);
    }

    private int calculateCancerRisk(SimulationRequest request, int futureYears) {
        int score = 0;

        score += request.getCigarettesPerDay();
        score += request.getSmokingYears() * 2;
        score += futureYears * 2;

        return Math.min(score, 100);
    }

    private double calculateMoneyBurned(SimulationRequest request) {
        int cigarettePrice = 20;

        return request.getCigarettesPerDay()
                * cigarettePrice
                * 365.0
                * request.getSmokingYears();
    }

    @Contract(pure = true)
    private @NonNull String getRecommendation(int lungCapacity10, int copdRisk10, int cancerRisk10) {

        if (lungCapacity10 < 50 || copdRisk10 > 70 || cancerRisk10 > 60) {
            return "High future health risk detected. Please reduce smoking/alcohol and consult a doctor.";
        }

        if (lungCapacity10 < 70 || copdRisk10 > 40 || cancerRisk10 > 30) {
            return "Moderate risk detected. Try to reduce smoking and monitor your health regularly.";
        }

        return "Risk is currently low, but avoiding smoking and alcohol is strongly recommended.";
    }

    public List<SimulationResult> getSimulationHistory(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return simulationResultRepository.findByUserOrderByCreatedAtDesc(user);
    }
}