package com.lungguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskResponse{
    Integer lungRiskScore;
    Integer liverRiskScore;
    String riskCategory;
    String recommendation;

}