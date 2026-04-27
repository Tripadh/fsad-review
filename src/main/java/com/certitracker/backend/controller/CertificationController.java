package com.certitracker.backend.controller;

import com.certitracker.backend.dto.CertificateScanRequest;
import com.certitracker.backend.dto.RenewalRequest;
import com.certitracker.backend.model.Certification;
import com.certitracker.backend.repository.CertificationRepository;
import com.certitracker.backend.repository.UserRepository;
import com.certitracker.backend.service.CertificateScanService;
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
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/certifications")
public class CertificationController {
    private final CertificationRepository certificationRepository;
    private final UserRepository userRepository;
    private final CertificateScanService certificateScanService;

    public CertificationController(
            CertificationRepository certificationRepository,
            UserRepository userRepository,
            CertificateScanService certificateScanService
    ) {
        this.certificationRepository = certificationRepository;
        this.userRepository = userRepository;
        this.certificateScanService = certificateScanService;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return certificationRepository.findAll().stream().map(this::toMapWithoutLob).toList();
    }

    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getByUser(@PathVariable String userId) {
        return getUserCertificationsSafe(userId).stream().map(this::toMapWithoutLob).toList();
    }

    @GetMapping("/{id}")
    public Map<String, Object> getById(@PathVariable String id) {
        String certificationId = requireId(id, "id");
        Certification cert = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found"));
        return toMapWithLob(cert);
    }

    @PostMapping("/scan")
    public Map<String, Object> scan(@RequestBody CertificateScanRequest body) {
        CertificateScanService.ScanResult result = certificateScanService.scan(
                body.documentBase64(),
                body.documentName(),
                body.documentMimeType()
        );

        return Map.of(
                "extractedText", result.extractedText(),
                "suggestions", result.suggestions(),
                "warnings", result.warnings()
        );
    }

    @PostMapping
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        Certification cert = new Certification();
        String userId = getRequiredString(body, "userId");
        cert.setId(UUID.randomUUID().toString());
        cert.setUserId(userId);
        cert.setTitle(getRequiredString(body, "title"));
        cert.setIssuer(getRequiredString(body, "issuer"));
        cert.setCredentialId(getOptionalString(body, "credentialId", ""));
        cert.setIssueDate(parseDate(getRequiredString(body, "issueDate")));
        cert.setExpiryDate(parseNullableDate(getOptionalString(body, "expiryDate", null)));
        cert.setDocumentBase64(getOptionalString(body, "documentBase64", null));
        cert.setDocumentName(getOptionalString(body, "documentName", null));
        cert.setDocumentMimeType(getOptionalString(body, "documentMimeType", null));
        cert.setTagsCsv(joinTags(body.get("tags")));
        cert.setVerificationStatus(getOptionalString(body, "verificationStatus", "pending"));
        cert.setNotified(false);
        cert.setCreatedAt(Instant.now());
        cert.setUpdatedAt(Instant.now());

        certificationRepository.save(cert);

        if ("verified".equalsIgnoreCase(cert.getVerificationStatus())) {
            userRepository.findById(Objects.requireNonNull(userId)).ifPresent(user -> {
                user.setPoints(user.getPoints() + 100);
                userRepository.save(user);
            });
        }

        return toMapWithLob(cert);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String certificationId = requireId(id, "id");
        Certification cert = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found"));

        cert.setTitle(getOptionalString(body, "title", cert.getTitle()));
        cert.setIssuer(getOptionalString(body, "issuer", cert.getIssuer()));
        cert.setCredentialId(getOptionalString(body, "credentialId", cert.getCredentialId()));
        if (body.containsKey("issueDate") && body.get("issueDate") != null) {
            cert.setIssueDate(parseDate(String.valueOf(body.get("issueDate"))));
        }
        if (body.containsKey("expiryDate")) {
            cert.setExpiryDate(parseNullableDate(getOptionalString(body, "expiryDate", null)));
        }
        cert.setDocumentBase64(getOptionalString(body, "documentBase64", cert.getDocumentBase64()));
        cert.setDocumentName(getOptionalString(body, "documentName", cert.getDocumentName()));
        cert.setDocumentMimeType(getOptionalString(body, "documentMimeType", cert.getDocumentMimeType()));
        cert.setTagsCsv(joinTags(body.getOrDefault("tags", splitTags(cert.getTagsCsv()))));
        if (body.containsKey("notified")) {
            cert.setNotified(Boolean.TRUE.equals(body.get("notified")));
        }
        boolean wasVerified = "verified".equalsIgnoreCase(cert.getVerificationStatus());

