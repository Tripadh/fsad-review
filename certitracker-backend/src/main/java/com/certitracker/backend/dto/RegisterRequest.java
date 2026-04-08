package com.certitracker.backend.dto;

public record RegisterRequest(
        String username,
        String email,
        String password,
        String role,
        String avatarColor
) {
}
