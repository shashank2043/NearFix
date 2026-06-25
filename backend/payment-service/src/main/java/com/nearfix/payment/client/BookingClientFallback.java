package com.nearfix.payment.client;

import com.nearfix.payment.client.dto.BookingResponse;
import com.nearfix.payment.client.dto.UpdateBookingStatusRequest;
import com.nearfix.payment.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class BookingClientFallback implements BookingClient {

    @Override
    public BookingResponse getBookingById(Long id, Long userId, String userRole) {
        log.error("Booking Service is down. Fallback triggered for getBookingById with id: {}", id);
        throw new ServiceUnavailableException("Booking Service is currently unavailable. Please try again later.");
    }

    @Override
    public BookingResponse updateBookingStatus(Long id, Long userId, String userRole, UpdateBookingStatusRequest request) {
        log.error("Booking Service is down. Fallback triggered for updateBookingStatus with id: {}", id);
        throw new ServiceUnavailableException("Booking Service is currently unavailable. Please try again later.");
    }
}
