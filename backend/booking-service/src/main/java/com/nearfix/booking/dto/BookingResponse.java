package com.nearfix.booking.dto;

import com.nearfix.booking.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long bookingId;
    private Long customerId;
    private Long workerId;
    private String serviceType;
    private String issueDescription;
    private String address;
    private String city;
    private BookingStatus status;
    private LocalDateTime createdAt;
}
