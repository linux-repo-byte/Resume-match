# Resume Analyzer & Job Matching Platform

A full-stack MERN application that will eventually let **Candidates** upload
resumes and get matched against job postings using AI/NLP, **Recruiters**
post jobs and review matched candidates, and **Admins** manage the platform.

This repository currently contains the **foundation**: project structure,
database models, and a complete JWT-based authentication + role-based
authorization system for the three roles. The AI/NLP resume analysis engine
is intentionally **not** implemented yet — it will be added as a separate
module later (e.g. `backend/services/resumeAnalysis.js`) without needing to
change the auth/user system.

---

## Tech Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React.js (Vite), React Router, Axios, Tailwind CSS |
| Backend    | Node.js, Express.js                           |
| Database   | MongoDB + Mongoose                            |
| Auth       | JWT (access token) + bcrypt password hashing  |
| Architecture | REST API, MVC-style backend                 |

---

## Folder Structure

```
resume-analyzer-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # register / login / me
│   │   └── resumeController.js   # upload / history / view / download / delete
│   ├── middleware/
│   │   ├── authMiddleware.js     # verifies JWT, attaches req.user
│   │   ├── roleMiddleware.js     # restricts routes by role
│   │   └── errorMiddleware.js    # centralized error handling
│   ├── models/
│   │   ├── User.js               # candidate | recruiter | admin
│   │   └── Resume.js             # uploaded resume metadata + extracted text
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── resumeRoutes.js
│   ├── services/
│   │   ├── fileService.js            # multer config, storage, validation, disk cleanup
│   │   ├── pdfParserService.js       # PDF -> raw text (pdf-parse)
│   │   ├── docxParserService.js      # DOCX -> raw text (mammoth)
│   │   ├── textPreprocessingService.js # normalizes text, computes stats
│   │   └── resumeParserService.js    # orchestrator: picks parser, runs preprocessing
│   ├── uploads/resumes/          # uploaded files on disk (gitignored, per-candidate folders)
│   ├── utils/
│   │   ├── generateToken.js
│   │   └── seedAdmin.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js          # pre-configured axios instance
│   │   │   └── resumeApi.js      # upload / list / view / download / delete calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CandidateDashboard.jsx
│   │   │   ├── ResumesPage.jsx   # upload form + resume history
│   │   │   ├── ResumeDetail.jsx  # extracted text + stats for one resume
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
└── README.md
```

---

## Getting Started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your own values
npm run dev
```

`.env` values needed:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/resume-analyzer
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to
`http://localhost:5000/api`.

---

## Auth Flow Implemented

- `POST /api/auth/register` — creates a user with role `candidate`,
  `recruiter`, or `admin` (admin creation is normally restricted — see
  comment in `authController.js`), hashes password with bcrypt.
- `POST /api/auth/login` — validates credentials, returns a signed JWT
  containing `{ id, role }`.
- `GET /api/auth/me` — protected route, returns the logged-in user's
  profile using the `authMiddleware`.
- `roleMiddleware(['recruiter', 'admin'])` — example of restricting a
  route to specific roles, ready to reuse for future job/resume routes.

On the frontend, `AuthContext` stores the token + user in memory and
`localStorage`, `ProtectedRoute` guards routes by login state and role,
and each role has its own placeholder dashboard page ready to be built out.

---

## Resume Management Module

Candidates can upload a resume (PDF or DOCX, up to 5 MB) at
`/candidate/resumes`. On upload:

1. `fileService` (multer) validates the file type/size and writes it to
   `backend/uploads/resumes/<candidateId>/`.
2. A `Resume` document is created immediately with `status: 'processing'`.
3. `resumeParserService` picks the right parser by MIME type —
   `pdfParserService` (pdf-parse) or `docxParserService` (mammoth) — and
   extracts raw text.
4. `textPreprocessingService` normalizes the raw text (line endings,
   whitespace, blank-line collapsing) and computes word/line/character
   counts.
5. The resume record is updated to `status: 'parsed'` with the cleaned
   text and stats — or `status: 'failed'` with a `parseError` message if
   extraction throws. Either way, the upload itself isn't lost.

All extraction happens locally with `pdf-parse` and `mammoth` — no
external AI/NLP API is used. The four services (`fileService`,
`pdfParserService`, `docxParserService`, `textPreprocessingService`) are
independent of each other so the upcoming skill-extraction and matching
logic can be layered on top of `textPreprocessingService`'s output
without touching file handling or parsing.

### Resume analysis

Parsed resume text is analyzed locally by independent services for skills,
education, experience, projects, keywords, and a 0-100 completeness score.
The configurable skill vocabulary lives in `backend/config/skillDataset.js`.
Analysis is persisted on the resume and can be refreshed through:

```
GET /api/resumes/:id/analysis
```

The response contains `skills`, `education`, `experience`, `projects`,
`keywords`, and `resumeScore`. No external AI or LLM API is used.

## Jobs and matching

Recruiters manage structured job postings through `/api/jobs`. Job records
store required and preferred skills, experience, education, status, and the
full description. Candidates can search open jobs, view compatibility details,
and apply through `/api/applications/job/:jobId`.

The matching engine is fully local and combines weighted skills, TF-IDF text
vectors, cosine similarity, experience, and education matching. Its default
weights are 50% skill, 25% text similarity, 15% experience, and 10% education.
They can be overridden with `MATCH_WEIGHT_SKILL`,
`MATCH_WEIGHT_SIMILARITY`, `MATCH_WEIGHT_EXPERIENCE`, and
`MATCH_WEIGHT_EDUCATION`; values are normalized before scoring.

Applications persist the compatibility snapshot returned as:

```json
{
  "skillScore": 0,
  "similarityScore": 0,
  "experienceScore": 0,
  "educationScore": 0,
  "finalScore": 0,
  "matchedSkills": [],
  "missingSkills": []
}
```

**Endpoints** (all under `/api/resumes`, candidate-only):

| Method | Route              | Purpose                              |
|--------|---------------------|---------------------------------------|
| POST   | `/upload`           | Upload + parse a resume               |
| GET    | `/my`               | List the candidate's upload history   |
| GET    | `/:id`              | View one resume's metadata + extracted text |
| GET    | `/:id/download`     | Download the original file            |
| DELETE | `/:id`              | Delete a resume (file + DB record)    |

---

## What's Next (not built yet)

- Skill extraction from the stored, preprocessed resume text
- Job posting CRUD — recruiter side
- AI/NLP resume-to-job matching engine
- Admin analytics & user management screens
- Cloud file storage (currently local disk under `backend/uploads/`)
#   R e s u m e - m a t c h  
 #   R e s u m e - m a t c h  
 