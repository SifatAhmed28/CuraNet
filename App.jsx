import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Home from "../pages/Home";
import CourseHub from "../features/courses/CourseHub";
import CourseDetails from "../features/courses/CourseDetails";
import LessonViewer from "../features/courses/LessonViewer";
import FirstAidHub from "../features/firstAid/FirstAidHub";
import FirstAidDetails from "../features/firstAid/FirstAidDetails";

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseHub />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonViewer />} />
          <Route path="/first-aid" element={<FirstAidHub />} />
          <Route path="/first-aid/:topicId" element={<FirstAidDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>CuraNet</strong>
            <span> — One Website for Every Health Decision</span>
          </div>
          <div className="footer-note">Educational content only • Frontend demonstration</div>
        </div>
      </footer>
    </div>
  );
}
