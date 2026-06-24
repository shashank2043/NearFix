package com.nearfix.worker.service;

import com.nearfix.worker.client.BookingClient;
import com.nearfix.worker.dto.*;
import com.nearfix.worker.entity.WorkerProfile;
import com.nearfix.worker.entity.WorkerStatus;
import com.nearfix.worker.exception.BadRequestException;
import com.nearfix.worker.exception.ResourceNotFoundException;
import com.nearfix.worker.mapper.WorkerProfileMapper;
import com.nearfix.worker.repository.WorkerProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkerProfileServiceTest {

    @Mock
    private WorkerProfileRepository workerProfileRepository;

    @Mock
    private BookingClient bookingClient;

    @Mock
    private WorkerProfileMapper workerProfileMapper;

    @InjectMocks
    private WorkerProfileService workerProfileService;

    private WorkerProfile sampleProfile;
    private CreateWorkerProfileRequest createRequest;
    private WorkerProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        sampleProfile = new WorkerProfile(1L, "Plumber", 5, "Bangalore", "123456789012");
        createRequest = new CreateWorkerProfileRequest("Plumber", 5, "Bangalore", "123456789012");
        profileResponse = new WorkerProfileResponse(1L, "Plumber", 5, "Bangalore", "123456789012", 0.0, false, WorkerStatus.OFFLINE);
    }

    @Test
    void createProfile_WhenDoesNotExist_ShouldSave() {
        when(workerProfileRepository.existsById(1L)).thenReturn(false);
        when(workerProfileMapper.requestToEntity(any())).thenReturn(sampleProfile);
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.createProfile(1L, createRequest);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals("Plumber", response.skill());
        verify(workerProfileRepository).save(any(WorkerProfile.class));
    }

    @Test
    void createProfile_WhenExists_ShouldThrowBadRequestException() {
        when(workerProfileRepository.existsById(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> workerProfileService.createProfile(1L, createRequest));
        verify(workerProfileRepository, never()).save(any());
    }

    @Test
    void getProfileById_WhenFound_ShouldReturnProfile() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.getProfileById(1L);

        assertNotNull(response);
        assertEquals(1L, response.id());
    }

    @Test
    void getProfileById_WhenNotFound_ShouldThrowResourceNotFoundException() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> workerProfileService.getProfileById(1L));
    }

    @Test
    void updateProfile_WhenSuccessful_ShouldReturnUpdated() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.updateProfile(1L, createRequest);

        assertNotNull(response);
        verify(workerProfileRepository).save(any(WorkerProfile.class));
    }

    @Test
    void updateProfile_WhenNotFound_ShouldThrowResourceNotFoundException() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> workerProfileService.updateProfile(1L, createRequest));
    }

    @Test
    void updateStatus_WhenAvailableAndNoActiveBooking_ShouldSetAvailable() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(bookingClient.hasActiveBooking(1L)).thenReturn(false);
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.updateStatus(1L, WorkerStatus.AVAILABLE);

        assertNotNull(response);
        verify(workerProfileRepository).save(sampleProfile);
    }

    @Test
    void updateStatus_WhenAvailableAndHasActiveBooking_ShouldThrowBadRequestException() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(bookingClient.hasActiveBooking(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> workerProfileService.updateStatus(1L, WorkerStatus.AVAILABLE));
        verify(workerProfileRepository, never()).save(any());
    }

    @Test
    void updateStatus_WhenBookingClientThrows_ShouldProceedWithUpdate() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(bookingClient.hasActiveBooking(1L)).thenThrow(new RuntimeException("Booking service down"));
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.updateStatus(1L, WorkerStatus.AVAILABLE);

        assertNotNull(response);
        verify(workerProfileRepository).save(sampleProfile);
    }

    @Test
    void updateStatus_WhenOffline_ShouldProceedWithoutBookingCheck() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.updateStatus(1L, WorkerStatus.OFFLINE);

        assertNotNull(response);
        verify(bookingClient, never()).hasActiveBooking(any());
        verify(workerProfileRepository).save(sampleProfile);
    }

    @Test
    void verifyWorker_WhenSuccessful_ShouldSetVerified() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.verifyWorker(1L, true);

        assertNotNull(response);
        verify(workerProfileRepository).save(sampleProfile);
    }

    @Test
    void updateRating_WhenSuccessful_ShouldSetRating() {
        when(workerProfileRepository.findById(1L)).thenReturn(Optional.of(sampleProfile));
        when(workerProfileRepository.save(any())).thenReturn(sampleProfile);
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        WorkerProfileResponse response = workerProfileService.updateRating(1L, 4.5);

        assertNotNull(response);
        verify(workerProfileRepository).save(sampleProfile);
    }

    @Test
    void searchWorkers_ShouldReturnList() {
        when(workerProfileRepository.searchWorkers("Plumber", "Bangalore", 4.0))
                .thenReturn(Arrays.asList(sampleProfile));
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        List<WorkerProfileResponse> response = workerProfileService.searchWorkers("Plumber", "Bangalore", 4.0);

        assertNotNull(response);
        assertEquals(1, response.size());
    }

    @Test
    void getAvailableWorkers_ShouldReturnList() {
        when(workerProfileRepository.findByVerifiedAndStatus(true, WorkerStatus.AVAILABLE))
                .thenReturn(Arrays.asList(sampleProfile));
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        List<WorkerProfileResponse> response = workerProfileService.getAvailableWorkers();

        assertNotNull(response);
        assertEquals(1, response.size());
    }

    @Test
    void getAllWorkers_ShouldReturnList() {
        when(workerProfileRepository.findAll()).thenReturn(Arrays.asList(sampleProfile));
        when(workerProfileMapper.entityToResponse(any())).thenReturn(profileResponse);

        List<WorkerProfileResponse> response = workerProfileService.getAllWorkers();

        assertNotNull(response);
        assertEquals(1, response.size());
    }
}
