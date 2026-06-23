Prompt 1 — Project Foundation + Auth
Project: NearFix — An emergency local skill marketplace (think Uber + Urban Company).
Tech stack: React + Vite, Material UI, React Bootstrap, React Router v6, 
Axios, Lucide React for icons, json-server for mock backend (port 3001), 
Context API for state (no Redux).

Design inspiration: Grab / Bolt — dark navy + teal accent, card-heavy UI, 
premium feel. NOT the typical blue-white Urban Company look.

Task: Scaffold the complete project foundation:

1. Vite + React project structure with these folders:
   src/api/, src/assets/, src/components/common/, src/components/customer/, 
   src/components/worker/, src/components/admin/, src/context/, src/hooks/, 
   src/pages/auth/, src/pages/customer/, src/pages/worker/, src/pages/admin/, 
   src/routes/, src/utils/

2. db.json for json-server with realistic seed data for:
   - users (role: CUSTOMER, WORKER, ADMIN — at least 3 each)
   - workers (skill, experience, status: AVAILABLE/BUSY/UNAVAILABLE, rating)
   - bookings (status: REQUESTED/ACCEPTED/ON_THE_WAY/WORK_STARTED/WORK_COMPLETED)
   - payments (status: PENDING/COMPLETED)
   - reviews (rating 1–5, comment)

3. src/assets/theme.js — MUI custom theme (light + dark), navy primary, teal accent

4. src/context/AuthContext.jsx — user, token, role, login(), logout() using 
   localStorage

5. src/context/ThemeContext.jsx — light/dark toggle

6. src/utils/constants.js — SERVICE_TYPES array 
   (Electrician, Plumber, Carpenter, Mechanic, AC Technician), 
   STATUS_LABELS, ROLES

7. src/utils/helpers.js — formatCurrency(), formatDate(), getStatusColor()

8. src/api/axiosInstance.js — base URL http://localhost:3001, 
   request interceptor to attach JWT token from localStorage

9. src/api/ — authApi.js, bookingApi.js, workerApi.js, paymentApi.js, 
   reviewApi.js (all using the axiosInstance)

10. src/routes/AppRoutes.jsx — React Router v6 with role-based redirect after 
    login (CUSTOMER → /customer/dashboard, WORKER → /worker/dashboard, 
    ADMIN → /admin/dashboard)

11. src/components/common/ — Navbar.jsx, Loader.jsx, ProtectedRoute.jsx, 
    StatusBadge.jsx (chip showing booking status with color), RatingStars.jsx, 
    EmptyState.jsx, ConfirmModal.jsx

12. src/pages/auth/Login.jsx — single login page for all 3 roles, redirects 
    based on role after login

13. src/pages/auth/Register.jsx — fields: Name, Email, Mobile, Password, 
    Role selector (CUSTOMER / WORKER)

14. src/App.jsx — wraps everything in MUI ThemeProvider, AuthContext, 
    ThemeContext, Router

Give complete working code for every file. No placeholders or TODOs.

