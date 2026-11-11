package com.smartmail.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartmail.dto.AuthResponse;
import com.smartmail.dto.LoginRequest;
import com.smartmail.dto.RegisterRequest;
import com.smartmail.security.JwtAuthenticationEntryPoint;
import com.smartmail.security.JwtTokenProvider;
import com.smartmail.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/auth/register with valid body should return 201 Created")
    void testRegisterValidInput() throws Exception {
        RegisterRequest request = new RegisterRequest("Bob Builder", "bob@builder.com", "Secret123!");
        AuthResponse authResponse = new AuthResponse("jwt_token_here", 1L, "Bob Builder", "bob@builder.com", "ROLE_USER", "Success");

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt_token_here"))
                .andExpect(jsonPath("$.email").value("bob@builder.com"));
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid email should return 400 Bad Request")
    void testRegisterInvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest("Bob", "invalid-email-format", "Secret123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors.email").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login with valid credentials should return 200 OK")
    void testLoginValidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("bob@builder.com", "Secret123!");
        AuthResponse authResponse = new AuthResponse("jwt_token_here", 1L, "Bob Builder", "bob@builder.com", "ROLE_USER", "Success");

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt_token_here"));
    }

    @Test
    @DisplayName("POST /api/auth/login with wrong password should return 401 Unauthorized")
    void testLoginWrongPassword() throws Exception {
        LoginRequest request = new LoginRequest("bob@builder.com", "WrongPassword");

        when(authService.login(any(LoginRequest.class))).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }
}
