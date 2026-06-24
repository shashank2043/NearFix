package com.nearfix.booking.controller;

import com.nearfix.booking.entity.Review;
import com.nearfix.booking.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Review>> getReviews(
            @RequestParam(value = "workerId", required = false) Long workerId,
            @RequestParam(value = "bookingId", required = false) Long bookingId) {
        if (workerId != null) {
            return ResponseEntity.ok(reviewRepository.findByWorkerId(workerId));
        } else if (bookingId != null) {
            return ResponseEntity.ok(reviewRepository.findByBookingId(bookingId));
        }
        return ResponseEntity.ok(reviewRepository.findAll());
    }
}
