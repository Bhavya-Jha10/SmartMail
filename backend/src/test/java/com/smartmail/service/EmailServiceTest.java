package com.smartmail.service;

import com.smartmail.dto.GenerateReplyRequest;
import com.smartmail.dto.GenerateReplyResponse;
import com.smartmail.dto.SummarizeRequest;
import com.smartmail.dto.SummarizeResponse;
import com.smartmail.entity.EmailGeneration;
import com.smartmail.entity.User;
import com.smartmail.exception.ResourceNotFoundException;
import com.smartmail.repository.EmailGenerationRepository;
import com.smartmail.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class EmailServiceTest {

    @Mock
    private EmailGenerationRepository emailGenerationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GeminiService geminiService;

    @Mock
    private PromptBuilderService promptBuilderService;

    @InjectMocks
    private EmailService emailService;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User("John Doe", "john@example.com", "pass", "ROLE_USER");
        testUser.setId(1L);
    }

    @Test
    @DisplayName("Should generate reply, save record, and return response")
    void testGenerateReplySuccess() {
        GenerateReplyRequest request = new GenerateReplyRequest();
        request.setOriginalContent("Can we meet at 4 PM?");
        request.setTone("Friendly");
        request.setLength("Short");
        request.setSaveToHistory(true);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(promptBuilderService.buildReplyPrompt(eq(request), anyInt())).thenReturn("Mock Prompt");
        when(geminiService.generateContent("Mock Prompt")).thenReturn("Hi! Sure, 4 PM works great for me. See you then!");
        when(geminiService.getModel()).thenReturn("gemini-1.5-flash");

        EmailGeneration mockSaved = new EmailGeneration(testUser, request.getOriginalContent(),
                "Hi! Sure, 4 PM works great for me. See you then!", "REPLY", "Friendly", "Short", "{}");
        mockSaved.setId(101L);
        when(emailGenerationRepository.save(any(EmailGeneration.class))).thenReturn(mockSaved);

        GenerateReplyResponse response = emailService.generateReply(1L, request);

        assertNotNull(response);
        assertEquals(101L, response.getId());
        assertEquals("Hi! Sure, 4 PM works great for me. See you then!", response.getGeneratedReply());
        assertEquals("Friendly", response.getTone());
        assertEquals("Short", response.getLength());
        verify(emailGenerationRepository, times(1)).save(any(EmailGeneration.class));
    }

    @Test
    @DisplayName("Should summarize email and extract structured JSON attributes")
    void testSummarizeSuccess() {
        SummarizeRequest request = new SummarizeRequest();
        request.setEmailContent("Sprint review scheduled for Friday. Please submit demo slides by Thursday noon.");
        request.setSaveToHistory(true);

        String jsonAiResponse = "{\n" +
                "  \"summary\": \"Sprint review scheduled for Friday with demo slide deadline on Thursday noon.\",\n" +
                "  \"mainPoints\": [\"Sprint review on Friday\", \"Slides required by Thursday\"],\n" +
                "  \"actionItems\": [\"Submit demo slides\"],\n" +
                "  \"deadlines\": [\"Thursday 12:00 PM\"],\n" +
                "  \"questions\": []\n" +
                "}";

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(promptBuilderService.buildSummarizePrompt(request)).thenReturn("Summarize Prompt");
        when(geminiService.generateContent("Summarize Prompt")).thenReturn(jsonAiResponse);
        when(geminiService.getModel()).thenReturn("gemini-1.5-flash");

        EmailGeneration mockSaved = new EmailGeneration(testUser, request.getEmailContent(),
                "Sprint review summary", "SUMMARY", "Analytical", "Concise", "{}");
        mockSaved.setId(201L);
        when(emailGenerationRepository.save(any(EmailGeneration.class))).thenReturn(mockSaved);

        SummarizeResponse response = emailService.summarize(1L, request);

        assertNotNull(response);
        assertEquals(201L, response.getId());
        assertEquals(2, response.getMainPoints().size());
        assertEquals(1, response.getActionItems().size());
        assertEquals("Thursday 12:00 PM", response.getDeadlines().get(0));
        assertTrue(response.getSummary().contains("Sprint review scheduled"));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user accesses unauthorized history entry")
    void testGetHistoryByIdUnauthorizedThrowsException() {
        when(emailGenerationRepository.findByIdAndUserId(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> emailService.getHistoryById(1L, 999L));
    }
}
