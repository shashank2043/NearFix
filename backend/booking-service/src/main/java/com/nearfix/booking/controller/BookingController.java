package com.nearfix.booking.controller;

import com.nearfix.booking.dto.BookingResponse;
import com.nearfix.booking.dto.CreateBookingRequest;
import com.nearfix.booking.dto.UpdateBookingStatusRequest;
import com.nearfix.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader("X-User-Id") Long customerId,
            @RequestHeader("X-User-Role") String customerRole,
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse response = bookingService.createBooking(customerId, customerRole, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole) {
        BookingResponse response = bookingService.getBookingById(id, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer")
    public ResponseEntity<List<BookingResponse>> getCustomerBookings(
            @RequestHeader("X-User-Id") Long customerId) {
        List<BookingResponse> responses = bookingService.getBookingsForCustomer(customerId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/worker")
    public ResponseEntity<List<BookingResponse>> getWorkerBookings(
            @RequestHeader("X-User-Id") Long workerId) {
        List<BookingResponse> responses = bookingService.getBookingsForWorker(workerId);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String userRole,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        BookingResponse response = bookingService.updateBookingStatus(id, userId, userRole, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/assign-worker/{workerId}")
    public ResponseEntity<BookingResponse> assignWorker(
            @PathVariable Long id,
            @PathVariable Long workerId) {
        BookingResponse response = bookingService.assignWorker(id, workerId);
        return ResponseEntity.ok(response);
    }
}
