package com.lungguard.controller;

import com.lungguard.dto.comparison.ScanComparisonRequest;
import com.lungguard.dto.comparison.ScanComparisonResponse;
import com.lungguard.dto.comparison.ScanReportData;
import com.lungguard.model.ScanComparison;
import com.lungguard.repository.ScanComparisonRepository;
import com.lungguard.repository.UserRepository;
import com.lungguard.service.ScanComparisonService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scan-comparison")
public class ScanComparisonController {

    private final ScanComparisonService scanComparisonService;
    private final ScanComparisonRepository scanComparisonRepository;
    private final UserRepository userRepository;

    public ScanComparisonController(ScanComparisonService scanComparisonService,
                                    ScanComparisonRepository scanComparisonRepository,
                                    UserRepository userRepository) {
        this.scanComparisonService = scanComparisonService;
        this.scanComparisonRepository = scanComparisonRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ScanReportData>> getAvailableScans(@RequestParam String type) {
        return ResponseEntity.ok(scanComparisonService.getAvailableScans(type));
    }

    @PostMapping("/compare")
    public ResponseEntity<ScanComparisonResponse> compareScans(@RequestBody ScanComparisonRequest request) {
        try {
            return ResponseEntity.ok(scanComparisonService.compareScans(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadComparisonPdf(@RequestBody ScanComparisonRequest request) {
        try {
            byte[] pdfBytes = scanComparisonService.generateComparisonPdf(request);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Comparison_Report.pdf");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<ScanComparison>> getComparisonHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(scanComparisonRepository.findByUserOrderByCreatedAtDesc(user));
    }
}
