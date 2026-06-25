package com.nearfix.booking.service;

import com.nearfix.booking.client.AuthClient;
import com.nearfix.booking.client.WorkerClient;
import org.springframework.kafka.core.KafkaTemplate;
import com.nearfix.booking.client.dto.NotificationRequest;
import com.nearfix.booking.client.dto.UserDto;
import com.nearfix.booking.client.dto.WorkerProfileResponse;
import com.nearfix.booking.dto.BookingResponse;
import com.nearfix.booking.dto.CreateBookingRequest;
import com.nearfix.booking.dto.UpdateBookingStatusRequest;
import com.nearfix.booking.entity.Booking;
import com.nearfix.booking.entity.BookingStatus;
import com.nearfix.booking.exception.BadRequestException;
import com.nearfix.booking.exception.ConflictException;
import com.nearfix.booking.exception.ResourceNotFoundException;
import com.nearfix.booking.exception.UnauthorizedException;
import com.nearfix.booking.mapper.BookingMapper;
import com.nearfix.booking.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private AuthClient authClient;

    @Mock
    private WorkerClient workerClient;

    @Mock
    private KafkaTemplate<String, NotificationRequest> kafkaTemplate;

    @Mock
    private BookingMapper bookingMapper;

    @InjectMocks
    private BookingService bookingService;

    private CreateBookingRequest createRequest;
    private Booking booking;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        createRequest = new CreateBookingRequest("Plumber", "Leaking pipe", "12.9716 N, 77.5946 E", "Bengaluru");
        booking = Booking.builder()
                .id(1L)
                .customerId(10L)
                .serviceType("Plumber")
                .issueDescription("Leaking pipe")
                .address("12.9716 N, 77.5946 E")
                .city("Bengaluru")
                .status(BookingStatus.REQUESTED)
                .build();

        bookingResponse = new BookingResponse(
                1L, 1L, 10L, null, "Plumber", "Leaking pipe", "12.9716 N, 77.5946 E", "Bengaluru",
                BookingStatus.REQUESTED, null, 12.9716, 77.5946, "Coordinates: 12.971600° N, 77.594600° E", null, null
        );
    }

    @Test
    void createBooking_Success() {
        UserDto userDto = new UserDto(10L, "Amit", "amit@nearfix.com", "9999999999", "CUSTOMER", true);
        when(authClient.getUserById(10L)).thenReturn(userDto);
        when(bookingRepository.existsByCustomerIdAndServiceTypeAndStatusIn(eq(10L), eq("Plumber"), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.createBooking(10L, "CUSTOMER", createRequest);

        assertNotNull(result);
        assertEquals(BookingStatus.REQUESTED, result.status());
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(kafkaTemplate, times(1)).send(eq("notification-topic"), any(NotificationRequest.class));
    }

    @Test
    void createBooking_UnauthorizedRole() {
        assertThrows(UnauthorizedException.class, () ->
                bookingService.createBooking(10L, "WORKER", createRequest)
        );
    }

    @Test
    void createBooking_CustomerInactive() {
        UserDto userDto = new UserDto(10L, "Amit", "amit@nearfix.com", "9999999999", "CUSTOMER", false);
        when(authClient.getUserById(10L)).thenReturn(userDto);

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void createBooking_AuthClientThrowsException() {
        when(authClient.getUserById(10L)).thenThrow(new RuntimeException("Service down"));

        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void createBooking_DuplicateActiveBooking() {
        UserDto userDto = new UserDto(10L, "Amit", "amit@nearfix.com", "9999999999", "CUSTOMER", true);
        when(authClient.getUserById(10L)).thenReturn(userDto);
        when(bookingRepository.existsByCustomerIdAndServiceTypeAndStatusIn(eq(10L), eq("Plumber"), any())).thenReturn(true);

        assertThrows(ConflictException.class, () ->
                bookingService.createBooking(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void getBookingById_Success_CustomerOwner() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse result = bookingService.getBookingById(1L, 10L, "CUSTOMER");

        assertNotNull(result);
        assertEquals(1L, result.id());
    }

    @Test
    void getBookingById_Success_WorkerAssigned() {
        booking.setWorkerId(20L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse result = bookingService.getBookingById(1L, 20L, "WORKER");

        assertNotNull(result);
    }

    @Test
    void getBookingById_NotFound() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                bookingService.getBookingById(1L, 10L, "CUSTOMER")
        );
    }

    @Test
    void getBookingById_CustomerNotOwner() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedException.class, () ->
                bookingService.getBookingById(1L, 99L, "CUSTOMER")
        );
    }

    @Test
    void getBookingById_WorkerNotAssigned() {
        booking.setWorkerId(20L);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedException.class, () ->
                bookingService.getBookingById(1L, 99L, "WORKER")
        );
    }

    @Test
    void getBookingsForCustomer() {
        when(bookingRepository.findByCustomerIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> results = bookingService.getBookingsForCustomer(10L);

        assertEquals(1, results.size());
    }

    @Test
    void getBookingsForWorker() {
        booking.setWorkerId(20L);
        when(bookingRepository.findByWorkerIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(booking));
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> results = bookingService.getBookingsForWorker(20L);

        assertEquals(1, results.size());
    }

    @Test
    void hasActiveBookingForWorker_True() {
        booking.setStatus(BookingStatus.ACCEPTED);
        when(bookingRepository.findByWorkerIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(booking));

        assertTrue(bookingService.hasActiveBookingForWorker(20L));
    }

    @Test
    void hasActiveBookingForWorker_False() {
        booking.setStatus(BookingStatus.PAID);
        when(bookingRepository.findByWorkerIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(booking));

        assertFalse(bookingService.hasActiveBookingForWorker(20L));
    }

    @Test
    void assignWorker_Success() {
        WorkerProfileResponse workerProfile = new WorkerProfileResponse(20L, "Plumber", 5, "Bengaluru", "123456789012", 4.5, true, "AVAILABLE");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(workerClient.getWorkerProfile(20L)).thenReturn(workerProfile);
        when(bookingRepository.findByWorkerIdOrderByCreatedAtDesc(20L)).thenReturn(new ArrayList<>());
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.assignWorker(1L, 20L);

        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void assignWorker_BookingNotInRequestedStatus() {
        booking.setStatus(BookingStatus.ACCEPTED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(ConflictException.class, () ->
                bookingService.assignWorker(1L, 20L)
        );
    }

    @Test
    void assignWorker_WorkerNotVerified() {
        WorkerProfileResponse workerProfile = new WorkerProfileResponse(20L, "Plumber", 5, "Bengaluru", "123456789012", 4.5, false, "AVAILABLE");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(workerClient.getWorkerProfile(20L)).thenReturn(workerProfile);

        assertThrows(BadRequestException.class, () ->
                bookingService.assignWorker(1L, 20L)
        );
    }

    @Test
    void assignWorker_WorkerNotAvailable() {
        WorkerProfileResponse workerProfile = new WorkerProfileResponse(20L, "Plumber", 5, "Bengaluru", "123456789012", 4.5, true, "BUSY");
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(workerClient.getWorkerProfile(20L)).thenReturn(workerProfile);

        assertThrows(BadRequestException.class, () ->
                bookingService.assignWorker(1L, 20L)
        );
    }

    @Test
    void assignWorker_WorkerHasActiveBooking() {
        WorkerProfileResponse workerProfile = new WorkerProfileResponse(20L, "Plumber", 5, "Bengaluru", "123456789012", 4.5, true, "AVAILABLE");
        Booking activeBooking = Booking.builder().status(BookingStatus.ACCEPTED).build();
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(workerClient.getWorkerProfile(20L)).thenReturn(workerProfile);
        when(bookingRepository.findByWorkerIdOrderByCreatedAtDesc(20L)).thenReturn(List.of(activeBooking));

        assertThrows(ConflictException.class, () ->
                bookingService.assignWorker(1L, 20L)
        );
    }

    @Test
    void updateBookingStatus_RejectRequest_Success() {
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.REQUESTED, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateBookingStatus(1L, 20L, "WORKER", request);

        assertNotNull(result);
        assertNull(booking.getWorkerId());
    }

    @Test
    void updateBookingStatus_AcceptRequest_Success() {
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.ACCEPTED, 12.9716, 77.5946, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateBookingStatus(1L, 20L, "WORKER", request);

        assertNotNull(result);
        assertEquals(BookingStatus.ACCEPTED, booking.getStatus());
        verify(workerClient, times(1)).updateWorkerStatus(20L, "BUSY");
    }

    @Test
    void updateBookingStatus_InvalidTransition() {
        booking.setStatus(BookingStatus.ACCEPTED);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.WORK_STARTED, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(ConflictException.class, () ->
                bookingService.updateBookingStatus(1L, 20L, "WORKER", request)
        );
    }

    @Test
    void updateBookingStatus_WorkCompleted_AmountMissing() {
        booking.setStatus(BookingStatus.WORK_STARTED);
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.WORK_COMPLETED, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class, () ->
                bookingService.updateBookingStatus(1L, 20L, "WORKER", request)
        );
    }

    @Test
    void updateBookingStatus_WorkCompleted_AmountLessThanMin() {
        booking.setStatus(BookingStatus.WORK_STARTED);
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.WORK_COMPLETED, null, null, null, 250.0);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(BadRequestException.class, () ->
                bookingService.updateBookingStatus(1L, 20L, "WORKER", request)
        );
    }

    @Test
    void updateBookingStatus_WorkCompleted_Success() {
        booking.setStatus(BookingStatus.WORK_STARTED);
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.WORK_COMPLETED, null, null, null, 350.0);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateBookingStatus(1L, 20L, "WORKER", request);

        assertNotNull(result);
        assertEquals(BookingStatus.WORK_COMPLETED, booking.getStatus());
        assertEquals(350.0, booking.getAmount());
    }

    @Test
    void updateBookingStatus_Paid_Success() {
        booking.setStatus(BookingStatus.WORK_COMPLETED);
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.PAID, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateBookingStatus(1L, 10L, "CUSTOMER", request);

        assertNotNull(result);
        assertEquals(BookingStatus.PAID, booking.getStatus());
        verify(workerClient, times(1)).updateWorkerStatus(20L, "AVAILABLE");
    }

    @Test
    void cancelBooking_Customer_Success() {
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.CANCELLED, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateBookingStatus(1L, 10L, "CUSTOMER", request);

        assertNotNull(result);
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
    }

    @Test
    void cancelBooking_Customer_NotOwner() {
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.CANCELLED, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedException.class, () ->
                bookingService.updateBookingStatus(1L, 99L, "CUSTOMER", request)
        );
    }

    @Test
    void cancelBooking_Worker_Success() {
        booking.setStatus(BookingStatus.ACCEPTED);
        booking.setWorkerId(20L);
        UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(BookingStatus.CANCELLED, null, null, null, null);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateBookingStatus(1L, 20L, "WORKER", request);

        assertNotNull(result);
        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        verify(workerClient, times(1)).updateWorkerStatus(20L, "AVAILABLE");
    }

    @Test
    void updateWorkerLocation_Success() {
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = bookingService.updateWorkerLocation(1L, 12.9716, 77.5946);

        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }
}
