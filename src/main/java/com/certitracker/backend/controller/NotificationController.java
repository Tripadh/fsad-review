package com.certitracker.backend.controller;

import com.certitracker.backend.model.Notification;
import com.certitracker.backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getByUser(@PathVariable String userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    @PostMapping
    public Notification create(@RequestBody Map<String, Object> body) {
        Notification note = new Notification();
        note.setId(UUID.randomUUID().toString());
        note.setRecipientUserId(getRequiredString(body, "recipientUserId"));
        note.setSenderAdminId(getOptionalString(body, "senderAdminId", null));
        note.setType(getOptionalString(body, "type", "renewal_notice"));
        note.setMessage(getRequiredString(body, "message"));
        note.setRelatedCertId(getOptionalString(body, "relatedCertId", null));
        note.setRead(false);
        note.setCreatedAt(Instant.now());
        return notificationRepository.save(note);
    }

    @PutMapping("/{id}/read")
    public Notification markRead(@PathVariable String id) {
        Notification note = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        note.setRead(true);
        return notificationRepository.save(note);
    }

    @PutMapping("/user/{userId}/read-all")
    public void markAllRead(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private static String getRequiredString(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return String.valueOf(value);
    }

    private static String getOptionalString(Map<String, Object> body, String key, String defaultValue) {
        Object value = body.get(key);
        return value == null ? defaultValue : String.valueOf(value);
    }
}
