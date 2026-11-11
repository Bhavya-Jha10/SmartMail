package com.smartmail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmail.dto.GenerateReplyRequest;
import com.smartmail.dto.GenerateReplyResponse;
import com.smartmail.security.JwtTokenProvider;
import com.smartmail.service.EmailService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EmailControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EmailService emailService;

    @Test
    @DisplayName("GET /api/email/history without JWT token should return 401 Unauthorized")
    void testGetHistoryUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/email/history"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/email/generate without JWT token should return 401 Unauthorized")
    void testGenerateReplyUnauthenticated() throws Exception {
        GenerateReplyRequest request = new GenerateReplyRequest();
        request.setOriginalContent("Test email content");

        mockMvc.perform(post("/api/email/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
