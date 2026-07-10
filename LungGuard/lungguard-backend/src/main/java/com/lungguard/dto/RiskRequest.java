package com.lungguard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * DTO used to receive risk assessment form data
 * from frontend/Postman.
 *
 * DTO = Data Transfer Object
 *
 * This data comes from user input and will later
 * be used by RiskService to calculate risk scores.
 */

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RiskRequest {

    /*
     * Basic Information
     */
    private Integer age;

    private String gender;

    private Double weight;

    /*
     * Smoking Information
     */
    private Integer cigarettesPerDay;

    private Integer smokingYears;

    /*
     * Alcohol Information
     */
    private String alcoholFrequency;

    /*
     * Symptoms
     * true = Yes
     * false = No
     */
    private boolean hasCough;

    private boolean hasChestPain;

    private boolean hasBreathlessness;
}