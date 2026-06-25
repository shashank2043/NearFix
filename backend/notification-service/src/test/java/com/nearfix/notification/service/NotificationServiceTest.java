package com.nearfix.notification.service;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
import com.nearfix.notification.mapper.NotificationMapper;
import com.nearfix.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationService notificationService;

    private NotificationRequest request;
    private Notification notification;
    private NotificationResponse response;

    @BeforeEach
    void setUp() {
        request = new NotificationRequest("test@test.com", "Booking Created", "Your plumber booking was created.");
        notification = Notification.builder()
                .id(1L)
                .to("test@test.com")
                .subject("Booking Created")
                .message("Your plumber booking was created.")
                .sent(true)
                .createdAt(LocalDateTime.now())
                .build();
        response = new NotificationResponse(1L, true);
    }

    @Test
    void sendNotification_Success() {
        when(notificationMapper.toEntity(request)).thenReturn(notification);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(response);
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        NotificationResponse result = notificationService.sendNotification(request);

        assertNotNull(result);
        assertTrue(result.sent());
        assertEquals(1L, result.id());
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        verify(notificationRepository, times(1)).save(notification);
        assertTrue(notification.getSent());
    }

    @Test
    void sendNotification_MailSenderThrowsException() {
        when(notificationMapper.toEntity(request)).thenReturn(notification);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);
        response = new NotificationResponse(1L, false);
        when(notificationMapper.toResponse(any(Notification.class))).thenReturn(response);
        doThrow(new RuntimeException("SMTP Server Unreachable")).when(mailSender).send(any(SimpleMailMessage.class));

        NotificationResponse result = notificationService.sendNotification(request);

        assertNotNull(result);
        assertFalse(result.sent());
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
        verify(notificationRepository, times(1)).save(notification);
        assertFalse(notification.getSent());
    }

    @Test
    void getNotificationsByTo_Success() {
        when(notificationRepository.findByToOrderByCreatedAtDesc("test@test.com")).thenReturn(List.of(notification));

        List<Notification> results = notificationService.getNotificationsByTo("test@test.com");

        assertEquals(1, results.size());
        assertEquals("test@test.com", results.get(0).getTo());
        verify(notificationRepository, times(1)).findByToOrderByCreatedAtDesc("test@test.com");
    }
}
