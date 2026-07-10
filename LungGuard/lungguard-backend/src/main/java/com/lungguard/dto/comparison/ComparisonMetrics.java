package com.lungguard.dto.comparison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonMetrics {
    private String predictionChange;
    private Double confidenceDifference;
    private String confidenceDirection; // "INCREASED", "DECREASED", "UNCHANGED"
    private Boolean samePrediction;
    private Long daysBetweenScans;
    private String attentionMapNotice;
}
