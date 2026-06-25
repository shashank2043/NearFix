package com.nearfix.payment.client;

import com.nearfix.payment.client.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service", path = "/api/notifications", fallback = NotificationClientFallback.class)
public interface NotificationClient {

    @PostMapping("/send")
    void sendNotification(@RequestBody NotificationRequest request);
}
