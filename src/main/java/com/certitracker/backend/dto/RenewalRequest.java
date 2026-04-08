package com.certitracker.backend.dto;

import java.time.LocalDate;

public record RenewalRequest(
        LocalDate newExpiryDate,
        String note,
        String adminId
) {
}
