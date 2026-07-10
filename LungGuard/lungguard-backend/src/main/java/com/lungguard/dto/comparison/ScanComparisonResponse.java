package com.lungguard.dto.comparison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanComparisonResponse {
    private String scanType;
    private ScanReportData olderScan;
    private ScanReportData newerScan;
    private ComparisonMetrics comparison;
    private String comparisonSummary;
    private String disclaimer;
}
