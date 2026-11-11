
package com.smartmail.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmail.exception.GeminiApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger logger =
            LoggerFactory.getLogger(GeminiService.class);

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.5-flash-lite}")
    private String model;

    @Value("${gemini.api.base-url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String baseUrl;

    public GeminiService(RestClient geminiRestClient) {
        this.restClient = geminiRestClient;
        this.objectMapper = new ObjectMapper();
    }

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 1000L; // 1 second

    /**
     * Calls Gemini generateContent endpoint with bounded retries and exponential backoff
     * for transient 503 High Demand and 5xx upstream capacity errors.
     *
     * @param prompt The crafted system and contextual user prompt
     * @return Generated text response from Gemini
     */
    public String generateContent(String prompt) {
        validateApiKey();

        String uri = String.format("%s/%s:generateContent?key=%s", baseUrl, model, apiKey);
        Map<String, Object> requestBody = buildGeminiRequestBody(prompt);

        int attempt = 0;
        long backoffMs = INITIAL_BACKOFF_MS;

        while (attempt < MAX_RETRIES) {
            attempt++;
            try {
                logger.info("Sending request to Gemini model: {} (Attempt {}/{})", model, attempt, MAX_RETRIES);

                String responseJson = restClient.post()
                        .uri(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(requestBody)
                        .exchange((request, response) -> {
                            int status = response.getStatusCode().value();
                            byte[] responseBytes = response.getBody().readAllBytes();
                            String responseBody = new String(responseBytes, StandardCharsets.UTF_8);

                            logger.info("Gemini HTTP status: {}, Content-Type: {}", status, response.getHeaders().getContentType());

                            if (response.getStatusCode().isError()) {
                                handleResponseError(status, responseBody);
                            }

                            return responseBody;
                        });

                if (!StringUtils.hasText(responseJson)) {
                    throw new GeminiApiException(
                            "Gemini returned an empty response.",
                            HttpStatus.BAD_GATEWAY,
                            "GEMINI_EMPTY_RESPONSE"
                    );
                }

                logger.info("Successfully received response from Gemini on attempt {}.", attempt);
                return extractTextFromResponse(responseJson);

            } catch (GeminiApiException ex) {
                // If it's a transient 503 or 429 or 5xx, retry with exponential backoff
                boolean isRetryable = ex.getStatus() == HttpStatus.SERVICE_UNAVAILABLE
                        || ex.getStatus() == HttpStatus.TOO_MANY_REQUESTS
                        || ex.getStatus().value() >= 500
                        || "GEMINI_UPSTREAM_ERROR".equals(ex.getErrorCode())
                        || "GEMINI_RATE_LIMIT".equals(ex.getErrorCode());

                if (isRetryable && attempt < MAX_RETRIES) {
                    logger.warn("Transient error on attempt {}/{} (Status: {}, ErrorCode: {}). Retrying in {}ms... Message: {}",
                            attempt, MAX_RETRIES, ex.getStatus(), ex.getErrorCode(), backoffMs, ex.getMessage());
                    try {
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new GeminiApiException("Request execution was interrupted.", HttpStatus.INTERNAL_SERVER_ERROR, "GEMINI_INTERRUPTED");
                    }
                    backoffMs *= 2; // Exponential backoff: 1s, 2s, 4s
                    continue;
                }
                throw ex;

            } catch (ResourceAccessException ex) {
                // Network or timeout error
                if (attempt < MAX_RETRIES) {
                    logger.warn("Network/timeout error on attempt {}/{}. Retrying in {}ms... Details: {}",
                            attempt, MAX_RETRIES, backoffMs, ex.getMessage());
                    try {
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new GeminiApiException("Request execution was interrupted.", HttpStatus.INTERNAL_SERVER_ERROR, "GEMINI_INTERRUPTED");
                    }
                    backoffMs *= 2;
                    continue;
                }

                logger.error("Network or timeout error contacting Gemini API after {} attempts", MAX_RETRIES, ex);
                throw new GeminiApiException(
                        "Network connection or timeout error contacting Gemini AI after multiple attempts. Please check your internet connection.",
                        HttpStatus.GATEWAY_TIMEOUT,
                        "GEMINI_TIMEOUT"
                );

            } catch (Exception ex) {
                logger.error("Unexpected error in GeminiService", ex);
                throw new GeminiApiException(
                        "An unexpected error occurred while communicating with Gemini AI: " + ex.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "GEMINI_INTERNAL_ERROR"
                );
            }
        }

        throw new GeminiApiException(
                "Gemini AI is currently experiencing high demand or upstream unavailability. Please retry in a few moments.",
                HttpStatus.SERVICE_UNAVAILABLE,
                "GEMINI_SERVICE_UNAVAILABLE"
        );
    }

    private void validateApiKey() {

        if (!StringUtils.hasText(apiKey)
                || "TODO".equalsIgnoreCase(apiKey)
                || "YOUR_GEMINI_API_KEY".equalsIgnoreCase(apiKey)) {

            logger.warn("Gemini API key is not configured.");

            throw new GeminiApiException(
                    "Google Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable or in application.properties.",
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GEMINI_API_KEY_MISSING"
            );
        }
    }

    private Map<String, Object> buildGeminiRequestBody(String prompt) {

        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(content));
        payload.put("generationConfig", generationConfig);

        return payload;
    }

    private String extractTextFromResponse(String responseJson) {

        try {

            JsonNode root = objectMapper.readTree(responseJson);

            // Check for prompt feedback block
            JsonNode promptFeedback = root.path("promptFeedback");

            if (promptFeedback.has("blockReason")) {

                String blockReason =
                        promptFeedback.path("blockReason").asText();

                throw new GeminiApiException(
                        "Request was blocked by Gemini safety filters: "
                                + blockReason,
                        HttpStatus.BAD_REQUEST,
                        "GEMINI_SAFETY_BLOCKED"
                );
            }

            JsonNode candidates = root.path("candidates");

            if (!candidates.isArray() || candidates.isEmpty()) {

                throw new GeminiApiException(
                        "No response candidate returned by Gemini AI.",
                        HttpStatus.BAD_GATEWAY,
                        "GEMINI_EMPTY_RESPONSE"
                );
            }

            JsonNode firstCandidate = candidates.get(0);

            JsonNode finishReason =
                    firstCandidate.path("finishReason");

            if ("SAFETY".equalsIgnoreCase(finishReason.asText())) {

                throw new GeminiApiException(
                        "Gemini response was blocked by safety filters.",
                        HttpStatus.BAD_REQUEST,
                        "GEMINI_SAFETY_BLOCKED"
                );
            }

            JsonNode parts = firstCandidate
                    .path("content")
                    .path("parts");

            if (!parts.isArray() || parts.isEmpty()) {

                throw new GeminiApiException(
                        "Malformed Gemini response: missing text parts.",
                        HttpStatus.BAD_GATEWAY,
                        "GEMINI_MALFORMED_RESPONSE"
                );
            }

            String generatedText = parts.get(0)
                    .path("text")
                    .asText()
                    .trim();

            if (!StringUtils.hasText(generatedText)) {

                throw new GeminiApiException(
                        "Gemini returned an empty text response.",
                        HttpStatus.BAD_GATEWAY,
                        "GEMINI_EMPTY_TEXT"
                );
            }

            return generatedText;

        } catch (GeminiApiException ex) {

            throw ex;

        } catch (Exception ex) {

            logger.error(
                    "Failed to parse Gemini API response JSON",
                    ex
            );

            throw new GeminiApiException(
                    "Failed to parse Gemini AI response: "
                            + ex.getMessage(),
                    HttpStatus.BAD_GATEWAY,
                    "GEMINI_PARSE_ERROR"
            );
        }
    }

    private void handleResponseError(
            int status,
            String responseBody
    ) {

        logger.error(
                "Gemini API error (HTTP {}): {}",
                status,
                responseBody
        );

        if (status == 400) {
            throw new GeminiApiException(
                    "Gemini API rejected the request. Please verify the prompt format or model configuration.",
                    HttpStatus.BAD_REQUEST,
                    "GEMINI_BAD_REQUEST"
            );
        } else if (status == 401 || status == 403) {
            throw new GeminiApiException(
                    "Invalid or unauthorized Gemini API key. Please check your GEMINI_API_KEY setting.",
                    HttpStatus.UNAUTHORIZED,
                    "GEMINI_AUTH_ERROR"
            );
        } else if (status == 429) {
            throw new GeminiApiException(
                    "Gemini API rate limit or quota exceeded. Please wait a moment and try again.",
                    HttpStatus.TOO_MANY_REQUESTS,
                    "GEMINI_RATE_LIMIT"
            );
        } else if (status == 503 || (responseBody != null && responseBody.toLowerCase().contains("high demand"))) {
            throw new GeminiApiException(
                    "Gemini AI is currently experiencing high demand. Retrying or wait a moment before retrying.",
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "GEMINI_UPSTREAM_ERROR"
            );
        } else if (status >= 500) {
            throw new GeminiApiException(
                    "Google Gemini AI service is currently experiencing upstream issues (HTTP " + status + "). Please try again shortly.",
                    HttpStatus.BAD_GATEWAY,
                    "GEMINI_UPSTREAM_ERROR"
            );
        } else {
            throw new GeminiApiException(
                    "Gemini API error (HTTP " + status + "): " + responseBody,
                    HttpStatus.BAD_GATEWAY,
                    "GEMINI_ERROR"
            );
        }
    }

    public String getModel() {
        return model;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public void setModel(String model) {
        this.model = model;
    }
}
