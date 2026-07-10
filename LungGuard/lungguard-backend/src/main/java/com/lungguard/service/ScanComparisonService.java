package com.lungguard.service;

import com.lungguard.dto.comparison.*;
import com.lungguard.model.ScanComparison;
import com.lungguard.model.User;
import com.lungguard.model.XrayReport;
import com.lungguard.repository.ScanComparisonRepository;
import com.lungguard.repository.UserRepository;
import com.lungguard.repository.XrayReportRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScanComparisonService {

    private final UserRepository userRepository;
    private final XrayReportRepository xrayReportRepository;
    private final ScanComparisonRepository scanComparisonRepository;
    private final ScanComparisonPdfService pdfService;

    public ScanComparisonService(UserRepository userRepository,
                                 XrayReportRepository xrayReportRepository,
                                 ScanComparisonRepository scanComparisonRepository,
                                 ScanComparisonPdfService pdfService) {
        this.userRepository = userRepository;
        this.xrayReportRepository = xrayReportRepository;
        this.scanComparisonRepository = scanComparisonRepository;
        this.pdfService = pdfService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<ScanReportData> getAvailableScans(String scanType) {
        User user = getAuthenticatedUser();
        
        if ("XRAY".equalsIgnoreCase(scanType)) {
            List<XrayReport> reports = xrayReportRepository.findByUserOrderByUploadedAtDesc(user);
            return reports.stream().map(this::mapToScanReportData).collect(Collectors.toList());
        }
        
        // For future CT integration or unsupported types
        return new ArrayList<>();
    }

    @Transactional
    public ScanComparisonResponse compareScans(ScanComparisonRequest request) {
        User user = getAuthenticatedUser();
        
        if (request.getOlderReportId().equals(request.getNewerReportId())) {
            throw new IllegalArgumentException("Cannot compare the same report");
        }

        if (!"XRAY".equalsIgnoreCase(request.getScanType())) {
            throw new IllegalArgumentException("Unsupported scan type for comparison");
        }

        XrayReport olderReport = xrayReportRepository.findById(request.getOlderReportId())
                .orElseThrow(() -> new RuntimeException("Older report not found"));
        XrayReport newerReport = xrayReportRepository.findById(request.getNewerReportId())
                .orElseThrow(() -> new RuntimeException("Newer report not found"));

        if (!olderReport.getUser().getId().equals(user.getId()) || !newerReport.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to access these reports");
        }

        LocalDateTime olderDate = olderReport.getScanDate() != null ? olderReport.getScanDate() : olderReport.getUploadedAt();
        LocalDateTime newerDate = newerReport.getScanDate() != null ? newerReport.getScanDate() : newerReport.getUploadedAt();

        if (olderDate.isAfter(newerDate)) {
            throw new IllegalArgumentException("Older report date must be before newer report date");
        }

        ComparisonMetrics metrics = calculateMetrics(olderReport, newerReport, olderDate, newerDate);
        String summary = generateComparisonSummary(olderReport, newerReport, metrics);
        
        String disclaimer = "Scan comparison is generated from AI-assisted image analysis. Differences in predictions, confidence scores, or attention maps do not confirm medical improvement or deterioration. A qualified healthcare professional should review both scans.";

        // Optional: Save to history
        ScanComparison comparisonEntity = ScanComparison.builder()
                .user(user)
                .scanType(request.getScanType())
                .olderReportId(olderReport.getId())
                .newerReportId(newerReport.getId())
                .comparisonSummary(summary)
                .confidenceDifference(metrics.getConfidenceDifference())
                .build();
        scanComparisonRepository.save(comparisonEntity);

        return ScanComparisonResponse.builder()
                .scanType(request.getScanType())
                .olderScan(mapToScanReportData(olderReport))
                .newerScan(mapToScanReportData(newerReport))
                .comparison(metrics)
                .comparisonSummary(summary)
                .disclaimer(disclaimer)
                .build();
    }

    public byte[] generateComparisonPdf(ScanComparisonRequest request) {
        ScanComparisonResponse response = compareScans(request);
        User user = getAuthenticatedUser();
        String patientName = user.getFullName() != null && !user.getFullName().isBlank() 
                ? user.getFullName() 
                : user.getEmail();
        return pdfService.generatePdf(response, patientName);
    }

    private ScanReportData mapToScanReportData(XrayReport report) {
        String originalImg = report.getFilePath();
        
        // Filter out local filesystem paths
        if (originalImg != null && !originalImg.isBlank()) {
            if (originalImg.contains(":\\") || originalImg.startsWith("/") || originalImg.startsWith("C:")) {
                originalImg = null;
            } else if (!originalImg.startsWith("http") && !originalImg.startsWith("data:")) {
                originalImg = null; // Enforce only URLs or Base64/data URIs
            }
        }

        return ScanReportData.builder()
                .reportId(report.getId())
                .fileName(report.getFileName())
                .originalImage(originalImg)
                .heatmapImage(report.getHeatmapBase64())
                .prediction(report.getPrediction())
                .confidence(report.getConfidence())
                .reportSummary(report.getClinicalSummary())
                .recommendation(report.getRecommendation())
                .scanDate(report.getScanDate() != null ? report.getScanDate() : report.getUploadedAt())
                .build();
    }

    private ComparisonMetrics calculateMetrics(XrayReport older, XrayReport newer, LocalDateTime olderDate, LocalDateTime newerDate) {
        boolean samePrediction = older.getPrediction().equalsIgnoreCase(newer.getPrediction());
        String predictionChange = older.getPrediction() + " → " + newer.getPrediction();
        
        Double confDiff = newer.getConfidence() - older.getConfidence();
        // Round to 1 decimal place
        confDiff = Math.round(confDiff * 10.0) / 10.0;
        
        String confDir;
        if (confDiff > 0) confDir = "INCREASED";
        else if (confDiff < 0) confDir = "DECREASED";
        else confDir = "UNCHANGED";

        long daysBetween = ChronoUnit.DAYS.between(olderDate, newerDate);

        return ComparisonMetrics.builder()
                .predictionChange(predictionChange)
                .confidenceDifference(confDiff)
                .confidenceDirection(confDir)
                .samePrediction(samePrediction)
                .daysBetweenScans(daysBetween)
                .attentionMapNotice("AI Attention Map — highlights regions that influenced the model prediction. It does not identify the exact location of disease or damage.")
                .build();
    }

    private String generateComparisonSummary(XrayReport older, XrayReport newer, ComparisonMetrics metrics) {
        StringBuilder sb = new StringBuilder();
        
        if (metrics.getSamePrediction()) {
            sb.append("The AI prediction remained ").append(newer.getPrediction()).append(". ");
        } else {
            sb.append("The AI prediction changed from ").append(older.getPrediction())
              .append(" to ").append(newer.getPrediction()).append(". ");
        }
        
        if (metrics.getConfidenceDirection().equals("INCREASED")) {
            sb.append("AI confidence increased by ").append(Math.abs(metrics.getConfidenceDifference())).append(" percentage points. ");
        } else if (metrics.getConfidenceDirection().equals("DECREASED")) {
            sb.append("AI confidence decreased by ").append(Math.abs(metrics.getConfidenceDifference())).append(" percentage points. ");
        } else {
            sb.append("AI confidence remained unchanged. ");
        }
        
        sb.append("This does not confirm that the underlying medical condition changed. Clinical review is recommended.");
        return sb.toString();
    }
}
