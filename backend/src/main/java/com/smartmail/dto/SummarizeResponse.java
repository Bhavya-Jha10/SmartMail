package com.smartmail.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SummarizeResponse {

    private Long id;
    private String summary;
    private List<String> mainPoints = new ArrayList<>();
    private List<String> actionItems = new ArrayList<>();
    private List<String> deadlines = new ArrayList<>();
    private List<String> questions = new ArrayList<>();
    private LocalDateTime createdAt;
    private String modelUsed;

    public SummarizeResponse() {
    }

    public SummarizeResponse(Long id, String summary, List<String> mainPoints,
                             List<String> actionItems, List<String> deadlines,
                             List<String> questions, LocalDateTime createdAt, String modelUsed) {
        this.id = id;
        this.summary = summary;
        this.mainPoints = mainPoints != null ? mainPoints : new ArrayList<>();
        this.actionItems = actionItems != null ? actionItems : new ArrayList<>();
        this.deadlines = deadlines != null ? deadlines : new ArrayList<>();
        this.questions = questions != null ? questions : new ArrayList<>();
        this.createdAt = createdAt;
        this.modelUsed = modelUsed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getMainPoints() {
        return mainPoints;
    }

    public void setMainPoints(List<String> mainPoints) {
        this.mainPoints = mainPoints;
    }

    public List<String> getActionItems() {
        return actionItems;
    }

    public void setActionItems(List<String> actionItems) {
        this.actionItems = actionItems;
    }

    public List<String> getDeadlines() {
        return deadlines;
    }

    public void setDeadlines(List<String> deadlines) {
        this.deadlines = deadlines;
    }

    public List<String> getQuestions() {
        return questions;
    }

    public void setQuestions(List<String> questions) {
        this.questions = questions;
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
