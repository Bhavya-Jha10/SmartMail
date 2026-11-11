package com.smartmail.dto;

import java.time.LocalDateTime;

public class EmailHistoryDto {

    private Long id;
    private Long userId;
    private String originalContent;
    private String generatedContent;
    private String generationType;
    private String tone;
    private String responseLength;
    private String metadataJson;
    private LocalDateTime createdAt;

    public EmailHistoryDto() {
    }

    public EmailHistoryDto(Long id, Long userId, String originalContent, String generatedContent,
                           String generationType, String tone, String responseLength,
                           String metadataJson, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.originalContent = originalContent;
        this.generatedContent = generatedContent;
        this.generationType = generationType;
        this.tone = tone;
        this.responseLength = responseLength;
        this.metadataJson = metadataJson;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getGeneratedContent() {
        return generatedContent;
    }

    public void setGeneratedContent(String generatedContent) {
        this.generatedContent = generatedContent;
    }

    public String getGenerationType() {
        return generationType;
    }

    public void setGenerationType(String generationType) {
        this.generationType = generationType;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getResponseLength() {
        return responseLength;
    }

    public void setResponseLength(String responseLength) {
        this.responseLength = responseLength;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
