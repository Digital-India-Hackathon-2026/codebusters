package com.lungguard.dto.comparison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanComparisonRequest {
    private Long olderReportId;
    private Long newerReportId;
    private String scanType; // e.g., "XRAY" or "CT"
}
