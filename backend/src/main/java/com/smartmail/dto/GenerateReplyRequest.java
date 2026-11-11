package com.smartmail.dto;

import jakarta.validation.constraints.NotBlank;

public class GenerateReplyRequest {

    @NotBlank(message = "Original email content is required")
    private String originalContent;

    private String senderName;

    private String recipientName;

    private String tone = "Professional"; // Professional, Formal, Friendly, Casual, Apologetic, Persuasive

    private String length = "Medium"; // Short, Medium, Detailed

    private String additionalInstructions;

    private int alternativeCount = 1; // 1 to 3

    private boolean saveToHistory = true;

    public GenerateReplyRequest() {
    }

    public String getOriginalContent() {
        return originalContent;
    }

    public void setOriginalContent(String originalContent) {
        this.originalContent = originalContent;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
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

    public String getAdditionalInstructions() {
        return additionalInstructions;
    }

    public void setAdditionalInstructions(String additionalInstructions) {
        this.additionalInstructions = additionalInstructions;
    }

    public int getAlternativeCount() {
        return alternativeCount;
    }

    public void setAlternativeCount(int alternativeCount) {
        this.alternativeCount = alternativeCount;
    }

    public boolean isSaveToHistory() {
        return saveToHistory;
    }

    public void setSaveToHistory(boolean saveToHistory) {
        this.saveToHistory = saveToHistory;
    }
}
