import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import Badge from "../components/Badge";
import { fetchLatestProfile } from "../services/api";

import { 
  Wand2, Building2, Briefcase, FileText, CheckCircle, AlertCircle, 
  History, Download, Copy, Sparkles, TrendingUp, Zap, Scissors, 
  ChevronRight, Activity, Target, PenTool
} from "lucide-react";

function CoverLetter() {
  const [loading, setLoading] = useState(true);
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");
  const [hasProfileData, setHasProfileData] = useState(true);
  const [error, setError] = useState("");

  const [context, setContext] = useState({ company: "", role: "", description: "" });
  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [score, setScore] = useState(85);
  const [suggestions, setSuggestions] = useState([]);
  const [resumeIntegration, setResumeIntegration] = useState({ matched: [], missing: [] });
  const [feedback, setFeedback] = useState({ strengths: [], weaknesses: [] });

  const analyzeText = useCallback((text) => {
    let newScore = 95;
    let newSuggestions = [];
    let weaknesses = [];
    let strengths = ["Clear structure", "Professional tone"];

    if (text.includes("I am writing to express")) {
      newSuggestions.push({
        find: "I am writing to express my strong interest in",
        replace: "I am thrilled to submit my application for",
        reason: "Generic opening. Be more energetic and confident."
      });
      newScore -= 5;
      weaknesses.push("Opening is slightly generic");
    }
    if (text.includes("I have developed strong skills")) {
      newSuggestions.push({
        find: "I have developed strong skills in",
        replace: "I have delivered measurable results utilizing my expertise in",
        reason: "Show impact instead of just stating skills."
      });
      newScore -= 8;
      weaknesses.push("Lacks quantified impact metrics");
    }
    if (!text.match(/\d+(%|x|\$|\+)/i)) { 
      newScore -= 10;
      if (!weaknesses.includes("Lacks quantified impact metrics")) {
        weaknesses.push("No numbers or metrics detected");
      }
    } else {
      strengths.push("Includes quantified achievements");
    }

    if (text.length > 2000) {
      newScore -= 10;
      weaknesses.push("Letter is too long");
    }

    setScore(Math.max(40, newScore));
    setSuggestions(newSuggestions);
    setFeedback({ strengths, weaknesses });
  }, []);

  const addVersion = useCallback((text) => {
    const id = Date.now();
    const newVer = { id, text, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setVersions(prev => [...prev, newVer]);
    setActiveVersionId(id);
    setCurrentText(text);
    analyzeText(text);
  }, [analyzeText]);

  const generateCoverLetterText = useCallback((resumeData, analysisData, customContext) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const matchedSkills = analysisData.matchedSkills || [];
    const missingSkills = analysisData.missingSkills || [];
    const projects = resumeData.projects || [];
    const experience = resumeData.experience || [];
    const name = user.name || resumeData.name || "Candidate";
    
    // Use custom context if provided, else fallback to analysis data
    const role = customContext.role || analysisData.role || "Developer";
    const company = customContext.company || "";

    const topSkills = matchedSkills.slice(0, 3).join(", ");
    const focusSkills = missingSkills.slice(0, 2).join(", ");

    const hasProjects = projects.length > 0;
    const hasExperience = experience.length > 0;

    const opening = `Dear Hiring Manager${company ? ` at ${company}` : ""},\n\nI am writing to express my strong interest in the ${role} position${company ? ` at ${company}` : ""}.`;
    
    const skillsMatch = `My background highlights core competencies in ${topSkills || "modern technologies"}.` +
      (hasExperience 
        ? " I have gained practical experience that has strengthened my problem-solving abilities." 
        : hasProjects ? " I have built projects that demonstrate my ability to apply concepts in real-world scenarios." 
        : " I am continuously learning and improving my technical skills.");

    const whyCompany = company 
      ? `I have long admired ${company}'s mission and believe my technical foundation makes me an ideal fit for your engineering culture.` 
      : `I have long admired your organization's mission and believe my technical foundation makes me an ideal fit for your engineering culture.`;

    const closingPart = focusSkills
      ? `I am currently focusing on improving skills like ${focusSkills} to better align with industry expectations.\n\n`
      : "";
    const closing = `${closingPart}Thank you for your time and consideration. I am confident my dedication will make me a valuable addition to your team.\n\nSincerely,\n${name}`;

    return `${opening}\n\n${skillsMatch}\n\n${whyCompany}\n\n${closing}`;
  }, []);

  const loadCoverLetter = useCallback(async (customContext = context) => {
    try {
      setLoading(true);
      setError("");

      let resumeData = JSON.parse(localStorage.getItem("resumeData") || "{}");
      let analysisData = JSON.parse(localStorage.getItem("roadmapData") || "{}");
      let latestProfile = JSON.parse(localStorage.getItem("latestProfile") || "null");

      try {
        setProfileSyncStatus("syncing");
        const remoteProfile = await fetchLatestProfile();
        if (remoteProfile) {
          latestProfile = remoteProfile;
          localStorage.setItem("latestProfile", JSON.stringify(remoteProfile));
          setProfileSyncStatus("synced");
        } else {
          setProfileSyncStatus("local-only");
        }
      } catch (remoteErr) {
        console.error("REMOTE PROFILE LOAD ERROR:", remoteErr);
        setProfileSyncStatus("local-only");
      }

      if ((!resumeData.name || resumeData.name === "") && latestProfile) {
        resumeData = { ...resumeData, ...latestProfile };
      }

      const mergedRole = customContext.role || analysisData.role || latestProfile?.role || "Developer";

      analysisData = {
        ...analysisData,
        role: mergedRole,
        matchedSkills: analysisData.matchedSkills || latestProfile?.skills || [],
        missingSkills: analysisData.missingSkills || [],
      };

      if (!resumeData.name && !analysisData.role) {
        setHasProfileData(false);
        const blankText = "No profile data found. Please analyze your resume first or fill in the context manually.";
        addVersion(blankText);
        return;
      }

      setHasProfileData(true);
      setResumeIntegration({ 
        matched: analysisData.matchedSkills.slice(0, 5), 
        missing: analysisData.missingSkills.slice(0, 3) 
      });

      const generatedText = generateCoverLetterText(resumeData, analysisData, customContext);
      addVersion(generatedText);

    } catch (err) {
      console.error(err);
      setHasProfileData(false);
      setError("Failed to generate insights.");
    } finally {
      setLoading(false);
    }
  }, [addVersion, context, generateCoverLetterText]);

  useEffect(() => {
    // Initial Load
    const saved = localStorage.getItem("coverLetterContext");
    let initContext = context;
    if (saved) {
      try { 
        initContext = JSON.parse(saved); 
        setContext(initContext); 
      } catch (e) {}
    }
    loadCoverLetter(initContext);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContextChange = (field, value) => {
    const newCtx = { ...context, [field]: value };
    setContext(newCtx);
    localStorage.setItem("coverLetterContext", JSON.stringify(newCtx));
  };

  const applySuggestion = (sug) => {
    const newText = currentText.replace(sug.find, sug.replace);
    addVersion(newText);
  };

  const handleSmartAction = (actionType) => {
    let updated = currentText;
    if (actionType === "Shorten") {
      updated = updated.split('\n').filter(p => !p.includes("currently focusing on improving")).join('\n');
    } else if (actionType === "Make Professional") {
      updated = updated.replace(/thrilled/gi, "highly motivated").replace(/I have gained/gi, "My professional tenure includes");
    } else if (actionType === "Add Metrics") {
      updated = updated.replace("problem-solving abilities.", "problem-solving abilities, increasing process efficiency by 20%.");
    } else if (actionType === "Improve Impact") {
      updated = updated.replace("I am currently focusing on", "I am actively upskilling in");
    }
    addVersion(updated);
  };

  const handleSwitchVersion = (id) => {
    const ver = versions.find(v => v.id === id);
    if (ver) {
      setActiveVersionId(id);
      setCurrentText(ver.text);
      analyzeText(ver.text);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(currentText);
      alert("Copied to clipboard!");
    } catch {
      setError("Failed to copy cover letter.");
    }
  };

  const downloadPdf = () => {
    const printWindow = window.open('', '', 'height=800,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Cover Letter</title>
          <style>
             body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>${currentText}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-12">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-indigo-500" />
              AI Writing Assistant
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Craft the perfect tailored cover letter instantly.</p>
          </div>
          <div className="flex items-center gap-4">
            <ProfileSyncBadge status={profileSyncStatus} />
            <div className="flex gap-2">
              <Button onClick={() => loadCoverLetter(context)} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                 <Wand2 className="w-4 h-4"/> Generate New
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {(loading || error || !hasProfileData) && (
          <div className="lg:col-span-12">
            {loading && (
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300">
                Loading your latest resume context...
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
                {error}
              </div>
            )}
            {!hasProfileData && !loading && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
                Add resume details or job context to generate a stronger first version.
              </div>
            )}
          </div>
        )}
        
        {/* LEFT COLUMN: Settings & Context */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Job Context Input */}
          <Card title="Job Context" subtitle="Tailor the letter to a specific role">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1.5"><Building2 className="w-4 h-4"/> Company Name</label>
                <input
                  value={context.company}
                  onChange={(e) => handleContextChange("company", e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1.5"><Briefcase className="w-4 h-4"/> Job Role</label>
                <input
                  value={context.role}
                  onChange={(e) => handleContextChange("role", e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-1.5"><FileText className="w-4 h-4"/> Job Description</label>
                <textarea
                  value={context.description}
                  onChange={(e) => handleContextChange("description", e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-medium min-h-[100px]"
                  placeholder="Paste JD to extract keywords..."
                />
              </div>
            </div>
          </Card>

          {/* Resume Integration */}
          <Card title="Resume Integration" subtitle="Keywords matched from your profile">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Automatically Included</p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeIntegration.matched.length > 0 ? resumeIntegration.matched.map(s => <Badge key={s} variant="success">{s}</Badge>) : <span className="text-sm text-gray-400">None detected</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide mb-2 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Suggested to Add</p>
                <div className="flex flex-wrap gap-1.5">
                  {resumeIntegration.missing.length > 0 ? resumeIntegration.missing.map(s => <Badge key={s} variant="danger">{s}</Badge>) : <span className="text-sm text-gray-400">Perfect match!</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Version Control */}
          <Card title="Version History" subtitle="Compare and revert changes">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {versions.slice().reverse().map((v, i) => (
                 <button 
                   key={v.id} 
                   onClick={() => handleSwitchVersion(v.id)}
                   className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${activeVersionId === v.id ? "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300"}`}
                 >
                   <span className={`text-sm font-bold ${activeVersionId === v.id ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}`}>
                     Version {versions.length - i}
                   </span>
                   <span className="text-xs text-gray-400 flex items-center gap-1"><History className="w-3 h-3"/> {v.timestamp}</span>
                 </button>
              ))}
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: Writing Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* AI Score Header */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={28 * 2 * Math.PI} strokeDashoffset={28 * 2 * Math.PI - (score / 100) * 28 * 2 * Math.PI} className={`${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000`} />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <span className="text-lg font-black text-gray-800 dark:text-white">{score}</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">AI Quality Score</h3>
                <p className="text-sm text-gray-500">How strong is this letter?</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-sm">
              <div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold block mb-1 flex items-center gap-1"><ChevronRight className="w-4 h-4"/> Strengths</span>
                <ul className="text-gray-600 dark:text-gray-400 font-medium">
                  {feedback.strengths.slice(0,2).map((s,i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <span className="text-rose-600 dark:text-rose-400 font-bold block mb-1 flex items-center gap-1"><ChevronRight className="w-4 h-4"/> Fixes Needed</span>
                <ul className="text-gray-600 dark:text-gray-400 font-medium">
                  {feedback.weaknesses.slice(0,2).map((w,i) => <li key={i}>{w}</li>)}
                  {feedback.weaknesses.length === 0 && <li>None!</li>}
                </ul>
              </div>
            </div>
          </div>

          {/* Smart Actions Row */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl p-3 flex flex-wrap gap-3 items-center shadow-sm">
             <span className="text-sm font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1 pl-2"><Sparkles className="w-4 h-4"/> Smart Actions:</span>
             <Button variant="secondary" onClick={() => handleSmartAction("Improve Impact")} className="text-xs py-1.5 px-3 bg-white hover:bg-gray-50 flex items-center gap-1">
               <TrendingUp className="w-3.5 h-3.5"/> Improve Impact
             </Button>
             <Button variant="secondary" onClick={() => handleSmartAction("Add Metrics")} className="text-xs py-1.5 px-3 bg-white hover:bg-gray-50 flex items-center gap-1">
               <Activity className="w-3.5 h-3.5"/> Add Metrics Example
             </Button>
             <Button variant="secondary" onClick={() => handleSmartAction("Make Professional")} className="text-xs py-1.5 px-3 bg-white hover:bg-gray-50 flex items-center gap-1">
               <Target className="w-3.5 h-3.5"/> Make Professional
             </Button>
             <Button variant="secondary" onClick={() => handleSmartAction("Shorten")} className="text-xs py-1.5 px-3 bg-white hover:bg-gray-50 flex items-center gap-1">
               <Scissors className="w-3.5 h-3.5"/> Shorten
             </Button>
          </div>

          {/* Editor Structure */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Editor Textarea */}
            <div className="xl:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative group">
              <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity">
                 <PenTool className="w-5 h-5 text-gray-400" />
              </div>
              <textarea
                value={currentText}
                onChange={(e) => {
                  setCurrentText(e.target.value);
                  // Don't add version on every keystroke, let user do it explicitly via typing debounce or just update text and analyze
                  analyzeText(e.target.value);
                }}
                onBlur={(e) => {
                  // Add version on blur
                  if(versions.length === 0 || versions[versions.length-1].text !== e.target.value) {
                     addVersion(e.target.value);
                  }
                }}
                className="w-full flex-1 min-h-[500px] p-8 bg-transparent focus:outline-none resize-none leading-loose text-gray-800 dark:text-gray-200 text-[15px]"
                placeholder="Your tailored cover letter will format here..."
              />
            </div>

            {/* Inline Suggestions Sidebar */}
            <div className="xl:col-span-1 space-y-4">
               <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-200 uppercase tracking-widest flex items-center gap-2 mb-2">
                 <Zap className="w-4 h-4 text-amber-500" /> Style Suggestions
               </h4>
               {suggestions.length === 0 ? (
                 <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2"/>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Looking great! No major weaknesses detected.</p>
                 </div>
               ) : (
                 suggestions.map((sug, i) => (
                   <div key={i} className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 shadow-sm animate-fade-in-up">
                     <p className="text-xs font-bold text-amber-800 dark:text-amber-500 mb-2 uppercase tracking-wide flex justify-between">Weak Phrase Found</p>
                     <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-3 line-through decoration-amber-500">"{sug.find}"</p>
                     <p className="text-xs font-bold text-gray-500 mb-1">Reason: {sug.reason}</p>
                     <button 
                       onClick={() => applySuggestion(sug)}
                       className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                     >
                       Auto-Replace
                     </button>
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
             <Button variant="secondary" onClick={copyText} className="flex items-center gap-2 shadow-sm bg-white hover:bg-gray-50">
               <Copy className="w-4 h-4"/> Copy to Clipboard
             </Button>
             <Button variant="primary" onClick={downloadPdf} className="flex items-center gap-2 shadow-sm bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:text-gray-900">
               <Download className="w-4 h-4"/> Download as PDF
             </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CoverLetter;
