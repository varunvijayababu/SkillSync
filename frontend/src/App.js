import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import CoverLetter from "./pages/coverLetter";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Roadmap from "./pages/Roadmap";
import ResumeBuilder from "./pages/ResumeBuilder";
import Compare from "./pages/Compare";
import JobMatcher from "./pages/JobMatcher";
import InterviewPrep from "./pages/InterviewPrep";
import RecruiterEngine from "./pages/RecruiterEngine";
import FinalBoss from "./pages/FinalBoss";

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        <Route path="/upload" element={
          <ProtectedRoute>
            <PageTransition><Upload /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <PageTransition><Dashboard /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/cover-letter" element={
          <ProtectedRoute>
            <PageTransition><CoverLetter /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/roadmap" element={<PageTransition><Roadmap /></PageTransition>} />
        <Route path="/resume-builder" element={
          <ProtectedRoute>
            <PageTransition><ResumeBuilder /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/compare" element={
          <ProtectedRoute>
            <PageTransition><Compare /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/job-matcher" element={
          <ProtectedRoute>
            <PageTransition><JobMatcher /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/interview-prep" element={
          <ProtectedRoute>
            <PageTransition><InterviewPrep /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/recruiter-engine" element={
          <ProtectedRoute>
            <PageTransition><RecruiterEngine /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/final-boss" element={
          <ProtectedRoute>
            <PageTransition><FinalBoss /></PageTransition>
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
      </BrowserRouter>
    </div>
  );
}

export default App;
