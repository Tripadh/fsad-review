package com.certitracker.backend.dto;

public record CertificateScanRequest(
        String documentBase64,
        String documentName,
        String documentMimeType
) {
}
