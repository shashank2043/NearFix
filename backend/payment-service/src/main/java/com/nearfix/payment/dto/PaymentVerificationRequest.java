package com.nearfix.payment.dto;

import jakarta.validation.constraints.NotNull;

public record PaymentVerificationRequest(
    @NotNull(message = "Booking ID is required") Long bookingId,
    @NotNull(message = "Transaction ID is required") String transactionId,
    String razorpayPaymentId,
    String razorpaySignature
) {}
