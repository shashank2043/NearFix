package com.nearfix.notification.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Title is required")
    private String title;

    @NotNull(message = "Message is required")
    private String message;
}
