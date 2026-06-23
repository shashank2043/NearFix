package com.nearfix.worker.dto;

import com.nearfix.worker.entity.WorkerStatus;

public record WorkerProfileResponse(
    Long id,
    String skill,
    Integer experience,
    String city,
    Double rating,
    Boolean verified,
    WorkerStatus status
) {}
