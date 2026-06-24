# 🛡️ NearFix Backend — Spring Boot Microservices Architecture

Welcome to the backend engineering repository of the **NearFix** Emergency Skill Marketplace. The backend is designed as a distributed, service-oriented system built with **Spring Boot 4.x** and **Spring Cloud**.

---

## 🏗️ Architecture Design & Infrastructure

Our backend services communicate using **OpenFeign** clients and register with a **Eureka Discovery Server** for dynamic routing. Config parameters are distributed centrally via a **Spring Cloud Config Server**.

```
                           +----------------------------------------+
                           |             Client Portal              |
                           +-------------------+--------------------+
                                               |
                                               v (Port 8080)
+-----------------------+  +-------------------+--------------------+
|     Eureka Server     |<--+            API Gateway                 |
|      (Port 8761)      |  +-------------------+--------------------+
+-----------------------+                      |
                                               | (Discovery Load-balanced routing)
                                               v
     +-----------------+-----------------------+-----------------------+---------------+
     |                 |                       |                       |               |
     v (Port 8081)     v (Port 8082)           v (Port 8083)           v (Port 8084)   v (Port 8085)
+----+----+       +----+----+             +----+----+             +----+----+     +----+----+
|  Auth   |       | Worker  |             | Booking |             | Payment |     | Notif   |
| Service |       | Service |             | Service |             | Service |     | Service |
+----+----+       +----+----+             +----+----+             +----+----+     +----+----+
     |                 |                       |                       |               |
     v                 v                       v                       v               v
 [auth_db]        [worker_db]             [booking_db]            [payment_db]   [notification_db]
```

---

## ⚙️ Infrastructure & Registry Services

