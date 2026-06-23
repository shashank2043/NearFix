package com.nearfix.auth.dto;

import com.nearfix.auth.entity.Role;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    Role role,
    Boolean active,
    LocalDateTime createdAt
) {}
