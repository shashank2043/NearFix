package com.nearfix.booking.repository;

import com.nearfix.booking.entity.Booking;
import com.nearfix.booking.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
    boolean existsByCustomerIdAndServiceTypeAndStatusIn(Long customerId, String serviceType, List<BookingStatus> statuses);
}
