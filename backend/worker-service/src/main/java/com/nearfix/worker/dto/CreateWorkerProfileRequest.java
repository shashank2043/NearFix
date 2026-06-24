package com.nearfix.worker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateWorkerProfileRequest(
    @NotBlank(message = "Skill is required")
    String skill,

    @NotNull(message = "Experience is required")
    @Min(value = 0, message = "Experience must be greater than or equal to 0")
    Integer experience,

    @NotBlank(message = "City is required")
    String city,

    @NotBlank(message = "Aadhaar number is required")
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must be exactly 12 digits")
    String aadhaarNumber
) {}
