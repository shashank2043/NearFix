package com.nearfix.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nearfix.booking.entity.Review;
import com.nearfix.booking.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class ReviewControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private ReviewController reviewController;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private Review review;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());
        mockMvc = MockMvcBuilders.standaloneSetup(reviewController).build();
        review = Review.builder()
                .id(1L)
                .bookingId(100L)
                .customerId(10L)
                .workerId(20L)
                .rating(4.5)
                .comment("Excellent plumber")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createReview_Success() throws Exception {
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        mockMvc.perform(post("/api/reviews")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(review)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.comment").value("Excellent plumber"));

        verify(reviewRepository, times(1)).save(any(Review.class));
    }

    @Test
    void getReviews_All() throws Exception {
        when(reviewRepository.findAll()).thenReturn(List.of(review));

        mockMvc.perform(get("/api/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(reviewRepository, times(1)).findAll();
    }

    @Test
    void getReviews_FilterByWorkerId() throws Exception {
        when(reviewRepository.findByWorkerId(20L)).thenReturn(List.of(review));

        mockMvc.perform(get("/api/reviews")
                        .param("workerId", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(reviewRepository, times(1)).findByWorkerId(20L);
    }

    @Test
    void getReviews_FilterByBookingId() throws Exception {
        when(reviewRepository.findByBookingId(100L)).thenReturn(List.of(review));

        mockMvc.perform(get("/api/reviews")
                        .param("bookingId", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1L));

        verify(reviewRepository, times(1)).findByBookingId(100L);
    }
}
