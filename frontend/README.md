# 🎨 NearFix Frontend — Emergency Skill UI Portals

Welcome to the React client repository of **NearFix**, a Grab/Bolt inspired emergency marketplace application. The client application contains portals custom-tailored for Customers, Workers, and System Administrators.

---

## 🚀 Key Features

* **Sleek Aesthetics:** Grab/Bolt inspired layout utilizing primary deep navy base themes paired with glowing teal accents.
* **Role-Based Access Control:** Custom redirects separating customer, worker, and admin panels.
* **Real-time SOS Booking Workflow:** Stepper timeline illustrating booking status steps from `REQUESTED` to `PAID`.
* **State Management:** Simple, lightweight state sharing using React Context APIs (Auth, Theme, Toast contexts).
* **Analytics Engine:** Interactive metrics displays utilizing Recharts widgets.

---

## 📁 Folder Structure Reference

Refer to this breakdown to locate layout templates, contexts, and API call actions:

* **[src/api/](file:///D:/nearfix/frontend/src/api):** Axios request configuration files.
  * [axiosInstance.js](file:///D:/nearfix/frontend/src/api/axiosInstance.js) — Base router instance dynamically reading session JWT headers.
  * [authApi.js](file:///D:/nearfix/frontend/src/api/authApi.js) — Login/Register services.
  * [bookingApi.js](file:///D:/nearfix/frontend/src/api/bookingApi.js) — SOS booking updates and assignment endpoints.
  * [workerApi.js](file:///D:/nearfix/frontend/src/api/workerApi.js) — Worker details and status update controls.
  * [paymentApi.js](file:///D:/nearfix/frontend/src/api/paymentApi.js) — Payment checkout calls.
* **[src/context/](file:///D:/nearfix/frontend/src/context):** Core app state definitions.
  * [AuthContext.jsx](file:///D:/nearfix/frontend/src/context/AuthContext.jsx) — Tracks session client object, token details, and login status.
  * [ThemeContext.jsx](file:///D:/nearfix/frontend/src/context/ThemeContext.jsx) — Controls UI Light/Dark style modes.
  * [ToastContext.jsx](file:///D:/nearfix/frontend/src/context/ToastContext.jsx) — Global user notification banners.
* **[src/hooks/](file:///D:/nearfix/frontend/src/hooks):** Custom react wrappers mapping hooks to context values.
  * [useAuth.js](file:///D:/nearfix/frontend/src/hooks/useAuth.js) — Session wrapper hooks.
  * [useBooking.js](file:///D:/nearfix/frontend/src/hooks/useBooking.js) — Orchestrates booking state interactions.
  * [useWorkers.js](file:///D:/nearfix/frontend/src/hooks/useWorkers.js) — Reads worker availability stats.
* **[src/pages/](file:///D:/nearfix/frontend/src/pages):** App Portal Layouts.
  * [auth/](file:///D:/nearfix/frontend/src/pages/auth) — Session Login and Register screen templates.
  * [customer/](file:///D:/nearfix/frontend/src/pages/customer) — SOS selection, tracking HUD, checkouts, and reviews.
  * [worker/](file:///D:/nearfix/frontend/src/pages/worker) — Active dispatch sheets, toggles, profile updates, and earnings analytics.
  * [admin/](file:///D:/nearfix/frontend/src/pages/admin) — Management consoles, compliance charts, and verification sheets.

---

## 🔑 Portal Login Credentials

NearFix includes realistic seed data in [db.json](file:///D:/nearfix/frontend/db.json) for immediate testing. All accounts use password `password123` (or `admin123` for administrators).

| Role | Username / Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Customer** | `amit@nearfix.com` | `password123` | Active customer with past bookings. |
| **Customer** | `priya@nearfix.com` | `password123` | Active customer profile. |
| **Worker** | `rajesh@nearfix.com` | `password123` | Verified Electrician (Status: `AVAILABLE`). |
| **Worker** | `vikram@nearfix.com` | `password123` | Verified Plumber (Status: `BUSY`). |
| **Worker** | `suresh@nearfix.com` | `password123` | Carpenter (Status: `OFFLINE`, pending verification). |
| **Admin** | `admin1@nearfix.com` | `admin123` | Main admin portal credentials. |

---

## 🚀 Setup & Installation Instructions

### 1. Prerequisites
Ensure you have [Node.js LTS](https://nodejs.org/) installed on your machine.

### 2. Dependency Installation
Navigate to the [frontend](file:///D:/nearfix/frontend) directory and install the packages:
```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Running with Mock Data Server (`json-server`)
If you want to run the frontend independently using the simulated mock database:
```bash
npm run server
```
This boots up a mock REST endpoint on `http://localhost:3001` matching the schema inside [db.json](file:///D:/nearfix/frontend/db.json).

### 4. Running with the Live Microservices Backend
To direct API requests to the live backend services:
1. Ensure your Spring Boot services are active, running on port `8080` (API Gateway).
2. Modify the `baseURL` inside [axiosInstance.js](file:///D:/nearfix/frontend/src/api/axiosInstance.js) to target port `8080`:
   ```javascript
   const axiosInstance = axios.create({
     baseURL: 'http://localhost:8080',
   });
   ```

### 5. Running the Client App
Start the Vite development web server:
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) to access the portal dashboard.
