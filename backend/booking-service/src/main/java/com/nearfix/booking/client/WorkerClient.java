package com.nearfix.booking.client;

import com.nearfix.booking.client.dto.WorkerProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "worker-service", path = "/api/workers", fallback = WorkerClientFallback.class)
public interface WorkerClient {

    @GetMapping("/profile/{id}")
    WorkerProfileResponse getWorkerProfile(@PathVariable("id") Long id);

    @PutMapping("/status")
    void updateWorkerStatus(@RequestHeader("X-User-Id") Long workerId, @RequestParam("status") String status);
}
