import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Home from "../pages/Home";
import CourseHub from "../features/courses/CourseHub";
import CourseDetails from "../features/courses/CourseDetails";
import LessonViewer from "../features/courses/LessonViewer";
import FirstAidHub from "../features/firstAid/FirstAidHub";
import FirstAidDetails from "../features/firstAid/FirstAidDetails";
import DoctorsPage from "../features/doctors/DoctorsPage";
import BloodPage from "../features/blood/BloodPage";
import LoginPage from "../features/auth/LoginPage";
import RegisterPage from "../features/auth/RegisterPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import ArticlesPage from "../features/articles/ArticlesPage";
import ArticlePage from "../features/articles/ArticlePage";
import SymptomChatbot from "../features/chatbot/SymptomChatbot";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: "center", padding: 80 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/blood" element={<BloodPage />} />
          <Route path="/courses" element={<CourseHub />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
          <Route path="/first-aid" element={<FirstAidHub />} />
          <Route path="/first-aid/:topicId" element={<FirstAidDetails />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>CuraNet</strong>
            <span> — One Website for Every Health Decision</span>
          </div>
          <div className="footer-note">Educational content only • Full-stack MERN application</div>
        </div>
      </footer>
      <SymptomChatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
