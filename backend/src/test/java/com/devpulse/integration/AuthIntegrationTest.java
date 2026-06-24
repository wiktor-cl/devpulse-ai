package com.devpulse.integration;

import com.devpulse.dto.request.AuthRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@DisplayName("Auth API Integration Tests")
class AuthIntegrationTest extends BaseIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /auth/register - should register and return tokens")
    void register_returnsTokens() throws Exception {
        AuthRequest.Register request = new AuthRequest.Register();
        request.setEmail("integration@devpulse.ai");
        request.setUsername("integrationuser");
        request.setPassword("Password123!");
        request.setFullName("Integration User");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("integration@devpulse.ai"));
    }

    @Test
    @DisplayName("POST /auth/register - should return 422 on invalid input")
    void register_invalidInput_returns422() throws Exception {
        AuthRequest.Register request = new AuthRequest.Register();
        request.setEmail("not-an-email");
        request.setUsername("u");
        request.setPassword("short");
        request.setFullName("");

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors").exists());
    }

    @Test
    @DisplayName("POST /auth/login - should return 401 on bad credentials")
    void login_badCredentials_returns401() throws Exception {
        AuthRequest.Login request = new AuthRequest.Login();
        request.setEmail("nobody@devpulse.ai");
        request.setPassword("WrongPass!");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
