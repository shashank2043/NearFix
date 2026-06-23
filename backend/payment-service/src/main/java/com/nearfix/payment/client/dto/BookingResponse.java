package com.nearfix.payment.client.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;
    private Long customerId;
    private Long workerId;
    private String status; // BookingStatus representation
}
