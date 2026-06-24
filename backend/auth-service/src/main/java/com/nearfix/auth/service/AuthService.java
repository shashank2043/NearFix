package com.nearfix.auth.service;

import com.nearfix.auth.dto.*;
import com.nearfix.auth.entity.User;
import com.nearfix.auth.entity.Role;
import com.nearfix.auth.exception.DuplicateResourceException;
import com.nearfix.auth.exception.ResourceNotFoundException;
import com.nearfix.auth.repository.UserRepository;
import com.nearfix.auth.config.JwtService;
import com.nearfix.auth.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void seedAdmin() {
        if (!userRepository.existsByEmail("admin@nearfix.com")) {
            User admin = new User(
                "System Admin",
                "admin@nearfix.com",
                "9999999999",
                passwordEncoder.encode("admin123"),
                Role.ADMIN
            );
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin@nearfix.com / admin123");
        }
    }

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserMapper userMapper;

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email is already registered");
        }
        if (userRepository.existsByPhone(request.phone())) {
            throw new DuplicateResourceException("Phone number is already registered");
        }

        User user = userMapper.registerRequestToUser(request);
        user.setPassword(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);
        return new RegisterResponse(savedUser.getId(), "User registered successfully");
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.getActive()) {
            throw new BadCredentialsException("User account is inactive");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return new LoginResponse(token, user.getRole(), user.getId());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return userMapper.userToUserResponse(user);
    }

    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::userToUserResponse)
                .toList();
    }

    public UserResponse getCurrentUserProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        final String email = (principal instanceof String) ? (String) principal : null;
        if (email == null || "anonymousUser".equals(email)) {
            throw new BadCredentialsException("User is not authenticated");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return userMapper.userToUserResponse(user);
    }
}
