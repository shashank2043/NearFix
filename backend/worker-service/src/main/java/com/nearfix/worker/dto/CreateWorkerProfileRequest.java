package com.nearfix.worker.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateWorkerProfileRequest(
    @NotBlank(message = "Skill is required")
    String skill,

    @NotNull(message = "Experience is required")
    @Min(value = 0, message = "Experience must be greater than or equal to 0")
    Integer experience,

    @NotBlank(message = "City is required")
    String city
) {}
