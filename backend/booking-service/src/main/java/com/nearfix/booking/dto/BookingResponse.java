package com.nearfix.booking.dto;

import com.nearfix.booking.entity.BookingStatus;
import java.time.LocalDateTime;

public record BookingResponse(
    Long id,
    Long bookingId,
    Long customerId,
    Long workerId,
    String serviceType,
    String issueDescription,
    String address,
    String city,
    BookingStatus status,
    LocalDateTime createdAt,
    Double workerLatitude,
    Double workerLongitude,
    String workerLocation,
    Double distance,
    Double amount
) {}
