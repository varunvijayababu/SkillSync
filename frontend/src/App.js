import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import CoverLetter from "./pages/coverLetter";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";

function App() {
  const isAuth = localStorage.getItem("token"); // ✅ ADD THIS

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/cover-letter" element={<CoverLetter />} />

        {/* ✅ PROTECTED ROUTE */}
        <Route
          path="/dashboard"
          element={isAuth ? <Dashboard /> : <Login />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;