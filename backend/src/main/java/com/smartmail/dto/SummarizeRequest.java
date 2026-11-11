package com.smartmail.dto;

import jakarta.validation.constraints.NotBlank;

public class SummarizeRequest {

    @NotBlank(message = "Email content is required")
    private String emailContent;

    private String additionalInstructions;

    private boolean saveToHistory = true;

    public SummarizeRequest() {
    }

    public SummarizeRequest(String emailContent, String additionalInstructions) {
        this.emailContent = emailContent;
        this.additionalInstructions = additionalInstructions;
    }

    public String getEmailContent() {
        return emailContent;
    }

    public void setEmailContent(String emailContent) {
        this.emailContent = emailContent;
    }

    public String getAdditionalInstructions() {
        return additionalInstructions;
    }

    public void setAdditionalInstructions(String additionalInstructions) {
        this.additionalInstructions = additionalInstructions;
    }

    public boolean isSaveToHistory() {
        return saveToHistory;
    }

    public void setSaveToHistory(boolean saveToHistory) {
        this.saveToHistory = saveToHistory;
    }
}
