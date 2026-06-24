package com.nearfix.notification.service;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
import com.nearfix.notification.mapper.NotificationMapper;
import com.nearfix.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final NotificationMapper notificationMapper;

    @Transactional
    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("Preparing SMTP email for recipient {}: {}", request.to(), request.subject());
        
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(request.to());
        mailMessage.setSubject(request.subject());
        mailMessage.setText(request.message());
        
        boolean sent = false;
        try {
            mailSender.send(mailMessage);
            sent = true;
            log.info("Email sent successfully via SMTP to {}", request.to());
        } catch (Exception e) {
            log.error("Failed to send email to {} via SMTP", request.to(), e);

        }

        Notification notification = notificationMapper.toEntity(request);
        notification.setSent(sent);
                 
        Notification saved = notificationRepository.save(notification);
        
        return notificationMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByTo(String to) {
        log.info("Fetching notifications for email {}", to);
        return notificationRepository.findByToOrderByCreatedAtDesc(to);
    }
}
