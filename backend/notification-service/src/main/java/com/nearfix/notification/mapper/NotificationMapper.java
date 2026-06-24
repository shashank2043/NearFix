package com.nearfix.notification.mapper;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "sent", ignore = true)
    Notification toEntity(NotificationRequest request);

    NotificationResponse toResponse(Notification notification);
}
