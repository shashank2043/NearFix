package com.nearfix.worker.dto;

import com.nearfix.worker.entity.WorkerStatus;

public record WorkerProfileResponse(
    Long id,
    String skill,
    Integer experience,
    String city,
    String aadhaarNumber,
    Double rating,
    Boolean verified,
    WorkerStatus status
) {}
