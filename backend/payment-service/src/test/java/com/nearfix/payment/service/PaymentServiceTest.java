package com.nearfix.payment.service;

import com.nearfix.payment.client.AuthClient;
import com.nearfix.payment.client.BookingClient;
import com.nearfix.payment.client.NotificationClient;
import com.nearfix.payment.client.dto.BookingResponse;
import com.nearfix.payment.client.dto.UserDto;
import com.nearfix.payment.dto.CreatePaymentRequest;
import com.nearfix.payment.dto.PaymentResponse;
import com.nearfix.payment.dto.PaymentVerificationRequest;
import com.nearfix.payment.entity.Payment;
import com.nearfix.payment.entity.PaymentStatus;
import com.nearfix.payment.exception.BadRequestException;
import com.nearfix.payment.exception.ConflictException;
import com.nearfix.payment.exception.ResourceNotFoundException;
import com.nearfix.payment.mapper.PaymentMapper;
import com.nearfix.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingClient bookingClient;

    @Mock
    private NotificationClient notificationClient;

    @Mock
    private AuthClient authClient;

    @Mock
    private PaymentMapper paymentMapper;

    @InjectMocks
    private PaymentService paymentService;

    private CreatePaymentRequest createRequest;
    private Payment payment;
    private PaymentResponse paymentResponse;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "razorpayKeyId", "test_key_id");
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "test_key_secret");

        createRequest = new CreatePaymentRequest(100L, 350.0);
        payment = Payment.builder()
                .id(1L)
                .bookingId(100L)
                .amount(350.0)
                .status(PaymentStatus.PENDING)
                .transactionId("rzp_order_test123")
                .paymentDate(null)
                .build();

        paymentResponse = new PaymentResponse("rzp_order_test123", PaymentStatus.PENDING, "test_key_id");

        bookingResponse = new BookingResponse(
                100L, 10L, 20L, "WORK_COMPLETED", 350.0
        );
    }

    @Test
    void processPayment_Success_Pending() {
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentMapper.toResponse(any(Payment.class), eq("test_key_id"))).thenReturn(paymentResponse);

        PaymentResponse result = paymentService.processPayment(10L, "CUSTOMER", createRequest);

        assertNotNull(result);
        assertEquals(PaymentStatus.PENDING, result.status());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void processPayment_Success_FailedForSpecificAmount() {
        bookingResponse = new BookingResponse(
                100L, 10L, 20L, "WORK_COMPLETED", 999.99
        );
        payment.setStatus(PaymentStatus.FAILED);
        paymentResponse = new PaymentResponse("rzp_order_failed", PaymentStatus.FAILED, "test_key_id");

        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentMapper.toResponse(any(Payment.class), eq("test_key_id"))).thenReturn(paymentResponse);
        when(authClient.getUserById(10L)).thenReturn(new UserDto(10L, "Amit", "amit@test.com", "999999", "CUSTOMER", true));

        PaymentResponse result = paymentService.processPayment(10L, "CUSTOMER", createRequest);

        assertNotNull(result);
        assertEquals(PaymentStatus.FAILED, result.status());
        verify(notificationClient, times(1)).sendNotification(any());
    }

    @Test
    void processPayment_AlreadySuccess() {
        payment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.of(payment));

        assertThrows(ConflictException.class, () ->
                paymentService.processPayment(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void processPayment_BookingNotFound() {
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(null);

        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.processPayment(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void processPayment_BookingCancelled() {
        bookingResponse = new BookingResponse(
                100L, 10L, 20L, "CANCELLED", 350.0
        );
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);

        assertThrows(ConflictException.class, () ->
                paymentService.processPayment(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void processPayment_BookingAlreadyPaid() {
        bookingResponse = new BookingResponse(
                100L, 10L, 20L, "PAID", 350.0
        );
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);

        assertThrows(ConflictException.class, () ->
                paymentService.processPayment(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void processPayment_BookingNotCompleted() {
        bookingResponse = new BookingResponse(
                100L, 10L, 20L, "ACCEPTED", 350.0
        );
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);

        assertThrows(ConflictException.class, () ->
                paymentService.processPayment(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void processPayment_BookingAmountMissing() {
        bookingResponse = new BookingResponse(
                100L, 10L, 20L, "WORK_COMPLETED", null
        );
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);

        assertThrows(BadRequestException.class, () ->
                paymentService.processPayment(10L, "CUSTOMER", createRequest)
        );
    }

    @Test
    void verifyPayment_AlreadySuccess() {
        payment.setStatus(PaymentStatus.SUCCESS);
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.of(payment));
        paymentResponse = new PaymentResponse("rzp_order_test123", PaymentStatus.SUCCESS, "test_key_id");
        when(paymentMapper.toResponse(payment, "test_key_id")).thenReturn(paymentResponse);

        PaymentVerificationRequest verifyRequest = new PaymentVerificationRequest(100L, "rzp_order_test123", "pay_123", null);
        PaymentResponse result = paymentService.verifyPayment(10L, "CUSTOMER", verifyRequest);

        assertNotNull(result);
        assertEquals(PaymentStatus.SUCCESS, result.status());
    }

    @Test
    void verifyPayment_Success_SimulationPath() {
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(bookingClient.getBookingById(100L, 10L, "CUSTOMER")).thenReturn(bookingResponse);
        
        paymentResponse = new PaymentResponse("rzp_order_test123", PaymentStatus.SUCCESS, "test_key_id");
        when(paymentMapper.toResponse(any(Payment.class), eq("test_key_id"))).thenReturn(paymentResponse);

        PaymentVerificationRequest verifyRequest = new PaymentVerificationRequest(100L, "rzp_order_test123", "pay_123", ""); // empty signature triggers simulation bypass
        PaymentResponse result = paymentService.verifyPayment(10L, "CUSTOMER", verifyRequest);

        assertNotNull(result);
        assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
        verify(bookingClient, times(1)).updateBookingStatus(eq(100L), eq(10L), eq("CUSTOMER"), any());
    }

    @Test
    void verifyPayment_SignatureVerificationFailed() {
        payment.setTransactionId("real_razorpay_order_id");
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.of(payment));

        PaymentVerificationRequest verifyRequest = new PaymentVerificationRequest(100L, "real_razorpay_order_id", "pay_123", "invalid_signature");
        
        assertThrows(BadRequestException.class, () ->
                paymentService.verifyPayment(10L, "CUSTOMER", verifyRequest)
        );
        assertEquals(PaymentStatus.FAILED, payment.getStatus());
    }

    @Test
    void getPaymentById_Success() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        Payment result = paymentService.getPaymentById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void getPaymentById_NotFound() {
        when(paymentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.getPaymentById(1L)
        );
    }

    @Test
    void getPaymentByBookingId_Success() {
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.of(payment));

        Payment result = paymentService.getPaymentByBookingId(100L);

        assertNotNull(result);
        assertEquals(100L, result.getBookingId());
    }

    @Test
    void getPaymentByBookingId_NotFound() {
        when(paymentRepository.findByBookingId(100L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.getPaymentByBookingId(100L)
        );
    }

    @Test
    void getAllPayments_Success() {
        when(paymentRepository.findAll()).thenReturn(List.of(payment));

        List<Payment> result = paymentService.getAllPayments();

        assertEquals(1, result.size());
    }
}