### 1. Eureka Server (`eureka-server`)
* **Role:** Service Discovery & Registry
* **Binding Port:** `8761`
* **Health Dashboard:** [http://localhost:8761/](http://localhost:8761/)
* **Folder:** [eureka-server](file:///D:/nearfix/backend/eureka-server)

### 2. Config Server (`config-server`)
* **Role:** Dynamic centralized profile configurations (`bootstrap.yml`) loaded from a local repository.
* **Binding Port:** `8888`
* **Local Repo Path:** [config-repo](file:///D:/nearfix/backend/config-repo)
* **Folder:** [config-server](file:///D:/nearfix/backend/config-server)

### 3. API Gateway (`api-gateway`)
* **Role:** Secure reverse-proxy routing. Extracts JWT header validations and routes request tokens directly.
* **Binding Port:** `8080`
* **Folder:** [api-gateway](file:///D:/nearfix/backend/api-gateway)

---

## 🛠️ Microservice Directory Reference

Each microservice maps to its own standalone database:

### 👤 Auth Service (`auth-service`)
* **Binding Port:** `8081`
* **Database Schema:** `auth_db`
* **Folder:** [auth-service](file:///D:/nearfix/backend/auth-service)
* **API Endpoints:**
  * `POST /api/auth/register` — Registers a standard account (CUSTOMER / WORKER / ADMIN).
  * `POST /api/auth/login` — Verifies encrypted password and yields signed JWT validation credentials.
  * `GET /api/auth/users/{id}` — Inter-service endpoint to fetch user profiles.
  * `GET /api/auth/profile` — Checks details of current logged-in session.

### 🛠️ Worker Service (`worker-service`)
* **Binding Port:** `8082`
* **Database Schema:** `worker_db`
* **Folder:** [worker-service](file:///D:/nearfix/backend/worker-service)
* **API Endpoints:**
  * `POST /api/workers/profile` — Workers build profiles detailing skill, experience, and service city.
  * `GET /api/workers/profile/{id}` — Fetches profile parameters.
  * `PUT /api/workers/profile` — Modifies registration descriptions.
  * `PUT /api/workers/status` — Toggles state between `AVAILABLE`, `BUSY`, and `OFFLINE`.
  * `GET /api/workers/search` — Search verified and active workers inside specific cities.

### 📞 Booking Service (`booking-service`)
* **Binding Port:** `8083`
* **Database Schema:** `booking_db`
* **Folder:** [booking-service](file:///D:/nearfix/backend/booking-service)
* **Dependencies:** Auth Service, Worker Service, Notification Service
* **API Endpoints:**
  * `POST /api/bookings` — Customers post real-time SOS requests. Starts as `REQUESTED`.
  * `GET /api/bookings/{id}` — Fetches detailed booking details.
  * `PUT /api/bookings/{id}/status` — Steps booking status through the state machine.
  * `PUT /api/bookings/{id}/assign-worker/{workerId}` — Assigns an available worker to a request.
  * `GET /api/bookings/customer` — Lists bookings associated with current Customer.
  * `GET /api/bookings/worker` — Lists assigned / completed jobs for Worker.

### 💳 Payment Service (`payment-service`)
* **Binding Port:** `8084`
* **Database Schema:** `payment_db`
* **Dependencies:** Booking Service, Notification Service
* **Folder:** [payment-service](file:///D:/nearfix/backend/payment-service)
* **API Endpoints:**
  * `POST /api/payments` — Starts payment verification checks. Updates booking state to `PAID` upon success.
  * `GET /api/payments/{id}` — Reviews transaction details.
  * `GET /api/payments/booking/{bookingId}` — Checks if a booking has a valid transaction attached.

### 🔔 Notification Service (`notification-service`)
* **Binding Port:** `8085`
* **Database Schema:** `notification_db`
* **Folder:** [notification-service](file:///D:/nearfix/backend/notification-service)
* **API Endpoints:**
  * `POST /api/notifications/send` — Saves and dispatches system notifications to users.
  * `GET /api/notifications/user/{userId}` — Inbox message logs for standard clients.

---

## 🚦 Booking Status Transition Rules

The booking orchestrator strictly enforces status transitions. Violating these steps returns a `409 Conflict` exception:

```
[REQUESTED] ──> [ACCEPTED] ──> [ON_THE_WAY] ──> [WORK_STARTED] ──> [WORK_COMPLETED] ──> [PAID]
```

* **Cancellation Rules:** 
  * Customers can cancel a booking only while in the `REQUESTED` state.
  * Workers can cancel a booking only before work starts (`ACCEPTED` or `ON_THE_WAY` states).

---

## ⚙️ Compilation & Running Instructions

### Prerequisites
* **Java SDK 21**
* **Maven 3.x**
* **MySQL Server** (ensure database schemas: `auth_db`, `worker_db`, `booking_db`, `payment_db`, and `notification_db` are created)

### 1. Database Creation
Before executing the applications, run the following SQL command to seed the local database:
```sql
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS worker_db;
CREATE DATABASE IF NOT EXISTS booking_db;
CREATE DATABASE IF NOT EXISTS payment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
```

### 2. Building Project Artifacts
From the root [backend](file:///D:/nearfix/backend) folder, clean and build dependencies:
```bash
./mvnw clean compile
```

### 3. Startup Order Guide
For the microservices grid to start successfully, run the modules in this order:

1. **Eureka Server:** Start [EurekaServerApplication](file:///D:/nearfix/backend/eureka-server/src/main/java/com/nearfix/eureka/EurekaServerApplication.java) (Port `8761`)
2. **Config Server:** Start [ConfigServerApplication](file:///D:/nearfix/backend/config-server/src/main/java/com/nearfix/config/ConfigServerApplication.java) (Port `8888`)
3. **API Gateway:** Start [ApiGatewayApplication](file:///D:/nearfix/backend/api-gateway/src/main/java/com/nearfix/gateway/ApiGatewayApplication.java) (Port `8080`)
4. **Core Services (order-independent):**
   * Start [AuthApplication](file:///D:/nearfix/backend/auth-service/src/main/java/com/nearfix/auth/AuthApplication.java) (Port `8081`)
   * Start [WorkerServiceApplication](file:///D:/nearfix/backend/worker-service/src/main/java/com/nearfix/worker/WorkerServiceApplication.java) (Port `8082`)
   * Start [BookingApplication](file:///D:/nearfix/backend/booking-service/src/main/java/com/nearfix/booking/BookingApplication.java) (Port `8083`)
   * Start [PaymentApplication](file:///D:/nearfix/backend/payment-service/src/main/java/com/nearfix/payment/PaymentApplication.java) (Port `8084`)
   * Start [NotificationApplication](file:///D:/nearfix/backend/notification-service/src/main/java/com/nearfix/notification/NotificationApplication.java) (Port `8085`)
