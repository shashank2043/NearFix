package com.nearfix.payment.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthPrincipal {
    private Long id;
    private String email;
    private String role;
}
