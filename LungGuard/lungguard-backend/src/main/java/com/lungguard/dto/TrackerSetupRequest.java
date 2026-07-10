package com.lungguard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackerSetupRequest {
    private LocalDate quitSmokingDate;
    private LocalDate quitAlcoholDate;
    private Integer cigarettesPerDay;
    private Double pricePerCigarette;
    private Integer cigarettesPerPacket;
    private Integer drinksPerWeek;
    private Double costPerDrink;
    private String currency;
    private String dailyGoal;
    private String motivationMessage;
}
