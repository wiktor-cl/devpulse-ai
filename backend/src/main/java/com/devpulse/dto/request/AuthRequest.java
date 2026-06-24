package com.devpulse.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank @Email
        private String email;

        @NotBlank @Size(min = 3, max = 50)
        private String username;

        @NotBlank @Size(min = 8, max = 100)
        private String password;

        @NotBlank @Size(max = 100)
        private String fullName;
    }

    @Data
    public static class Login {
        @NotBlank @Email
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class RefreshToken {
        @NotBlank
        private String refreshToken;
    }
}
