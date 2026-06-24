package com.nearfix.payment.client.dto;

public record BookingResponse(
    Long bookingId,
    Long customerId,
    Long workerId,
    String status,
    Double amount
) {}
