# NearFix — Emergency Local Skill Marketplace

NearFix is a premium, high-fidelity real-time emergency service finder matching local skilled technicians (Electricians, Plumbers, Carpenters, etc.) directly with customers needing urgent fixes. Designed with a sleek, dark-navy and teal layout inspired by Grab and Bolt.

---

## 🚀 Setup & Installation Instructions

Follow these steps to run both the frontend React application and the mock database backend server locally:

### 1. Prerequisite Installations
Ensure you have [Node.js](https://nodejs.org/) installed (LTS version recommended).

### 2. Dependency Configuration
Navigate to the `frontend/` directory and install required node modules:
```bash
cd frontend
npm install --legacy-peer-deps
```

### 3. Start the Mock Database Server (`json-server`)
NearFix uses `json-server` to mock live databases, authentication, and dispatch states. Spin up the backend API node on port `3001`:
```bash
npm run server
# or directly:
npx json-server --watch db.json --port 3001
```

### 4. Boot the Vite Development Client
With the backend server active, open another terminal window and start the React client:
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser to view the application.

---

## 🔑 Portal Login Credentials

Use the following seeded accounts to test different roles and flows on the platform. All accounts use standard passwords.

### 👤 Customer Portal
Access SOS booking sheets, request emergency technicians, and track active bookings in real-time.
* **Email:** `amit@nearfix.com` | **Password:** `password123`
* **Email:** `priya@nearfix.com` | **Password:** `password123`

### 🛠️ Worker Portal
Toggle live availability status, accept/reject incoming emergency dispatches, and track financial statements.
* **Email:** `rajesh@nearfix.com` | **Password:** `password123` *(Electrician - Verified & Available)*
* **Email:** `vikram@nearfix.com` | **Password:** `password123` *(Plumber - Verified & Busy)*
* **Email:** `suresh@nearfix.com` | **Password:** `password123` *(Carpenter - Pending Admin Verification)*

### 👑 Administration Console
Oversee registration lists, verify incoming technician certifications, analyze revenue trends, and resolve customer complaints.
* **Email:** `admin1@nearfix.com` | **Password:** `admin123`
* **Email:** `admin2@nearfix.com` | **Password:** `admin123`

---

## 📂 Project Folder Structure

```
frontend/
├── db.json                 # Simulated local database seed file
├── package.json            # Configuration and third-party dependencies (MUI, Recharts, Lucide)
├── index.html              # Main HTML entrypoint
└── src/
    ├── App.jsx             # React root mounting wrapper and context orchestration
    ├── main.jsx            # Entry point bundle mounting
    ├── index.css           # Global core styling definitions
    ├── api/                # Axios instance endpoints
    │   ├── axiosInstance.js
    │   ├── authApi.js
    │   ├── bookingApi.js
    │   ├── workerApi.js
    │   └── paymentApi.js
    ├── assets/             # Global Material UI theme setup definitions
    │   └── theme.js
    ├── components/         # Modular layout segments
    │   ├── common/         # Shared layouts (Navbar, Sidebar, Stepper components)
    │   ├── customer/       # Customer-only panel elements
    │   ├── worker/         # Worker availability toggles, charts, profiles
    │   └── admin/          # Admin stats summaries and user registries
    ├── context/            # React Context API global states
    │   ├── AuthContext.jsx
    │   ├── ThemeContext.jsx
    │   └── ToastContext.jsx
    ├── hooks/              # Custom React hooks encapsulating business logic
    │   ├── useAuth.js
    │   ├── useBooking.js
    │   ├── useWorkers.js
    │   ├── useTheme.js
    │   └── useToast.js
    ├── pages/              # Portal page-level containers
    │   ├── auth/           # Login & registration panels
    │   ├── customer/       # SOS selector, live status tracking, checkout
    │   ├── worker/         # Dashboard, Active HUD, statement sheets
    │   └── admin/          # Console layouts, graphs, and compliance tables
    ├── routes/             # App routing rules & Protected Routes configurations
    │   └── AppRoutes.jsx
    └── utils/              # Helper utilities and constant lists
        ├── constants.js
        └── helpers.js
```

---

## 📸 Screenshots

*Place visual walkthrough images here once running in your development environment.*

| Mobile Dispatch Tracking | Desktop Financial Metrics | Admin Compliance Console |
| :---: | :---: | :---: |
| *[Tracking HUD]* | *[Earnings Graph]* | *[Worker compliance]* |
