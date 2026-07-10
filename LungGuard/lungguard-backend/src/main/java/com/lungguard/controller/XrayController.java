package com.lungguard.controller;

import com.lungguard.dto.XrayResponse;
import com.lungguard.model.XrayReport;
import com.lungguard.service.XrayService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/xray")
public class XrayController {

    private final XrayService xrayService;

    public XrayController(XrayService xrayService) {

        this.xrayService = xrayService;
    }

    @PostMapping("/upload")
    public XrayResponse uploadXray(
            @RequestParam("file") MultipartFile file) {

        return xrayService.uploadXray(file);
    }
    @GetMapping("/history")
    public List<XrayReport> getXrayHistory() {
        return xrayService.getXrayHistory();
    }

    @GetMapping("/report/{id}")
    public XrayReport getReportById(@PathVariable Long id) {
        return xrayService.getReportById(id);
    }

    @GetMapping("/report/{id}/pdf")
    public org.springframework.http.ResponseEntity<byte[]> downloadReportPdf(@PathVariable Long id, com.lungguard.service.XrayReportPdfService pdfService) {
        XrayReport report = xrayService.getReportById(id);
        byte[] pdfBytes = pdfService.generatePdf(report);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "lungguard_report_" + id + ".pdf");

        return new org.springframework.http.ResponseEntity<>(pdfBytes, headers, org.springframework.http.HttpStatus.OK);
    }
}