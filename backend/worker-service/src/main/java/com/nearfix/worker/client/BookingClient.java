package com.nearfix.worker.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "booking-service", url = "${booking.service.url:http://localhost:8083}")
public interface BookingClient {

    @GetMapping("/api/bookings/worker/has-active")
    Boolean hasActiveBooking(@RequestParam("workerId") Long workerId);
}
