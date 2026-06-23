package com.nearfix.booking.config;

import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static AuthPrincipal getPrincipal() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthPrincipal) {
            return (AuthPrincipal) authentication.getPrincipal();
        }
        throw new IllegalStateException("User not authenticated or principal is invalid");
    }

    public static Long getUserId() {
        return getPrincipal().getId();
    }

    public static String getUserRole() {
        return getPrincipal().getRole();
    }

    public static String getUserEmail() {
        return getPrincipal().getEmail();
    }
}
