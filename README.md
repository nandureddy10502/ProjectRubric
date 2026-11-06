# ProjectRubric 📊

> **Live Demo (Vercel)**: 🔗 [https://projectrubric.vercel.app](https://projectrubric.vercel.app) *(Vercel Deployment URL Placeholder)*

A transparent project rubric tracker and evaluation dashboard built with the **MERN** stack (MongoDB, Express, React, Node.js), Tailwind CSS, and Recharts.

ProjectRubric gives students complete transparency into how their software projects are graded, showing exact criterion weights, points awarded, visual contribution breakdowns, and specific instructor commentary.

---

## 🌟 Key Features

- **Strict Data Isolation**: Students can strictly **only** access evaluations belonging to their account (`studentId === req.user._id`). Direct URL parameter tampering is blocked with HTTP 403 Forbidden.
- **Production-Ready JWT Authentication**: Secure password hashing with `bcryptjs`, JWT token signing with configurable expiration, and route protection middleware.
- **Visual Contribution Breakdown (Horizontal Progress Bar)**: A proportional segmented horizontal bar utilizing Tailwind flex widths to clearly show how each criterion contributes to the 100% total.
- **Interactive Performance Analytics**: Recharts-powered comparative bar and distribution charts comparing points awarded against criterion maximums.
- **Detailed Feedback Matrix**: Tabular breakdown of criterion expectations, max points, awarded scores, achievement ratios, and qualitative teacher feedback.
- **Subtle, Minimalist UI/UX**: Designed following Vercel / Linear / Shadcn aesthetic—clean monochromatic `zinc` palette, subtle `indigo-600` single accent, `border-zinc-200`, and zero AI-slop gradients.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3.4, React Router 7, Axios, Recharts, Lucide React |
| **Backend** | Node.js, Express 4, MongoDB, Mongoose 8, JSON Web Tokens (JWT), BcryptJS |
| **Database** | MongoDB (supports MongoDB Atlas, local MongoDB, or automated zero-config in-memory fallback) |

---

## 📁 Repository Structure

```
ProjectRubric/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & fallback runner
│   ├── controllers/
│   │   ├── authController.js     # Register, login, me endpoints
│   │   ├── evaluationController.js # Strict user-isolated queries
│   │   └── rubricController.js   # Rubric management
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── error.js              # Centralized error handler
│   ├── models/
│   │   ├── User.js               # Student & teacher schema with bcrypt pre-save
│   │   ├── Rubric.js             # Rubric title and criteria schema
│   │   └── ProjectEvaluation.js  # StudentId, rubricId, scores, totalScore
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── evaluationRoutes.js
│   │   └── rubricRoutes.js
│   ├── seed/
│   │   └── seeder.js             # Initial database bootstrap seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # Express application entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Axios instance with JWT bearer interceptor
│   │   ├── components/
│   │   │   ├── CriterionProgressBar.jsx # Flex-width segmented progress bar
│   │   │   ├── EvaluationChart.jsx      # Recharts comparative bar & pie
│   │   │   ├── Navbar.jsx               # Minimalist top navigation
│   │   │   └── ProtectedRoute.jsx       # Route guard redirecting to /login
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & localStorage sync
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Student evaluations grid & stats
│   │   │   ├── EvaluationDetail.jsx # Deep-dive rubric breakdown & table
│   │   │   ├── Login.jsx         # Sign-in with demo quick-fill
│   │   │   ├── Register.jsx      # Sign-up for students/teachers
│   │   │   └── NotFound.jsx      # 404 handler
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── package.json
```

---

## ⚡ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm start
```
> **Zero-Config Database**: If no MongoDB server is running on `127.0.0.1:27017`, the backend automatically initializes an embedded `MongoMemoryServer` instance and bootstraps demo student evaluations immediately!

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Credentials (Quick-Fill Included on Login Screen)

| User | Email | Password | Role | Evaluated Projects |
|---|---|---|---|---|
| **Alex Johnson** | `alex@example.com` | `password123` | Student | 2 Projects (DevFlow, KacheKV) |
| **Sarah Connor** | `sarah@example.com` | `password123` | Student | 1 Project (NeuroSync) |
| **Dr. Evelyn Reed** | `teacher@example.com` | `password123` | Teacher | Instructor |

> **Testing User Isolation**:
> 1. Log in as `alex@example.com`: You will see **2 projects** (DevFlow & KacheKV).
> 2. Log in as `sarah@example.com`: You will see **1 project** (NeuroSync).
> 3. Register a brand new student: You will see **0 projects** until evaluated.
> 4. If Sarah attempts to open Alex's evaluation ID in the URL, the API blocks it and returns `403 Forbidden`.

---

## 📡 REST API Reference

### Auth
- `POST /api/auth/register` — Register a new student or teacher (hashes password with bcrypt, returns JWT).
- `POST /api/auth/login` — Validate credentials and return JWT.
- `GET /api/auth/me` — Return current authenticated user profile (`protect` middleware).

### Evaluations & Submissions
- `POST /api/evaluations/submit` — Student submits a new project (`status: 'Pending'`, `scores: []`, `totalScore: 0`).
- `GET /api/evaluations/my-projects` — Returns strictly evaluations where `studentId === req.user._id` (both Pending and Graded).
- `GET /api/evaluations/all` — Teacher portal: retrieves all student submissions sorted with Pending reviews first.
- `PUT /api/evaluations/:id/grade` — Teacher submits criteria points & feedback, calculates `totalScore`, sets `status: 'Graded'`, and records `evaluatedBy`.
- `GET /api/evaluations/:id` — Single evaluation with ownership check (`studentId === req.user._id` or teacher).

### Rubrics
- `GET /api/rubrics` — List all course rubrics with criteria definitions (protected for students and faculty).

