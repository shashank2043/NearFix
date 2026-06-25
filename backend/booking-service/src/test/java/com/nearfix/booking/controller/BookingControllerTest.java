package com.nearfix.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.booking.config.AuthPrincipal;
import com.nearfix.booking.dto.BookingResponse;
import com.nearfix.booking.dto.CreateBookingRequest;
import com.nearfix.booking.dto.UpdateBookingStatusRequest;
import com.nearfix.booking.entity.BookingStatus;
import com.nearfix.booking.service.BookingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class BookingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private BookingResponse response;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController).build();
        
        response = new BookingResponse(
                1L, 1L, 10L, null, "Plumber", "Leaking pipe", "12.9716 N, 77.5946 E", "Bengaluru",
                BookingStatus.REQUESTED, null, 12.9716, 77.5946, "Coordinates: 12.971600° N, 77.594600° E", null, null
        );

        // Mock security principal
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                new AuthPrincipal(10L, "customer@test.com", "CUSTOMER"), null, List.of()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createBooking_Success() throws Exception {
        CreateBookingRequest request = new CreateBookingRequest("Plumber", "Leaking pipe", "12.9716 N, 77.5946 E", "Bengaluru");
        when(bookingService.createBooking(eq(10L), eq("CUSTOMER"), any(CreateBookingRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.status").value("REQUESTED"));

        verify(bookingService, times(1)).createBooking(eq(10L), eq("CUSTOMER"), any(CreateBookingRequest.class));
    }

    @Test
    void getBookingById_Success() throws Exception {
        when(bookingService.getBookingById(1L, 10L, "CUSTOMER")).thenReturn(response);

        mockMvc.perform(get("/api/bookings/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(bookingService, times(1)).getBookingById(1L, 10L, "CUSTOMER");
    }

    @Test
    void getCustomerBookings_Success() throws Exception {
        when(bookingService.getBookingsForCustomer(10L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/bookings/customer"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(bookingService, times(1)).getBookingsForCustomer(10L);
    }

    @Test
    void getWorkerBookings_Success() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                new AuthPrincipal(20L, "worker@test.com", "WORKER"), null, List.of()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(bookingService.getBookingsForWorker(20L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/bookings/worker"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(bookingService, times(1)).getBookingsForWorker(20L);
    }

    @Test
    void hasActiveBooking_Success() throws Exception {
        when(bookingService.hasActiveBookingForWorker(20L)).thenReturn(true);

        mockMvc.perform(get("/api/bookings/worker/has-active")
                        .param("workerId", "20"))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));

        verify(bookingService, times(1)).hasActiveBookingForWorker(20L);
    }

    @Test
    void getAvailableBookings_Success() throws Exception {
        when(bookingService.getAvailableBookings("Plumber", "Bengaluru")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/bookings/available")
                        .param("skill", "Plumber")
                        .param("city", "Bengaluru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(bookingService, times(1)).getAvailableBookings("Plumber", "Bengaluru");
    }

    @Test
    void updateBookingStatus_Success() throws Exception {
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.ACCEPTED, 12.9716, 77.5946, null, null);
        response = new BookingResponse(
                1L, 1L, 10L, 20L, "Plumber", "Leaking pipe", "12.9716 N, 77.5946 E", "Bengaluru",
                BookingStatus.ACCEPTED, null, 12.9716, 77.5946, "Coordinates: 12.971600° N, 77.594600° E", null, null
        );
        when(bookingService.updateBookingStatus(eq(1L), eq(10L), eq("CUSTOMER"), any(UpdateBookingStatusRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/bookings/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        verify(bookingService, times(1)).updateBookingStatus(eq(1L), eq(10L), eq("CUSTOMER"), any(UpdateBookingStatusRequest.class));
    }

    @Test
    void assignWorker_Success() throws Exception {
        when(bookingService.assignWorker(1L, 20L)).thenReturn(response);

        mockMvc.perform(put("/api/bookings/1/assign-worker/20"))
                .andExpect(status().isOk());

        verify(bookingService, times(1)).assignWorker(1L, 20L);
    }

    @Test
    void updateWorkerLocation_Success() throws Exception {
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(null, 12.9716, 77.5946, null, null);
        when(bookingService.updateWorkerLocation(1L, 12.9716, 77.5946)).thenReturn(response);

        mockMvc.perform(put("/api/bookings/1/worker-location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        verify(bookingService, times(1)).updateWorkerLocation(1L, 12.9716, 77.5946);
    }

    @Test
    void getAllBookings_Success() throws Exception {
        when(bookingService.getAllBookings()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(bookingService, times(1)).getAllBookings();
    }
}
