package com.smartmail.service;

import com.smartmail.dto.AuthResponse;
import com.smartmail.dto.LoginRequest;
import com.smartmail.dto.RegisterRequest;
import com.smartmail.entity.User;
import com.smartmail.exception.ApiException;
import com.smartmail.repository.UserRepository;
import com.smartmail.security.JwtTokenProvider;
import com.smartmail.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Should successfully register a new user and return JWT token")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("Alice Smith", "alice@example.com", "Password123!");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_pass");

        User savedUser = new User("Alice Smith", "alice@example.com", "encoded_pass", "ROLE_USER");
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateTokenFromUser(eq(10L), eq("alice@example.com"), eq("Alice Smith"), eq("ROLE_USER")))
                .thenReturn("mock_jwt_token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("Alice Smith", response.getName());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ApiException with 409 Conflict when registering with duplicate email")
    void testRegisterDuplicateEmailThrowsException() {
        RegisterRequest request = new RegisterRequest("Alice Smith", "alice@example.com", "Password123!");

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> authService.register(request));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        assertTrue(ex.getMessage().contains("already exists"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should successfully login user with valid credentials")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("alice@example.com", "Password123!");

        UserPrincipal principal = new UserPrincipal(10L, "Alice Smith", "alice@example.com", "encoded_pass", Collections.emptyList());
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock_login_token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mock_login_token", response.getToken());
        assertEquals("alice@example.com", response.getEmail());
    }

    @Test
    @DisplayName("Should throw BadCredentialsException when login credentials are invalid")
    void testLoginInvalidCredentialsThrowsException() {
        LoginRequest request = new LoginRequest("alice@example.com", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }
}
