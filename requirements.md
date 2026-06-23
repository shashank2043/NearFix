# SkillConnect Emergency Marketplace

## Problem Statement

Finding a trusted electrician, plumber, mechanic, carpenter, AC technician, or other skilled worker during an emergency is difficult. Existing platforms focus on scheduled services rather than immediate assistance.

SkillConnect provides a real-time marketplace that connects customers with nearby verified workers for emergency service requests.

---

# Team Structure

## Backend Team

### Member 1

Responsibilities:

* API Gateway
* Eureka Server
* Auth Service
* Worker Service

### Member 2

Responsibilities:

* Booking Service
* Payment Service
* Notification Service

---

## Frontend Team

### Member 3

Responsibilities:

* Customer Portal

### Member 4

Responsibilities:

* Worker Portal
* Admin Portal

---

## QA Team

### Member 5

Responsibilities:

* API Testing
* Integration Testing
* E2E Testing
* Swagger Validation
* Test Case Creation

---

# Architecture

Customer
→ API Gateway
→ Auth Service

Customer
→ Booking Service
→ Worker Service

Worker
→ Booking Service

Customer
→ Payment Service

Booking Service
→ Notification Service

---

# Technology Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* JWT
* Spring Cloud Gateway
* Eureka Server
* OpenFeign
* Resilience4j
* MySQL

## Frontend

* React
* Material UI
* Axios
* React Router

## Testing

* Rest Assured
* Cucumber

## Deployment

* Docker
* Docker Compose

---

# Authentication Model

Single User Identity Model

No separate userId and workerId mapping.

Auth User ID will be used across all services.

Example:

User ID = 101

Worker Profile ID = 101

Booking.workerId = 101

Booking.customerId = 11

---

# SERVICE 1 : AUTH SERVICE

Database : auth_db

## Entity

### User

| Field     | Type          |
| --------- | ------------- |
| id        | Long          |
| fullName  | String        |
| email     | String        |
| phone     | String        |
| password  | String        |
| role      | Role          |
| active    | Boolean       |
| createdAt | LocalDateTime |

### Role

CUSTOMER

WORKER

ADMIN

---

## DTOs

### RegisterRequest

| Field    |
| -------- |
| fullName |
| email    |
| phone    |
| password |
| role     |

### RegisterResponse

| Field   |
| ------- |
| id      |
| message |

### LoginRequest

| Field    |
| -------- |
| email    |
| password |

### LoginResponse

| Field |
| ----- |
| token |
| role  |
| id    |

---

## APIs

POST /api/auth/register

POST /api/auth/login

GET /api/auth/users/{id}

GET /api/auth/profile

---

# SERVICE 2 : WORKER SERVICE

Database : worker_db

## Entity

### WorkerProfile

| Field      | Type         |
| ---------- | ------------ |
| id         | Long         |
| skill      | String       |
| experience | Integer      |
| city       | String       |
| rating     | Double       |
| verified   | Boolean      |
| status     | WorkerStatus |

### WorkerStatus

AVAILABLE

BUSY

OFFLINE

---

## DTOs

### CreateWorkerProfileRequest

| Field      |
| ---------- |
| skill      |
| experience |
| city       |

### WorkerProfileResponse

| Field      |
| ---------- |
| id         |
| skill      |
| experience |
| city       |
| rating     |
| verified   |
| status     |

---

## APIs

POST /api/workers/profile

GET /api/workers/profile/{id}

PUT /api/workers/profile

PUT /api/workers/status

GET /api/workers/search

GET /api/workers/available

---

## Dependency

Auth Service

Purpose:

* JWT Validation
* Role Validation

---

# SERVICE 3 : BOOKING SERVICE

Database : booking_db

## Entity

### Booking

| Field            | Type          |
| ---------------- | ------------- |
| id               | Long          |
| customerId       | Long          |
| workerId         | Long          |
| serviceType      | String        |
| issueDescription | String        |
| address          | String        |
| status           | BookingStatus |
| createdAt        | LocalDateTime |

