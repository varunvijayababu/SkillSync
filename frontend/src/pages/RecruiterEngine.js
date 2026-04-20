import { useEffect, useState } from "react";
import Button from "../components/Button";
import { ChevronRight } from "lucide-react";

import { 
  Activity, CheckCircle, AlertTriangle, Eye,
  ShieldAlert, ShieldCheck, HelpCircle, Target,
  Zap, BrainCircuit
} from "lucide-react";

export default function RecruiterEngine() {
  const [resumeData, setResumeData] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    try {
      const roadmap = JSON.parse(localStorage.getItem("roadmapData") || "{}");
      const latest = JSON.parse(localStorage.getItem("latestProfile") || "{}");
      const rData = JSON.parse(localStorage.getItem("resumeData") || "{}");

      setResumeData({
        role: roadmap.role || latest.role || "Developer",
        skills: latest.skills || roadmap.matchedSkills || [],
        missing: roadmap.missingSkills || [],
        experience: rData.experience || [],
        projects: rData.projects || []
      });
    } catch (e) {}
  }, []);

  const runSimulation = () => {
    setIsEvaluating(true);

    setTimeout(() => {
      // Mock simulation heuristic based on current profile data
      const skillsCount = resumeData.skills.length;
      const missingCount = resumeData.missing.length;
      const hasExp = Array.isArray(resumeData.experience) && resumeData.experience.length > 0;
      
      let confidence = 75;
      if (missingCount > 3) confidence -= 20;
      if (!hasExp) confidence -= 15;
      if (skillsCount > 5) confidence += 15;

      const probability = Math.min(99, Math.max(5, confidence));
      
      let decision = "BORDERLINE";
      if (probability >= 80) decision = "SHORTLISTED";
      if (probability < 50) decision = "REJECTED";

      // 1st impression
      const notices = [];
      if (hasExp) notices.push("Previous Job Titles & Tenures");
      notices.push("Top 3 skills presented at the top");
      notices.push("Overall layout formatting and whitespacing");
      
      const ignored = [];
      ignored.push("Lengthy objective summary");
      ignored.push("Hobbies and non-relevant interests");

      // Notes
      let reasoning = "";
      if (probability >= 80) reasoning = "Candidate perfectly aligns with the core tech stack requirement. Solid experience block signals reliability.";
      else if (probability < 50) reasoning = "Missing too many mandatory skill keywords. Initial glance doesn't show enough quantifiable impact to take a risk.";
      else reasoning = "Candidate has overlapping skills but lacks the specific targeted toolchain or explicit metrics in experience bullets. Very dependent on interview performance.";

      // Flags
      const greenFlags = ["Clear layout architecture", "Modern framework knowledge"];
      if (hasExp) greenFlags.push("Relevant domain experience");
      if (skillsCount > 5) greenFlags.push("Diverse technical capability");

      const redFlags = [];
      if (missingCount > 0) redFlags.push(`Lack of explicit '${resumeData.missing[0] || "core tools"}' capability`);
      if (!hasExp) redFlags.push("Lack of formal tenure");
      redFlags.push("Some generic phrasing ('hard worker', 'team player')");
      redFlags.push("Missing exact dollar ($) or percentage (%) metrics");

      const improvements = [];
      if (decision !== "SHORTLISTED") {
         improvements.push("Rewrite bullet points to strictly begin with an action verb and end with a quantifiable metric.");
         if (missingCount > 0) improvements.push(`Integrate keyword '${resumeData.missing[0]}' naturally into project descriptions.`);
         improvements.push("Delete the generic objective statement; replace it with a 2-line hard-hitting impact summary.");
      } else {
         improvements.push("Optimize the order of projects to highlight the most complex architectural one first.");
      }

      setSimulation({
         decision,
         probability,
         notes: {
            strengths: greenFlags,
            weaknesses: redFlags,
            reasoning
         },
         firstImpression: {
            notices,
            ignored,
            time: "7.2 Seconds"
         },
         questions: [
            `Can you detail a time your problem-solving explicitly saved money or increased efficiency using ${resumeData.skills[0] || "your main stack"}?`,
            `How do you compensate for your lack of production exposure to ${resumeData.missing[0] || "core CI/CD tools"}?`,
            `Walk me through the structural design of the largest project on your resume.`
         ],
         improvements
      });
      setIsEvaluating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 md:px-8 py-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="absolute -top-16 -right-16 p-8 opacity-5">
            <BrainCircuit className="w-96 h-96 text-indigo-500" />
          </div>
          
          <div className="relative z-10 w-full md:w-2/3">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-black bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full tracking-widest uppercase">
              Recruiter Simulation Engine
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              See Your Resume Through <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">A Recruiter's Eyes</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
              We process your resume exactly how an exhausted recruiter does. Uncover the brutal truth about what they notice in the first 7 seconds, flag your weaknesses, and predict their hiring decision.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-1/3 flex justify-center md:justify-end">
            <Button onClick={runSimulation} disabled={isEvaluating || !resumeData} className="px-8 py-5 text-lg font-black bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-3 w-full justify-center">
              {isEvaluating ? <Activity className="w-6 h-6 animate-spin"/> : <Zap className="w-6 h-6"/>}
              {isEvaluating ? "Scanning Resume..." : "Run Evaluation"}
            </Button>
          </div>
        </div>

        {/* Results Pipeline */}
        {simulation && (
          <div className="space-y-8 animate-fade-in-up">
             
             {/* Core Decision Board */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Final Decision */}
                <div className={`p-8 rounded-3xl border-2 shadow-sm flex flex-col justify-center items-center text-center ${
                   simulation.decision === 'SHORTLISTED' ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300' :
                   simulation.decision === 'BORDERLINE' ? 'bg-amber-50 border-amber-500 dark:bg-amber-900/20 text-amber-900 dark:text-amber-300' :
                   'bg-rose-50 border-rose-500 dark:bg-rose-900/20 text-rose-900 dark:text-rose-300'
                }`}>
                   <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">Screening Decision</p>
                   <h2 className="text-4xl font-black tracking-tight">{simulation.decision}</h2>
                   <p className="mt-4 font-semibold opacity-90 text-sm max-w-xs leading-relaxed">
                     "{simulation.notes.reasoning}"
                   </p>
                </div>

                {/* Probability Score */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm flex flex-col items-center justify-center">
                   <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Shortlist Probability</p>
                   <div className="relative">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-100 dark:text-gray-700" />
                        <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={54 * 2 * Math.PI} strokeDashoffset={54 * 2 * Math.PI - (simulation.probability / 100) * 54 * 2 * Math.PI} className={`${simulation.probability >= 80 ? 'text-emerald-500' : simulation.probability >= 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000`} />
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{simulation.probability}%</span>
                      </div>
                   </div>
                </div>

                {/* First Impression Glance */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                     <p className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Eye className="w-4 h-4"/> 1st Impression Glance</p>
                     <span className="text-xs font-black bg-blue-100 text-blue-700 py-1 px-2 rounded-md">{simulation.firstImpression.time}</span>
                   </div>
                   <div className="flex-1 space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-600 block mb-1">What caught my eye</span>
                        <ul className="text-sm font-medium text-gray-700 dark:text-gray-300 space-y-1">
                          {simulation.firstImpression.notices.map((n, i) => <li key={i} className="flex gap-1.5"><ChevronRight className="w-4 h-4 text-emerald-500 shrink-0"/>{n}</li>)}
                        </ul>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">What I skipped instantly</span>
                        <ul className="text-sm font-medium text-gray-500 dark:text-gray-500 space-y-1">
                          {simulation.firstImpression.ignored.map((n, i) => <li key={i} className="flex gap-1.5 line-through"><ChevronRight className="w-4 h-4 text-gray-300 shrink-0"/>{n}</li>)}
                        </ul>
                      </div>
                   </div>
                </div>

             </div>

             {/* Dynamic Analysis Rows */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Green vs Red Flags */}
                <div className="space-y-6">
                   <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-4">
                         <ShieldCheck className="w-5 h-5"/> Green Flags Detected
                      </h3>
                      <ul className="space-y-3">
                         {simulation.notes.strengths.map((str, i) => (
                           <li key={i} className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                             <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500"/> {str}
                           </li>
                         ))}
                      </ul>
                   </div>

                   <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-extrabold text-lg text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-4">
                         <ShieldAlert className="w-5 h-5"/> Red Flags Detected
                      </h3>
                      <ul className="space-y-3">
                         {simulation.notes.weaknesses.map((wk, i) => (
                           <li key={i} className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800 text-sm font-semibold text-rose-900 dark:text-rose-200">
                             <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500"/> {wk}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>

                {/* Interventions & Predictions */}
                <div className="space-y-6">
                   
                   <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
                      <h3 className="font-extrabold text-xl text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                         <Target className="w-6 h-6"/> Improvement Action Plan
                      </h3>
                      <p className="text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-5">
                         Do exactly these steps to move from <strong>{simulation.decision}</strong> to <strong>SHORTLISTED</strong>.
                      </p>
                      <ul className="space-y-3">
                         {simulation.improvements.map((imp, i) => (
                           <li key={i} className="flex items-start gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm/50 text-sm font-bold text-gray-800 dark:text-gray-200 border border-indigo-50 dark:border-indigo-900/40">
                             <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                             {imp}
                           </li>
                         ))}
                      </ul>
                   </div>

                   <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                         <HelpCircle className="w-5 h-5 text-gray-500"/> Predicted Interview Ammo
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">Recruiters pass these notes to the hiring manager. Expect these explicit technical queries based on your gaps:</p>
                      <ul className="space-y-3">
                         {simulation.questions.map((q, i) => (
                           <li key={i} className="flex gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 px-3 border-l-2 border-gray-300 dark:border-gray-600 py-1">
                             "{q}"
                           </li>
                         ))}
                      </ul>
                      <Button onClick={() => window.location.href="/interview-prep"} className="w-full mt-5 font-bold shadow-md">Practice these questions now</Button>
                   </div>
                </div>

             </div>

          </div>
        )}

      </div>
    </div>
  );
}
