package com.lungguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    /*
     * Latest Lung Risk Score
     */
    private Integer latestLungRiskScore;

    /*
     * Latest Liver Risk Score
     */
    private Integer latestLiverRiskScore;

    /*
     * LOW / MEDIUM / HIGH
     */
    private String latestRiskCategory;

    /*
     * Latest Recommendation
     */
    private String latestRecommendation;

    /*
     * Total number of assessments
     */
    private Long totalAssessments;
}