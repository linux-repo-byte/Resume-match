# Resume Analyzer & Job Matching Platform

A full-stack MERN application for resume analysis and job matching.

The platform supports three roles:

- **Candidates** — upload resumes, analyze resume content, search jobs, and apply.
- **Recruiters** — create and manage job postings and review candidate applications.
- **Admins** — manage and monitor the platform.

The application uses local resume parsing and a local matching engine. No external AI or LLM API is required.

---

## Features

### Candidate

- User registration and login
- JWT-based authentication
- Role-based route protection
- Resume upload
- PDF and DOCX parsing
- Resume text extraction
- Resume statistics
- Resume skill extraction
- Education and experience analysis
- Resume completeness score
- Job search
- Job compatibility analysis
- Job applications
- Application compatibility snapshots

### Recruiter

- Recruiter authentication
- Job posting management
- Required and preferred skills
- Experience requirements
- Education requirements
- Job description management
- Candidate application review

### Admin

- Admin authentication
- Role-based authorization
- Platform management foundation
- Admin dashboard foundation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| File Upload | Multer |
| PDF Parsing | pdf-parse |
| DOCX Parsing | Mammoth |
| Architecture | REST API, MVC-style backend |

---

## Project Structure

```text
resume-analyzer-platform/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── resumeController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Resume.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── resumeRoutes.js
│   │
│   ├── services/
│   │   ├── fileService.js
│   │   ├── pdfParserService.js
│   │   ├── docxParserService.js
│   │   ├── textPreprocessingService.js
│   │   └── resumeParserService.js
│   │
│   ├── uploads/
│   │   └── resumes/
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedAdmin.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── resumeApi.js
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── ResumesPage.jsx
│   │   │   ├── ResumeDetail.jsx
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── package-lock.json
└── README.md
