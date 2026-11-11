package com.smartmail.service;

import com.smartmail.exception.GeminiApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class GeminiServiceTest {

    @Mock
    private RestClient restClient;

    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        geminiService = new GeminiService(restClient);
    }

    @Test
    @DisplayName("Should throw GeminiApiException when API key is missing or blank")
    void testMissingApiKeyThrowsException() {
        geminiService.setApiKey("");

        GeminiApiException exception = assertThrows(GeminiApiException.class, () -> {
            geminiService.generateContent("Test prompt");
        });

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatus());
        assertEquals("GEMINI_API_KEY_MISSING", exception.getErrorCode());
    }

    @Test
    @DisplayName("Should throw GeminiApiException when API key is placeholder")
    void testPlaceholderApiKeyThrowsException() {
        geminiService.setApiKey("YOUR_GEMINI_API_KEY");

        GeminiApiException exception = assertThrows(GeminiApiException.class, () -> {
            geminiService.generateContent("Test prompt");
        });

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatus());
        assertEquals("GEMINI_API_KEY_MISSING", exception.getErrorCode());
    }
}
