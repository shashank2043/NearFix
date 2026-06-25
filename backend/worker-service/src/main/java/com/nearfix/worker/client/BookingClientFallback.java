package com.nearfix.worker.client;

import com.nearfix.worker.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class BookingClientFallback implements BookingClient {

    private static final Logger log = LoggerFactory.getLogger(BookingClientFallback.class);

    @Override
    public Boolean hasActiveBooking(Long workerId) {
        log.error("Booking Service is down. Fallback triggered for hasActiveBooking for workerId: {}", workerId);
        throw new ServiceUnavailableException("Booking Service is currently unavailable. Please try again later.");
    }
}
