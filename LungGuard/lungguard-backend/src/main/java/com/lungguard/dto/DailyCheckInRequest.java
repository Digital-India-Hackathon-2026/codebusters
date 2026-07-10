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
public class DailyCheckInRequest {
    private LocalDate checkInDate;
    private boolean didSmoke;
    private Integer cigarettesSmoked;
    private boolean didDrink;
    private Integer drinksConsumed;
    private Integer cravingLevel;
    private String mood;
    private String notes;
}
