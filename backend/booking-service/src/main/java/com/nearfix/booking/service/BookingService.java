package com.nearfix.booking.service;

import com.nearfix.booking.client.AuthClient;
import com.nearfix.booking.client.WorkerClient;
import com.nearfix.booking.client.dto.NotificationRequest;
import org.springframework.kafka.core.KafkaTemplate;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AuthClient authClient;
    private final WorkerClient workerClient;
    private final KafkaTemplate<String, NotificationRequest> kafkaTemplate;
    private final BookingMapper bookingMapper;

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


        if (!"CUSTOMER".equalsIgnoreCase(customerRole)) {
            throw new UnauthorizedException("Only customers are authorized to create bookings");
        }

        UserDto user = null;
        try {
            user = authClient.getUserById(customerId);
            if (user == null || !Boolean.TRUE.equals(user.active())) {
                throw new BadRequestException("Customer is inactive or not found");
            }
        } catch (Exception e) {
            log.error("Failed to validate customer details with Auth Service", e);
            throw new BadRequestException("Failed to validate customer. Auth Service unavailable or user not found.");
        }

        boolean exists = bookingRepository.existsByCustomerIdAndServiceTypeAndStatusIn(
                customerId, request.serviceType(), ACTIVE_STATUSES);
        if (exists) {
            throw new ConflictException("You already have an active request for service type: " + request.serviceType());
        }

        Booking booking = Booking.builder()
                .customerId(customerId)
                .serviceType(request.serviceType())
                .issueDescription(request.issueDescription())
                .address(request.address())
                .city(request.city())
                .status(BookingStatus.REQUESTED)
                .build();

        Booking saved = bookingRepository.save(booking);

        String customerName = user != null && user.fullName() != null ? user.fullName() : "Customer";
        String subject = "NearFix: Emergency Request Submitted [#" + saved.getId() + "]";
        String message = "Hi " + customerName + ",\n\n" +
                "We have received your emergency service request for a **" + request.serviceType() + "**. A nearby certified responder will be assigned shortly.\n\n" +
                "* **Issue Description:** " + request.issueDescription() + "\n" +
                "* **Location:** " + request.address() + "\n" +
                "* **Status:** REQUESTED\n\n" +
                "You can track your request details live on your dashboard.\n\n" +
                "Best regards,\n" +
                "The NearFix Team";
        sendNotificationSafely(customerId, subject, message);

        return bookingMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Long userId, String userRole) {
        log.info("Fetching booking by id: {} for user: {}, role: {}", id, userId, userRole);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));


        if ("CUSTOMER".equalsIgnoreCase(userRole) && !booking.getCustomerId().equals(userId)) {
            throw new UnauthorizedException("Access denied: You can only view your own bookings");
        }


        if ("WORKER".equalsIgnoreCase(userRole) && !userId.equals(booking.getWorkerId())) {
            throw new UnauthorizedException("Access denied: You are not assigned to this booking");
        }

        return bookingMapper.toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForCustomer(Long customerId) {
        log.info("Fetching bookings for customer: {}", customerId);
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsForWorker(Long workerId) {
        log.info("Fetching bookings for worker: {}", workerId);
        return bookingRepository.findByWorkerIdOrderByCreatedAtDesc(workerId)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean hasActiveBookingForWorker(Long workerId) {
        log.info("Checking if worker: {} has active bookings", workerId);
        List<Booking> bookings = bookingRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
        return bookings.stream().anyMatch(b -> 
            b.getStatus() == BookingStatus.ACCEPTED 
            || b.getStatus() == BookingStatus.ON_THE_WAY
            || b.getStatus() == BookingStatus.WORK_STARTED
            || b.getStatus() == BookingStatus.WORK_COMPLETED);
    }

    @Transactional
    public BookingResponse assignWorker(Long bookingId, Long workerId) {
        log.info("Assigning worker: {} to booking: {}", workerId, bookingId);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.REQUESTED) {
            throw new ConflictException("Worker can only be assigned to REQUESTED bookings");
        }


        try {
            WorkerProfileResponse workerProfile = workerClient.getWorkerProfile(workerId);
            if (workerProfile == null) {
                throw new BadRequestException("Worker profile not found");
            }
            if (!Boolean.TRUE.equals(workerProfile.verified())) {
                throw new BadRequestException("Worker is not verified");
            }
            if (!"AVAILABLE".equalsIgnoreCase(workerProfile.status())) {
                throw new BadRequestException("Worker is not available (Status: " + workerProfile.status() + ")");
            }
        } catch (Exception e) {
            log.error("Failed to validate worker details with Worker Service", e);
            throw new BadRequestException("Failed to validate worker details. Worker Service unavailable or worker not found.");
        }

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

        Booking saved = bookingRepository.save(booking);


        String workerName = "Worker";
        try {
            UserDto workerUser = authClient.getUserById(workerId);
            if (workerUser != null && workerUser.fullName() != null) {
                workerName = workerUser.fullName();
            }
        } catch (Exception e) {
            log.warn("Could not fetch worker user details for name placeholder", e);
        }

        String subject = "NearFix: New Emergency Dispatch [#" + bookingId + "]";
        String message = "Hi " + workerName + ",\n\n" +
                "You have been assigned to a new emergency dispatch request in **" + booking.getCity() + "**. Please review the details and accept or decline the job as soon as possible.\n\n" +
                "* **Service Type:** " + booking.getServiceType() + "\n" +
                "* **Distance:** " + (booking.getDistance() != null ? booking.getDistance() : "N/A") + " km\n" +
                "* **Description:** " + booking.getIssueDescription() + "\n\n" +
                "Please open your responder dashboard to accept the request.\n\n" +
                "Best regards,\n" +
                "The NearFix Dispatcher";
        sendNotificationSafely(workerId, subject, message);

        return bookingMapper.toResponse(saved);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long id, Long userId, String userRole, UpdateBookingStatusRequest request) {
        BookingStatus newStatus = request.status();
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

        if (newStatus == BookingStatus.CANCELLED) {
            return cancelBooking(booking, userId, userRole);
        }


        switch (currentStatus) {
            case REQUESTED:
                if (newStatus == BookingStatus.REQUESTED) {
                    if (!"WORKER".equalsIgnoreCase(userRole)) {
                        throw new UnauthorizedException("Only workers can reject job requests");
                    }
                    if (booking.getWorkerId() != null && !userId.equals(booking.getWorkerId())) {
                        throw new UnauthorizedException("You are not the worker assigned to this booking");
                    }
                    booking.setWorkerId(null);
                    break;
                }
                if (newStatus != BookingStatus.ACCEPTED) {
                    throw new ConflictException("Invalid transition from REQUESTED to " + newStatus);
                }

                if (!"WORKER".equalsIgnoreCase(userRole)) {
                    throw new UnauthorizedException("Only workers can accept booking");
                }

                if (booking.getWorkerId() != null && !userId.equals(booking.getWorkerId())) {
                    throw new ConflictException("This emergency dispatch has already been accepted by another responder.");
                }
                

                try {
                    workerClient.updateWorkerStatus(userId, "BUSY");
                } catch (Exception e) {
                    log.error("Failed to update worker status to BUSY", e);
                    throw new BadRequestException("Could not update worker status. Transition aborted.");
                }
                
                booking.setWorkerId(userId);
                booking.setStatus(BookingStatus.ACCEPTED);
                booking.setWorkerLocation(formatCoordinates(request.workerLatitude(), request.workerLongitude()));
                
                Double[] custCoords = parseCoordinates(booking.getAddress());
                if (custCoords != null && request.workerLatitude() != null && request.workerLongitude() != null) {
                    Double dist = calculateHaversineDistance(request.workerLatitude(), request.workerLongitude(), custCoords[0], custCoords[1]);
                    if (dist != null) {
                        booking.setDistance(Math.round(dist * 100.0) / 100.0);
                    }
                } else {
                    booking.setDistance(request.distance());
                }
                
                String customerAcceptName = "Customer";
                String workerAcceptName = "Responder";
                try {
                    UserDto customerUser = authClient.getUserById(booking.getCustomerId());
                    if (customerUser != null && customerUser.fullName() != null) {
                        customerAcceptName = customerUser.fullName();
                    }
                    UserDto workerUser = authClient.getUserById(userId);
                    if (workerUser != null && workerUser.fullName() != null) {
                        workerAcceptName = workerUser.fullName();
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch user details for ACCEPTED notification", e);
                }

                String acceptSubject = "NearFix: Emergency Request Accepted [#" + id + "]";
                String acceptMessage = "Hi " + customerAcceptName + ",\n\n" +
                        "Your emergency request has been accepted by our responder " + workerAcceptName + ". They are on the way.\n\n" +
                        "* **Responder Name:** " + workerAcceptName + "\n" +
                        "* **Status:** ACCEPTED\n\n" +
                        "You can track the responder's live location on your dashboard.\n\n" +
                        "Best regards,\n" +
                        "The NearFix Team";
                sendNotificationSafely(booking.getCustomerId(), acceptSubject, acceptMessage);
                break;

            case ACCEPTED:
                if (newStatus != BookingStatus.ON_THE_WAY) {
                    throw new ConflictException("Invalid transition from ACCEPTED to " + newStatus);
                }
                validateWorkerAccess(booking, userId, userRole);
                booking.setStatus(BookingStatus.ON_THE_WAY);
                break;

            case ON_THE_WAY:
                if (newStatus != BookingStatus.WORK_STARTED) {
                    throw new ConflictException("Invalid transition from ON_THE_WAY to " + newStatus);
                }
                validateWorkerAccess(booking, userId, userRole);
                booking.setStatus(BookingStatus.WORK_STARTED);

                break;

            case WORK_STARTED:
                if (newStatus != BookingStatus.WORK_COMPLETED) {
                    throw new ConflictException("Invalid transition from WORK_STARTED to " + newStatus);
                }
                validateWorkerAccess(booking, userId, userRole);
                if (request.amount() == null) {
                    throw new BadRequestException("Total amount is required to complete the work");
                }
                if (request.amount() < 300.0) {
                    throw new BadRequestException("Minimum charge is 300");
                }
                booking.setAmount(request.amount());
                booking.setStatus(BookingStatus.WORK_COMPLETED);
                

                String customerCompName = "Customer";
                String workerCompName = "Responder";
                try {
                    UserDto customerUser = authClient.getUserById(booking.getCustomerId());
                    if (customerUser != null && customerUser.fullName() != null) {
                        customerCompName = customerUser.fullName();
                    }
                    UserDto workerUser = authClient.getUserById(booking.getWorkerId());
                    if (workerUser != null && workerUser.fullName() != null) {
                        workerCompName = workerUser.fullName();
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch user details for WORK_COMPLETED notification", e);
                }

                String compSubject = "NearFix: Work Completed - Invoice for Booking [#" + id + "]";
                String compMessage = "Hi " + customerCompName + ",\n\n" +
                        "The worker **" + workerCompName + "** has completed the emergency repair service.\n\n" +
                        "* **Service Type:** " + booking.getServiceType() + "\n" +
                        "* **Assigned Technician:** " + workerCompName + "\n" +
                        "* **Total Charge:** ₹" + request.amount() + "\n\n" +
                        "Please log into the app to verify the work and complete your payment.\n\n" +
                        "Best regards,\n" +
                        "The NearFix Billing Team";
                sendNotificationSafely(booking.getCustomerId(), compSubject, compMessage);
                break;

            case WORK_COMPLETED:
                if (newStatus != BookingStatus.PAID) {
                    throw new ConflictException("Invalid transition from WORK_COMPLETED to " + newStatus);
                }

                booking.setStatus(BookingStatus.PAID);
                

                try {
                    workerClient.updateWorkerStatus(booking.getWorkerId(), "AVAILABLE");
                } catch (Exception e) {
                    log.error("Failed to set worker status back to AVAILABLE", e);
                }
                

                String custPaidName = "Customer";
                String workPaidName = "Worker";
                try {
                    UserDto customerUser = authClient.getUserById(booking.getCustomerId());
                    if (customerUser != null && customerUser.fullName() != null) {
                        custPaidName = customerUser.fullName();
                    }
                    UserDto workerUser = authClient.getUserById(booking.getWorkerId());
                    if (workerUser != null && workerUser.fullName() != null) {
                        workPaidName = workerUser.fullName();
                    }
                } catch (Exception e) {
                    log.warn("Could not fetch user details for PAID notification", e);
                }

                String timestampStr = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

                String custPaidSubject = "NearFix: Payment Verified for Booking [#" + booking.getId() + "]";
                String custPaidMessage = "Hi " + custPaidName + ",\n\n" +
                        "This email confirms that the payment of **₹" + (booking.getAmount() != null ? booking.getAmount() : "0.0") + "** for Booking #" + booking.getId() + " has been successfully processed.\n\n" +
                        "* **Transaction ID:** Simulated/Settled\n" +
                        "* **Payment Status:** SUCCESS\n" +
                        "* **Date:** " + timestampStr + "\n\n" +
                        "Thank you for choosing NearFix.\n\n" +
                        "Best regards,\n" +
                        "The NearFix Payments Team";
                sendNotificationSafely(booking.getCustomerId(), custPaidSubject, custPaidMessage);

                String workPaidSubject = "NearFix: Payment Verified for Booking [#" + booking.getId() + "]";
                String workPaidMessage = "Hi " + workPaidName + ",\n\n" +
                        "This email confirms that the payment of **₹" + (booking.getAmount() != null ? booking.getAmount() : "0.0") + "** for Booking #" + booking.getId() + " has been successfully processed.\n\n" +
                        "* **Transaction ID:** Simulated/Settled\n" +
                        "* **Payment Status:** SUCCESS\n" +
                        "* **Date:** " + timestampStr + "\n\n" +
                        "Thank you for choosing NearFix.\n\n" +
                        "Best regards,\n" +
                        "The NearFix Payments Team";
                sendNotificationSafely(booking.getWorkerId(), workPaidSubject, workPaidMessage);
                break;

            default:
                throw new ConflictException("Invalid booking state transition workflow");
        }

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    private BookingResponse cancelBooking(Booking booking, Long userId, String userRole) {
        BookingStatus currentStatus = booking.getStatus();

        if ("CUSTOMER".equalsIgnoreCase(userRole)) {

            if (currentStatus != BookingStatus.REQUESTED) {
                throw new ConflictException("Customers can only cancel bookings before they are accepted");
            }
            if (!booking.getCustomerId().equals(userId)) {
                throw new UnauthorizedException("You are not authorized to cancel this booking");
            }
        } else if ("WORKER".equalsIgnoreCase(userRole)) {

            if (currentStatus != BookingStatus.ACCEPTED && currentStatus != BookingStatus.ON_THE_WAY) {
                throw new ConflictException("Workers can only cancel bookings before work starts");
            }
            if (!userId.equals(booking.getWorkerId())) {
                throw new UnauthorizedException("You are not the worker assigned to this booking");
            }


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

        String custCancelName = "Customer";
        String workCancelName = "Worker";
        try {
            UserDto customerUser = authClient.getUserById(booking.getCustomerId());
            if (customerUser != null && customerUser.fullName() != null) {
                custCancelName = customerUser.fullName();
            }
            if (booking.getWorkerId() != null) {
                UserDto workerUser = authClient.getUserById(booking.getWorkerId());
                if (workerUser != null && workerUser.fullName() != null) {
                    workCancelName = workerUser.fullName();
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch user details for CANCELLED notification", e);
        }

        String cancelSubject = "NearFix: Booking Cancelled [#" + booking.getId() + "]";
        String custCancelMessage = "Hi " + custCancelName + ",\n\n" +
                "This email confirms that your Booking #" + booking.getId() + " has been cancelled.\n\n" +
                "If you did not request this cancellation or have questions, please contact support.\n\n" +
                "Best regards,\n" +
                "The NearFix Team";
        sendNotificationSafely(booking.getCustomerId(), cancelSubject, custCancelMessage);

        if (booking.getWorkerId() != null) {
            String workCancelMessage = "Hi " + workCancelName + ",\n\n" +
                    "This email confirms that Booking #" + booking.getId() + " has been cancelled.\n\n" +
                    "Your status has been set back to AVAILABLE.\n\n" +
                    "Best regards,\n" +
                    "The NearFix Dispatcher";
            sendNotificationSafely(booking.getWorkerId(), cancelSubject, workCancelMessage);
        }

        return bookingMapper.toResponse(saved);
    }

    private void validateWorkerAccess(Booking booking, Long userId, String userRole) {
        if (!"WORKER".equalsIgnoreCase(userRole)) {
            throw new UnauthorizedException("Only workers can update this booking status");
        }
        if (!userId.equals(booking.getWorkerId())) {
            throw new UnauthorizedException("You are not the worker assigned to this booking");
        }
    }

    private void sendNotificationSafely(Long userId, String subject, String message) {
        try {
            UserDto user = authClient.getUserById(userId);
            if (user != null && user.email() != null) {
                kafkaTemplate.send("notification-topic", new NotificationRequest(user.email(), subject, message));
            } else {
                log.warn("Could not send notification to user {}: User or email not found", userId);
            }
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", userId, subject, e);
        }
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings() {
        log.info("Fetching all bookings in the system");
        return bookingRepository.findAll()
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAvailableBookings(String skill, String city) {
        log.info("Fetching available requests for skill: {} and city: {}", skill, city);
        return bookingRepository.findByStatusAndWorkerIdIsNullAndServiceTypeAndCity(
                BookingStatus.REQUESTED, skill, city)
                .stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse updateWorkerLocation(Long id, Double workerLatitude, Double workerLongitude) {
        log.info("Updating worker live location for booking: {} to ({}, {})", id, workerLatitude, workerLongitude);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        booking.setWorkerLocation(formatCoordinates(workerLatitude, workerLongitude));

        Double[] custCoords = parseCoordinates(booking.getAddress());
        if (custCoords != null && workerLatitude != null && workerLongitude != null) {
            Double distance = calculateHaversineDistance(workerLatitude, workerLongitude, custCoords[0], custCoords[1]);
            if (distance != null) {
                booking.setDistance(Math.round(distance * 100.0) / 100.0);
            }
        }

        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
    }

    private Double calculateHaversineDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return null;
        }
        final int R = 6371; // Radius of the Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private Double[] parseCoordinates(String addressStr) {
        if (addressStr == null) return null;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(-?\\d+\\.\\d+)\\s*°?\\s*([NSEW]?)");
        java.util.regex.Matcher matcher = pattern.matcher(addressStr);
        Double lat = null;
        Double lon = null;
        if (matcher.find()) {
            lat = Double.parseDouble(matcher.group(1));
            String dir = matcher.group(2);
            if ("S".equalsIgnoreCase(dir)) {
                lat = -Math.abs(lat);
            } else if ("N".equalsIgnoreCase(dir)) {
                lat = Math.abs(lat);
            }
        }
        if (matcher.find()) {
            lon = Double.parseDouble(matcher.group(1));
            String dir = matcher.group(2);
            if ("W".equalsIgnoreCase(dir)) {
                lon = -Math.abs(lon);
            } else if ("E".equalsIgnoreCase(dir)) {
                lon = Math.abs(lon);
            }
        }
        if (lat != null && lon != null) {
            return new Double[]{lat, lon};
        }
        return null;
    }

    private String formatCoordinates(Double lat, Double lon) {
        if (lat == null || lon == null) {
            return null;
        }
        char latDirection = lat >= 0 ? 'N' : 'S';
        char lonDirection = lon >= 0 ? 'E' : 'W';
        return String.format(java.util.Locale.US, "Coordinates: %.6f° %c, %.6f° %c", 
                Math.abs(lat), latDirection, Math.abs(lon), lonDirection);
    }
}
