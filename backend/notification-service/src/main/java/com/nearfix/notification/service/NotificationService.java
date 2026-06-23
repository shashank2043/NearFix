package com.nearfix.notification.service;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
import com.nearfix.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("Sending notification to user {}: {}", request.getUserId(), request.getTitle());
        
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .sent(true) // In-app notification is sent immediately upon database persistence
                .build();
                
        Notification saved = notificationRepository.save(notification);
        
        return new NotificationResponse(saved.getId(), saved.getSent());
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByUserId(Long userId) {
        log.info("Fetching notifications for user {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
