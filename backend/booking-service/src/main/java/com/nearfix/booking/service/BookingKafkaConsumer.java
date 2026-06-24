package com.nearfix.booking.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BookingKafkaConsumer {

    @KafkaListener(topics = "${spring.kafka.topic.work-requests:work-requests}", groupId = "booking-group")
    public void consumeWorkRequest(String message) {
        log.info("Received work request event from Kafka topic: {}", message);
    }
}