### BookingStatus

REQUESTED

ACCEPTED

ON_THE_WAY

WORK_STARTED

WORK_COMPLETED

PAID

CANCELLED

---

## DTOs

### CreateBookingRequest

| Field            |
| ---------------- |
| serviceType      |
| issueDescription |
| address          |

### BookingResponse

| Field      |
| ---------- |
| bookingId  |
| customerId |
| workerId   |
| status     |

### UpdateBookingStatusRequest

| Field  |
| ------ |
| status |

---

## APIs

POST /api/bookings

GET /api/bookings/{id}

GET /api/bookings/customer

GET /api/bookings/worker

PUT /api/bookings/{id}/status

PUT /api/bookings/{id}/assign-worker/{workerId}

---

## Dependency

Worker Service

Purpose:

* Find available workers
* Assign worker

Auth Service

Purpose:

* Validate customer
* Validate worker

---

# SERVICE 4 : PAYMENT SERVICE

Database : payment_db

## Entity

### Payment

| Field         | Type          |
| ------------- | ------------- |
| id            | Long          |
| bookingId     | Long          |
| amount        | Double        |
| status        | PaymentStatus |
| transactionId | String        |
| paymentDate   | LocalDateTime |

### PaymentStatus

PENDING

SUCCESS

FAILED

---

## DTOs

### CreatePaymentRequest

| Field     |
| --------- |
| bookingId |
| amount    |

### PaymentResponse

| Field         |
| ------------- |
| transactionId |
| status        |

---

## APIs

POST /api/payments

GET /api/payments/{id}

GET /api/payments/booking/{bookingId}

---

## Dependency

Booking Service

Purpose:

* Verify booking exists
* Update booking status to PAID

---

# SERVICE 5 : NOTIFICATION SERVICE

Database : notification_db

## Entity

### Notification

| Field     | Type          |
| --------- | ------------- |
| id        | Long          |
| userId    | Long          |
| title     | String        |
| message   | String        |
| sent      | Boolean       |
| createdAt | LocalDateTime |

---

## DTOs

### NotificationRequest

| Field   |
| ------- |
| userId  |
| title   |
| message |

### NotificationResponse

| Field |
| ----- |
| id    |
| sent  |

---

## APIs

POST /api/notifications/send

GET /api/notifications/user/{userId}

---

## Dependency

Called By:

* Booking Service
* Payment Service

---

# CUSTOMER FRONTEND

## Authentication

* Login
* Register

---

## Dashboard

Display:

* Active Bookings
* Completed Bookings
* Total Requests

---

## Create Booking

Fields:

* Service Type
* Issue Description
* Address

---

## Booking Tracking

Display:

* Worker Name
* Worker Rating
* Status Timeline

---

## Payment Page

Display:

* Booking Summary
* Amount
* Payment Button

---

## Reviews Page

Fields:

* Rating
* Comments

---

# WORKER FRONTEND

## Dashboard

Display:

* Available Requests
* Active Jobs
* Today's Earnings

---

## Profile Page

Fields:

* Skill
* Experience
* City

---

## Job Management

Actions:

* Accept Job
* Reject Job
* Update Status

---

# ADMIN FRONTEND

## Dashboard

Display:

* Total Users
* Workers
* Bookings
* Revenue

---

## Worker Verification

Actions:

* Approve Worker
* Reject Worker

---

## Complaint Management

Display:

* Open Complaints
* Resolved Complaints

---

# Complete Business Flow

## Customer Registration

Customer

→ Register

→ Login

→ JWT Generated

---

## Worker Registration

Worker

→ Register

→ Login

→ Create Worker Profile

→ Admin Verification

→ Status AVAILABLE

---

## Emergency Request

Customer

→ Create Booking

→ Booking Status REQUESTED

---

## Worker Assignment

Worker

→ View Available Requests

→ Accept Request

→ Booking Status ACCEPTED

---

## Service Execution

