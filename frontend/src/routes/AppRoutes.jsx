import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import Register from '../pages/Register';
import CandidateDashboard from '../pages/CandidateDashboard';
import ResumesPage from '../pages/ResumesPage';
import ResumeDetail from '../pages/ResumeDetail';
import RecruiterDashboard from '../pages/RecruiterDashboard';
import RecruiterCreateJob from '../pages/RecruiterCreateJob';
import RecruiterJobsPage from '../pages/RecruiterJobsPage';
import RecruiterPipelinePage from '../pages/RecruiterPipelinePage';
import AdminDashboard from '../pages/AdminDashboard';
import NotFound from '../pages/NotFound';
import JobsPage from '../pages/JobsPage';
import JobDetail from '../pages/JobDetail';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/profile"
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />
      <Route
        path="/profile/password"
        element={<ProtectedRoute><ChangePassword /></ProtectedRoute>}
      />

      <Route
        path="/jobs"
        element={<ProtectedRoute allowedRoles={['candidate', 'recruiter']}><JobsPage /></ProtectedRoute>}
      />
      <Route
        path="/jobs/:id"
        element={<ProtectedRoute allowedRoles={['candidate', 'recruiter']}><JobDetail /></ProtectedRoute>}
      />

      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidateDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/resumes"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <ResumesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/candidate/resumes/:id"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <ResumeDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recruiter"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/create"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterCreateJob />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/active"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/jobs/expired"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterJobsPage expired />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recruiter/pipeline"
        element={
          <ProtectedRoute allowedRoles={['recruiter']}>
            <RecruiterPipelinePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']} loginPath="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
