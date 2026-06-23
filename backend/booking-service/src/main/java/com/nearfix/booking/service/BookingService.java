package com.nearfix.booking.service;

import com.nearfix.booking.client.AuthClient;
import com.nearfix.booking.client.NotificationClient;
import com.nearfix.booking.client.WorkerClient;
import com.nearfix.booking.client.dto.NotificationRequest;
import com.nearfix.booking.client.dto.UserDto;
import com.nearfix.booking.client.dto.WorkerProfileResponse;
import com.nearfix.booking.dto.BookingResponse;
import com.nearfix.booking.dto.CreateBookingRequest;
import com.nearfix.booking.entity.Booking;
import com.nearfix.booking.entity.BookingStatus;
import com.nearfix.booking.exception.BadRequestException;
import com.nearfix.booking.exception.ConflictException;
import com.nearfix.booking.exception.ResourceNotFoundException;
import com.nearfix.booking.exception.UnauthorizedException;
import com.nearfix.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AuthClient authClient;
    private final WorkerClient workerClient;
    private final NotificationClient notificationClient;

    private static final List<BookingStatus> ACTIVE_STATUSES = List.of(
            BookingStatus.REQUESTED,
            BookingStatus.ACCEPTED,
            BookingStatus.ON_THE_WAY,
            BookingStatus.WORK_STARTED,
            BookingStatus.WORK_COMPLETED
    );

    @Transactional
    public BookingResponse createBooking(Long customerId, String customerRole, CreateBookingRequest request) {
        log.info("Creating booking for customerId: {}, role: {}", customerId, customerRole);

        // Validation: Only CUSTOMER can create bookings
        if (!"CUSTOMER".equalsIgnoreCase(customerRole)) {
            throw new UnauthorizedException("Only customers are authorized to create bookings");
        }

        // Validation: Customer must exist and be active
        try {
            UserDto user = authClient.getUserById(customerId);
            if (user == null || !Boolean.TRUE.equals(user.getActive())) {
                throw new BadRequestException("Customer is inactive or not found");
            }
        } catch (Exception e) {
            log.error("Failed to validate customer details with Auth Service", e);
            throw new BadRequestException("Failed to validate customer. Auth Service unavailable or user not found.");
        }

        // Validation: No duplicate active requests for the same service type
        boolean exists = bookingRepository.existsByCustomerIdAndServiceTypeAndStatusIn(
                customerId, request.getServiceType(), ACTIVE_STATUSES);
        if (exists) {
            throw new ConflictException("You already have an active request for service type: " + request.getServiceType());
        }

        Booking booking = Booking.builder()
                .customerId(customerId)
                .serviceType(request.getServiceType())
                .issueDescription(request.getIssueDescription())
                .address(request.getAddress())
                .status(BookingStatus.REQUESTED)
                .build();

        Booking saved = bookingRepository.save(booking);

        // Send Notification
        try {
            notificationClient.sendNotification(new NotificationRequest(
                    customerId,
                    "Booking Created",
                    "Your request for " + request.getServiceType() + " service has been submitted successfully."
            ));
        } catch (Exception e) {
            log.error("Failed to send booking creation notification", e);
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Long userId, String userRole) {
        log.info("Fetching booking by id: {} for user: {}, role: {}", id, userId, userRole);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        // Customers can only see their own bookings
        if ("CUSTOMER".equalsIgnoreCase(userRole) && !booking.getCustomerId().equals(userId)) {
            throw new UnauthorizedException("Access denied: You can only view your own bookings");
        }

        // Workers can only see their own bookings if assigned
        if ("WORKER".equalsIgnoreCase(userRole) && !userId.equals(booking.getWorkerId())) {
            throw new UnauthorizedException("Access denied: You are not assigned to this booking");
        }

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForCustomer(Long customerId) {
        log.info("Fetching bookings for customer: {}", customerId);
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForWorker(Long workerId) {
        log.info("Fetching bookings for worker: {}", workerId);
        return bookingRepository.findByWorkerIdOrderByCreatedAtDesc(workerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public BookingResponse assignWorker(Long bookingId, Long workerId) {
        log.info("Assigning worker: {} to booking: {}", workerId, bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.REQUESTED) {
            throw new ConflictException("Worker can only be assigned to REQUESTED bookings");
        }

        // Validate Worker Profile
        try {
            WorkerProfileResponse workerProfile = workerClient.getWorkerProfile(workerId);
            if (workerProfile == null) {
                throw new BadRequestException("Worker profile not found");
            }
            if (!Boolean.TRUE.equals(workerProfile.getVerified())) {
                throw new BadRequestException("Worker is not verified");
            }
            if (!"AVAILABLE".equalsIgnoreCase(workerProfile.getStatus())) {
                throw new BadRequestException("Worker is not available (Status: " + workerProfile.getStatus() + ")");
            }
        } catch (Exception e) {
            log.error("Failed to validate worker details with Worker Service", e);
            throw new BadRequestException("Failed to validate worker details. Worker Service unavailable or worker not found.");
        }

        // Verify worker has no other active booking (ACCEPTED, ON_THE_WAY, WORK_STARTED, WORK_COMPLETED)
        List<Booking> workerBookings = bookingRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
        boolean hasActive = workerBookings.stream()
                .anyMatch(b -> b.getStatus() == BookingStatus.ACCEPTED 
                        || b.getStatus() == BookingStatus.ON_THE_WAY
                        || b.getStatus() == BookingStatus.WORK_STARTED
                        || b.getStatus() == BookingStatus.WORK_COMPLETED);
        
        if (hasActive) {
            throw new ConflictException("Worker already has an active booking assignment");
        }

        booking.setWorkerId(workerId);
        // "Once assigned: workerId is populated, status remains REQUESTED until accepted"
        Booking saved = bookingRepository.save(booking);

        // Notify Worker
        try {
            notificationClient.sendNotification(new NotificationRequest(
                    workerId,
                    "New Job Assignment",
                    "You have been assigned to booking #" + bookingId + ". Please accept or reject."
            ));
        } catch (Exception e) {
            log.error("Failed to send job assignment notification", e);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, Long userId, String userRole, BookingStatus newStatus) {
        log.info("Updating booking: {} to status: {} by user: {}, role: {}", id, newStatus, userId, userRole);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        BookingStatus currentStatus = booking.getStatus();

        if (currentStatus == BookingStatus.CANCELLED) {
            throw new ConflictException("Cancelled bookings cannot be modified");
        }
        if (currentStatus == BookingStatus.PAID) {
            throw new ConflictException("Paid bookings are closed and cannot be modified");
        }

        // Handle Cancellation separate flow
        if (newStatus == BookingStatus.CANCELLED) {
            return cancelBooking(booking, userId, userRole);
        }

        // State transitions workflow validation
        switch (currentStatus) {
            case REQUESTED:
                if (newStatus != BookingStatus.ACCEPTED) {
                    throw new ConflictException("Invalid transition from REQUESTED to " + newStatus);
                }
                // Acceptance rules
                if (!"WORKER".equalsIgnoreCase(userRole)) {
                    throw new UnauthorizedException("Only workers can accept booking");
                }
                if (!userId.equals(booking.getWorkerId())) {
                    throw new UnauthorizedException("You are not the worker assigned to this booking");
                }
                
                // Change status of worker to BUSY in Worker service
                try {
                    workerClient.updateWorkerStatus(booking.getWorkerId(), "BUSY");
                } catch (Exception e) {
                    log.error("Failed to update worker status to BUSY", e);
                    throw new BadRequestException("Could not update worker status. Transition aborted.");
                }
                
                booking.setStatus(BookingStatus.ACCEPTED);
                
                // Notify Customer
                sendNotificationSafely(booking.getCustomerId(), "Booking Accepted", 
                        "Your service request has been accepted by the worker.");
                break;

            case ACCEPTED:
                if (newStatus != BookingStatus.ON_THE_WAY) {
                    throw new ConflictException("Invalid transition from ACCEPTED to " + newStatus);
                }
                validateWorkerAccess(booking, userId, userRole);
                booking.setStatus(BookingStatus.ON_THE_WAY);
                
                // Notify Customer
                sendNotificationSafely(booking.getCustomerId(), "Worker On The Way", 
                        "Your assigned worker is on their way.");
                break;

            case ON_THE_WAY:
                if (newStatus != BookingStatus.WORK_STARTED) {
                    throw new ConflictException("Invalid transition from ON_THE_WAY to " + newStatus);
                }
                validateWorkerAccess(booking, userId, userRole);
                booking.setStatus(BookingStatus.WORK_STARTED);
                
                // Notify Customer
                sendNotificationSafely(booking.getCustomerId(), "Work Started", 
                        "The worker has started the emergency service.");
                break;

            case WORK_STARTED:
                if (newStatus != BookingStatus.WORK_COMPLETED) {
                    throw new ConflictException("Invalid transition from WORK_STARTED to " + newStatus);
                }
                validateWorkerAccess(booking, userId, userRole);
                booking.setStatus(BookingStatus.WORK_COMPLETED);
                
                // Notify Customer
                sendNotificationSafely(booking.getCustomerId(), "Work Completed", 
                        "The worker has completed the service. Please make payment.");
                break;

            case WORK_COMPLETED:
                if (newStatus != BookingStatus.PAID) {
                    throw new ConflictException("Invalid transition from WORK_COMPLETED to " + newStatus);
                }
                // PAID is generally triggered by Payment Service
                // Make sure payment service is calling or we are updating status
                booking.setStatus(BookingStatus.PAID);
                
                // Worker goes back to AVAILABLE status since the booking is PAID (job completed)
                try {
                    workerClient.updateWorkerStatus(booking.getWorkerId(), "AVAILABLE");
                } catch (Exception e) {
                    log.error("Failed to set worker status back to AVAILABLE", e);
                }
                
                // Notify Customer & Worker
                sendNotificationSafely(booking.getCustomerId(), "Payment Successful", 
                        "Payment verified. Booking #" + booking.getId() + " is now completed.");
                sendNotificationSafely(booking.getWorkerId(), "Payment Received", 
                        "Payment for booking #" + booking.getId() + " has been settled. You are now AVAILABLE.");
                break;

            default:
                throw new ConflictException("Invalid booking state transition workflow");
        }

        Booking saved = bookingRepository.save(booking);
        return mapToResponse(saved);
    }

    private BookingResponse cancelBooking(Booking booking, Long userId, String userRole) {
        BookingStatus currentStatus = booking.getStatus();

        if ("CUSTOMER".equalsIgnoreCase(userRole)) {
            // Customer can cancel: Before ACCEPTED (i.e. only when status is REQUESTED)
            if (currentStatus != BookingStatus.REQUESTED) {
                throw new ConflictException("Customers can only cancel bookings before they are accepted");
            }
            if (!booking.getCustomerId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to cancel this booking");
            }
        } else if ("WORKER".equalsIgnoreCase(userRole)) {
            // Worker can cancel: Before WORK_STARTED (i.e. when status is ACCEPTED or ON_THE_WAY)
            if (currentStatus != BookingStatus.ACCEPTED && currentStatus != BookingStatus.ON_THE_WAY) {
                throw new ConflictException("Workers can only cancel bookings before work starts");
            }
            if (!userId.equals(booking.getWorkerId())) {
                throw new UnauthorizedException("You are not the worker assigned to this booking");
            }

            // Release worker status to AVAILABLE
            try {
                workerClient.updateWorkerStatus(booking.getWorkerId(), "AVAILABLE");
            } catch (Exception e) {
                log.error("Failed to release worker status back to AVAILABLE upon cancellation", e);
            }
        } else if (!"ADMIN".equalsIgnoreCase(userRole)) {
            throw new UnauthorizedException("Unauthorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);

        // Notifications
        sendNotificationSafely(booking.getCustomerId(), "Booking Cancelled", 
                "Booking #" + booking.getId() + " has been cancelled.");
        if (booking.getWorkerId() != null) {
            sendNotificationSafely(booking.getWorkerId(), "Booking Cancelled", 
                    "Booking #" + booking.getId() + " has been cancelled.");
        }

        return mapToResponse(saved);
    }

    private void validateWorkerAccess(Booking booking, Long userId, String userRole) {
        if (!"WORKER".equalsIgnoreCase(userRole)) {
            throw new UnauthorizedException("Only workers can update this booking status");
        }
        if (!userId.equals(booking.getWorkerId())) {
            throw new UnauthorizedException("You are not the worker assigned to this booking");
        }
    }

    private void sendNotificationSafely(Long userId, String title, String message) {
        try {
            notificationClient.sendNotification(new NotificationRequest(userId, title, message));
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, title, e);
        }
    }

    private BookingResponse mapToResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCustomerId(),
                booking.getWorkerId(),
                booking.getStatus()
        );
    }
}
