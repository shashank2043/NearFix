package com.nearfix.payment.client;

import com.nearfix.payment.client.dto.UserDto;
import com.nearfix.payment.exception.ServiceUnavailableException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AuthClientFallback implements AuthClient {

    @Override
    public UserDto getUserById(Long id) {
        log.error("Auth Service is down. Fallback triggered for getUserById with id: {}", id);
        throw new ServiceUnavailableException("Auth Service is currently unavailable. Please try again later.");
    }
}
