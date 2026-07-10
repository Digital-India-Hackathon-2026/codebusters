package com.lungguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackerResponse {
    
    // Calculated stats
    private Integer smokeFreeDays;
    private Integer alcoholFreeDays;
    private Integer cigarettesAvoided;
    private Integer drinksAvoided;
    private Double moneySavedCigarettes;
    private Double moneySavedAlcohol;
    
    // Streaks
    private Integer currentSmokingStreak;
    private Integer currentAlcoholStreak;
    private Integer bestSmokingStreak;
    private Integer bestAlcoholStreak;
    
    // Progress
    private LocalDate startDate; // earliest of the two quit dates
    private Integer habitJourneyProgress; // progress percentage
    
    // Form fields echoed back for editing
    private LocalDate quitSmokingDate;
    private LocalDate quitAlcoholDate;
    private Integer cigarettesPerDay;
    private Double pricePerCigarette;
    private Integer cigarettesPerPacket;
    private Integer drinksPerWeek;
    private Double costPerDrink;
    private String currency;
    private String dailyGoal;
    
    // Motivation
    private String motivationMessage;
    private String dailyMotivationalQuote;
    private List<String> milestones;
    
    // For charts
    private List<DailyCheckInDto> checkIns;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCheckInDto {
        private LocalDate date;
        private boolean didSmoke;
        private Integer cigarettesSmoked;
        private boolean didDrink;
        private Integer drinksConsumed;
        private Integer cravingLevel;
        private String mood;
        private String notes;
    }
}
