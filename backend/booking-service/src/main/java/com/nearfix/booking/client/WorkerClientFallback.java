package com.nearfix.booking.client;

import com.nearfix.booking.client.dto.WorkerProfileResponse;
import com.nearfix.booking.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class WorkerClientFallback implements WorkerClient {

    @Override
    public WorkerProfileResponse getWorkerProfile(Long id) {
        log.error("Worker Service is down. Fallback triggered for getWorkerProfile with id: {}", id);
        throw new ServiceUnavailableException("Worker Service is currently unavailable. Please try again later.");
    }

    @Override
    public void updateWorkerStatus(Long workerId, String status) {
        log.error("Worker Service is down. Fallback triggered for updateWorkerStatus with workerId: {}", workerId);
        throw new ServiceUnavailableException("Worker Service is currently unavailable. Please try again later.");
    }
}
