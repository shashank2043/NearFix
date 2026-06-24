package com.nearfix.booking.client.dto;

public record WorkerProfileResponse(
    Long id,
    String skill,
    Integer experience,
    String city,
    String aadhaarNumber,
    Double rating,
    Boolean verified,
    String status
) {}
