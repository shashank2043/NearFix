package com.nearfix.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateBookingRequest(
    @NotNull(message = "Service type is required")
    String serviceType,
    @NotNull(message = "Issue description is required") @Size(min = 10, message = "Issue description must be at least 10 characters")
    String issueDescription,
    @NotNull(message = "Address is required")
    String address,
    @NotNull(message = "City is required")
    String city
) {}
