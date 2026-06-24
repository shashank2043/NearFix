package com.nearfix.worker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.worker.dto.*;
import com.nearfix.worker.entity.WorkerStatus;
import com.nearfix.worker.service.WorkerProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class WorkerProfileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private WorkerProfileService workerProfileService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private WorkerProfileController workerProfileController;

    private ObjectMapper objectMapper;
    private CreateWorkerProfileRequest createRequest;
    private WorkerProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(workerProfileController).build();
        objectMapper = new ObjectMapper();
        
        createRequest = new CreateWorkerProfileRequest("Plumber", 5, "Bangalore", "123456789012");
        profileResponse = new WorkerProfileResponse(1L, "Plumber", 5, "Bangalore", "123456789012", 4.5, true, WorkerStatus.AVAILABLE);
    }

    private void mockAuthenticatedUser(Long userId) {
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userId);
    }

    @Test
    void createProfile_ShouldReturnCreated() throws Exception {
        mockAuthenticatedUser(1L);
        when(workerProfileService.createProfile(eq(1L), any())).thenReturn(profileResponse);

        mockMvc.perform(post("/api/workers/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.skill").value("Plumber"));

        verify(workerProfileService).createProfile(eq(1L), any(CreateWorkerProfileRequest.class));
    }

    @Test
    void getProfileById_ShouldReturnProfile() throws Exception {
        when(workerProfileService.getProfileById(1L)).thenReturn(profileResponse);

        mockMvc.perform(get("/api/workers/profile/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.skill").value("Plumber"));

        verify(workerProfileService).getProfileById(1L);
    }

    @Test
    void updateProfile_ShouldReturnOk() throws Exception {
        mockAuthenticatedUser(1L);
        when(workerProfileService.updateProfile(eq(1L), any())).thenReturn(profileResponse);

        mockMvc.perform(put("/api/workers/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.skill").value("Plumber"));

        verify(workerProfileService).updateProfile(eq(1L), any(CreateWorkerProfileRequest.class));
    }

    @Test
    void updateStatus_WithBody_ShouldReturnOk() throws Exception {
        mockAuthenticatedUser(1L);
        UpdateWorkerStatusRequest req = new UpdateWorkerStatusRequest(WorkerStatus.AVAILABLE);
        when(workerProfileService.updateStatus(1L, WorkerStatus.AVAILABLE)).thenReturn(profileResponse);

        mockMvc.perform(put("/api/workers/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        verify(workerProfileService).updateStatus(1L, WorkerStatus.AVAILABLE);
    }

    @Test
    void updateStatus_WithParam_ShouldReturnOk() throws Exception {
        mockAuthenticatedUser(1L);
        when(workerProfileService.updateStatus(1L, WorkerStatus.AVAILABLE)).thenReturn(profileResponse);

        mockMvc.perform(put("/api/workers/status")
                .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        verify(workerProfileService).updateStatus(1L, WorkerStatus.AVAILABLE);
    }

    @Test
    void updateStatus_WithNoStatus_ShouldReturnBadRequest() throws Exception {
        mockAuthenticatedUser(1L);
        mockMvc.perform(put("/api/workers/status"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchWorkers_ShouldReturnList() throws Exception {
        when(workerProfileService.searchWorkers("Plumber", "Bangalore", 4.0))
                .thenReturn(Arrays.asList(profileResponse));

        mockMvc.perform(get("/api/workers/search")
                .param("skill", "Plumber")
                .param("city", "Bangalore")
                .param("minRating", "4.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skill").value("Plumber"));

        verify(workerProfileService).searchWorkers("Plumber", "Bangalore", 4.0);
    }

    @Test
    void getAvailableWorkers_ShouldReturnList() throws Exception {
        when(workerProfileService.getAvailableWorkers()).thenReturn(Arrays.asList(profileResponse));

        mockMvc.perform(get("/api/workers/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].skill").value("Plumber"));

        verify(workerProfileService).getAvailableWorkers();
    }

    @Test
    void verifyWorker_ShouldReturnOk() throws Exception {
        when(workerProfileService.verifyWorker(1L, true)).thenReturn(profileResponse);

        mockMvc.perform(put("/api/workers/profile/1/verify")
                .param("verified", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified").value(true));

        verify(workerProfileService).verifyWorker(1L, true);
    }

    @Test
    void updateRating_ShouldReturnOk() throws Exception {
        when(workerProfileService.updateRating(1L, 4.5)).thenReturn(profileResponse);

        mockMvc.perform(put("/api/workers/profile/1/rating")
                .param("rating", "4.5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rating").value(4.5));

        verify(workerProfileService).updateRating(1L, 4.5);
    }

    @Test
    void getAllWorkers_ShouldReturnList() throws Exception {
        when(workerProfileService.getAllWorkers()).thenReturn(Arrays.asList(profileResponse));

        mockMvc.perform(get("/api/workers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(workerProfileService).getAllWorkers();
    }
}
