package com.nearfix.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record CreatePaymentRequest(
    @NotNull(message = "Booking ID is required") Long bookingId,
    @NotNull(message = "Amount is required") @DecimalMin(value = "0.01", message = "Amount must be greater than zero") Double amount
) {}
