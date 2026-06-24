package com.nearfix.payment.client.dto;

public record NotificationRequest(
    String to,
    String subject,
    String message
) {}
