package com.smartmail.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalGenerations;
    private long totalReplies;
    private long totalSummaries;
    private List<EmailHistoryDto> recentActivity = new ArrayList<>();
    private Map<String, Long> toneDistribution = new HashMap<>();

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalGenerations, long totalReplies, long totalSummaries,
                             List<EmailHistoryDto> recentActivity, Map<String, Long> toneDistribution) {
        this.totalGenerations = totalGenerations;
        this.totalReplies = totalReplies;
        this.totalSummaries = totalSummaries;
        this.recentActivity = recentActivity != null ? recentActivity : new ArrayList<>();
        this.toneDistribution = toneDistribution != null ? toneDistribution : new HashMap<>();
    }

    public long getTotalGenerations() {
        return totalGenerations;
    }

    public void setTotalGenerations(long totalGenerations) {
        this.totalGenerations = totalGenerations;
    }

    public long getTotalReplies() {
        return totalReplies;
    }

    public void setTotalReplies(long totalReplies) {
        this.totalReplies = totalReplies;
    }

    public long getTotalSummaries() {
        return totalSummaries;
    }

    public void setTotalSummaries(long totalSummaries) {
        this.totalSummaries = totalSummaries;
    }

    public List<EmailHistoryDto> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<EmailHistoryDto> recentActivity) {
        this.recentActivity = recentActivity;
    }

    public Map<String, Long> getToneDistribution() {
        return toneDistribution;
    }

    public void setToneDistribution(Map<String, Long> toneDistribution) {
        this.toneDistribution = toneDistribution;
    }
}
