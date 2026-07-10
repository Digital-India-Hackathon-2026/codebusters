package com.lungguard.dto.comparison;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanReportData {
    private Long reportId;
    private String fileName;
    private String originalImage; // Base64 or URL
    private String heatmapImage;  // Base64
    private String prediction;
    private Double confidence;
    private String reportSummary;
    private String recommendation;
    private LocalDateTime scanDate;
}
