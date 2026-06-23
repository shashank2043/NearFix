package com.nearfix.notification.service;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
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

    @Transactional
    public NotificationResponse sendNotification(NotificationRequest request) {
        log.info("Preparing SMTP email for recipient {}: {}", request.getTo(), request.getSubject());
        
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(request.getTo());
        mailMessage.setSubject(request.getSubject());
        mailMessage.setText(request.getMessage());
        
        boolean sent = false;
        try {
            mailSender.send(mailMessage);
            sent = true;
            log.info("Email sent successfully via SMTP to {}", request.getTo());
        } catch (Exception e) {
            log.error("Failed to send email to {} via SMTP", request.getTo(), e);
            // Non-blocking fallback: store record as unsent (sent = false)
        }

        Notification notification = Notification.builder()
                .to(request.getTo())
                .subject(request.getSubject())
                .message(request.getMessage())
                .sent(sent) 
                .build();
                
        Notification saved = notificationRepository.save(notification);
        
        return new NotificationResponse(saved.getId(), saved.getSent());
    }

    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByTo(String to) {
        log.info("Fetching notifications for email {}", to);
        return notificationRepository.findByToOrderByCreatedAtDesc(to);
    }
}
