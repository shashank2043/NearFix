package com.nearfix.auth.dto;

import com.nearfix.auth.entity.Role;

public record LoginResponse(
    String token,
    Role role,
    Long id
) {}
