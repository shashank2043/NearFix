package com.nearfix.booking.dto;

import com.nearfix.booking.entity.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateBookingStatusRequest(
    @NotNull(message = "Status is required") BookingStatus status,
    Double workerLatitude,
    Double workerLongitude,
    Double distance,
    Double amount
) {}
