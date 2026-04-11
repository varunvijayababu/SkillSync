import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/">Login</Link> | 
      <Link to="/register">Register</Link> | 
      <Link to="/upload">Upload</Link> | 
      <Link to="/dashboard">Dashboard</Link> | 
      <Link to="/cover-letter">Cover Letter</Link>
    </nav>
  );
}

export default Navbar;