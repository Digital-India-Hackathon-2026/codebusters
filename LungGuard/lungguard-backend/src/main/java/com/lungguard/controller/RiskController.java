package com.lungguard.controller;

import com.lungguard.dto.RiskRequest;
import com.lungguard.dto.RiskResponse;
import com.lungguard.service.RiskService;
import org.springframework.web.bind.annotation.*;

/*
 * Handles Risk Assessment APIs.
 */
@RestController
@RequestMapping("/api/risk")
public class RiskController {

    /*
     * Service layer object.
     * Controller delegates business logic to service.
     */
    private final RiskService riskService;

    /*
     * Constructor Injection.
     * Spring automatically injects RiskService.
     */
    public RiskController(RiskService riskService) {
        this.riskService = riskService;
    }

    /*
     * POST /api/risk/calculate
     *
     * Receives RiskRequest JSON
     * Calls RiskService
     * Returns RiskResponse
     */
    @PostMapping("/calculate")
    public RiskResponse calculateRisk(
            @RequestBody RiskRequest request) {

        return riskService.calculateRisk(request);
    }
}