package com.nearfix.notification.consumer;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consume(NotificationRequest request) {
        log.info("Received notification request from Kafka: recipient={}, subject={}", request.to(), request.subject());
        try {
            notificationService.sendNotification(request);
        } catch (Exception e) {
            log.error("Failed to process notification request from Kafka for recipient {}", request.to(), e);
        }
    }
}
