package com.nearfix.worker.dto;

import com.nearfix.worker.entity.WorkerStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateWorkerStatusRequest(
    @NotNull(message = "Status is required")
    WorkerStatus status
) {}
