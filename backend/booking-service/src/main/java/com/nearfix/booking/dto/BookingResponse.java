package com.nearfix.booking.dto;

import com.nearfix.booking.entity.BookingStatus;
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
    private BookingStatus status;
}
