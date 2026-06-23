package com.nearfix.payment.repository;

import com.nearfix.payment.entity.Payment;
import com.nearfix.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    boolean existsByBookingId(Long bookingId);
    boolean existsByBookingIdAndStatus(Long bookingId, PaymentStatus status);
}
