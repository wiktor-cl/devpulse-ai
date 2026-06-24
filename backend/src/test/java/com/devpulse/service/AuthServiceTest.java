package com.devpulse.service;

import com.devpulse.dto.request.AuthRequest;
import com.devpulse.dto.response.AuthResponse;
import com.devpulse.entity.RefreshToken;
import com.devpulse.entity.User;
import com.devpulse.exception.BusinessException;
import com.devpulse.repository.RefreshTokenRepository;
import com.devpulse.repository.UserRepository;
import com.devpulse.security.jwt.JwtService;
import com.devpulse.service.impl.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(authService, "refreshExpiration", 604800000L);
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_success() {
        AuthRequest.Register request = new AuthRequest.Register();
        request.setEmail("test@devpulse.ai");
        request.setUsername("testuser");
        request.setPassword("Password123!");
        request.setFullName("Test User");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$12$encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            ReflectionTestUtils.setField(u, "id", UUID.randomUUID());
            return u;
        });
        when(jwtService.generateToken(any())).thenReturn("jwt.token.here");
        when(refreshTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("jwt.token.here");
        assertThat(response.getUser().getEmail()).isEqualTo("test@devpulse.ai");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw BusinessException when email already exists")
    void register_duplicateEmail_throwsException() {
        AuthRequest.Register request = new AuthRequest.Register();
        request.setEmail("existing@devpulse.ai");
        request.setUsername("newuser");
        request.setPassword("Password123!");
        request.setFullName("Existing User");

        when(userRepository.existsByEmail("existing@devpulse.ai")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    @DisplayName("Should throw BusinessException when refresh token is expired")
    void refreshToken_expired_throwsException() {
        RefreshToken expiredToken = RefreshToken.builder()
                .token("expired-token")
                .expiresAt(LocalDateTime.now().minusDays(1))
                .user(User.builder().id(UUID.randomUUID()).email("u@d.ai").build())
                .build();

        when(refreshTokenRepository.findByToken("expired-token"))
                .thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.refreshToken("expired-token"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("expired");

        verify(refreshTokenRepository).delete(expiredToken);
    }
}
