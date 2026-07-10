package com.lungguard.service;

import com.lungguard.dto.XrayResponse;
import com.lungguard.model.User;
import com.lungguard.model.XrayReport;
import com.lungguard.repository.UserRepository;
import com.lungguard.repository.XrayReportRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class XrayService {

    private final XrayReportRepository xrayReportRepository;
    private final UserRepository userRepository;
    private final AiClientService aiClientService;

    public XrayService(XrayReportRepository xrayReportRepository,
                       UserRepository userRepository,
                       AiClientService aiClientService) {
        this.xrayReportRepository = xrayReportRepository;
        this.userRepository = userRepository;
        this.aiClientService = aiClientService;
    }

    public XrayResponse uploadXray(MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        XrayResponse aiResponse = aiClientService.analyzeXray(file);

        XrayReport report = new XrayReport();

        report.setFileName(file.getOriginalFilename());
        report.setFileType(file.getContentType());

        report.setPrediction(aiResponse.getPrediction());
        report.setConfidence(aiResponse.getConfidence());
        report.setMessage(aiResponse.getMessage());

        report.setUploadedAt(LocalDateTime.now());
        report.setUser(user); // Associate the X-ray report with the authenticated user

        xrayReportRepository.save(report);

        return XrayResponse.builder()
                .fileName(report.getFileName())
                .prediction(report.getPrediction())
                .confidence(report.getConfidence())
                .message(report.getMessage())
                .build();
    }

    public List<XrayReport> getXrayHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return xrayReportRepository.findByUserOrderByUploadedAtDesc(user);
    }
}