package com.nearfix.payment.client;

import com.nearfix.payment.client.dto.BookingResponse;
import com.nearfix.payment.client.dto.UpdateBookingStatusRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "booking-service", path = "/api/bookings", fallback = BookingClientFallback.class)
public interface BookingClient {

    @GetMapping("/{id}")
    BookingResponse getBookingById(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole
    );

    @PutMapping("/{id}/status")
    BookingResponse updateBookingStatus(
            @PathVariable("id") Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole,
            @RequestBody UpdateBookingStatusRequest request
    );
}
