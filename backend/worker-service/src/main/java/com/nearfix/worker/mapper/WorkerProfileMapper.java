package com.nearfix.worker.mapper;

import com.nearfix.worker.dto.CreateWorkerProfileRequest;
import com.nearfix.worker.dto.WorkerProfileResponse;
import com.nearfix.worker.entity.WorkerProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface WorkerProfileMapper {

    WorkerProfileMapper INSTANCE = Mappers.getMapper(WorkerProfileMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "verified", ignore = true)
    @Mapping(target = "status", ignore = true)
    WorkerProfile requestToEntity(CreateWorkerProfileRequest request);

    WorkerProfileResponse entityToResponse(WorkerProfile entity);
}
