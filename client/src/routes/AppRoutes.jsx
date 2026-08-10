import { Routes, Route } from "react-router-dom";
import RootRedirect from "./RootRedirect";
import RoleRoute from "./RoleRoute";
import PublicRoute from "./PublicRoute";
import HRStatusRoute from "./HRStatusRoute";

import AppLayout from "../layouts/AppLayout";

import Register from "../pages/user/Register";
import Login from "../pages/user/Login";
import AuthCallback from "../pages/user/AuthCallback";
import UserDashboard from "../pages/user/Dashboard";
import Profile from "../pages/user/Profile";
import ResumeUpload from "../pages/user/ResumeUpload";
import AnswerHistory from "../pages/user/AnswerHistory";
import ForgotPassword from "../pages/user/ForgotPassword";
import ResetPassword from "../pages/user/ResetPassword";
import TutorialHub from "../pages/user/TutorialHub";
import FriendsPage from "../pages/user/FriendsPage";
import MessagesPage from "../pages/user/MessagesPage";
import JobBoard from "../pages/user/JobBoard";
import JobDetail from "../pages/user/JobDetail";
import InterviewsList from "../pages/user/InterviewsList";
import Interview from "../pages/user/Interview";
import Leaderboard from "../pages/user/Leaderboard";

import RegisterHR from "../pages/hr/RegisterHR";
import HRDocumentUpload from "../pages/hr/HRDocumentUpload";
import HRVerificationPending from "../pages/hr/HRVerificationPending";
import HRApplicationRejected from "../pages/hr/HRApplicationRejected";
import HRDashboard from "../pages/hr/Dashboard";
import ApplicationsList from "../pages/hr/ApplicationsList";
import JobApplicants from "../pages/hr/JobApplicants";
import JobPostings from "../pages/hr/JobPostings";
import HRInterviewsList from "../pages/hr/HRInterviewsList";
import HRJobInterviews from "../pages/hr/HRJobInterviews";

import UserManagement from "../pages/admin/UserManagement";
import AdminDashboard from "../pages/admin/Dashboard";
import QuestionManagement from "../pages/admin/QuestionManagement";
import TutorialManagement from "../pages/admin/TutorialManagement";
import HRVerificationQueue from "@/pages/admin/HRVerificationQueue";
import LeaderboardManagement from "@/pages/admin/LeaderboardManagement";
import JobOversight from "@/pages/admin/JobOversight";

import InterviewRoom from "@/pages/shared/InterviewRoom";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-hr" element={<RegisterHR />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route path="/" element={<RootRedirect />} />

      {/* User */}
      <Route element={<RoleRoute allowedRoles={["user"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/answers" element={<AnswerHistory />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/resume" element={<ResumeUpload />} />
          <Route path="/job-board" element={<JobBoard />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/my-interviews" element={<InterviewsList />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/tutorialHub" element={<TutorialHub />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>

      {/* Shared */}
      <Route element={<RoleRoute allowedRoles={["user", "hr"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/interview/:id" element={<InterviewRoom />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<RoleRoute allowedRoles={["admin"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route
            path="/admin/hr-verification"
            element={<HRVerificationQueue />}
          />
          <Route
            path="/admin/question-management"
            element={<QuestionManagement />}
          />
          <Route
            path="/admin/tutorial-management"
            element={<TutorialManagement />}
          />
          <Route path="/admin/jobs" element={<JobOversight />} />
          <Route path="/admin/jobs/:id" element={<JobDetail />} />
          <Route
            path="/admin/leaderboard-management"
            element={<LeaderboardManagement />}
          />
          <Route path="/admin/reports" element={<div>Reports</div>} />
        </Route>
      </Route>

      {/* HR */}
      <Route element={<HRStatusRoute allowedStatus="pending" />}>
        <Route path="/hr-document-upload" element={<HRDocumentUpload />} />
        <Route
          path="/hr-verification-pending"
          element={<HRVerificationPending />}
        />
      </Route>
      <Route element={<HRStatusRoute allowedStatus="rejected" />}>
        <Route
          path="/hr-application-rejected"
          element={<HRApplicationRejected />}
        />
      </Route>

      <Route element={<RoleRoute allowedRoles={["hr"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/hr/dashboard" element={<HRDashboard />} />
          <Route path="/hr/job-postings" element={<JobPostings />} />
          <Route path="/hr/applications" element={<ApplicationsList />} />
          <Route path="/hr/applications/:jobId" element={<JobApplicants />} />
          <Route path="/hr/interviews" element={<HRInterviewsList />} />
          <Route path="/hr/interviews/:jobId" element={<HRJobInterviews />} />
          <Route path="/hr/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}
