package com.devpulse.controller;

import com.devpulse.entity.AiReport;
import com.devpulse.entity.User;
import com.devpulse.service.ai.AiAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Analytics", description = "AI-powered productivity analysis and report generation")
@SecurityRequirement(name = "bearerAuth")
public class AiController {

    private final AiAnalyticsService aiAnalyticsService;

    @GetMapping("/reports")
    @Operation(summary = "Get all AI reports for current user")
    public ResponseEntity<Page<AiReport>> getReports(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiAnalyticsService.getUserReports(user.getId(), pageable));
    }

    @PostMapping("/reports/weekly")
    @Operation(summary = "Generate weekly productivity report")
    public ResponseEntity<AiReport> generateWeeklyReport(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiAnalyticsService.generateWeeklyReport(user));
    }

    @PostMapping("/reports/project/{projectId}")
    @Operation(summary = "Generate project analysis report")
    public ResponseEntity<AiReport> generateProjectReport(@PathVariable UUID projectId,
                                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(aiAnalyticsService.generateProjectReport(projectId, user));
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with AI assistant about your projects")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> body,
                                                     @AuthenticationPrincipal User user) {
        String message = body.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        return ResponseEntity.ok(aiAnalyticsService.chat(message, user));
    }
}
