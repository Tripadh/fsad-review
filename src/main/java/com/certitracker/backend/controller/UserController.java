package com.certitracker.backend.controller;

import com.certitracker.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> out = new HashMap<>();
            out.put("id", u.getId());
            out.put("username", u.getUsername());
            out.put("email", u.getEmail());
            out.put("role", u.getRole().name().toLowerCase());
            out.put("createdAt", u.getCreatedAt());
            out.put("avatarColor", u.getAvatarColor());
            out.put("points", u.getPoints());
            return out;
        }).toList();
    }
}
