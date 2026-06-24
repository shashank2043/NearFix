package com.nearfix.worker.mapper;

import com.nearfix.worker.dto.CreateWorkerProfileRequest;
import com.nearfix.worker.dto.WorkerProfileResponse;
import com.nearfix.worker.entity.WorkerProfile;
import org.springframework.stereotype.Component;

@Component
public class WorkerProfileMapper {

    public WorkerProfile requestToEntity(CreateWorkerProfileRequest request) {
        if (request == null) {
            return null;
        }
        WorkerProfile profile = new WorkerProfile();
        profile.setSkill(request.skill());
        profile.setExperience(request.experience());
        profile.setCity(request.city());
        profile.setAadhaarNumber(request.aadhaarNumber());
        return profile;
    }

    public WorkerProfileResponse entityToResponse(WorkerProfile entity) {
        if (entity == null) {
            return null;
        }
        return new WorkerProfileResponse(
            entity.getId(),
            entity.getSkill(),
            entity.getExperience(),
            entity.getCity(),
            entity.getAadhaarNumber(),
            entity.getRating(),
            entity.getVerified(),
            entity.getStatus()
        );
    }
}