Worker

→ ON_THE_WAY

→ WORK_STARTED

→ WORK_COMPLETED

---

## Payment

Customer

→ Payment

→ Payment SUCCESS

→ Booking Status PAID

---

## Review

Customer

→ Rate Worker

→ Review Saved

---

# Testing Scenarios

## Auth Service

* Register Customer
* Register Worker
* Login
* Invalid Login
* JWT Validation

---

## Worker Service

* Create Profile
* Search Workers
* Update Availability

---

## Booking Service

* Create Booking
* Assign Worker
* Update Status
* Cancel Booking

---

## Payment Service

* Successful Payment
* Failed Payment

---

## End-to-End Test

Customer Register

→ Customer Login

→ Create Booking

→ Worker Accept

→ Worker Complete Job

→ Customer Pay

→ Booking Closed Successfully


# Business Requirements & Validations

---

# AUTH SERVICE

## Business Requirements

### User Registration

- Email must be unique across the platform.
- Phone number must be unique.
- Password must be encrypted using BCrypt.
- Role must be one of:
    - CUSTOMER
    - WORKER
    - ADMIN
- User account should be active by default.
- Worker registration does not automatically make the worker available for bookings.
- Worker must create a Worker Profile and get admin approval.

### Login

- Only active users can login.
- Invalid credentials should return Unauthorized.
- JWT token should contain:
    - User ID
    - Role
    - Email
- JWT expiration should be configurable.

### Authorization

- CUSTOMER can access customer endpoints only.
- WORKER can access worker endpoints only.
- ADMIN can access admin endpoints only.
- Every protected API must validate JWT.

## Validations

### RegisterRequest

| Field | Validation |
|---------|---------|
| fullName | Required, Min 3 chars |
| email | Required, Valid Email Format |
| phone | Required, 10-15 digits |
| password | Required, Min 8 chars |
| role | CUSTOMER/WORKER/ADMIN |

### LoginRequest

| Field | Validation |
|---------|---------|
| email | Required |
| password | Required |

---

# WORKER SERVICE

## Business Requirements

### Worker Profile Creation

- Only users with WORKER role can create profile.
- One worker can have only one profile.
- Worker Profile ID must match Auth User ID.
- New worker status should be OFFLINE.
- New worker should not be visible for assignments until verified.

### Worker Verification

- Only ADMIN can verify workers.
- Verified workers become eligible for assignments.
- Rejected workers cannot receive bookings.

### Worker Availability

Worker can update status:

- AVAILABLE
- BUSY
- OFFLINE

Rules:

- Worker with active booking cannot become AVAILABLE until current job is completed.
- Worker assigned to a booking automatically becomes BUSY.
- Offline workers should not appear in search results.

### Worker Search

Only return workers:

- Verified = true
- Status = AVAILABLE

Search filters:

- Skill
- City
- Minimum Rating

## Validations

### CreateWorkerProfileRequest

| Field | Validation |
|---------|---------|
| skill | Required |
| experience | >= 0 |
| city | Required |

### Worker Status Update

- Only valid statuses accepted.
- Invalid status should return Bad Request.

---

# BOOKING SERVICE

## Business Requirements

### Booking Creation

- Only CUSTOMER can create bookings.
- Customer must be active.
- Booking starts with REQUESTED status.
- Customer cannot create duplicate active requests for the same issue.
- Booking must contain service details and address.

### Worker Assignment

- Worker must exist.
- Worker must be verified.
- Worker must be AVAILABLE.
- Worker cannot have another active booking.
- Once assigned:
    - workerId is populated
    - status remains REQUESTED until accepted

### Booking Acceptance

- Only assigned worker can accept booking.
- Booking status changes to ACCEPTED.
- Worker status becomes BUSY.

### Status Transition Rules

Allowed transitions:

REQUESTED
→ ACCEPTED

ACCEPTED
→ ON_THE_WAY

ON_THE_WAY
→ WORK_STARTED

