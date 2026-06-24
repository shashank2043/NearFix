package com.nearfix.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.auth.dto.*;
import com.nearfix.auth.entity.Role;
import com.nearfix.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private ObjectMapper objectMapper;
    private RegisterRequest registerRequest;
    private RegisterResponse registerResponse;
    private LoginRequest loginRequest;
    private LoginResponse loginResponse;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
        objectMapper = new ObjectMapper();
        
        registerRequest = new RegisterRequest("John Doe", "john@example.com", "1234567890", "password123", Role.CUSTOMER);
        registerResponse = new RegisterResponse(1L, "User registered successfully");
        
        loginRequest = new LoginRequest("john@example.com", "password123");
        loginResponse = new LoginResponse("mockToken", Role.CUSTOMER, 1L);
        
        userResponse = new UserResponse(1L, "John Doe", "john@example.com", "1234567890", Role.CUSTOMER, true, null);
    }

    @Test
    void register_ShouldReturnCreated() throws Exception {
        when(authService.register(any())).thenReturn(registerResponse);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.message").value("User registered successfully"));

        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void login_ShouldReturnOk() throws Exception {
        when(authService.login(any())).thenReturn(loginResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockToken"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.id").value(1L));

        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void getUserById_ShouldReturnUser() throws Exception {
        when(authService.getUserById(1L)).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));

        verify(authService).getUserById(1L);
    }

    @Test
    void getAllUsers_ShouldReturnList() throws Exception {
        List<UserResponse> list = Arrays.asList(userResponse);
        when(authService.getAllUsers()).thenReturn(list);

        mockMvc.perform(get("/api/auth/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L))
                .andExpect(jsonPath("$[0].fullName").value("John Doe"));

        verify(authService).getAllUsers();
    }

    @Test
    void getProfile_ShouldReturnProfile() throws Exception {
        when(authService.getCurrentUserProfile()).thenReturn(userResponse);

        mockMvc.perform(get("/api/auth/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.fullName").value("John Doe"));

        verify(authService).getCurrentUserProfile();
    }
}
