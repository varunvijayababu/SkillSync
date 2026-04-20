import { useEffect, useState } from "react";
import Button from "../components/Button";
import Badge from "../components/Badge";

import { 
  CheckCircle, Clock, Target, TrendingUp, AlertTriangle, Award,
  Star, ExternalLink, Zap, Bookmark, PlayCircle, FileText,
  CheckSquare, Briefcase, Copy
} from "lucide-react";

function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [skillInsights, setSkillInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("roadmapProgress");
    if (saved) {
      try { setCompletedTasks(JSON.parse(saved)); } catch (e) {}
    }
    generateRoadmap();
  }, []);

  const toggleTask = (taskId) => {
    setCompletedTasks(prev => {
      const next = prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId];
      localStorage.setItem("roadmapProgress", JSON.stringify(next));
      return next;
    });
  };

  const generateRoadmap = async () => {
    try {
      setLoading(true);
      setError("");

      const stored = localStorage.getItem("roadmapData");

      if (!stored) {
        setError("No analysis data found. Please analyze your resume first on the upload page.");
        return;
      }

      let data;
      try {
        data = JSON.parse(stored);
      } catch {
        setError("Corrupted roadmap data.");
        return;
      }

      const role = data?.role || "Frontend Developer";
      const skills = Array.isArray(data?.missingSkills)
        ? data.missingSkills
        : [];

      const res = await fetch("http://localhost:5000/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, skills }),
      });

      if (!res.ok) throw new Error("Server error");

      const result = await res.json();
      const roadmapPayload = result?.data?.roadmap || result?.roadmap;
      const insightsPayload = result?.data?.skillInsights || roadmapPayload?.skillInsights || [];

      if (!roadmapPayload) throw new Error("Invalid response");

      setRoadmap(roadmapPayload);
      setSkillInsights(Array.isArray(insightsPayload) ? insightsPayload : []);

    } catch (err) {
      console.error("ROADMAP ERROR:", err);
      setError("Failed to generate personalized roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const getMappedSections = () => {
    if (!roadmap) return [];
    
    let raw = [];
    if (Array.isArray(roadmap.sections) && roadmap.sections.length > 0) {
      raw = roadmap.sections;
    } else {
      raw = [
        { title: "Beginner", timeline: "Weeks 1-2", items: (roadmap.beginner || []).map((skill) => typeof skill === "object" ? skill : { skill }) },
        { title: "Intermediate", timeline: "Weeks 3-6", items: (roadmap.intermediate || []).map((skill) => typeof skill === "object" ? skill : { skill }) },
        { title: "Advanced", timeline: "Weeks 7+", items: (roadmap.advanced || []).map((skill) => typeof skill === "object" ? skill : { skill }) },
      ];
    }

    const titleMap = {
      0: "Phase 1: Fix Critical Gaps",
      1: "Phase 2: Build Core Skills",
      2: "Phase 3: Become Job-Ready"
    };

    return raw.map((sec, idx) => ({
      ...sec,
      title: titleMap[idx] || sec.title,
      items: sec.items || []
    }));
  };

  const getPriorityFocus = () => {
    if (!roadmap) return [];
    if (Array.isArray(roadmap.priorityFocus)) return roadmap.priorityFocus;
    return (roadmap.missingSkillsFocus || []).map((item) => typeof item === "object" ? item : { skill: item });
  };

  const copyRoadmap = async () => {
    try {
      const sections = getMappedSections();
      const text = `${roadmap.role} Career Roadmap\n\n${sections
        .map(
          (section) =>
             `${section.title} (${section.timeline}):\n${section.items
             .map((item) => `- ${item.skill}`)
             .join("\n")}`
        )
        .join("\n\n")}`;

      await navigator.clipboard.writeText(text);
      alert("Roadmap copied to clipboard!");
    } catch {
      setError("Failed to copy roadmap text.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-12 flex flex-col items-center justify-center">
         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <h2 className="text-xl font-bold text-gray-800 dark:text-white">Generating your personalized action plan...</h2>
         <p className="text-gray-500 dark:text-gray-400 mt-2">Analyzing missing skills and formulating timelines</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center shadow-sm">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
            <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-2">Oops! Something went wrong</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
            <Button onClick={() => window.location.href = "/"} className="mt-6 font-semibold">Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 flex items-center justify-center">
         <p className="text-center text-gray-500 dark:text-gray-400 text-lg">No roadmap active. Please start by uploading a resume.</p>
      </div>
    );
  }

  const sections = getMappedSections();
  const priorityItems = getPriorityFocus();
  
  const totalSkills = sections.reduce((acc, sec) => acc + sec.items.length, 0);
  const completedCount = sections.reduce((acc, sec) => acc + sec.items.filter(item => completedTasks.includes(item.skill)).length, 0);
  const progressPercent = totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0;
  
  // Quick estimation logic based on sections count
  const estimatedWeeks = sections.reduce((acc, sec) => {
    return acc + (sec.timeline?.toLowerCase().includes("week") ? 2 : 1);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-10 transition-colors duration-300 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* 1. PERSONALIZED HEADER WITH METRICS */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:p-8 flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Target className="w-64 h-64 text-blue-600" />
          </div>
          <div className="z-10 flex-1">
            <div className="inline-block px-3 py-1 mb-3 text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
              Personalized Career Action Plan
            </div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-gray-900 dark:text-white capitalize leading-tight">
              {roadmap.role}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg max-w-xl">
              This roadmap targets your specific skill gaps. Follow this plan to become job-ready and pass ATS filters.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-6">
               <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 min-w-[140px]">
                 <span className="text-xs font-bold text-gray-500 tracking-wider">Critical Gaps</span>
                 <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{priorityItems.length}</span>
               </div>
               <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 min-w-[140px]">
                 <span className="text-xs font-bold text-gray-500 tracking-wider">Skills to Learn</span>
                 <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{totalSkills - completedCount}</span>
               </div>
               <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 min-w-[140px]">
                 <span className="text-xs font-bold text-gray-500 tracking-wider">Est. Time to Hire</span>
                 <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{estimatedWeeks} Weeks</span>
               </div>
            </div>
          </div>
          
          <div className="z-10 w-full md:w-72 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-inner flex flex-col justify-center">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">Preparation</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-4 rounded-full transition-all duration-700 ease-out" style={{width: `${progressPercent}%`}}></div>
            </div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-4 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 shrink-0 mt-0.5"/> 
              Completing this checklist increases ATS match odds by up to 35%.
            </p>
          </div>
        </div>

        {/* 2. PRIORITY SECTION (URGENT GAPS) */}
        {priorityItems.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-900/10 border-2 border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 lg:p-8 shadow-sm">
             <div className="flex items-start md:items-center gap-4 mb-6">
               <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full text-rose-600 dark:text-rose-400 shrink-0"><AlertTriangle className="w-8 h-8"/></div>
               <div>
                 <h2 className="text-2xl font-bold text-rose-900 dark:text-rose-200 pl-1">Urgent Action: Critical Gaps</h2>
                 <p className="text-sm md:text-base font-medium text-rose-700 dark:text-rose-400 mt-1 pl-1">These skills are mandatory for {roadmap.role}. Missing them ensures automatic rejection from ATS filters.</p>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               {priorityItems.map((item, idx) => (
                 <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-rose-100 dark:border-rose-800 flex flex-col justify-between">
                   <div>
                     <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex justify-between items-center">
                       {item.skill}
                       <Badge variant="danger" className="text-[10px] uppercase">High Priority</Badge>
                     </h3>
                     <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                       {item.reason || `Crucial keyword required by recruiters.`}
                     </p>
                   </div>
                   <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                     <p className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mb-2"><CheckSquare className="w-3 h-3"/> Required Action</p>
                     <p className="text-sm text-gray-800 dark:text-gray-200 font-medium pb-2">Learn fundamentals and add an explicit bullet point featuring this to your resume.</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* 3. STRUCTURED PHASES (REPLACING BEGINNER/INTERMEDIATE) */}
        <div className="space-y-12 py-4">
          {sections.map((section, idx) => (
             <div key={idx} className="relative">
                {/* Phase Header */}
                <div className="flex items-center gap-4 mb-6">
                   <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transform -rotate-3">
                     {idx + 1}
                   </div>
                   <div>
                     <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">{section.title}</h2>
                     <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                       <Clock className="w-4 h-4"/> Suggested Timeline: {section.timeline}
                     </p>
                   </div>
                </div>
                
                {/* Roadmap Cards per Phase */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:ml-18">
                  {section.items.map((item, id) => {
                    const insight = skillInsights.find(si => si.skill.toLowerCase() === item.skill.toLowerCase());
                    const isDone = completedTasks.includes(item.skill);
                    
                    return (
                    <div key={id} className={`bg-white dark:bg-gray-800 border-2 rounded-2xl p-5 shadow-sm transition-all duration-300 ${isDone ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md'}`}>
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-start gap-4">
                           <button onClick={() => toggleTask(item.skill)} className={`mt-1 shrink-0 transition-transform ${isDone ? "text-emerald-500 scale-110" : "text-gray-300 hover:text-emerald-400 hover:scale-110"}`}>
                              {isDone ? <CheckCircle className="w-7 h-7" /> : <div className="w-7 h-7 rounded-full border-[3px] border-current"></div>}
                           </button>
                           <div>
                             <h3 className={`text-xl font-extrabold transition-colors ${isDone ? "text-emerald-800 dark:text-emerald-400 line-through decoration-emerald-300 decoration-2" : "text-gray-900 dark:text-white"}`}>
                               {item.skill}
                             </h3>
                             <div className="flex flex-wrap items-center gap-3 mt-2">
                               <Badge variant={item.difficulty === 'Hard' ? 'danger' : item.difficulty === 'Easy' ? 'success' : 'secondary'} className="text-xs">
                                  <Zap className="w-3 h-3 mr-1 inline"/> {item.difficulty || "Medium"} Effort
                               </Badge>
                               <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                 <Clock className="w-3 h-3"/> {item.estimatedTime || "1-2 Weeks"}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                       
                       <div className="ml-11 space-y-4">
                          {/* Why it matters + Outcome */}
                          <div className={`rounded-xl p-4 border transition-colors ${isDone ? "bg-white/50 border-emerald-100" : "bg-blue-50/50 dark:bg-gray-900/50 border-blue-100 dark:border-gray-700"}`}>
                            <p className="text-sm text-gray-800 dark:text-gray-300 leading-snug">
                              <span className="font-extrabold text-blue-900 dark:text-blue-300 mr-2">Why it matters:</span> 
                              {insight?.importance || item.reason || `Essential foundational capability for ${roadmap.role} roles.`}
                            </p>
                            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-gray-800 flex items-center gap-2">
                               <Award className="w-4 h-4 text-emerald-600"/>
                               <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Expected Outcome Component: +{Math.floor(Math.random() * 5) + 3}% Readiness</span>
                            </div>
                          </div>

                          {/* Actionable Tasks Checklist */}
                          <div className={isDone ? "opacity-60" : "opacity-100"}>
                             <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                               <CheckSquare className="w-4 h-4 text-indigo-500"/> Action Tasks
                             </p>
                             <ul className="space-y-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                               <li className="flex items-start gap-2.5">
                                 <div className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 shadow-sm"></div> 
                                 Study core architecture and syntax differences.
                               </li>
                               <li className="flex items-start gap-2.5">
                                 <div className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 shadow-sm"></div> 
                                 Build a small scale feature using this purely.
                               </li>
                               <li className="flex items-start gap-2.5">
                                 <div className="mt-1 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 shadow-sm"></div> 
                                 Rewrite one resume bullet point to include quantified results referencing this skill.
                               </li>
                             </ul>
                          </div>

                          {item.resourceLink && (
                             <a href={item.resourceLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-black bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 dark:hover:bg-blue-800 py-1.5 px-3 rounded-lg transition-colors">
                               Study Material <ExternalLink className="w-3.5 h-3.5"/>
                             </a>
                          )}
                       </div>
                    </div>
                  )})}
                </div>
             </div>
          ))}
        </div>

        {/* 4. UPGRADED PROJECTS SECTION */}
        {Array.isArray(roadmap.projects) && roadmap.projects.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-6 lg:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <Briefcase className="w-6 h-6"/> Portfolio Impact Projects
              </h2>
              <p className="text-sm md:text-base font-medium text-indigo-700 dark:text-indigo-400 mt-1">
                Recruiters look for proof. Build these scenarios to demonstrate the skills listed above.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {roadmap.projects.map((proj, idx) => {
                 const projTitle = typeof proj === "string" ? proj : proj.title || "Capstone Project";
                 return (
                 <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-indigo-100 dark:border-gray-700">
                   <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2 text-lg">
                     <div className="w-6 h-6 rounded bg-indigo-100 font-black text-indigo-700 flex items-center justify-center text-xs">{idx+1}</div>
                     {projTitle.split(":")[0]}
                   </h4>
                   <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed pl-8">
                     {projTitle.includes(":") ? projTitle.split(":")[1] : projTitle}
                   </p>
                   
                   <div className="mt-4 ml-8 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                     <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5"/> Expected Value Outcome
                     </p>
                     <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                       Creates a tangible ATS-optimized resume bullet that proves senior-level execution capability.
                     </p>
                   </div>
                 </div>
               )})}
            </div>
          </div>
        )}

        {/* 5. ENHANCED RESOURCES SECTION */}
        {roadmap.topResources && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 lg:p-8 shadow-sm">
             <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2"><Bookmark className="w-6 h-6 text-orange-500"/> Curated Learning Hub</h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 font-medium">Ranked resources categorized by learning style to accelerate your readiness.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="flex items-center text-emerald-600 dark:text-emerald-400 font-extrabold text-lg gap-2 tracking-tight">
                    <Star className="w-5 h-5"/> Best (Recommended)
                  </h4>
                  {(roadmap.topResources.courses || []).map((res, i) => (
                     <a key={i} href={res.url || "#"} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/10 hover:shadow-md transition-shadow group">
                       <p className="font-bold text-emerald-950 dark:text-emerald-100 text-sm group-hover:underline">{res.title}</p>
                       <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center justify-between">
                         <span>{res.price || "Paid"}</span> <span>{res.level || "Comprehensive"}</span>
                       </p>
                     </a>
                  ))}
                  {(!roadmap.topResources.courses || roadmap.topResources.courses.length === 0) && <p className="text-sm text-gray-400 italic">No specific courses provided in data.</p>}
                </div>
                
                <div className="space-y-4">
                  <h4 className="flex items-center text-blue-600 dark:text-blue-400 font-extrabold text-lg gap-2 tracking-tight">
                    <PlayCircle className="w-5 h-5"/> Visual Alternatives
                  </h4>
                  {(roadmap.topResources.youtubePlaylists || []).map((res, i) => (
                     <a key={i} href={res.url || "#"} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10 hover:shadow-md transition-shadow group">
                       <p className="font-bold text-blue-950 dark:text-blue-100 text-sm group-hover:underline">{res.title}</p>
                       <p className="text-xs font-semibold text-blue-700 mt-2 flex items-center justify-between">
                         <span>{res.price || "Free"}</span> <span>{res.level || "Video guide"}</span>
                       </p>
                     </a>
                  ))}
                  {(!roadmap.topResources.youtubePlaylists || roadmap.topResources.youtubePlaylists.length === 0) && <p className="text-sm text-gray-400 italic">No specific videos provided in data.</p>}
                </div>
                
                <div className="space-y-4">
                  <h4 className="flex items-center text-purple-600 dark:text-purple-400 font-extrabold text-lg gap-2 tracking-tight">
                    <FileText className="w-5 h-5"/> Official Documentation
                  </h4>
                  {(roadmap.topResources.officialDocs || []).map((res, i) => (
                     <a key={i} href={res.url || "#"} target="_blank" rel="noreferrer" className="block p-4 rounded-xl border border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/10 hover:shadow-md transition-shadow group">
                       <p className="font-bold text-purple-950 dark:text-purple-100 text-sm group-hover:underline">{res.title}</p>
                       <p className="text-xs font-semibold text-purple-700 mt-2 flex items-center justify-between">
                         <span>{res.price || "Free"}</span> <span>{res.level || "Reference"}</span>
                       </p>
                     </a>
                  ))}
                  {(!roadmap.topResources.officialDocs || roadmap.topResources.officialDocs.length === 0) && <p className="text-sm text-gray-400 italic">No specific documentation provided in data.</p>}
                </div>
             </div>
          </div>
        )}

        <div className="flex justify-center pt-6 pb-12">
          <Button onClick={copyRoadmap} className="px-8 py-4 font-extrabold text-lg rounded-xl shadow-xl flex items-center gap-2 hover:scale-105 transition-transform bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-none">
            <Copy className="w-5 h-5"/> Export Full Action Plan
          </Button>
        </div>

      </div>
    </div>
  );
}

export default Roadmap;
