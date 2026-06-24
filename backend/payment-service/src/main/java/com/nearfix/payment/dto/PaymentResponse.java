package com.nearfix.payment.dto;

import com.nearfix.payment.entity.PaymentStatus;

public record PaymentResponse(
    String transactionId,
    PaymentStatus status,
    String keyId
) {}
