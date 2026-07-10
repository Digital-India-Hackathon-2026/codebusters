package com.lungguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineResponse {
    
    private TimelineSummary summary;
    private List<RiskTrendData> riskTrend;
    private List<TimelineEvent> events;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineSummary {
        private Integer latestLungRisk;
        private Integer latestLiverRisk;
        private Integer lungRiskChange;
        private Integer totalScans;
        private Integer smokeFreeStreak;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskTrendData {
        private String date; // Using String (YYYY-MM-DD) for frontend charts
        private Integer lungRisk;
        private Integer liverRisk;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEvent {
        private LocalDateTime date;
        private String type;
        private String result;
        private String score; // e.g. "91%"
        private String note;
        private String actionUrl; // URL to open report if applicable
    }
}
