package com.devpulse.dto.response;

import com.devpulse.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String username;
    private String fullName;
    private String avatarUrl;
    private User.Role role;
    private boolean active;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
}
