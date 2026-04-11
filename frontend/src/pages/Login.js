import { Link } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Sending login data:", form);

    const res = await loginUser(form);
    console.log("LOGIN RESPONSE 👉", res);

    if (res.token) {
      localStorage.setItem("token", res.token);
      alert("Login successful 🚀");
      console.log("Token saved:", res.token);
    } else {
      alert(res.error || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <div className="bg-white p-8 rounded shadow-md w-96">
        
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          
          <input
            className="border p-2 mb-3 w-full rounded"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            className="border p-2 mb-4 w-full rounded"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600"
          >
            Login
          </button>

        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;