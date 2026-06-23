package com.nearfix.notification.controller;

import com.nearfix.notification.dto.NotificationRequest;
import com.nearfix.notification.dto.NotificationResponse;
import com.nearfix.notification.entity.Notification;
import com.nearfix.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> sendNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam("to") String to) {
        List<Notification> notifications = notificationService.getNotificationsByTo(to);
        return ResponseEntity.ok(notifications);
    }
}
