package com.nearfix.booking.service;

import com.nearfix.booking.entity.Booking;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class BookingKafkaProducer {

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${spring.kafka.topic.work-requests:work-requests}")
    private String topicName;

    public void sendWorkRequest(Booking booking) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not auto-configured, skipping event publishing for booking ID: {}", booking.getId());
            return;
        }
        try {
            log.info("Publishing work request event to Kafka topic: {} for booking ID: {}", topicName, booking.getId());
            String message = String.format("{\"bookingId\": %d, \"customerId\": %d, \"serviceType\": \"%s\", \"city\": \"%s\", \"status\": \"%s\"}",
                    booking.getId(), booking.getCustomerId(), booking.getServiceType(), booking.getCity(), booking.getStatus());
            kafkaTemplate.send(topicName, String.valueOf(booking.getId()), message);
        } catch (Exception e) {
            log.error("Failed to publish booking request event to Kafka: {}", e.getMessage());
        }
    }
}
