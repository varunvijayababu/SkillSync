import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogOut, User, Moon, Sun } from "lucide-react";
import Button from "./Button";
import Badge from "./Badge";

function Navbar() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");

      if (stored && stored !== "undefined") {
       setUser(JSON.parse(stored));
      } else {
       setUser(null);
      }
    } catch {
     setUser(null);
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 🔥 update state immediately
    setUser(null);

    window.location.href = "/";
  };

  const linkClass = (path) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
      location.pathname === path
        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-b border-gray-100 dark:border-gray-700/50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">SkillSync 🚀</h2>
        <div className="flex flex-wrap gap-2 items-center">
        
        <button onClick={() => setIsDark(!isDark)} className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-300">
          {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        {!user ? (
          <>
            <Link to="/" className={linkClass("/")}>Login</Link>
            <Link to="/register" className={linkClass("/register")}>Register</Link>
          </>
        ) : (
          <>
            <Link to="/upload" className={linkClass("/upload")}>Upload</Link>
            <Link to="/resume-builder" className={linkClass("/resume-builder")}>Resume Builder</Link>
            <Link to="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
            <Link to="/cover-letter" className={linkClass("/cover-letter")}>Cover Letter</Link>
            <Badge variant="secondary" className="flex flex-row items-center gap-2 dark:bg-gray-700 dark:text-gray-200">
              <User className="w-4 h-4" /> {user?.name || "User"}
            </Badge>
            <Button onClick={logout} variant="danger" className="flex flex-row items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </>
        )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;