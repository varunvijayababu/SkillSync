import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LogOut, User, Moon, Sun, ChevronDown, Menu, X, 
  Sparkles, Eye, Mic, FileText, Zap, Command 
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");
  
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toolsRef = useRef();
  const profileRef = useRef();
  const isAuthenticated = !!user;

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

  // Close dropdowns when path changes
  useEffect(() => {
    setIsToolsOpen(false);
    setIsProfileOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) setIsToolsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const isActiveAiGroup = ["/cover-letter", "/interview-prep", "/recruiter-engine", "/final-boss"].includes(location.pathname);

  const primaryLinks = [
    { path: "/upload", label: "Upload" },
    { path: "/resume-builder", label: "Resume Builder" },
    { path: "/compare", label: "Compare" },
    { path: "/job-matcher", label: "Job Match" },
    { path: "/dashboard", label: "Dashboard" }
  ];

  return (
    <nav className="sticky top-0 z-[100] backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center pr-4 xl:pr-6 border-r border-gray-100 dark:border-gray-800">
            <Link to="/" className="text-xl xl:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2 tracking-tight">
              SkillSync <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500 hidden sm:block" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden lg:flex flex-1 justify-between items-center ml-6">
              
              {/* Primary Links */}
              <div className="flex space-x-1 xl:space-x-2 relative">
                {primaryLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className={`relative px-3 py-2 text-[15px] font-bold transition-colors duration-200 ${
                      location.pathname === link.path 
                        ? "text-blue-700 dark:text-blue-300" 
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {location.pathname === link.path && (
                      <motion.div 
                        layoutId="nav-pill" 
                        className="absolute inset-0 bg-blue-100 dark:bg-blue-900/50 rounded-lg shadow-sm" 
                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} 
                        style={{ zIndex: -1 }} 
                      />
                    )}
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                {/* AI Tools Dropdown */}
                <div className="relative pl-1 xl:pl-2" ref={toolsRef}>
                  <button 
                    onClick={() => setIsToolsOpen(!isToolsOpen)}
                    className={`relative px-3 py-2 rounded-lg text-[15px] font-bold flex items-center gap-1.5 transition-colors duration-200 ${
                      isActiveAiGroup || isToolsOpen ? "text-indigo-700 dark:text-indigo-400" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${isActiveAiGroup ? 'text-indigo-500' : 'text-gray-400 dark:text-gray-500'}`}/> 
                    AI Tools 
                    <motion.div animate={{ rotate: isToolsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60"/>
                    </motion.div>
                    {(isActiveAiGroup || isToolsOpen) && (
                      <motion.div 
                        layoutId="nav-pill-ai" 
                        className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg" 
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} 
                        style={{ zIndex: -1 }} 
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {isToolsOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
                        className="absolute top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-100 dark:border-gray-700 overflow-hidden origin-top z-[9999]"
                      >
                         <div className="p-2 flex flex-col gap-1">
                           <Link to="/cover-letter" className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 transition-colors duration-200">
                              <FileText className="w-4 h-4 opacity-70"/> Cover Letter
                           </Link>
                           <Link to="/interview-prep" className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-2 transition-colors duration-200">
                              <Mic className="w-4 h-4 opacity-70"/> Interview Prep
                           </Link>
                           <Link to="/recruiter-engine" className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-2 transition-colors duration-200">
                              <Eye className="w-4 h-4 opacity-70"/> Recruiter Engine
                           </Link>
                           <Link to="/final-boss" className="px-3 py-2.5 rounded-xl text-sm font-black text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 flex items-center gap-2 transition-colors duration-200 border border-rose-100 dark:border-rose-900/50 mt-1">
                              <Command className="w-4 h-4"/> Final Boss
                           </Link>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Side: Theme & User */}
              <div className="flex items-center gap-3 border-l border-gray-100 dark:border-gray-800 pl-4 xl:pl-6 ml-auto">
                <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-full py-1.5 pl-3 pr-2 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5"/>
                    </div>
                    <span className="text-[13px] font-extrabold text-gray-700 dark:text-gray-200 max-w-[100px] truncate">{user?.name?.split(' ')[0] || "User"}</span>
                    <motion.div animate={{ rotate: isProfileOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400"/>
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-900/10 border border-gray-100 dark:border-gray-700 overflow-hidden origin-top-right z-[9999]"
                      >
                         <div className="p-1 pt-3 pb-2 border-b border-gray-100 dark:border-gray-700 px-4 mb-1 bg-gray-50 dark:bg-gray-900/50">
                           <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest">Account</p>
                           <p className="text-sm font-bold truncate text-gray-900 dark:text-white mt-0.5">{user?.name}</p>
                         </div>
                         <div className="p-2 pb-2">
                           <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors">
                             <LogOut className="w-4 h-4"/> Sign Out
                           </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Login/Register Links for non-user */}
          {!isAuthenticated && (
            <div className="hidden lg:flex items-center gap-4 ml-auto">
               <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors">
                  {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
               </button>
               <Link to="/" className="text-[15px] font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
               <Link to="/login" className="text-[15px] font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 transition-colors">Login</Link>
               <Link to="/register" className="text-[15px] font-bold bg-blue-600 text-white hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-sm transition-transform hover:scale-105">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="p-2 text-gray-500 transition-colors">
              {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700">
               {isMobileOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Content */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl absolute w-full left-0 overflow-hidden"
          >
             <div className="p-4 space-y-2 flex flex-col">
                {!isAuthenticated ? (
                   <>
                     <Link to="/" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold dark:text-white">Home</Link>
                     <Link to="/login" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-bold dark:text-white">Login</Link>
                     <Link to="/register" className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-center">Get Started</Link>
                   </>
                ) : (
                   <>
                     {[...primaryLinks].map(link => (
                        <Link key={link.path} to={link.path} className="font-bold flex p-3 rounded-xl hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800 transition">
                          {link.label}
                        </Link>
                     ))}
                     
                     <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4 pb-2">
                       <p className="px-3 text-xs font-black uppercase text-indigo-500 tracking-widest mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Tools</p>
                       <Link to="/cover-letter" className="font-semibold flex p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-gray-300 transition text-sm">Cover Letter</Link>
                       <Link to="/interview-prep" className="font-semibold flex p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 dark:text-gray-300 transition text-sm">Interview Prep</Link>
                       <Link to="/recruiter-engine" className="font-semibold flex p-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 dark:text-gray-300 transition text-sm">Recruiter Engine</Link>
                       <Link to="/final-boss" className="font-black flex p-3 rounded-xl text-rose-600 bg-rose-50 dark:bg-rose-900/20 transition mt-1 text-sm border border-rose-100 dark:border-rose-900/30">Final Boss</Link>
                     </div>
                     
                     <button onClick={logout} className="mt-4 p-4 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 font-bold rounded-xl flex items-center gap-2 justify-center w-full shadow-sm border border-rose-100 dark:border-none">
                       <LogOut className="w-4 h-4"/> Sign Out
                     </button>
                   </>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
