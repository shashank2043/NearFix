package com.nearfix.payment.controller;

import com.nearfix.payment.dto.CreatePaymentRequest;
import com.nearfix.payment.dto.PaymentResponse;
import com.nearfix.payment.entity.Payment;
import com.nearfix.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(
            @RequestHeader("X-User-Id") Long customerId,
            @RequestHeader("X-User-Role") String customerRole,
            @Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(customerId, customerRole, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> getPaymentByBookingId(@PathVariable Long bookingId) {
        Payment payment = paymentService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(payment);
    }
}
