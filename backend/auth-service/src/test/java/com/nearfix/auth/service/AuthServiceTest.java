package com.nearfix.auth.service;

import com.nearfix.auth.config.JwtService;
import com.nearfix.auth.dto.*;
import com.nearfix.auth.entity.Role;
import com.nearfix.auth.entity.User;
import com.nearfix.auth.exception.DuplicateResourceException;
import com.nearfix.auth.exception.ResourceNotFoundException;
import com.nearfix.auth.mapper.UserMapper;
import com.nearfix.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        sampleUser = new User("John Doe", "john@example.com", "1234567890", "encodedPassword", Role.CUSTOMER);
        sampleUser.setId(1L);
        
        registerRequest = new RegisterRequest("John Doe", "john@example.com", "1234567890", "password123", Role.CUSTOMER);
        loginRequest = new LoginRequest("john@example.com", "password123");
        userResponse = new UserResponse(1L, "John Doe", "john@example.com", "1234567890", Role.CUSTOMER, true, LocalDateTime.now());
    }

    @Test
    void seedAdmin_WhenAdminDoesNotExist_ShouldSaveAdmin() {
        when(userRepository.existsByEmail("admin@nearfix.com")).thenReturn(false);
        when(passwordEncoder.encode("admin123")).thenReturn("encodedAdminPassword");

        authService.seedAdmin();

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void seedAdmin_WhenAdminExists_ShouldNotSaveAdmin() {
        when(userRepository.existsByEmail("admin@nearfix.com")).thenReturn(true);

        authService.seedAdmin();

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_WhenSuccessful_ShouldReturnResponse() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(false);
        when(userMapper.registerRequestToUser(any())).thenReturn(sampleUser);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(any())).thenReturn(sampleUser);

        RegisterResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("User registered successfully", response.message());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_WhenEmailExists_ShouldThrowDuplicateResourceException() {
        when(userRepository.existsByEmail(any())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_WhenPhoneExists_ShouldThrowDuplicateResourceException() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByPhone(any())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_WhenSuccessful_ShouldReturnToken() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(jwtService.generateToken(any(), any(), any())).thenReturn("mockToken");

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mockToken", response.token());
        assertEquals(Role.CUSTOMER, response.role());
        assertEquals(1L, response.id());
    }

    @Test
    void login_WhenEmailNotFound_ShouldThrowBadCredentialsException() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_WhenUserInactive_ShouldThrowBadCredentialsException() {
        sampleUser.setActive(false);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(sampleUser));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void login_WhenPasswordIncorrect_ShouldThrowBadCredentialsException() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void getUserById_WhenFound_ShouldReturnUser() {
        when(userRepository.findById(any())).thenReturn(Optional.of(sampleUser));
        when(userMapper.userToUserResponse(any())).thenReturn(userResponse);

        UserResponse response = authService.getUserById(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("John Doe", response.fullName());
    }

    @Test
    void getUserById_WhenNotFound_ShouldThrowResourceNotFoundException() {
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getUserById(1L));
    }

    @Test
    void getAllUsers_ShouldReturnList() {
        when(userRepository.findAll()).thenReturn(Arrays.asList(sampleUser));
        when(userMapper.userToUserResponse(any())).thenReturn(userResponse);

        List<UserResponse> responses = authService.getAllUsers();

        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("John Doe", responses.get(0).fullName());
    }

    @Test
    void getCurrentUserProfile_WhenSuccessful_ShouldReturnProfile() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(sampleUser));
        when(userMapper.userToUserResponse(any())).thenReturn(userResponse);

        UserResponse response = authService.getCurrentUserProfile();

        assertNotNull(response);
        assertEquals("john@example.com", response.email());
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUserProfile_WhenNotAuthenticated_ShouldThrowBadCredentialsException() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("anonymousUser");

        assertThrows(BadCredentialsException.class, () -> authService.getCurrentUserProfile());
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUserProfile_WhenUserNotFound_ShouldThrowResourceNotFoundException() {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn("john@example.com");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUserProfile());
        SecurityContextHolder.clearContext();
    }
}
