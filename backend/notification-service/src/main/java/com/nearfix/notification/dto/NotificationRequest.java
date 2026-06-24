package com.nearfix.notification.dto;

import jakarta.validation.constraints.NotBlank;

public record NotificationRequest(
    @NotBlank(message = "Recipient 'to' email is required") String to,
    @NotBlank(message = "Subject is required") String subject,
    @NotBlank(message = "Message is required") String message
) {}
