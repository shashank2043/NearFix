package com.nearfix.booking.client.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkerProfileResponse {
    private Long id;
    private String skill;
    private Integer experience;
    private String city;
    private Double rating;
    private Boolean verified;
    private String status; // AVAILABLE, BUSY, OFFLINE
}
