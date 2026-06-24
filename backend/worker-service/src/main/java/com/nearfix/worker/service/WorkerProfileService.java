package com.nearfix.worker.service;

import com.nearfix.worker.client.BookingClient;
import com.nearfix.worker.dto.*;
import com.nearfix.worker.entity.WorkerProfile;
import com.nearfix.worker.entity.WorkerStatus;
import com.nearfix.worker.exception.BadRequestException;
import com.nearfix.worker.exception.ResourceNotFoundException;
import com.nearfix.worker.repository.WorkerProfileRepository;
import com.nearfix.worker.mapper.WorkerProfileMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerProfileService {

    @Autowired
    private WorkerProfileRepository workerProfileRepository;

    @Autowired
    private BookingClient bookingClient;

    @Autowired
    private WorkerProfileMapper workerProfileMapper;

    @Transactional
    public WorkerProfileResponse createProfile(Long id, CreateWorkerProfileRequest request) {
        if (workerProfileRepository.existsById(id)) {
            throw new BadRequestException("Worker profile already exists");
        }

        WorkerProfile profile = workerProfileMapper.requestToEntity(request);
        profile.setId(id);

        WorkerProfile savedProfile = workerProfileRepository.save(profile);
        return workerProfileMapper.entityToResponse(savedProfile);
    }

    public WorkerProfileResponse getProfileById(Long id) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));
        return workerProfileMapper.entityToResponse(profile);
    }

    @Transactional
    public WorkerProfileResponse updateProfile(Long id, CreateWorkerProfileRequest request) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));

        profile.setSkill(request.skill());
        profile.setExperience(request.experience());
        profile.setCity(request.city());
        profile.setAadhaarNumber(request.aadhaarNumber());

        WorkerProfile savedProfile = workerProfileRepository.save(profile);
        return workerProfileMapper.entityToResponse(savedProfile);
    }

    @Transactional
    public WorkerProfileResponse updateStatus(Long id, WorkerStatus status) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));

        if (status == WorkerStatus.AVAILABLE) {
            try {
                Boolean hasActive = bookingClient.hasActiveBooking(id);
                if (Boolean.TRUE.equals(hasActive)) {
                    throw new BadRequestException("Cannot set status to AVAILABLE while having an active booking");
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (Exception e) {
                System.err.println("Booking Service check failed, proceeding status update: " + e.getMessage());
            }
        }

        profile.setStatus(status);
        WorkerProfile savedProfile = workerProfileRepository.save(profile);
        return workerProfileMapper.entityToResponse(savedProfile);
    }

    @Transactional
    public WorkerProfileResponse verifyWorker(Long id, Boolean verified) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));

        profile.setVerified(verified);
        WorkerProfile savedProfile = workerProfileRepository.save(profile);
        return workerProfileMapper.entityToResponse(savedProfile);
    }

    public List<WorkerProfileResponse> searchWorkers(String skill, String city, Double minRating) {
        List<WorkerProfile> profiles = workerProfileRepository.searchWorkers(skill, city, minRating);
        return profiles.stream().map(workerProfileMapper::entityToResponse).collect(Collectors.toList());
    }

    public List<WorkerProfileResponse> getAvailableWorkers() {
        List<WorkerProfile> profiles = workerProfileRepository.findByVerifiedAndStatus(true, WorkerStatus.AVAILABLE);
        return profiles.stream().map(workerProfileMapper::entityToResponse).collect(Collectors.toList());
    }

    public List<WorkerProfileResponse> getAllWorkers() {
        List<WorkerProfile> profiles = workerProfileRepository.findAll();
        return profiles.stream().map(workerProfileMapper::entityToResponse).collect(Collectors.toList());
    }

    @Transactional
    public WorkerProfileResponse updateRating(Long id, Double rating) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Worker profile not found with id: " + id));
        profile.setRating(rating);
        WorkerProfile savedProfile = workerProfileRepository.save(profile);
        return workerProfileMapper.entityToResponse(savedProfile);
    }
}
