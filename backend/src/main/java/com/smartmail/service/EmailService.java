package com.smartmail.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmail.dto.*;
import com.smartmail.entity.EmailGeneration;
import com.smartmail.entity.User;
import com.smartmail.exception.ApiException;
import com.smartmail.exception.ResourceNotFoundException;
import com.smartmail.repository.EmailGenerationRepository;
import com.smartmail.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final EmailGenerationRepository emailGenerationRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final PromptBuilderService promptBuilderService;
    private final ObjectMapper objectMapper;

    public EmailService(EmailGenerationRepository emailGenerationRepository,
                        UserRepository userRepository,
                        GeminiService geminiService,
                        PromptBuilderService promptBuilderService) {
        this.emailGenerationRepository = emailGenerationRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.promptBuilderService = promptBuilderService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generates a context-aware email reply and optional variations using Gemini.
     */
    @Transactional
    public GenerateReplyResponse generateReply(Long userId, GenerateReplyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Generate primary response
        String primaryPrompt = promptBuilderService.buildReplyPrompt(request, 1);
        String primaryReply = geminiService.generateContent(primaryPrompt);

        // Generate alternatives if requested
        List<String> alternativeReplies = new ArrayList<>();
        int altCount = Math.min(Math.max(request.getAlternativeCount(), 1), 3);
        for (int i = 2; i <= altCount; i++) {
            try {
                String altPrompt = promptBuilderService.buildReplyPrompt(request, i);
                String altReply = geminiService.generateContent(altPrompt);
                alternativeReplies.add(altReply);
            } catch (Exception ex) {
                logger.warn("Failed generating alternative variation {}: {}", i, ex.getMessage());
            }
        }

        Long savedId = null;
        LocalDateTime now = LocalDateTime.now();

        if (request.isSaveToHistory()) {
            String metadataJson = null;
            try {
                Map<String, Object> meta = new HashMap<>();
                meta.put("senderName", request.getSenderName());
                meta.put("recipientName", request.getRecipientName());
                meta.put("additionalInstructions", request.getAdditionalInstructions());
                meta.put("alternatives", alternativeReplies);
                metadataJson = objectMapper.writeValueAsString(meta);
            } catch (Exception e) {
                logger.warn("Failed to serialize reply metadata: {}", e.getMessage());
            }

            EmailGeneration generation = new EmailGeneration(
                    user,
                    request.getOriginalContent(),
                    primaryReply,
                    "REPLY",
                    request.getTone(),
                    request.getLength(),
                    metadataJson
            );

            EmailGeneration saved = emailGenerationRepository.save(generation);
            savedId = saved.getId();
            now = saved.getCreatedAt();
        }

        return new GenerateReplyResponse(
                savedId,
                primaryReply,
                alternativeReplies,
                request.getTone(),
                request.getLength(),
                now,
                geminiService.getModel()
        );
    }

    /**
     * Analyzes and summarizes email content into structured points, action items, deadlines, and questions.
     */
    @Transactional
    public SummarizeResponse summarize(Long userId, SummarizeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String prompt = promptBuilderService.buildSummarizePrompt(request);
        String aiResponse = geminiService.generateContent(prompt);

        // Parse structured JSON response from Gemini
        SummarizeResponse parsedResponse = parseSummarizeResponse(aiResponse);

        Long savedId = null;
        LocalDateTime now = LocalDateTime.now();

        if (request.isSaveToHistory()) {
            String metadataJson = null;
            try {
                Map<String, Object> meta = new HashMap<>();
                meta.put("mainPoints", parsedResponse.getMainPoints());
                meta.put("actionItems", parsedResponse.getActionItems());
                meta.put("deadlines", parsedResponse.getDeadlines());
                meta.put("questions", parsedResponse.getQuestions());
                metadataJson = objectMapper.writeValueAsString(meta);
            } catch (Exception e) {
                logger.warn("Failed to serialize summary metadata: {}", e.getMessage());
            }

            EmailGeneration generation = new EmailGeneration(
                    user,
                    request.getEmailContent(),
                    parsedResponse.getSummary(),
                    "SUMMARY",
                    "Analytical",
                    "Concise",
                    metadataJson
            );

            EmailGeneration saved = emailGenerationRepository.save(generation);
            savedId = saved.getId();
            now = saved.getCreatedAt();
        }

        parsedResponse.setId(savedId);
        parsedResponse.setCreatedAt(now);
        parsedResponse.setModelUsed(geminiService.getModel());

        return parsedResponse;
    }

    private SummarizeResponse parseSummarizeResponse(String rawAiText) {
        SummarizeResponse response = new SummarizeResponse();
        try {
            // Strip markdown block if model wrapped in ```json ... ```
            String cleanJson = rawAiText.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode root = objectMapper.readTree(cleanJson);

            response.setSummary(root.path("summary").asText("No summary generated."));

            List<String> mainPoints = new ArrayList<>();
            JsonNode pointsNode = root.path("mainPoints");
            if (pointsNode.isArray()) {
                pointsNode.forEach(p -> mainPoints.add(p.asText()));
            }
            response.setMainPoints(mainPoints);

            List<String> actionItems = new ArrayList<>();
            JsonNode actionNode = root.path("actionItems");
            if (actionNode.isArray()) {
                actionNode.forEach(a -> actionItems.add(a.asText()));
            }
            response.setActionItems(actionItems);

            List<String> deadlines = new ArrayList<>();
            JsonNode deadlineNode = root.path("deadlines");
            if (deadlineNode.isArray()) {
                deadlineNode.forEach(d -> deadlines.add(d.asText()));
            }
            response.setDeadlines(deadlines);

            List<String> questions = new ArrayList<>();
            JsonNode questionNode = root.path("questions");
            if (questionNode.isArray()) {
                questionNode.forEach(q -> questions.add(q.asText()));
            }
            response.setQuestions(questions);

        } catch (Exception ex) {
            logger.warn("Could not parse AI response as JSON directly, using fallback parser: {}", ex.getMessage());
            // Graceful fallback
            response.setSummary(rawAiText);
            response.setMainPoints(List.of("Summary generated from full email context."));
            response.setActionItems(Collections.emptyList());
            response.setDeadlines(Collections.emptyList());
            response.setQuestions(Collections.emptyList());
        }

        return response;
    }

    /**
     * Retrieves paginated history of generated emails and summaries for a user with optional search and filters.
     */
    @Transactional(readOnly = true)
    public Page<EmailHistoryDto> getHistory(Long userId, int page, int size, String search, String type, String tone) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        String keywordFilter = StringUtils.hasText(search) ? search.trim() : null;
        String typeFilter = StringUtils.hasText(type) && !"ALL".equalsIgnoreCase(type) ? type.trim().toUpperCase() : null;
        String toneFilter = StringUtils.hasText(tone) && !"ALL".equalsIgnoreCase(tone) ? tone.trim() : null;

        Page<EmailGeneration> entities = emailGenerationRepository.searchGenerations(
                userId, typeFilter, toneFilter, keywordFilter, pageable);

        return entities.map(this::mapToHistoryDto);
    }

    /**
     * Retrieves single history entry by id, ensuring ownership security check.
     */
    @Transactional(readOnly = true)
    public EmailHistoryDto getHistoryById(Long userId, Long historyId) {
        EmailGeneration gen = emailGenerationRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("EmailGeneration", "id", historyId));

        return mapToHistoryDto(gen);
    }

    /**
     * Deletes single history entry ensuring ownership security check.
     */
    @Transactional
    public void deleteHistory(Long userId, Long historyId) {
        EmailGeneration gen = emailGenerationRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("EmailGeneration", "id", historyId));

        emailGenerationRepository.delete(gen);
    }

    /**
     * Retrieves dashboard statistics and recent activity for the user.
     */
    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats(Long userId) {
        long totalGenerations = emailGenerationRepository.countByUserId(userId);
        long totalReplies = emailGenerationRepository.countByUserIdAndGenerationType(userId, "REPLY");
        long totalSummaries = emailGenerationRepository.countByUserIdAndGenerationType(userId, "SUMMARY");

        List<EmailGeneration> recent = emailGenerationRepository.findTop5ByUserIdOrderByCreatedAtDesc(userId);
        List<EmailHistoryDto> recentDtos = recent.stream().map(this::mapToHistoryDto).toList();

        // Calculate tone distribution
        Map<String, Long> toneMap = new HashMap<>();
        List<EmailGeneration> allUserGens = emailGenerationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 100)).getContent();
        for (EmailGeneration g : allUserGens) {
            if ("REPLY".equalsIgnoreCase(g.getGenerationType()) && StringUtils.hasText(g.getTone())) {
                toneMap.put(g.getTone(), toneMap.getOrDefault(g.getTone(), 0L) + 1);
            }
        }

        return new DashboardStatsDto(totalGenerations, totalReplies, totalSummaries, recentDtos, toneMap);
    }

    private EmailHistoryDto mapToHistoryDto(EmailGeneration gen) {
        return new EmailHistoryDto(
                gen.getId(),
                gen.getUser().getId(),
                gen.getOriginalContent(),
                gen.getGeneratedContent(),
                gen.getGenerationType(),
                gen.getTone(),
                gen.getResponseLength(),
                gen.getMetadataJson(),
                gen.getCreatedAt()
        );
    }
}
