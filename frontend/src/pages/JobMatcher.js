import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Badge from "../components/Badge";

import { 
  Zap, Target, BarChart2, Briefcase, FileText,
  CheckCircle, AlertTriangle, Trash, Layers, Sparkles, Activity
} from "lucide-react";

export default function JobMatcher() {
  const [userProfile, setUserProfile] = useState({ skills: [], experience: [] });
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState(null);
  
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobJD, setNewJobJD] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Load local profile data
    let profile = { skills: [], experience: [] };
    try {
      const latest = JSON.parse(localStorage.getItem("latestProfile") || "{}");
      const roadmap = JSON.parse(localStorage.getItem("roadmapData") || "{}");
      profile.skills = latest.skills || roadmap.matchedSkills || ["JavaScript", "React", "Node.js", "Git"];
    } catch (e) {}
    setUserProfile(profile);

    // Load saved jobs
    try {
      const savedJobs = JSON.parse(localStorage.getItem("jobMatches") || "[]");
      setJobs(savedJobs);
      if (savedJobs.length > 0) setActiveJobId(savedJobs[0].id);
    } catch (e) {}
  }, []);

  const saveJobs = (updatedJobs) => {
    setJobs(updatedJobs);
    localStorage.setItem("jobMatches", JSON.stringify(updatedJobs));
  };

  const analyzeJob = () => {
    if (!newJobTitle.trim() || !newJobJD.trim()) return;
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // 1. Basic Heuristic Keyword Extraction (mock AI)
      const text = newJobJD.toLowerCase();
      const techKeywords = ["react", "node", "python", "aws", "docker", "kubernetes", "sql", "nosql", "agile", "java", "c++", "go", "typescript", "figma", "graphql", "rest", "linux"];
      const requirementKeywords = techKeywords.filter(k => text.includes(k));
      
      // Ensure at least some requirements
      if (requirementKeywords.length === 0) requirementKeywords.push("agile", "communication", "leadership");

      // 2. Compute matches
      const userSkillsLower = userProfile.skills.map(s => s.toLowerCase());
      const matched = requirementKeywords.filter(k => userSkillsLower.some(us => us.includes(k) || k.includes(us)));
      const missing = requirementKeywords.filter(k => !matched.includes(k));
      
      const skillsMatchScore = Math.round((matched.length / Math.max(requirementKeywords.length, 1)) * 100);
      const experienceScore = text.includes("senior") || text.includes("lead") ? 60 : 85; 
      const projectScore = 75; 
      const atsScore = skillsMatchScore > 80 ? 90 : skillsMatchScore > 50 ? 70 : 45;

      const overall = Math.round((skillsMatchScore * 0.4) + (experienceScore * 0.2) + (projectScore * 0.2) + (atsScore * 0.2));
      const readiness = Math.round(overall * 0.95);

      // 3. Rejection Analysis & Gaps
      let rejectionReasons = [];
      let gapFixes = [];
      
      if (missing.length > 0) {
        rejectionReasons.push(`Missing critical core skills: ${missing.slice(0, 3).join(", ")}`);
        gapFixes.push(`Add projects demonstrating proficiency in ${missing[0]}`);
      }
      if (atsScore < 70) {
        rejectionReasons.push("Low ATS compatibility due to missing exact keyword matches from the JD.");
        gapFixes.push("Rewrite resume summaries to explicitly include exact JD terminology.");
      }
      if (experienceScore < 70) {
        rejectionReasons.push("May lack the requested years of seniority or leadership scale.");
        gapFixes.push("Emphasize leadership, mentoring, or architecture decisions in bullet points.");
      }
      if (rejectionReasons.length === 0) rejectionReasons.push("Highly competitive applicant pool.");

      // 4. Construct result
      const newJob = {
        id: Date.now(),
        title: newJobTitle,
        jd: newJobJD,
        results: {
          overall,
          readiness,
          breakdown: {
            skills: skillsMatchScore,
            experience: experienceScore,
            projects: projectScore,
            ats: atsScore
          },
          matched,
          missing,
          rejectionReasons,
          gapFixes
        }
      };

      const updated = [newJob, ...jobs];
      saveJobs(updated);
      setActiveJobId(newJob.id);
      
      setNewJobTitle("");
      setNewJobJD("");
      setIsAnalyzing(false);
    }, 1200);
  };

  const deleteJob = (id) => {
    const updated = jobs.filter(j => j.id !== id);
    saveJobs(updated);
    if (activeJobId === id) setActiveJobId(updated.length > 0 ? updated[0].id : null);
  };

  const handleSmartAction = (action, job) => {
    if (action === "cover-letter") {
       const context = { company: job.title.split("-")[0].trim() || "Company", role: job.title, description: job.jd };
       localStorage.setItem("coverLetterContext", JSON.stringify(context));
       window.location.href = "/cover-letter";
    }
    if (action === "resume") {
       alert("Navigating to Resume Builder. Your Target Job Context has been saved to tailor suggestions automatically.");
       window.location.href = "/resume-builder";
    }
  };

  const activeJob = jobs.find(j => j.id === activeJobId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Target className="w-64 h-64 text-blue-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="inline-block px-3 py-1 mb-3 text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full flex items-center gap-2 w-max">
                <Sparkles className="w-4 h-4"/> AI Application Optimizer
              </div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Job Match Analyzer</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
                Paste job descriptions to instantly see how well you rank. Identify gaps, predict rejection risks, and auto-tailor your application.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input & Multi-Job List */}
          <div className="lg:col-span-4 space-y-6">
            
            <Card title="Add New Job" subtitle="Analyze a new Job Description">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Job Title / Company</label>
                  <input
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    placeholder="e.g. Frontend Dev @ Acme"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Job Description</label>
                  <textarea
                    value={newJobJD}
                    onChange={(e) => setNewJobJD(e.target.value)}
                    className="w-full h-32 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Paste the full JD here..."
                  />
                </div>
                <Button onClick={analyzeJob} disabled={isAnalyzing} className="w-full shadow-md flex items-center justify-center gap-2">
                  {isAnalyzing ? <Activity className="w-5 h-5 animate-spin"/> : <Zap className="w-5 h-5"/>}
                  {isAnalyzing ? "Analyzing Match..." : "Calculate Match Score"}
                </Button>
              </div>
            </Card>

            {jobs.length > 0 && (
              <Card title="Saved Matches" subtitle="Compare multiple jobs">
                <div className="space-y-3">
                  {jobs.map(job => (
                    <div 
                      key={job.id} 
                      onClick={() => setActiveJobId(job.id)}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex justify-between items-center ${activeJobId === job.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-100 hover:border-blue-200 dark:border-gray-700 dark:hover:border-gray-600'}`}
                    >
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">{job.title}</h4>
                        <p className="text-xs text-gray-500 font-semibold mt-1">Match: {job.results.overall}%</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteJob(job.id); }} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                        <Trash className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>

          {/* RIGHT COLUMN: Analysis Output */}
          <div className="lg:col-span-8">
            {activeJob ? (
              <div className="space-y-6">
                
                {/* Top Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-6">
                     <div className="relative shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={40 * 2 * Math.PI} strokeDashoffset={40 * 2 * Math.PI - (activeJob.results.overall / 100) * 40 * 2 * Math.PI} className={`${activeJob.results.overall >= 80 ? 'text-emerald-500' : activeJob.results.overall >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000`} />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                          <span className="text-2xl font-black text-gray-800 dark:text-white">{activeJob.results.overall}%</span>
                        </div>
                     </div>
                     <div>
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white">Overall Match</h3>
                       <p className="text-sm text-gray-500 mt-1">For <span className="font-semibold text-gray-700 dark:text-gray-300">{activeJob.title}</span></p>
                     </div>
                   </div>

                   <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
                     <Layers className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10"/>
                     <span className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Apply Readiness</span>
                     <div className="flex items-end gap-3 font-black">
                       <span className="text-5xl">{activeJob.results.readiness}%</span>
                     </div>
                     <p className="text-sm opacity-90 mt-2 font-medium leading-tight">Likelihood of passing the initial ATS & Recruiter screening.</p>
                   </div>
                </div>

                {/* Score Breakdown Section */}
                <Card title="Detailed Breakdown">
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {[
                       { label: "Skills Match", val: activeJob.results.breakdown.skills },
                       { label: "Experience Relevance", val: activeJob.results.breakdown.experience },
                       { label: "Project Relevance", val: activeJob.results.breakdown.projects },
                       { label: "ATS Compatibility", val: activeJob.results.breakdown.ats },
                     ].map((score, i) => (
                        <div key={i} className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                          <span className="text-2xl font-black text-gray-800 dark:text-white mb-1.5">{score.val}%</span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">{score.label}</span>
                        </div>
                     ))}
                   </div>
                </Card>

                {/* Gaps, Rejections, and Fixes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Rejection Analysis */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-rose-200 dark:border-rose-900/50">
                    <h3 className="font-bold text-lg text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-5">
                      <AlertTriangle className="w-5 h-5"/> Rejection Risks
                    </h3>
                    <ul className="space-y-4">
                      {activeJob.results.rejectionReasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></div> {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actionable Suggestions */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-emerald-200 dark:border-emerald-900/50">
                     <h3 className="font-bold text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-5">
                       <CheckCircle className="w-5 h-5"/> Gaps & Fixes
                     </h3>
                     <ul className="space-y-4">
                        {activeJob.results.gapFixes.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div> {f}
                          </li>
                        ))}
                        {activeJob.results.missing.length > 0 && (
                          <li className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Keywords to add:</span>
                             <div className="flex flex-wrap gap-1.5">
                               {activeJob.results.missing.map(m => <Badge key={m} variant="secondary" className="text-xs uppercase">{m}</Badge>)}
                             </div>
                          </li>
                        )}
                     </ul>
                  </div>

                </div>

                {/* Smart Actions */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 md:p-8 shadow-sm border border-indigo-100 dark:border-indigo-800/50 text-center md:text-left">
                   <h3 className="font-extrabold text-indigo-900 dark:text-indigo-300 text-xl mb-2 flex items-center gap-2 justify-center md:justify-start">
                     <Zap className="w-6 h-6"/> Smart Application Actions
                   </h3>
                   <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400 mb-6">Let's aggressively optimize your application materials specifically for {activeJob.title}.</p>
                   
                   <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                      <Button onClick={() => handleSmartAction("resume", activeJob)} className="px-6 py-3 text-[15px] font-bold shadow-md flex items-center gap-2">
                        <Briefcase className="w-5 h-5"/> Auto-Tailor Resume
                      </Button>
                      <Button onClick={() => handleSmartAction("cover-letter", activeJob)} variant="secondary" className="px-6 py-3 text-[15px] font-bold flex items-center gap-2 bg-white dark:bg-gray-800 border-[1.5px] border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 transition-all text-indigo-700 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <FileText className="w-5 h-5"/> Generate Targeted Cover Letter
                      </Button>
                   </div>
                </div>

              </div>
            ) : (
               <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-12 text-center h-full flex flex-col items-center justify-center min-h-[500px]">
                  <BarChart2 className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-6"/>
                  <h3 className="text-2xl font-extrabold text-gray-500 dark:text-gray-400">No Job Selected</h3>
                  <p className="text-gray-400 dark:text-gray-500 mt-2 font-medium text-lg">Add a job description on the left to generate an AI match report.</p>
               </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
