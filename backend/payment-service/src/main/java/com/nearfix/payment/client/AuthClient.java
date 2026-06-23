package com.nearfix.payment.client;

import com.nearfix.payment.client.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "auth-service", path = "/api/auth")
public interface AuthClient {

    @GetMapping("/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}
