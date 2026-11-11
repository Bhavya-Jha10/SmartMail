package com.smartmail.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_generations", indexes = {
    @Index(name = "idx_email_gen_user_id", columnList = "user_id"),
    @Index(name = "idx_email_gen_created_at", columnList = "created_at"),
    @Index(name = "idx_email_gen_type", columnList = "generation_type")
})
public class EmailGeneration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "original_content", nullable = false, columnDefinition = "LONGTEXT")
    private String originalContent;

    @Column(name = "generated_content", nullable = false, columnDefinition = "LONGTEXT")
    private String generatedContent;

    @Column(name = "generation_type", nullable = false, length = 30)
    private String generationType; // REPLY, SUMMARY

    @Column(name = "tone", length = 30)
    private String tone; // Professional, Formal, Friendly, Casual, Apologetic, Persuasive

    @Column(name = "response_length", length = 30)
    private String responseLength; // Short, Medium, Detailed

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public EmailGeneration() {
    }

    public EmailGeneration(User user, String originalContent, String generatedContent,
                           String generationType, String tone, String responseLength, String metadataJson) {
        this.user = user;
        this.originalContent = originalContent;
        this.generatedContent = generatedContent;
        this.generationType = generationType;
        this.tone = tone;
        this.responseLength = responseLength;
        this.metadataJson = metadataJson;
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
