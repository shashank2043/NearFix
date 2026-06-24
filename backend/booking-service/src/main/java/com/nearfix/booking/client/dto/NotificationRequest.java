package com.nearfix.booking.client.dto;

public record NotificationRequest(
    String to,
    String subject,
    String message
) {}
