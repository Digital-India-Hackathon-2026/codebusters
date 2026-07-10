package com.lungguard.service;

import com.lungguard.dto.TimelineResponse;
import com.lungguard.dto.TrackerResponse;
import com.lungguard.model.*;
import com.lungguard.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TimelineService {

    private final UserRepository userRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final XrayReportRepository xrayReportRepository;
    private final SimulationResultRepository simulationResultRepository;
    private final DailyCheckInRepository dailyCheckInRepository;
    private final RecoveryTrackerRepository recoveryTrackerRepository;
    private final RecoveryTrackerService recoveryTrackerService;

    public TimelineService(UserRepository userRepository,
                           RiskAssessmentRepository riskAssessmentRepository,
                           XrayReportRepository xrayReportRepository,
                           SimulationResultRepository simulationResultRepository,
                           DailyCheckInRepository dailyCheckInRepository,
                           RecoveryTrackerRepository recoveryTrackerRepository,
                           RecoveryTrackerService recoveryTrackerService) {
        this.userRepository = userRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.xrayReportRepository = xrayReportRepository;
        this.simulationResultRepository = simulationResultRepository;
        this.dailyCheckInRepository = dailyCheckInRepository;
        this.recoveryTrackerRepository = recoveryTrackerRepository;
        this.recoveryTrackerService = recoveryTrackerService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public TimelineResponse getTimelineData(String range) {
        User user = getAuthenticatedUser();
        LocalDateTime cutoff = getCutoffDate(range);

        // Fetch Data
        List<RiskAssessment> risks = riskAssessmentRepository.findByUserOrderByCreatedAtDesc(user);
        List<XrayReport> xrays = xrayReportRepository.findByUserOrderByUploadedAtDesc(user);
        List<SimulationResult> simulations = simulationResultRepository.findByUserOrderByCreatedAtDesc(user);
        
        Optional<RecoveryTracker> trackerOpt = recoveryTrackerRepository.findByUser(user);
        List<DailyCheckIn> checkIns = new ArrayList<>();
        int currentSmokeFreeStreak = 0;

        if (trackerOpt.isPresent()) {
            checkIns = dailyCheckInRepository.findByTrackerOrderByCheckInDateAsc(trackerOpt.get());
            try {
                TrackerResponse trackerResponse = recoveryTrackerService.getTracker();
                currentSmokeFreeStreak = trackerResponse.getCurrentSmokingStreak() != null ? trackerResponse.getCurrentSmokingStreak() : 0;
            } catch (Exception e) {
                // Ignore if tracker isn't fully set up yet
            }
        }

        // Summary Calculations
        Integer latestLungRisk = null;
        Integer latestLiverRisk = null;
        Integer lungRiskChange = null;

        if (risks.size() > 0) {
            latestLungRisk = risks.get(0).getLungRiskScore();
            latestLiverRisk = risks.get(0).getLiverRiskScore();
            
            if (risks.size() > 1 && risks.get(1).getLungRiskScore() != null && latestLungRisk != null) {
                lungRiskChange = latestLungRisk - risks.get(1).getLungRiskScore();
            }
        }

        TimelineResponse.TimelineSummary summary = TimelineResponse.TimelineSummary.builder()
                .latestLungRisk(latestLungRisk)
                .latestLiverRisk(latestLiverRisk)
                .lungRiskChange(lungRiskChange)
                .totalScans(xrays.size())
                .smokeFreeStreak(currentSmokeFreeStreak)
                .build();

        // Risk Trend Data (Filter by cutoff, map, and reverse for chronological chart order)
        List<TimelineResponse.RiskTrendData> riskTrend = risks.stream()
                .filter(r -> cutoff == null || !r.getCreatedAt().isBefore(cutoff))
                .sorted(Comparator.comparing(RiskAssessment::getCreatedAt))
                .map(r -> TimelineResponse.RiskTrendData.builder()
                        .date(r.getCreatedAt().toLocalDate().toString())
                        .lungRisk(r.getLungRiskScore())
                        .liverRisk(r.getLiverRiskScore())
                        .build())
                .collect(Collectors.toList());

        // Aggregate Events
        List<TimelineResponse.TimelineEvent> events = new ArrayList<>();

        for (RiskAssessment r : risks) {
            if (cutoff != null && r.getCreatedAt().isBefore(cutoff)) continue;
            events.add(TimelineResponse.TimelineEvent.builder()
                    .date(r.getCreatedAt())
                    .type("Risk Assessment")
                    .result("Category: " + (r.getRiskCategory() != null ? r.getRiskCategory() : "Unknown"))
                    .score(r.getLungRiskScore() != null ? r.getLungRiskScore() + "%" : "N/A")
                    .note("Lung Risk Evaluated")
                    .actionUrl("/risk")
                    .build());
        }

        for (XrayReport x : xrays) {
            if (cutoff != null && x.getUploadedAt().isBefore(cutoff)) continue;
            String type = "X-ray Analysis";
            // Simple heuristic to label as CT if filename suggests it, else X-ray
            if (x.getFileName() != null && x.getFileName().toLowerCase().contains("ct")) {
                type = "CT Analysis";
            }
            events.add(TimelineResponse.TimelineEvent.builder()
                    .date(x.getUploadedAt())
                    .type(type)
                    .result(x.getPrediction() != null ? x.getPrediction() : "Analysis Pending")
                    .score(x.getConfidence() != null ? String.format("%.1f%%", x.getConfidence()) : "N/A")
                    .note(x.getPatientName() != null ? "Patient: " + x.getPatientName() : "Scan Uploaded")
                    .actionUrl("/xray")
                    .build());
        }

        for (SimulationResult s : simulations) {
            if (cutoff != null && s.getCreatedAt().isBefore(cutoff)) continue;
            events.add(TimelineResponse.TimelineEvent.builder()
                    .date(s.getCreatedAt())
                    .type("Health Simulation")
                    .result(s.getCopdRiskAfter5Years() != null ? "Projected COPD Risk: " + s.getCopdRiskAfter5Years() + "%" : "Simulation Completed")
                    .score("N/A")
                    .note("5 & 10 Year Forecast")
                    .actionUrl("/simulation")
                    .build());
        }

        for (DailyCheckIn c : checkIns) {
            if (c.getCheckInDate() == null) continue;
            LocalDateTime checkInDateTime = c.getCheckInDate().atStartOfDay();
            if (cutoff != null && checkInDateTime.isBefore(cutoff)) continue;

            String result = "Daily Logged";
            if (!c.isDidSmoke() && !c.isDidDrink()) {
                result = "Smoke & Alcohol Free";
            } else if (!c.isDidSmoke()) {
                result = "Smoke Free";
            } else if (!c.isDidDrink()) {
                result = "Alcohol Free";
            }

            events.add(TimelineResponse.TimelineEvent.builder()
                    .date(checkInDateTime)
                    .type("Recovery Check-in")
                    .result(result)
                    .score(c.getCravingLevel() != null ? "Craving: " + c.getCravingLevel() + "/10" : "N/A")
                    .note(c.getMood() != null ? "Mood: " + c.getMood() : "Habit Tracker Log")
                    .actionUrl("/tracker")
                    .build());
        }

        // Sort events newest first
        events.sort(Comparator.comparing(TimelineResponse.TimelineEvent::getDate).reversed());

        return TimelineResponse.builder()
                .summary(summary)
                .riskTrend(riskTrend)
                .events(events)
                .build();
    }

    private LocalDateTime getCutoffDate(String range) {
        if (range == null || range.equals("all")) {
            return null;
        }
        LocalDateTime now = LocalDateTime.now();
        switch (range.toLowerCase()) {
            case "7d": return now.minusDays(7);
            case "30d": return now.minusDays(30);
            case "6m": return now.minusMonths(6);
            default: return null;
        }
    }
}
