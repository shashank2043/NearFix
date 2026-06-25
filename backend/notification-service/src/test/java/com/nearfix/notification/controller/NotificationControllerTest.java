package com.nearfix.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
import com.nearfix.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private NotificationRequest request;
    private NotificationResponse response;
    private Notification notification;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController).build();
        request = new NotificationRequest("test@test.com", "Booking Created", "Your plumber booking was created.");
        response = new NotificationResponse(1L, true);
        notification = Notification.builder()
                .id(1L)
                .to("test@test.com")
                .subject("Booking Created")
                .message("Your plumber booking was created.")
                .sent(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void sendNotification_Success() throws Exception {
        when(notificationService.sendNotification(any(NotificationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/notifications/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.sent").value(true));

        verify(notificationService, times(1)).sendNotification(any(NotificationRequest.class));
    }

    @Test
    void getNotifications_Success() throws Exception {
        when(notificationService.getNotificationsByTo("test@test.com")).thenReturn(List.of(notification));

        mockMvc.perform(get("/api/notifications")
                        .param("to", "test@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].to").value("test@test.com"));

        verify(notificationService, times(1)).getNotificationsByTo("test@test.com");
    }
}
