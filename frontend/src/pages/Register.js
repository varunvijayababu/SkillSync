import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../services/api";
import { Zap, User, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await registerUser(form);

    if (!res.error) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: res?.name || form.name || "",
          email: res?.email || form.email || "",
        })
      );
      alert("Registration successful");
      navigate("/login");
    } else {
      alert(res.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0B0F19] transition-colors duration-300 font-sans">
      
      {/* LEFT SIDE - Brand Section (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-indigo-700 via-purple-600 to-rose-600 p-12 flex-col justify-between overflow-hidden">
        
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-400/40 blur-[120px] rounded-full mix-blend-overlay pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-400/40 blur-[130px] rounded-full mix-blend-overlay pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white font-black text-2xl tracking-tight hover:opacity-90 transition-opacity w-fit">
            SkillSync <Zap className="w-6 h-6 fill-white" />
          </Link>
        </div>

        <div className="relative z-10 mb-20 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span className="text-xs font-bold text-white tracking-widest uppercase">The Pipeline</span>
           </div>
           <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6">
             Start optimizing your career trajectory instantly.
           </h1>
           <p className="text-xl text-purple-100 font-medium max-w-lg leading-relaxed">
             Join thousands of professionals utilizing generative adversarial panels to perfectly tailor their applications.
           </p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-purple-200/60 text-sm font-semibold uppercase tracking-widest">
           <span>(c) 2026 SkillSync Inc.</span>
           <span>v2.0.4 AI Engine</span>
        </div>
      </div>

      {/* RIGHT SIDE - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
         
         {/* Mobile glow background */}
         <div className="absolute lg:hidden bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none dark:bg-purple-600/10" />

         <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 animate-fade-in-up">
            <Link to="/" className="mb-6 inline-block text-sm font-bold text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-white transition-colors">
              &lt;- Back to Home
            </Link>
            
            <div className="mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 lg:hidden">
                 <Zap className="w-6 h-6 fill-white"/>
               </div>
               <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Create Account</h2>
               <p className="text-gray-500 dark:text-gray-400 font-medium">Register for free and test your resume score.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Full Name</label>
                  <div className="relative group">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                     <input
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                       placeholder="e.g. Jane Doe"
                       value={form.name}
                       onChange={(e) => setForm({ ...form, name: e.target.value })}
                       required
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                     <input
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
                       placeholder="you@example.com"
                       type="email"
                       value={form.email}
                       onChange={(e) => setForm({ ...form, email: e.target.value })}
                       required
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Secure Password</label>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                     <input
                       className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
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
                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-[15px] py-3.5 rounded-xl shadow-[0_10px_20px_rgba(124,58,237,0.3)] hover:shadow-[0_10px_30px_rgba(124,58,237,0.5)] hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0"
               >
                 {loading ? "Creating Account..." : <>Join SkillSync <ArrowRight className="w-5 h-5"/></>}
               </button>
            </form>

            <p className="mt-8 text-sm font-medium text-center text-gray-500 dark:text-gray-400">
               Already have an account?{" "}
               <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-bold hover:underline transition-colors">
                 Sign in instead
               </Link>
            </p>

         </div>
      </div>
    </div>
  );
}

export default Register;
