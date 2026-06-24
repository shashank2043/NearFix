package com.nearfix.payment.client.dto;

public record UserDto(
    Long id,
    String fullName,
    String email,
    String phone,
    String role,
    Boolean active
) {}
