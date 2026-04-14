import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar() {
  const location = useLocation();

  const [user, setUser] = useState(null);

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

  const linkStyle = (path) => ({
    padding: "8px 14px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "500",
    color: location.pathname === path ? "white" : "#333",
    background: location.pathname === path ? "#4f46e5" : "transparent",
    transition: "0.2s",
  });

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 30px",
        background: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <h2 style={{ margin: 0, color: "#4f46e5" }}>
        SkillSync 🚀
      </h2>

      {/* Links */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        
        {!user ? (
          <>
            <Link to="/" style={linkStyle("/")}>Login</Link>
            <Link to="/register" style={linkStyle("/register")}>Register</Link>
          </>
        ) : (
          <>
            <Link to="/upload" style={linkStyle("/upload")}>Upload</Link>
            <Link to="/dashboard" style={linkStyle("/dashboard")}>Dashboard</Link>
            <Link to="/cover-letter" style={linkStyle("/cover-letter")}>Cover Letter</Link>

            <span style={{ marginLeft: "10px", fontWeight: "bold" }}>
              👤 {user?.name || "User"}
            </span>

            <button
              onClick={logout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;