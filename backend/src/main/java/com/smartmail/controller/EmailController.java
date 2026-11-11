package com.smartmail.controller;

import com.smartmail.dto.*;
import com.smartmail.security.UserPrincipal;
import com.smartmail.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/generate")
    public ResponseEntity<GenerateReplyResponse> generateReply(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody GenerateReplyRequest request) {
        GenerateReplyResponse response = emailService.generateReply(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/summarize")
    public ResponseEntity<SummarizeResponse> summarize(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SummarizeRequest request) {
        SummarizeResponse response = emailService.summarize(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<EmailHistoryDto>> getHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String tone) {
        Page<EmailHistoryDto> history = emailService.getHistory(userPrincipal.getId(), page, size, search, type, tone);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<EmailHistoryDto> getHistoryById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        EmailHistoryDto dto = emailService.getHistoryById(userPrincipal.getId(), id);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<ApiResponse> deleteHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        emailService.deleteHistory(userPrincipal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Email history record deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DashboardStatsDto stats = emailService.getDashboardStats(userPrincipal.getId());
        return ResponseEntity.ok(stats);
    }
}
