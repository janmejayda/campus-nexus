# CAMPUS NEXUS
> **One Campus. One Platform. Real-Time Intelligence.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Open%20App-35D6E8?style=for-the-badge&logo=googlecloud&logoColor=white)](https://ais-pre-weli6if22typkpfvdwwswz-844330482685.asia-southeast1.run.app)
[![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

---

### 🌐 Instant Live Web App Link
Click below to open the application directly in any browser (Mobile, Tablet, or Desktop):

👉 **[Launch Campus Nexus Live App](https://ais-pre-weli6if22typkpfvdwwswz-844330482685.asia-southeast1.run.app)**  
`https://ais-pre-weli6if22typkpfvdwwswz-844330482685.asia-southeast1.run.app`

---

Campus Nexus is a unified Smart Campus Operating System connecting **Students**, **Faculty**, **Campus Security**, **Hostel Wardens**, **Institutional Administrators**, and **Alumni** into a single, real-time, responsive intelligence platform.

---

## 🏛️ System Architecture & Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Lucide React Icons, HTML5 Canvas QR Generator (`qrcode`).
- **Backend:** Node.js 22, Express, TypeScript runtime (`tsx`), RESTful API endpoints.
- **Database:** Persistent structured JSON data layer (`data/campus_db.json`) with atomic file writes, relationship integrity, and validation constraints.
- **Security:** Role-Based Access Control (RBAC), JWT token authentication, SHA-256 password hashing, and privileged enrollment verification policies.
- **Perimeter & Gate Security:** Digital QR Gate Passes with live optical camera scanning and manual pass-code audit fallback.
- **AI Intelligence:** Campus Nexus Assistant with rule-based permitted student record retrieval and optional Gemini AI grounding.
- **UI/UX Theme:** Low-glare Navy & Aqua university theme (`#081820` canvas, `#0D222B` cards, `#35D6E8` aqua accent).

---

## 📁 Repository Structure

```text
campus-nexus/
├── data/
│   └── campus_db.json         # Persistent JSON database (users, rooms, passes, attendance, etc.)
├── server/
│   ├── ai.ts                  # AI Campus Assistant query processor & Gemini integration
│   ├── auth.ts                # JWT authentication middleware, hashing, and token verification
│   ├── db.ts                  # Database schemas, seeding, atomic file read/write operations
│   └── routes.ts              # RESTful API router for all six campus roles
├── src/
│   ├── components/            # UI components (Navbar, Sidebar, QRPassModal, QRScannerModal, etc.)
│   ├── context/               # React AuthContext providing user state and credentials
│   ├── pages/                 # Role dashboards (Admin, Faculty, Security, Warden, Student, Alumni)
│   ├── services/              # Client-side API client with automatic token attachment
│   ├── App.tsx                # Main application router and view switcher
│   ├── index.css              # Global styles and Tailwind CSS configurations
│   ├── main.tsx               # React entry point
│   └── types.ts               # Shared TypeScript models and interfaces
├── .env.example               # Template for environment variables (GEMINI_API_KEY, APP_URL)
├── .gitignore                 # Git ignore rules (node_modules, .env, build artifacts)
├── index.html                 # HTML template and metadata
├── metadata.json              # Applet configuration and capabilities
├── package.json               # Node.js dependencies and run scripts
├── server.ts                  # Express full-stack entry point with Vite middleware
├── tsconfig.json              # TypeScript compiler options
├── vite.config.ts             # Vite build & plugin configuration
└── README.md                  # Project documentation & push guide
```

---

## 🔑 Pre-Configured Demo Credentials

For quick evaluation, all six roles are pre-seeded in the database:

| Role | Portal Route | Demo Email | Password | Primary Clearance |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `/admin` | `admin@campusnexus.edu` | `Admin@123` | Institutional Control Center, User Directory, Timetables, Settings |
| **Faculty** | `/faculty` | `faculty.sharma@campusnexus.edu` | `Faculty@123` | Mark Class Attendance, Schedules, Student Leave Review |
| **Security** | `/security` | `security.gate1@campusnexus.edu` | `Security@123` | Optical QR Scanner, Verify Gate Passes, Record Entry/Exit |
| **Hostel Warden** | `/warden` | `warden.singh@campusnexus.edu` | `Warden@123` | Room & Bed Allocation, Gate Pass Approvals, Hostel Maintenance |
| **Student** | `/student` | `student.aarav@campusnexus.edu` | `Student@123` | Attendance, QR Gate Passes, Leave, Fees, AI Campus Assistant |
| **Alumni** | `/alumni` | `alumni.priya@campusnexus.edu` | `Alumni@123` | Publish Job/Workshop Opportunities, Review Student Applicants |

*Tip: You can also use the role switcher located in the top navigation bar or the "Fill Demo Credentials" button on any login screen.*

---

## 🚪 Dedicated Authentication Routes

Every role has an independent dedicated login and signup route:

### Main Role Selector
- `/login` — Gateway selection cards for all 6 campus roles.

### Dedicated Login Pages
- `/login/admin` — Administrator Governance Login
- `/login/faculty` — Faculty Academic Login
- `/login/security` — Perimeter Security Login
- `/login/warden` — Hostel Warden Login
- `/login/student` — Student Services Login
- `/login/alumni` — Alumni Network Login

### Dedicated Signup Pages
- `/signup/admin` — Restricted setup (requires Institutional Root Key: `CAMPUS_NEXUS_ROOT_2026`)
- `/signup/faculty` — Academic enrollment (requires administrator verification)
- `/signup/security` — Staff enrollment (requires administrator verification)
- `/signup/warden` — Warden enrollment (requires administrator verification)
- `/signup/student` — Full student self-registration (Roll ID, department, course, year, semester)
- `/signup/alumni` — Alumni network registration (batch year, company, designation)

---

## 🚀 Key Modules & Capabilities

### 1. Hostel Room & Bed Allocation Console
- Managed collaboratively by both **Wardens** and **Administrators**.
- Visual room grid displaying bed capacities (e.g., `A-201`, `A-202`, `A-203`).
- **Student names, roll numbers, and departments are visible directly on each room card.**
- Three-click allocation: Select Hostel $\to$ Select Room $\to$ Select Student.
- Prevents over-allocation beyond room capacity.
- Automatic reallocation: moving a student to a new room automatically vacates their previous bed.
- Searchable Student Resident Directory with instant 1-click **"Assign Room"** and **"Vacate Bed"** actions.

### 2. Digital QR Gate-Pass System
- Students submit gate-pass outing requests with destination and expected return time.
- Hostel Wardens review and approve requests.
- Approved passes generate an official digital QR pass with cryptographic signature.
- Security scans the QR pass using an optical camera stream or enters the pass code (`CN-GP-xxxxx`).
- Verification engine checks approval status, time validity, and expiry.
- Ingress and egress movements are timestamped and recorded in real time.

### 3. Academic Attendance & Threshold Alerts
- Faculty marks class attendance with interactive Present / Absent / Late toggles.
- Automatic calculation of cumulative and subject-wise percentages.
- Automatic visual warnings for students falling below the institutional threshold ($<75\%$).

### 4. Collision-Detected Timetable Scheduler
- Automatic detection and prevention of room double-booking.
- Automatic detection of faculty schedule clashes at the same day/time.

### 5. AI Campus Assistant
- Available directly from dashboards or floating navigation.
- Answers personal, permitted campus queries based strictly on verified records:
  - *"What is my attendance percentage?"*
  - *"When is my next class?"*
  - *"Has my gate pass been approved?"*
  - *"What is today's dining menu?"*
  - *"Which alumni workshops or internships are available?"*

### 6. Institutional Control Center & Live Feeds
- Real-time KPI counters: Enrolled students, staff counts, open complaints, hostel occupancy.
- Live event activity stream updating on gate movements, leave submissions, and complaint resolutions.
- CSV export for student directories, attendance sessions, gate passes, and complaints.

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or newer)
- npm (version 9.0 or newer) or yarn / pnpm / bun

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/<YOUR-USERNAME>/campus-nexus.git
cd campus-nexus
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add your `GEMINI_API_KEY` in `.env` to enable AI natural language capabilities).*

### 3. Start Development Server
Starts Express API and Vite frontend co-located on port `3000`:
```bash
npm run dev
```
Open your browser and navigate to: **`http://localhost:3000`**

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

## 📦 How to Push this Project to GitHub

Follow these steps from your project root terminal:

### Step 1: Initialize Git (if not already done)
```bash
git init
```

### Step 2: Configure Git User (if not already configured)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 3: Stage All Project Files
```bash
git add .
```

### Step 4: Commit Your Changes
```bash
git commit -m "feat: complete Campus Nexus smart campus operating system"
```

### Step 5: Rename Current Branch to Main
```bash
git branch -M main
```

### Step 6: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Set the repository name to `campus-nexus`.
3. Choose **Public** or **Private**.
4. **Do not** initialize with a README, .gitignore, or license (they already exist in this project).
5. Click **Create repository**.

### Step 7: Link Your Local Repo to GitHub
Replace `<YOUR_GITHUB_USERNAME>` with your GitHub username:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/campus-nexus.git
```
*(If the remote already exists, update it with: `git remote set-url origin https://github.com/<YOUR_GITHUB_USERNAME>/campus-nexus.git`)*

### Step 8: Push Code to GitHub
```bash
git push -u origin main
```

---

## 🌐 How to Generate a Live Public Link (Mobile, Tablet & Desktop)

Because Campus Nexus has both a React frontend and an Express backend, you need a hosting platform that runs Node.js. Here are the easiest ways to generate a live public URL:

### Option 1: Instant Free Deployment via Render (Recommended)
1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** $\to$ **Web Service**.
3. Select your `campus-nexus` repository from GitHub.
4. Fill in the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. (Optional) Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = your API key (optional)
6. Click **Deploy Web Service**.
7. In ~2 minutes, Render will provide a free public HTTPS link (e.g. `https://campus-nexus.onrender.com`).
👉 **Anyone can open this link on their smartphone, iPhone, Android, iPad, tablet, or desktop browser.**

---

### Option 2: Instant Deployment via Railway
1. Go to [railway.app](https://railway.app) and log in with GitHub.
2. Click **New Project** $\to$ **Deploy from GitHub repo**.
3. Select `campus-nexus`.
4. Railway will automatically detect the build and start commands (`npm run build` and `npm start`).
5. Under service settings, click **Generate Domain** to get a public URL (e.g. `https://campus-nexus.up.railway.app`).

---

### Option 3: Test on Phones & Tablets on Local Wi-Fi (No Cloud Required)
If your computer and mobile phone/tablet are connected to the same Wi-Fi:
1. Run the app:
   ```bash
   npm run dev
   ```
2. Find your computer's local IP address:
   - **Windows:** Run `ipconfig` (look for `IPv4 Address`, e.g., `192.168.1.45`)
   - **Mac/Linux:** Run `ifconfig` or `ip a` (e.g., `192.168.1.45`)
3. Open your mobile phone or tablet browser and go to:
   ```text
   http://192.168.1.45:3000
   ```
*(Replace `192.168.1.45` with your computer's actual IP address).*

---

## 📄 License
This project is licensed under the Apache-2.0 License.

campus-nexus-production.up.railway.app