        if (body.containsKey("verificationStatus")) {
            cert.setVerificationStatus(String.valueOf(body.get("verificationStatus")));
        }
        cert.setUpdatedAt(Instant.now());

        certificationRepository.save(cert);

        boolean isVerifiedNow = "verified".equalsIgnoreCase(cert.getVerificationStatus());
        if (!wasVerified && isVerifiedNow) {
            String certUserId = cert.getUserId();
            if (certUserId != null && !certUserId.isBlank()) {
                userRepository.findById(certUserId).ifPresent(user -> {
                    user.setPoints(user.getPoints() + 100);
                    userRepository.save(user);
                });
            }
        }

        return toMapWithLob(cert);
    }

    @PostMapping("/{id}/renew")
    public Map<String, Object> renew(@PathVariable String id, @RequestBody RenewalRequest body) {
        String certificationId = requireId(id, "id");
        Certification cert = certificationRepository.findById(certificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certification not found"));

        cert.setExpiryDate(body.newExpiryDate());
        cert.setNotified(false);
        cert.setUpdatedAt(Instant.now());
        certificationRepository.save(cert);

        return toMapWithLob(cert);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        certificationRepository.deleteById(requireId(id, "id"));
    }

    @GetMapping("/suggestions/{userId}")
    public Map<String, Object> getSuggestions(@PathVariable String userId) {
        List<Certification> userCerts = getUserCertificationsSafe(userId);
        List<Map<String, Object>> suggestions = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        // Group certifications by urgency
        List<Certification> expiredCerts = new ArrayList<>();
        List<Certification> expiringSoon = new ArrayList<>();  // 0-30 days
        List<Certification> planRenewal = new ArrayList<>();   // 30-90 days
        List<Certification> recentlyVerified = new ArrayList<>();
        
        for (Certification cert : userCerts) {
            if (cert.getExpiryDate() == null) {
                continue;  // No expiry date, no action needed
            }
            
            long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, cert.getExpiryDate());
            
            if (daysUntilExpiry < 0) {
                expiredCerts.add(cert);
            } else if (daysUntilExpiry <= 30) {
                expiringSoon.add(cert);
            } else if (daysUntilExpiry <= 90) {
                planRenewal.add(cert);
            }
            
            if ("verified".equalsIgnoreCase(cert.getVerificationStatus()) && 
                cert.getUpdatedAt() != null && 
                cert.getUpdatedAt().isAfter(Instant.now().minusSeconds(7 * 24 * 3600))) {
                recentlyVerified.add(cert);
            }
        }
        
        // Generate suggestions for expired certificates (URGENT)
        for (Certification cert : expiredCerts) {
            long daysExpired = java.time.temporal.ChronoUnit.DAYS.between(cert.getExpiryDate(), today);
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("id", safeString(cert.getId(), ""));
            suggestion.put("type", "expired");
            suggestion.put("priority", "urgent");
            suggestion.put("title", "🚨 RENEW NOW: " + safeString(cert.getTitle(), "Untitled Certification"));
            suggestion.put("description", "This certification expired " + daysExpired + " days ago. Renew it immediately to maintain your credentials.");
            suggestion.put("action", "Renew Certification");
            suggestion.put("certTitle", safeString(cert.getTitle(), "Untitled Certification"));
            suggestion.put("issuer", safeString(cert.getIssuer(), "Unknown Issuer"));
            suggestions.add(suggestion);
        }
        
        // Generate suggestions for certs expiring soon (HIGH PRIORITY)
        for (Certification cert : expiringSoon) {
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, cert.getExpiryDate());
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("id", safeString(cert.getId(), ""));
            suggestion.put("type", "expiring_soon");
            suggestion.put("priority", "high");
            suggestion.put("title", "⏰ " + safeString(cert.getTitle(), "Untitled Certification") + " expires in " + daysLeft + " days");
            suggestion.put("description", "Start the renewal process now to ensure no lapse in your credential.");
            suggestion.put("action", "Renew Now");
            suggestion.put("certTitle", safeString(cert.getTitle(), "Untitled Certification"));
            suggestion.put("issuer", safeString(cert.getIssuer(), "Unknown Issuer"));
            suggestion.put("expiryDate", cert.getExpiryDate());
            suggestions.add(suggestion);
        }
        
        // Generate suggestions for certs to plan renewal (MEDIUM PRIORITY)
        for (Certification cert : planRenewal) {
            long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, cert.getExpiryDate());
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("id", safeString(cert.getId(), ""));
            suggestion.put("type", "plan_renewal");
            suggestion.put("priority", "medium");
            suggestion.put("title", "📋 Plan renewal for " + safeString(cert.getTitle(), "Untitled Certification"));
            suggestion.put("description", "Expires in " + daysLeft + " days. Mark your calendar and plan the renewal.");
            suggestion.put("action", "Schedule Renewal");
            suggestion.put("certTitle", safeString(cert.getTitle(), "Untitled Certification"));
            suggestion.put("issuer", safeString(cert.getIssuer(), "Unknown Issuer"));
            suggestion.put("expiryDate", cert.getExpiryDate());
            suggestions.add(suggestion);
        }
        
        // Generate suggestions for recently verified (ACHIEVEMENT)
        for (Certification cert : recentlyVerified) {
            Map<String, Object> suggestion = new HashMap<>();
            suggestion.put("id", safeString(cert.getId(), ""));
            suggestion.put("type", "recently_verified");
            suggestion.put("priority", "low");
            suggestion.put("title", "🎉 Great! " + safeString(cert.getTitle(), "Untitled Certification") + " verified");
            suggestion.put("description", "Your certification has been verified. Keep building your skills!");
            suggestion.put("action", "View Details");
            suggestion.put("certTitle", safeString(cert.getTitle(), "Untitled Certification"));
            suggestion.put("issuer", safeString(cert.getIssuer(), "Unknown Issuer"));
            suggestions.add(suggestion);
        }
        
        // If no certs exist, suggest adding first one
        if (userCerts.isEmpty()) {
            suggestions.add(Map.of(
                "id", "",
                "type", "no_certs",
                "priority", "medium",
                "title", "📚 Start Your Journey",
                "description", "Add your first certification to begin tracking your professional growth.",
                "action", "Add Certification"
            ));
        }
        
        return Map.of(
            "suggestions", suggestions,
            "totalCertifications", userCerts.size(),
            "expiredCount", expiredCerts.size(),
            "expiringSoonCount", expiringSoon.size()
        );
    }

    @GetMapping("/calendar/{userId}")
    public Map<String, Object> getCalendarEvents(@PathVariable String userId) {
        List<Certification> userCerts = getUserCertificationsSafe(userId);
        List<Map<String, Object>> events = new ArrayList<>();
        
        LocalDate today = LocalDate.now();
        
        for (Certification cert : userCerts) {
            // Issue date event
            if (cert.getIssueDate() != null) {
                events.add(Map.of(
                    "date", cert.getIssueDate().toString(),
                    "title", cert.getTitle() + " - Issued",
                    "description", "Received from " + cert.getIssuer(),
                    "issuer", cert.getIssuer(),
                    "eventType", "renewal",
                    "icon", "📜",
                    "certId", cert.getId()
                ));
            }
            
            // Expiry date event
            if (cert.getExpiryDate() != null) {
                long daysUntilExpiry = ChronoUnit.DAYS.between(today, cert.getExpiryDate());
                
                String eventType;
                String icon;
                if (daysUntilExpiry < 0) {
                    eventType = "expired";
                    icon = "🚨";
                } else if (daysUntilExpiry <= 30) {
                    eventType = "expiry";
                    icon = "⏰";
                } else {
                    eventType = "renewal";
                    icon = "📅";
                }
                
                events.add(Map.of(
                    "date", cert.getExpiryDate().toString(),
                    "title", cert.getTitle() + " - Expires",
                    "description", daysUntilExpiry < 0 ? 
                        "Expired " + Math.abs(daysUntilExpiry) + " days ago" : 
                        "Expires in " + daysUntilExpiry + " days",
                    "issuer", cert.getIssuer(),
                    "eventType", eventType,
                    "icon", icon,
                    "certId", cert.getId()
                ));
            }
            
            // Verification status event
            if (cert.getUpdatedAt() != null && "verified".equalsIgnoreCase(cert.getVerificationStatus())) {
                LocalDate verifiedDate = cert.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                events.add(Map.of(
                    "date", verifiedDate.toString(),
                    "title", cert.getTitle() + " - Verified",
                    "description", "Successfully verified your certification",
                    "issuer", cert.getIssuer(),
                    "eventType", "verified",
                    "icon", "✅",
                    "certId", cert.getId()
                ));
            }
        }
        
        return Map.of(
            "events", events,
            "totalEvents", events.size()
        );
    }

    @GetMapping("/calendar/{userId}/export")
    public org.springframework.http.ResponseEntity<byte[]> exportCalendarAsICAL(@PathVariable String userId) {
        List<Certification> userCerts = getUserCertificationsSafe(userId);
        
        StringBuilder ical = new StringBuilder();
        ical.append("BEGIN:VCALENDAR\r\n");
        ical.append("VERSION:2.0\r\n");
        ical.append("PRODID:-//CertiTracker//Certification Calendar//EN\r\n");
        ical.append("CALSCALE:GREGORIAN\r\n");
        ical.append("METHOD:PUBLISH\r\n");
        ical.append("X-WR-CALNAME:Certification Tracker\r\n");
        ical.append("X-WR-TIMEZONE:UTC\r\n");
        
        LocalDate today = LocalDate.now();
        
        for (Certification cert : userCerts) {
            // Expiry event
            if (cert.getExpiryDate() != null) {
                long daysUntilExpiry = ChronoUnit.DAYS.between(today, cert.getExpiryDate());
                String summary = daysUntilExpiry < 0 ? 
                    "🚨 EXPIRED: " + cert.getTitle() : 
                    "⏰ EXPIRES: " + cert.getTitle();
                
                ical.append("BEGIN:VEVENT\r\n");
                ical.append("UID:exp-").append(cert.getId()).append("@certitracker.local\r\n");
                ical.append("DTSTAMP:").append(formatICALDate(Instant.now())).append("\r\n");
                ical.append("DTSTART:").append(formatICALDateOnly(cert.getExpiryDate())).append("\r\n");
                ical.append("DTEND:").append(formatICALDateOnly(cert.getExpiryDate().plusDays(1))).append("\r\n");
                ical.append("SUMMARY:").append(summary).append("\r\n");
                ical.append("DESCRIPTION:").append(cert.getTitle()).append(" from ").append(cert.getIssuer()).append("\r\n");
                ical.append("LOCATION:CertiTracker\r\n");
                ical.append("STATUS:CONFIRMED\r\n");
                
                // Add reminder 7 days before
                if (daysUntilExpiry > 7) {
                    ical.append("BEGIN:VALARM\r\n");
                    ical.append("TRIGGER:-P7D\r\n");
                    ical.append("DESCRIPTION:Certification expiration reminder\r\n");
                    ical.append("ACTION:DISPLAY\r\n");
                    ical.append("END:VALARM\r\n");
                }
                
                ical.append("END:VEVENT\r\n");
            }
            
            // Issue date event
            if (cert.getIssueDate() != null) {
                ical.append("BEGIN:VEVENT\r\n");
                ical.append("UID:iss-").append(cert.getId()).append("@certitracker.local\r\n");
                ical.append("DTSTAMP:").append(formatICALDate(Instant.now())).append("\r\n");
                ical.append("DTSTART:").append(formatICALDateOnly(cert.getIssueDate())).append("\r\n");
                ical.append("DTEND:").append(formatICALDateOnly(cert.getIssueDate().plusDays(1))).append("\r\n");
                ical.append("SUMMARY:📜 ISSUED: ").append(cert.getTitle()).append("\r\n");
                ical.append("DESCRIPTION:").append(cert.getTitle()).append(" issued by ").append(cert.getIssuer()).append("\r\n");
                ical.append("LOCATION:CertiTracker\r\n");
                ical.append("STATUS:CONFIRMED\r\n");
                ical.append("END:VEVENT\r\n");
            }
        }
        
        ical.append("END:VCALENDAR\r\n");
        
        byte[] icalBytes = ical.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return org.springframework.http.ResponseEntity.ok()
            .header("Content-Type", "text/calendar; charset=utf-8")
            .header("Content-Disposition", "attachment; filename=\"certifications.ics\"")
            .body(icalBytes);
    }

    private String formatICALDate(Instant instant) {
        return instant.toString().replace("-", "").replace(":", "").replace(".000Z", "Z");
    }

    private String formatICALDateOnly(LocalDate date) {
        return date.toString().replace("-", "");
    }

    private Map<String, Object> toMapWithoutLob(Certification cert) {
        Map<String, Object> out = new HashMap<>();
        out.put("id", cert.getId());
        out.put("userId", cert.getUserId());
        out.put("title", cert.getTitle());
        out.put("issuer", cert.getIssuer());
        out.put("credentialId", cert.getCredentialId());
        out.put("issueDate", cert.getIssueDate());
        out.put("expiryDate", cert.getExpiryDate());
        out.put("documentName", cert.getDocumentName());
        out.put("documentMimeType", cert.getDocumentMimeType());
        out.put("tags", new ArrayList<>());  // Don't load LOB tagsCsv
        out.put("verificationStatus", cert.getVerificationStatus());
        out.put("renewalHistory", List.of());
        out.put("notified", cert.isNotified());
        out.put("createdAt", cert.getCreatedAt());
        out.put("updatedAt", cert.getUpdatedAt());
        return out;
    }

    private Map<String, Object> toMapWithLob(Certification cert) {
        Map<String, Object> out = new HashMap<>();
        out.put("id", cert.getId());
        out.put("userId", cert.getUserId());
        out.put("title", cert.getTitle());
        out.put("issuer", cert.getIssuer());
        out.put("credentialId", cert.getCredentialId());
        out.put("issueDate", cert.getIssueDate());
        out.put("expiryDate", cert.getExpiryDate());
        out.put("documentBase64", cert.getDocumentBase64());  // Include LOB for detail view
        out.put("documentName", cert.getDocumentName());
        out.put("documentMimeType", cert.getDocumentMimeType());
        out.put("tags", splitTags(cert.getTagsCsv()));
        out.put("verificationStatus", cert.getVerificationStatus());
        out.put("renewalHistory", List.of());
        out.put("notified", cert.isNotified());
        out.put("createdAt", cert.getCreatedAt());
        out.put("updatedAt", cert.getUpdatedAt());
        return out;
    }

    private static String joinTags(Object value) {
        if (value instanceof List<?> tags) {
            return tags.stream().map(String::valueOf).map(String::trim).filter(s -> !s.isBlank()).reduce((a, b) -> a + "," + b).orElse("");
        }
        if (value instanceof String s) {
            return s;
        }
        return "";
    }

    private static List<String> splitTags(String csv) {
        if (csv == null || csv.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isBlank()).toList();
    }

    private static LocalDate parseDate(String value) {
        return LocalDate.parse(value);
    }

    private static LocalDate parseNullableDate(String value) {
        if (value == null || value.isBlank() || "null".equalsIgnoreCase(value) || "undefined".equalsIgnoreCase(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private static String getRequiredString(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, key + " is required");
        }
        return value.toString();
    }

    private static @NonNull String requireId(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
        return value;
    }

    private static String getOptionalString(Map<String, Object> body, String key, String defaultValue) {
        Object value = body.get(key);
        return value == null ? defaultValue : String.valueOf(value);
    }

    private List<Certification> getUserCertificationsSafe(String userId) {
        String normalizedUserId = safeString(userId, "").trim();
        try {
            return certificationRepository.findByUserIdOrderByCreatedAtDesc(normalizedUserId);
        } catch (RuntimeException ex) {
            return certificationRepository.findAll().stream()
                    .filter(c -> normalizedUserId.equalsIgnoreCase(safeString(c.getUserId(), "").trim()))
                    .sorted(Comparator.comparing(Certification::getCreatedAt,
                            Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .toList();
        }
    }

    private static String safeString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
