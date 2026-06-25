package com.nearfix.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.payment.config.AuthPrincipal;
import com.nearfix.payment.dto.CreatePaymentRequest;
import com.nearfix.payment.dto.PaymentResponse;
import com.nearfix.payment.dto.PaymentVerificationRequest;
import com.nearfix.payment.entity.Payment;
import com.nearfix.payment.entity.PaymentStatus;
import com.nearfix.payment.service.PaymentService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class PaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private PaymentResponse response;
    private Payment payment;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController).build();
        response = new PaymentResponse("rzp_order_test123", PaymentStatus.PENDING, "test_key_id");
        payment = Payment.builder()
                .id(1L)
                .bookingId(100L)
                .amount(350.0)
                .status(PaymentStatus.PENDING)
                .transactionId("rzp_order_test123")
                .build();

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
    void processPayment_Success() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest(100L, 350.0);
        when(paymentService.processPayment(eq(10L), eq("CUSTOMER"), any(CreatePaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/payments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").value("rzp_order_test123"));

        verify(paymentService, times(1)).processPayment(eq(10L), eq("CUSTOMER"), any(CreatePaymentRequest.class));
    }

    @Test
    void verifyPayment_Success() throws Exception {
        PaymentVerificationRequest request = new PaymentVerificationRequest(100L, "rzp_order_test123", "pay_123", "sig_123");
        response = new PaymentResponse("rzp_order_test123", PaymentStatus.SUCCESS, "test_key_id");
        when(paymentService.verifyPayment(eq(10L), eq("CUSTOMER"), any(PaymentVerificationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/payments/verify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        verify(paymentService, times(1)).verifyPayment(eq(10L), eq("CUSTOMER"), any(PaymentVerificationRequest.class));
    }

    @Test
    void getPaymentById_Success() throws Exception {
        when(paymentService.getPaymentById(1L)).thenReturn(payment);

        mockMvc.perform(get("/api/payments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(paymentService, times(1)).getPaymentById(1L);
    }

    @Test
    void getPaymentByBookingId_Success() throws Exception {
        when(paymentService.getPaymentByBookingId(100L)).thenReturn(payment);

        mockMvc.perform(get("/api/payments/booking/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingId").value(100L));

        verify(paymentService, times(1)).getPaymentByBookingId(100L);
    }

    @Test
    void getPayments_All() throws Exception {
        when(paymentService.getAllPayments()).thenReturn(List.of(payment));

        mockMvc.perform(get("/api/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(paymentService, times(1)).getAllPayments();
    }

    @Test
    void getPayments_FilterByBookingId_Success() throws Exception {
        when(paymentService.getPaymentByBookingId(100L)).thenReturn(payment);

        mockMvc.perform(get("/api/payments")
                        .param("bookingId", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(paymentService, times(1)).getPaymentByBookingId(100L);
    }

    @Test
    void getPayments_FilterByBookingId_NotFound() throws Exception {
        when(paymentService.getPaymentByBookingId(100L)).thenThrow(new com.nearfix.payment.exception.ResourceNotFoundException("not found"));

        mockMvc.perform(get("/api/payments")
                        .param("bookingId", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        verify(paymentService, times(1)).getPaymentByBookingId(100L);
    }
}
