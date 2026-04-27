package com.certitracker.backend.controller;

import com.certitracker.backend.model.Achievement;
import com.certitracker.backend.repository.AchievementRepository;
import com.certitracker.backend.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
    private final AchievementRepository achievementRepository;
    private final UserRepository userRepository;

    public AchievementController(AchievementRepository achievementRepository, UserRepository userRepository) {
        this.achievementRepository = achievementRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public Object getByUser(@PathVariable String userId) {
        return achievementRepository.findByUserIdOrderByDateDesc(requireId(userId, "userId"));
    }

    @PostMapping
    public Achievement create(@RequestBody Map<String, Object> body) {
        Achievement item = new Achievement();
        String userId = getRequiredString(body, "userId");
        item.setId(UUID.randomUUID().toString());
        item.setUserId(userId);
        item.setTitle(getRequiredString(body, "title"));
        item.setType(getOptionalString(body, "type", "achievement"));
        item.setDescription(getOptionalString(body, "description", ""));
        item.setDate(LocalDate.parse(getRequiredString(body, "date")));
        item.setCreatedAt(Instant.now());
        
        achievementRepository.save(item);
        
        userRepository.findById(Objects.requireNonNull(userId)).ifPresent(user -> {
            user.setPoints(user.getPoints() + 50);
            userRepository.save(user);
        });
        
        return item;
    }

    @PutMapping("/{id}")
    public Achievement update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String achievementId = requireId(id, "id");
        Achievement item = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Achievement not found"));

        item.setTitle(getOptionalString(body, "title", item.getTitle()));
        item.setType(getOptionalString(body, "type", item.getType()));
        item.setDescription(getOptionalString(body, "description", item.getDescription()));
        if (body.containsKey("date") && body.get("date") != null) {
            item.setDate(LocalDate.parse(String.valueOf(body.get("date"))));
        }

        return achievementRepository.save(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        achievementRepository.deleteById(requireId(id, "id"));
    }

    private static @NonNull String requireId(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value;
    }

    private static String getRequiredString(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return value.toString();
    }

    private static String getOptionalString(Map<String, Object> body, String key, String defaultValue) {
        Object value = body.get(key);
        return value == null ? defaultValue : String.valueOf(value);
    }
}
