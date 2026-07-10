package com.lungguard.controller;

import com.lungguard.dto.TimelineResponse;
import com.lungguard.service.TimelineService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping
    public TimelineResponse getTimelineData(@RequestParam(defaultValue = "all") String range) {
        return timelineService.getTimelineData(range);
    }
}
