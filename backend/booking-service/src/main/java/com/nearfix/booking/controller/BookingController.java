package com.nearfix.booking.controller;

import com.nearfix.booking.config.SecurityUtils;
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
            @Valid @RequestBody CreateBookingRequest request) {
        Long customerId = SecurityUtils.getUserId();
        String customerRole = SecurityUtils.getUserRole();
        BookingResponse response = bookingService.createBooking(customerId, customerRole, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id) {
        Long userId = SecurityUtils.getUserId();
        String userRole = SecurityUtils.getUserRole();
        BookingResponse response = bookingService.getBookingById(id, userId, userRole);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer")
    public ResponseEntity<List<BookingResponse>> getCustomerBookings() {
        Long customerId = SecurityUtils.getUserId();
        List<BookingResponse> responses = bookingService.getBookingsForCustomer(customerId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/worker")
    public ResponseEntity<List<BookingResponse>> getWorkerBookings() {
        Long workerId = SecurityUtils.getUserId();
        List<BookingResponse> responses = bookingService.getBookingsForWorker(workerId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/worker/has-active")
    public ResponseEntity<Boolean> hasActiveBooking(@RequestParam("workerId") Long workerId) {
        boolean hasActive = bookingService.hasActiveBookingForWorker(workerId);
        return ResponseEntity.ok(hasActive);
    }

    @GetMapping("/available")
    public ResponseEntity<List<BookingResponse>> getAvailableBookings(
            @RequestParam("skill") String skill,
            @RequestParam("city") String city) {
        List<BookingResponse> responses = bookingService.getAvailableBookings(skill, city);
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingStatusRequest request) {
        Long userId = SecurityUtils.getUserId();
        String userRole = SecurityUtils.getUserRole();
        BookingResponse response = bookingService.updateBookingStatus(id, userId, userRole, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/assign-worker/{workerId}")
    public ResponseEntity<BookingResponse> assignWorker(
            @PathVariable Long id,
            @PathVariable Long workerId) {
        BookingResponse response = bookingService.assignWorker(id, workerId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/worker-location")
    public ResponseEntity<BookingResponse> updateWorkerLocation(
            @PathVariable Long id,
            @RequestBody UpdateBookingStatusRequest request) {
        BookingResponse response = bookingService.updateWorkerLocation(id, request.getWorkerLatitude(), request.getWorkerLongitude());
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> responses = bookingService.getAllBookings();
        return ResponseEntity.ok(responses);
    }
}
