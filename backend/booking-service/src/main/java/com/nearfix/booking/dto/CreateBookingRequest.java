package com.nearfix.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull(message = "Service type is required")
    private String serviceType;

    @NotNull(message = "Issue description is required")
    @Size(min = 10, message = "Issue description must be at least 10 characters")
    private String issueDescription;

    @NotNull(message = "Address is required")
    private String address;

    @NotNull(message = "City is required")
    private String city;
}