Context: We are building "NearFix" — an emergency local skill marketplace.
Stack: React + Vite, MUI, React Bootstrap, Lucide React, React Router v6, 
Axios (base URL: http://localhost:3001 via axiosInstance), Context API. 
json-server is the mock backend. AuthContext provides { user, token, logout }.
Design: Grab/Bolt inspired — dark navy + teal, premium card UI.

The foundation (routes, context, api files, common components) is already built.
Now build the complete Customer Portal.

Pages to build (in src/pages/customer/):

1. CustomerDashboard.jsx
   - Welcome message with user name
   - Quick service type cards (Electrician, Plumber, Carpenter, Mechanic, 
     AC Technician) — clicking one goes to EmergencyRequest page with 
     pre-selected service
   - Recent bookings list (last 3) with StatusBadge
   - Emergency SOS button (prominent, red) → goes to ServiceSelection

2. ServiceSelection.jsx
   - Grid of service type cards with Lucide icon, name, short description
   - Clicking a card navigates to EmergencyRequest with that service pre-filled

3. EmergencyRequest.jsx
   - Form: Service Type (pre-filled if coming from ServiceSelection), 
     Issue Description textarea, Location (auto-captured via 
     navigator.geolocation, shown as lat/lng or address)
   - On submit: POST to /bookings via bookingApi, then navigate to 
     TrackingPage with bookingId

4. TrackingPage.jsx
   - Shows current booking status with a 5-step stepper:
     REQUESTED → ACCEPTED → ON_THE_WAY → WORK_STARTED → WORK_COMPLETED
   - Worker info card (name, skill, rating, phone)
   - Simulated location map placeholder (static image or colored div is fine)
   - Cancel booking button (only if status is REQUESTED)

5. PaymentPage.jsx
   - Booking summary (service type, worker name, issue)
   - Amount display
   - Payment method selector: UPI, Debit Card, Credit Card (radio buttons)
   - Pay Now button → PATCH /payments/:id status to COMPLETED
   - On success: navigate to ReviewPage

6. ReviewPage.jsx
   - Worker info display
   - 5-star rating selector (clickable stars using Lucide Star icon)
   - Comment textarea
   - Submit → POST to /reviews

Components to build (in src/components/customer/):
- ServiceCard.jsx — icon, name, description, onClick
- WorkerCard.jsx — avatar, name, skill, rating, distance, estimated arrival
- BookingStatusStepper.jsx — MUI Stepper with 5 steps
- EmergencyRequestForm.jsx — reusable form used in EmergencyRequest page
- PaymentForm.jsx — payment method selector
- ReviewForm.jsx — stars + comment
- PriceEstimator.jsx — takes service type + time of day, shows estimated 
  price range (mock calculation, no real AI needed)

Custom hook: src/hooks/useBooking.js
- fetchBookingById(id), fetchMyBookings(), createBooking(data), 
  updateBookingStatus(id, status)

Give complete working code for every file. No placeholders or TODOs.

Prompt 3 — Worker Portal
Context: We are building "NearFix" — an emergency local skill marketplace.
Stack: React + Vite, MUI, React Bootstrap, Lucide React, React Router v6, 
Axios (http://localhost:3001), Context API.
AuthContext provides { user, token, logout }.
Design: Grab/Bolt inspired — dark navy + teal, premium card UI.

Foundation and Customer portal are already built.
Now build the complete Worker Portal.

Pages to build (in src/pages/worker/):

1. WorkerDashboard.jsx
   - Worker profile summary (name, skill, rating, total jobs)
   - Availability toggle (AVAILABLE / BUSY / UNAVAILABLE) — PATCH to 
     /workers/:id on change
   - Pending job requests count chip
   - Quick links to JobRequestsPage and EarningsPage

2. JobRequestsPage.jsx
   - List of incoming bookings with status REQUESTED assigned to this worker
   - Each request shows: customer name, service type, issue description, 
     location, estimated distance
   - Accept button → PATCH /bookings/:id status to ACCEPTED + navigate to 
     ActiveJobPage
   - Reject button → PATCH /bookings/:id status back to REQUESTED 
     (re-opens for reassignment)

3. ActiveJobPage.jsx
   - Current active booking details
   - Status update action buttons (only show the next logical step):
     - If ACCEPTED → "I'm on the way" button → status: ON_THE_WAY
     - If ON_THE_WAY → "Work Started" button → status: WORK_STARTED  
     - If WORK_STARTED → "Mark Complete" button → status: WORK_COMPLETED
   - Customer contact info display
   - Map placeholder showing customer location

4. EarningsPage.jsx
   - Tabs: Today / This Week / This Month
   - Earnings summary card (total amount, number of jobs)
   - Completed jobs list (job type, customer, amount, date)
   - Simple bar chart using Recharts showing earnings by day

Components to build (in src/components/worker/):
- AvailabilityToggle.jsx — 3-state toggle (AVAILABLE/BUSY/UNAVAILABLE) 
  with color coding (green/amber/red)
- JobRequestCard.jsx — full job request card with Accept/Reject buttons
- ActiveJobPanel.jsx — current job with dynamic status action buttons
- EarningsChart.jsx — Recharts BarChart for daily earnings
- WorkerProfileCard.jsx — avatar, name, skill, rating, experience badge

Custom hook: src/hooks/useWorkers.js
- fetchWorkerById(id), updateAvailability(id, status), 
  fetchWorkerBookings(workerId), updateBookingStatus(id, status)

Give complete working code for every file. No placeholders or TODOs.

Prompt 4 — Admin Portal
Context: We are building "NearFix" — an emergency local skill marketplace.
Stack: React + Vite, MUI, React Bootstrap, Lucide React, React Router v6, 
Axios (http://localhost:3001), Context API.
AuthContext provides { user, token, logout }.
Design: Grab/Bolt inspired — dark navy + teal, premium card UI.

Foundation, Customer portal, and Worker portal are already built.
Now build the complete Admin Portal.

Pages to build (in src/pages/admin/):

1. AdminDashboard.jsx
   - Stats row: Total Users, Active Workers, Completed Jobs, Total Revenue
     (each as a StatsCard with icon + number + trend)
   - Pending worker verifications count with quick action link
   - Recent bookings table (last 10) with status badges
   - Revenue line chart (last 7 days) using Recharts

2. WorkerVerificationPage.jsx
   - List of workers with verificationStatus: PENDING
   - Each card shows: name, skill, experience, Aadhaar/license info
   - Approve button → PATCH /workers/:id { verificationStatus: "APPROVED" }
   - Reject button → PATCH /workers/:id { verificationStatus: "REJECTED" }
   - Filter tabs: All / Pending / Approved / Rejected

3. AnalyticsPage.jsx
   - Total revenue by service type (Recharts PieChart)
   - Bookings per day (Recharts BarChart)
   - Top 5 workers by rating (table with avatar, name, jobs, rating)
   - Top 5 busiest locations (mock table)

4. ComplaintsPage.jsx
   - Table of all bookings with status COMPLETED and reviews rating ≤ 2
   - Columns: Booking ID, Customer, Worker, Service, Rating, Comment, Action
   - Action: "Flag Worker" → PATCH /workers/:id { flagged: true }
   - Filter by service type

Components to build (in src/components/admin/):
- StatsCard.jsx — icon (Lucide), label, value, optional trend percentage
- WorkerVerificationCard.jsx — worker info + Approve/Reject buttons
- AnalyticsChart.jsx — reusable wrapper for Recharts charts
- ComplaintTable.jsx — MUI DataGrid or manual table with flag action
- UserTable.jsx — list of all users with role badges

Give complete working code for every file. No placeholders or TODOs.

Prompt 5 — Polish, Integration & Finishing
Context: "NearFix" emergency skill marketplace is fully built across 4 prompts.
Stack: React + Vite, MUI, React Bootstrap, Lucide React, React Router v6, 
Axios, json-server.

Now do the final polish pass:

1. Responsive design audit
   - Ensure all pages work on mobile (375px) and desktop (1280px)
   - Navbar should collapse to hamburger on mobile
   - Cards should stack vertically on small screens
   - Fix any MUI Grid breakpoints that may be off

2. src/components/common/Sidebar.jsx
   - Collapsible sidebar for Admin portal (desktop: expanded, mobile: drawer)
   - Links: Dashboard, Worker Verification, Analytics, Complaints
   - Highlight active route using useLocation()

3. Light / Dark mode toggle
   - Add toggle button in Navbar using ThemeContext
   - Ensure all custom colors use the MUI theme so they respond to mode change

4. Error handling
   - Add try/catch to all Axios calls with a toast notification on failure
   - Show EmptyState component when lists return no data
   - Add loading spinners (Loader.jsx) while data is fetching

5. src/hooks/useAuth.js
   - Wrap AuthContext consumption with null-check
   - Add isAuthenticated boolean
   - Add role-check helpers: isCustomer(), isWorker(), isAdmin()

6. Role-based redirect on direct URL access
   - If a CUSTOMER tries to access /worker/* or /admin/*, redirect to 
     /customer/dashboard
   - Same for other roles — enforce in ProtectedRoute.jsx

7. README.md
   - Setup instructions (npm install, json-server command, npm run dev)
   - Portal login credentials for all 3 roles (from db.json seed data)
   - Folder structure overview
   - Screenshots placeholder section

Give complete working code for every changed or new file. No placeholders.