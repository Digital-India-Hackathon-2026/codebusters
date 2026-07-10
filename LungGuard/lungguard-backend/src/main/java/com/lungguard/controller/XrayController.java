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
}