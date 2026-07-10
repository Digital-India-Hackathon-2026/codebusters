package com.lungguard.controller;

import com.lungguard.dto.DailyCheckInRequest;
import com.lungguard.dto.TrackerResponse;
import com.lungguard.dto.TrackerSetupRequest;
import com.lungguard.service.RecoveryTrackerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tracker")
public class RecoveryTrackerController {

    private final RecoveryTrackerService trackerService;

    public RecoveryTrackerController(RecoveryTrackerService trackerService) {
        this.trackerService = trackerService;
    }

    @PostMapping("/setup")
    public TrackerResponse setupTracker(@RequestBody TrackerSetupRequest request) {
        return trackerService.setupTracker(request);
    }

    @PutMapping("/setup")
    public TrackerResponse updateTracker(@RequestBody TrackerSetupRequest request) {
        return trackerService.updateTracker(request);
    }

    @GetMapping
    public TrackerResponse getTracker() {
        return trackerService.getTracker();
    }

    @PostMapping("/check-in")
    public TrackerResponse saveCheckIn(@RequestBody DailyCheckInRequest request) {
        return trackerService.saveCheckIn(request);
    }
}
