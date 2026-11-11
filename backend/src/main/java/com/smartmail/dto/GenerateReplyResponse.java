package com.smartmail.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class GenerateReplyResponse {

    private Long id;
    private String generatedReply;
    private List<String> alternativeReplies = new ArrayList<>();
    private String tone;
    private String length;
    private LocalDateTime createdAt;
    private String modelUsed;

    public GenerateReplyResponse() {
    }

    public GenerateReplyResponse(Long id, String generatedReply, List<String> alternativeReplies,
                                 String tone, String length, LocalDateTime createdAt, String modelUsed) {
        this.id = id;
        this.generatedReply = generatedReply;
        this.alternativeReplies = alternativeReplies != null ? alternativeReplies : new ArrayList<>();
        this.tone = tone;
        this.length = length;
        this.createdAt = createdAt;
        this.modelUsed = modelUsed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGeneratedReply() {
        return generatedReply;
    }

    public void setGeneratedReply(String generatedReply) {
        this.generatedReply = generatedReply;
    }

    public List<String> getAlternativeReplies() {
        return alternativeReplies;
    }

    public void setAlternativeReplies(List<String> alternativeReplies) {
        this.alternativeReplies = alternativeReplies;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getLength() {
        return length;
    }

    public void setLength(String length) {
        this.length = length;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }
}
