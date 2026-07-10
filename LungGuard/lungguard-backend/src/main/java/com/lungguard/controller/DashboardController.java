package com.lungguard.controller;

import com.lungguard.dto.DashboardResponse;
import com.lungguard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController{
    private final DashboardService dashBoardService;


    public DashboardController(DashboardService dashBoardService) {
        this.dashBoardService = dashBoardService;
    }
    @GetMapping
    public DashboardResponse getDashboardData() {
        return dashBoardService.getDashboardData();
    }
}