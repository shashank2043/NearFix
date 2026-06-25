package com.nearfix.booking.client;

import com.nearfix.booking.client.dto.NotificationRequest;
import com.nearfix.booking.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class NotificationClientFallback implements NotificationClient {

    @Override
    public void sendNotification(NotificationRequest request) {
        log.error("Notification Service is down. Fallback triggered for sendNotification. Recipient: {}", 
                 request != null ? request.to() : "null");
        throw new ServiceUnavailableException("Notification Service is currently unavailable. Please try again later.");
    }
}
