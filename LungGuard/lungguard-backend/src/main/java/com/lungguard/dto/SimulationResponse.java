package com.lungguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public  class SimulationResponse{
    private Integer lungCapacityAfter5Years;

    private Integer copdRiskAfter5Years;

    private Integer cancerRiskAfter5Years;

    private Integer lungCapacityAfter10Years;

    private Integer copdRiskAfter10Years;

    private Integer cancerRiskAfter10Years;

    private Double moneyBurned;

    private String recommendation;
}