WORK_STARTED
→ WORK_COMPLETED

WORK_COMPLETED
→ PAID

Any invalid transition should be rejected.

### Cancellation Rules

Customer can cancel:

- Before ACCEPTED

Worker can cancel:

- Before WORK_STARTED

Cancelled bookings cannot be modified.

### Booking History

Customers can view:

- Current Bookings
- Completed Bookings
- Cancelled Bookings

Workers can view:

- Assigned Jobs
- Completed Jobs

## Validations

### CreateBookingRequest

| Field | Validation |
|---------|---------|
| serviceType | Required |
| issueDescription | Required, Min 10 chars |
| address | Required |

### Assign Worker

- Worker ID must exist.
- Worker must be AVAILABLE.

### Status Update

- Status must follow workflow.
- Invalid transition returns Conflict.

---

# PAYMENT SERVICE

## Business Requirements

### Payment Creation

- Booking must exist.
- Booking status must be WORK_COMPLETED.
- Payment can be created only once per booking.
- Amount must be greater than zero.

### Successful Payment

On success:

- Payment status becomes SUCCESS.
- Booking status becomes PAID.
- Notification event triggered.

### Failed Payment

On failure:

- Payment status becomes FAILED.
- Booking remains WORK_COMPLETED.
- Customer can retry payment.

### Transaction Handling

- Every payment must generate unique transaction ID.
- Duplicate transactions must be prevented.

## Validations

### CreatePaymentRequest

| Field | Validation |
|---------|---------|
| bookingId | Required |
| amount | > 0 |

### Payment Processing

- Booking must not already be PAID.
- Booking must not be CANCELLED.

---

# NOTIFICATION SERVICE

## Business Requirements

### Notification Creation

Notifications should be sent for:

- Worker Registration Approval
- Booking Created
- Booking Assigned
- Booking Accepted
- Worker On The Way
- Work Started
- Work Completed
- Payment Success
- Booking Cancelled

### Delivery Rules

- Notifications should be persisted.
- Failed notifications should be retried.
- Notification history should be available.

### Notification Types

- Email
- SMS
- In-App Notification

(Initial implementation can support In-App only)

## Validations

### NotificationRequest

| Field | Validation |
|---------|---------|
| userId | Required |
| title | Required |
| message | Required |

---

# ADMIN REQUIREMENTS

## Worker Verification

Admin can:

- Approve Worker
- Reject Worker

Rules:

- Worker must have completed profile.
- Approval sets verified=true.
- Rejection stores rejection reason.

## Dashboard Metrics

Admin Dashboard should display:

- Total Customers
- Total Workers
- Verified Workers
- Active Bookings
- Completed Bookings
- Revenue

---

# CUSTOMER BUSINESS RULES

## Customer Restrictions

- Customer must be logged in.
- Customer can only access their own bookings.
- Customer can only review completed bookings.

### Review Rules

- One review per booking.
- Rating range: 1-5.
- Review allowed only after payment success.

---

# WORKER BUSINESS RULES

## Worker Restrictions

- Worker must be verified.
- Worker must be AVAILABLE to receive jobs.
- Worker can only update status of assigned bookings.
- Worker cannot modify customer details.

### Earnings

Worker earnings should be calculated from:

- Successfully completed and paid bookings only.

---

# SYSTEM-WIDE REQUIREMENTS

## Security

- JWT Authentication for all protected APIs.
- Passwords stored using BCrypt.
- Role-Based Access Control (RBAC).
- Sensitive APIs should be audit logged.

## Performance

- API response time < 2 seconds.
- Service-to-service communication through OpenFeign.
- Circuit Breaker using Resilience4j.

## Audit Logs

Track:

- User Registration
- Login Attempts
- Booking Creation
- Worker Assignment
- Payment Success
- Status Changes

## Error Handling

Standard Error Response:

```json
{
  "timestamp": "2026-06-23T10:00:00",
  "status": 400,
  "message": "Validation Failed",
  "path": "/api/bookings"
}