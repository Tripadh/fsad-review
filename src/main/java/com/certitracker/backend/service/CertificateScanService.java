package com.certitracker.backend.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CertificateScanService {

    private static final Pattern ISSUE_PATTERN = Pattern.compile("(?i)(issue\\s*date|issued\\s*on|date\\s*of\\s*issue)\\s*[:\\-]?\\s*([A-Za-z0-9,\\-\\/ ]{6,40})");
    private static final Pattern EXPIRY_PATTERN = Pattern.compile("(?i)(expiry\\s*date|expiration\\s*date|valid\\s*until|expires\\s*on)\\s*[:\\-]?\\s*([A-Za-z0-9,\\-\\/ ]{6,40})");
    private static final Pattern CREDENTIAL_PATTERN = Pattern.compile("(?i)(credential\\s*id|certificate\\s*id|cert\\s*id|id|license\\s*no)\\s*[:#\\-]?\\s*([A-Za-z0-9\\-_/]{4,})");
    private static final Pattern ISO_DATE = Pattern.compile("\\b(\\d{4}-\\d{2}-\\d{2})\\b");
    private static final Pattern DMY_DATE = Pattern.compile("\\b(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4})\\b");
    private static final Pattern LONG_DATE = Pattern.compile("\\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\s+\\d{1,2},?\\s+\\d{4}\\b", Pattern.CASE_INSENSITIVE);

    private final String ocrLanguage;
    private final String tessdataPath;

    public CertificateScanService(
            @Value("${app.ocr.language:eng}") String ocrLanguage,
            @Value("${app.ocr.tessdata-path:}") String tessdataPath
    ) {
        this.ocrLanguage = ocrLanguage;
        this.tessdataPath = tessdataPath;
    }

    public ScanResult scan(String dataUrlOrBase64, String fileName, String mimeType) {
        List<String> warnings = new ArrayList<>();
        byte[] fileBytes = decode(dataUrlOrBase64);

        String resolvedMime = resolveMime(dataUrlOrBase64, mimeType, fileName);
        String text = extractText(fileBytes, resolvedMime, warnings);
        Map<String, Object> suggestions = buildSuggestions(text);

        if (text.isBlank()) {
            warnings.add("No readable text detected from the file.");
        }

        return new ScanResult(text, suggestions, warnings);
    }

    private byte[] decode(String raw) {
        if (raw == null || raw.isBlank()) {
            return new byte[0];
        }
        String payload = raw;
        int comma = raw.indexOf(',');
        if (raw.startsWith("data:") && comma >= 0) {
            payload = raw.substring(comma + 1);
        }
        return Base64.getDecoder().decode(payload);
    }

    private String resolveMime(String dataUrl, String mimeType, String fileName) {
        if (mimeType != null && !mimeType.isBlank()) {
            return mimeType.toLowerCase(Locale.ROOT);
        }
        if (dataUrl != null && dataUrl.startsWith("data:")) {
            int semi = dataUrl.indexOf(';');
            if (semi > 5) {
                return dataUrl.substring(5, semi).toLowerCase(Locale.ROOT);
            }
        }
        String lower = fileName == null ? "" : fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".pdf")) {
            return "application/pdf";
        }
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        return "application/octet-stream";
    }

    private String extractText(byte[] fileBytes, String mimeType, List<String> warnings) {
        if (fileBytes.length == 0) {
            warnings.add("Uploaded file is empty.");
            return "";
        }

        if ("application/pdf".equals(mimeType)) {
            return extractPdfText(fileBytes, warnings);
        }

        if (mimeType.startsWith("image/")) {
            return extractImageText(fileBytes, warnings);
        }

        warnings.add("Unsupported file type for scanning: " + mimeType);
        return "";
    }

    private String extractPdfText(byte[] fileBytes, List<String> warnings) {
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            return new PDFTextStripper().getText(document);
        } catch (IOException ex) {
            warnings.add("Failed to read PDF content: " + ex.getMessage());
            return "";
        }
    }

    private String extractImageText(byte[] fileBytes, List<String> warnings) {
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(fileBytes));
            if (image == null) {
                warnings.add("Unable to parse image data.");
                return "";
            }

            Tesseract tesseract = new Tesseract();
            tesseract.setLanguage(ocrLanguage);
            if (tessdataPath != null && !tessdataPath.isBlank()) {
                tesseract.setDatapath(tessdataPath);
            }
            return tesseract.doOCR(image);
        } catch (UnsatisfiedLinkError ex) {
            warnings.add("OCR engine is unavailable on this machine. Install Tesseract OCR to enable image scanning.");
            return "";
        } catch (TesseractException ex) {
            warnings.add("Image OCR failed: " + ex.getMessage());
            return "";
        } catch (IOException ex) {
            warnings.add("Failed to read image data: " + ex.getMessage());
            return "";
        }
    }

    private Map<String, Object> buildSuggestions(String rawText) {
        String text = rawText == null ? "" : rawText.replace('\r', '\n');
        String title = detectTitle(text);
        String issuer = detectIssuer(text);
        String issueDate = detectIssueDate(text);
        String expiryDate = detectExpiryDate(text);
        String credentialId = detectCredentialId(text);
        List<String> tags = detectTags(text);

        return Map.of(
                "title", safe(title),
                "issuer", safe(issuer),
                "issueDate", safe(issueDate),
                "expiryDate", safe(expiryDate),
                "credentialId", safe(credentialId),
                "tags", tags
        );
    }

    private String detectTitle(String text) {
        String[] lines = text.split("\\n");
        for (String line : lines) {
            String value = line.trim();
            if (value.length() < 8 || value.length() > 90) {
                continue;
            }
            String lower = value.toLowerCase(Locale.ROOT);
            if (lower.contains("certificate") || lower.contains("issued") || lower.contains("verify") || lower.contains("credential")) {
                continue;
            }
            if (value.chars().filter(Character::isLetter).count() < 6) {
                continue;
            }
            return value;
        }
        return "";
    }

    private String detectIssuer(String text) {
        Pattern p = Pattern.compile("(?i)(issued\\s*by|issuer|awarded\\s*by|provided\\s*by)\\s*[:\\-]?\\s*([^\\n]{3,80})");
        Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(2).trim();
        }

        String lower = text.toLowerCase(Locale.ROOT);
        if (lower.contains("amazon web services") || lower.contains("aws")) return "Amazon Web Services";
        if (lower.contains("microsoft")) return "Microsoft";
        if (lower.contains("google")) return "Google";
        if (lower.contains("coursera")) return "Coursera";
        if (lower.contains("udemy")) return "Udemy";
        return "";
    }

    private String detectIssueDate(String text) {
        Matcher matcher = ISSUE_PATTERN.matcher(text);
        if (matcher.find()) {
            return toIsoDate(matcher.group(2));
        }
        return firstDetectedDate(text);
    }

    private String detectExpiryDate(String text) {
        Matcher matcher = EXPIRY_PATTERN.matcher(text);
        if (matcher.find()) {
            return toIsoDate(matcher.group(2));
        }
        return "";
    }

    private String detectCredentialId(String text) {
        Matcher matcher = CREDENTIAL_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group(2).trim();
        }
        return "";
    }

    private List<String> detectTags(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        Set<String> tags = new LinkedHashSet<>();
        if (lower.contains("aws") || lower.contains("amazon web services")) tags.add("aws");
        if (lower.contains("azure")) tags.add("azure");
        if (lower.contains("google cloud") || lower.contains("gcp")) tags.add("gcp");
        if (lower.contains("oracle")) tags.add("oracle");
        if (lower.contains("devops")) tags.add("devops");
        if (lower.contains("kubernetes")) tags.add("kubernetes");
        if (lower.contains("security")) tags.add("security");
        return new ArrayList<>(tags);
    }

    private String firstDetectedDate(String text) {
        Matcher iso = ISO_DATE.matcher(text);
        if (iso.find()) {
            return toIsoDate(iso.group(1));
        }
        Matcher dmy = DMY_DATE.matcher(text);
        if (dmy.find()) {
            return toIsoDate(dmy.group(1));
        }
        Matcher longDate = LONG_DATE.matcher(text);
        if (longDate.find()) {
            return toIsoDate(longDate.group());
        }
        return "";
    }

    private String toIsoDate(String raw) {
        String value = raw == null ? "" : raw.trim().replaceAll("\\s+", " ");
        if (value.isBlank()) {
            return "";
        }

        List<DateTimeFormatter> formatters = List.of(
                DateTimeFormatter.ISO_LOCAL_DATE,
                DateTimeFormatter.ofPattern("d/M/uuuu").withResolverStyle(ResolverStyle.SMART),
                DateTimeFormatter.ofPattern("d-M-uuuu").withResolverStyle(ResolverStyle.SMART),
                DateTimeFormatter.ofPattern("d/M/uu").withResolverStyle(ResolverStyle.SMART),
                DateTimeFormatter.ofPattern("d-M-uu").withResolverStyle(ResolverStyle.SMART),
                DateTimeFormatter.ofPattern("MMM d, uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART),
                DateTimeFormatter.ofPattern("MMMM d, uuuu", Locale.ENGLISH).withResolverStyle(ResolverStyle.SMART)
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDate.parse(value, formatter).toString();
            } catch (DateTimeParseException ignored) {
                // Try next known certificate date format.
            }
        }

        return "";
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    public record ScanResult(String extractedText, Map<String, Object> suggestions, List<String> warnings) {
    }
}
