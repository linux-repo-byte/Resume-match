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

## Algorithms Used

This project uses a combination of rule-based extraction and lightweight statistical matching for resume-to-job evaluation.

### 1. Text preprocessing
- Lowercasing and normalization
- Removal of noisy formatting and extra whitespace
- Tokenization for keyword and matching analysis

### 2. Skill extraction
- Keyword-based matching against the local skill dataset
- Frequency counting of relevant terms in resume text
- Rule-based extraction of technical and domain-related skills

### 3. Education extraction
- Detection of education sections and headings
- Degree and institution pattern recognition
- Comparison of education levels such as high school, diploma, associate, bachelor, master, and doctorate

### 4. Experience extraction
- Detection of work history sections
- Parsing of employment periods and years of experience
- Estimation of total relevant experience from extracted timeline data

### 5. Project extraction
- Section-based project detection
- Parsing of project name and description into structured records

### 6. Keyword analysis
- Frequency-based keyword ranking
- Identification of major terms in a resume
- Support for resume completeness and relevance scoring

### 7. TF-IDF vectorization
- Term frequency calculation per document
- Inverse document frequency weighting to highlight important terms
- Creation of numeric vectors for similarity comparison

### 8. Cosine similarity
- Measures similarity between resume and job description vectors
- Converts the result into a percentage-based matching score

### 9. Weighted matching engine
- Combines multiple score components:
  - skill match
  - text similarity
  - experience match
  - education match
- Produces a final weighted job-fit score

### 10. Resume scoring heuristic
- Evaluates completeness using education, experience, projects, keyword quality, and skill coverage
- Returns an overall resume score between 0 and 100

---

## Modules Used in the Project

### Frontend modules
- React
- React DOM
- React Router DOM
- Vite
- Axios
- Tailwind CSS
- GSAP
- Recharts
- ESLint
- PostCSS
- Autoprefixer

### Backend modules
- Node.js
- Express
- CORS
- Morgan
- Cookie Parser
- Dotenv
- Mongoose
- JWT
- bcryptjs
- Multer
- pdf-parse
- Mammoth
- PDFKit
- Nodemon

### Application modules
- Authentication module
- Role-based authorization module
- User profile module
- Resume upload and parsing module
- Resume analysis module
- Job management module
- Application management module
- Recruiter dashboard module
- Candidate dashboard module
- Admin dashboard module
- Matching engine module
- File download and storage module
- Job expiry and status management module
- Profile picture upload module

### Core backend services
- fileService.js
- pdfParserService.js
- docxParserService.js
- resumeParserService.js
- textPreprocessingService.js
- skillExtractionService.js
- educationExtractionService.js
- experienceExtractionService.js
- projectExtractionService.js
- keywordAnalysisService.js
- tfidf.js
- cosineSimilarity.js
- skillMatcher.js
- educationMatcher.js
- experienceMatcher.js
- matchingEngine.js
- resumeAnalysisService.js
- resumeScoringService.js
- jobExpiryService.js
- profilePictureService.js

### Models and middleware
- User.js
- Job.js
- Resume.js
- Application.js
- authMiddleware.js
- roleMiddleware.js
- errorMiddleware.js
- generateToken.js
- seedAdmin.js
- matchingConfig.js
- skillDataset.js

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
