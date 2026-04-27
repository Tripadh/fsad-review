package com.certitracker.backend.controller;

import com.certitracker.backend.model.Certification;
import com.certitracker.backend.model.User;
import com.certitracker.backend.repository.CertificationRepository;
import com.certitracker.backend.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {
    private final UserRepository userRepository;
    private final CertificationRepository certificationRepository;

    public PortfolioController(UserRepository userRepository, CertificationRepository certificationRepository) {
        this.userRepository = userRepository;
        this.certificationRepository = certificationRepository;
    }

    @GetMapping("/{userId}")
    public Map<String, Object> getPublicPortfolio(@PathVariable String userId) {
        User user = userRepository.findById(requireId(userId, "userId"))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Certification> certs = getUserCertificationsSafe(userId);

        List<Map<String, Object>> verifiedCerts = certs.stream()
                .filter(c -> "verified".equalsIgnoreCase(c.getVerificationStatus()))
                .map(this::toMap)
                .toList();

        Map<String, Object> out = new HashMap<>();
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", user.getUsername());
        userInfo.put("avatarColor", user.getAvatarColor());
        userInfo.put("points", user.getPoints());
        
        out.put("user", userInfo);
        out.put("certifications", verifiedCerts);

        return out;
    }

    private Map<String, Object> toMap(Certification cert) {
        Map<String, Object> out = new HashMap<>();
        out.put("id", cert.getId());
        out.put("title", cert.getTitle());
        out.put("issuer", cert.getIssuer());
        out.put("credentialId", cert.getCredentialId());
        out.put("issueDate", cert.getIssueDate());
        out.put("expiryDate", cert.getExpiryDate());
        // Exclude documentBase64 (LOB) from portfolio view to avoid lazy loading issues
        out.put("documentName", cert.getDocumentName());
        out.put("documentMimeType", cert.getDocumentMimeType());
        out.put("tags", new ArrayList<>()); // Don't load lazy LOB tagsCSV field
        out.put("verificationStatus", cert.getVerificationStatus());
        return out;
    }

    private List<Certification> getUserCertificationsSafe(String userId) {
        String normalizedUserId = safeString(userId).trim();
        try {
            return certificationRepository.findByUserIdOrderByCreatedAtDesc(normalizedUserId);
        } catch (RuntimeException ex) {
            return certificationRepository.findAll().stream()
                    .filter(c -> normalizedUserId.equalsIgnoreCase(safeString(c.getUserId()).trim()))
                    .sorted(Comparator.comparing(Certification::getCreatedAt,
                            Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .toList();
        }
    }

    private String safeString(String value) {
        return value == null ? "" : value;
    }

    private static @NonNull String requireId(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value;
    }
}
