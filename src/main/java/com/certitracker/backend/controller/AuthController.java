package com.certitracker.backend.controller;

import com.certitracker.backend.dto.LoginRequest;
import com.certitracker.backend.dto.RegisterRequest;
import com.certitracker.backend.model.Role;
import com.certitracker.backend.model.User;
import com.certitracker.backend.repository.UserRepository;
import com.certitracker.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest body) {
        if (userRepository.existsByEmailIgnoreCase(body.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "An account with this email already exists.");
        }
        if (userRepository.existsByUsernameIgnoreCase(body.username())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This username is already taken.");
        }

        Role role = "admin".equalsIgnoreCase(body.role()) ? Role.ADMIN : Role.USER;
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(body.username().trim());
        user.setEmail(body.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(body.password()));
        user.setRole(role);
        user.setAvatarColor(body.avatarColor() == null || body.avatarColor().isBlank() ? "#f97316" : body.avatarColor());
        user.setCreatedAt(Instant.now());

        userRepository.save(user);
        return toAuthResponse(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest body) {
        User user = userRepository.findByEmailIgnoreCase(body.email().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No account found with this email."));

        if (!passwordEncoder.matches(body.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect password. Please try again.");
        }

        return toAuthResponse(user);
    }

    private Map<String, Object> toAuthResponse(User user) {
        return Map.of(
                "token", jwtService.generateToken(user),
                "user", toSessionUser(user)
        );
    }

    private Map<String, Object> toSessionUser(User user) {
        return Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().name().toLowerCase(),
                "createdAt", user.getCreatedAt(),
                "avatarColor", user.getAvatarColor(),
                "points", user.getPoints()
        );
    }
}
