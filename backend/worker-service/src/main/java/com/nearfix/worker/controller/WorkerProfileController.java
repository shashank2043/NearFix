package com.nearfix.worker.controller;

import com.nearfix.worker.dto.*;
import com.nearfix.worker.entity.WorkerStatus;
import com.nearfix.worker.service.WorkerProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerProfileController {

    @Autowired
    private WorkerProfileService workerProfileService;

    private Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        throw new IllegalStateException("User not authenticated or invalid principal type");
    }

    @PostMapping("/profile")
    public ResponseEntity<WorkerProfileResponse> createProfile(@Valid @RequestBody CreateWorkerProfileRequest request) {
        Long userId = getAuthenticatedUserId();
        WorkerProfileResponse response = workerProfileService.createProfile(userId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<WorkerProfileResponse> getProfileById(@PathVariable Long id) {
        WorkerProfileResponse response = workerProfileService.getProfileById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<WorkerProfileResponse> updateProfile(@Valid @RequestBody CreateWorkerProfileRequest request) {
        Long userId = getAuthenticatedUserId();
        WorkerProfileResponse response = workerProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/status")
    public ResponseEntity<WorkerProfileResponse> updateStatus(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestBody(required = false) UpdateWorkerStatusRequest bodyRequest,
            @RequestParam(value = "status", required = false) WorkerStatus queryStatus
    ) {
        Long userId = (headerUserId != null) ? headerUserId : getAuthenticatedUserId();
        WorkerStatus statusToUpdate = null;

        if (bodyRequest != null && bodyRequest.status() != null) {
            statusToUpdate = bodyRequest.status();
        } else if (queryStatus != null) {
            statusToUpdate = queryStatus;
        }

        if (statusToUpdate == null) {
            return ResponseEntity.badRequest().build();
        }

        WorkerProfileResponse response = workerProfileService.updateStatus(userId, statusToUpdate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<WorkerProfileResponse>> searchWorkers(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Double minRating
    ) {
        List<WorkerProfileResponse> response = workerProfileService.searchWorkers(skill, city, minRating);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<List<WorkerProfileResponse>> getAvailableWorkers() {
        List<WorkerProfileResponse> response = workerProfileService.getAvailableWorkers();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/{id}/verify")
    public ResponseEntity<WorkerProfileResponse> verifyWorker(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") Boolean verified
    ) {
        WorkerProfileResponse response = workerProfileService.verifyWorker(id, verified);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/{id}/rating")
    public ResponseEntity<WorkerProfileResponse> updateRating(
            @PathVariable Long id,
            @RequestParam Double rating
    ) {
        WorkerProfileResponse response = workerProfileService.updateRating(id, rating);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkerProfileResponse>> getAllWorkers() {
        List<WorkerProfileResponse> response = workerProfileService.getAllWorkers();
        return ResponseEntity.ok(response);
    }
}
