package com.lungguard.controller;

import com.lungguard.dto.SimulationRequest;
import com.lungguard.dto.SimulationResponse;
import com.lungguard.model.SimulationResult;
import com.lungguard.service.SimulationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController{
    private final SimulationService simulationService;

    public SimulationController(
            SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @PostMapping("/run")
    public SimulationResponse runSimulation(
            @RequestBody SimulationRequest request){
        return simulationService.simulateHealthImpact(request);
    }

    @GetMapping("/history")
    public List<SimulationResult> getSimulationHistory(){
        return simulationService.getSimulationHistory();
    }
}