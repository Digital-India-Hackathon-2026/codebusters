package com.lungguard.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimulationRequest{

    private Integer age;
    private Integer cigarettesPerDay;
    private Integer smokingYears;
    private String alcoholFrequency;

}