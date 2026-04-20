import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUser } from "../services/api";
import { Zap, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await loginUser(form);

      if (res?.token) {
        localStorage.setItem("token", res.token);
        const userData = {
          name: res?.user?.name || res?.name || "User",
          email: res?.user?.email || res?.email || "",
        };

        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/dashboard");
      } else {
        alert(res?.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-300 font-sans">
      
      {/* LEFT SIDE - Brand Section (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between overflow-hidden">
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/40 blur-[120px] rounded-full mix-blend-overlay pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-rose-400/30 blur-[130px] rounded-full mix-blend-overlay pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-2xl tracking-tight hover:opacity-90 transition-opacity w-fit">
            SkillSync <Zap className="w-6 h-6 fill-white" />
          </Link>
        </div>

        <div className="relative z-10 mb-20 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">The Hiring standard</span>
           </div>
           <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
             Get hired faster with AI-powered resume intelligence.
           </h1>
           <p className="text-xl text-blue-100 font-medium max-w-lg leading-relaxed">
             Analyze, optimize, and beat ATS systems with real insights from our deep learning recruiter simulation engine.
           </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-blue-200/60 text-sm font-semibold uppercase tracking-widest">
           <span>(c) 2026 SkillSync Inc.</span>
           <span>v2.0.4 AI Engine</span>
        </div>
      </div>

      {/* RIGHT SIDE - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
         
         {/* Mobile glow background */}
         <div className="absolute lg:hidden top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none dark:bg-blue-600/10" />

         <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 animate-fade-in-up">
            <Link to="/" className="mb-6 inline-block text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">
              &lt;- Back to Home
            </Link>
            
            <div className="mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 lg:hidden">
                 <Zap className="w-6 h-6 fill-white"/>
               </div>
               <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Welcome Back</h2>
               <p className="text-gray-500 dark:text-gray-400 font-medium">Log in to view your application analytics.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                     <input
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                       placeholder="you@example.com"
                       type="email"
                       value={form.email}
                       onChange={(e) => setForm({ ...form, email: e.target.value })}
                       required
                     />
                  </div>
               </div>

               <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
                     <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                     <button type="button" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">Forgot password?</button>
                  </div>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                     <input
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                       type="password"
                       placeholder="Password"
                       value={form.password}
                       onChange={(e) => setForm({ ...form, password: e.target.value })}
                       required
                     />
                  </div>
               </div>

               <button
                 type="submit"
                 disabled={loading}
                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-[15px] py-3.5 rounded-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_30px_rgba(79,70,229,0.5)] hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0"
               >
                 {loading ? "Authenticating..." : <>Sign In <ArrowRight className="w-5 h-5"/></>}
               </button>
            </form>

            <p className="mt-8 text-sm font-medium text-center text-gray-500 dark:text-gray-400">
               Don't have an account?{" "}
               <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-bold hover:underline transition-colors">
                 Sign up for free
               </Link>
            </p>

         </div>
      </div>
    </div>
  );
}

export default Login;
