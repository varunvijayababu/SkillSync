import { useEffect, useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import { fetchLatestProfile, uploadResume as uploadResumeApi } from "../services/api";

import { UploadCloud, FileText, CheckCircle, XCircle, AlertCircle, TrendingUp, Compass, Target, Activity } from "lucide-react";

function Upload() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    const loadLatestProfile = async () => {
      try {
        setProfileSyncStatus("syncing");
        let latestProfile = JSON.parse(localStorage.getItem("latestProfile") || "null");
        try {
          const remoteProfile = await fetchLatestProfile();
          if (remoteProfile) {
            latestProfile = remoteProfile;
            localStorage.setItem("latestProfile", JSON.stringify(remoteProfile));
            setProfileSyncStatus("synced");
          }
        } catch (remoteErr) {
          console.error("REMOTE PROFILE LOAD ERROR:", remoteErr);
          setProfileSyncStatus("local-only");
        }

        if (latestProfile?.role) {
          setRole((prev) => prev || latestProfile.role);
        }
        if (Array.isArray(latestProfile?.skills) && latestProfile.skills.length > 0) {
          setDescription((prev) => prev || `Core skills: ${latestProfile.skills.join(", ")}`);
        }
        if (!latestProfile) {
          setProfileSyncStatus("local-only");
        }
      } catch (e) {
        console.error("PROFILE AUTOLOAD ERROR:", e);
        setProfileSyncStatus("local-only");
      }
    };

    loadLatestProfile();
  }, []);

  const handleUpload = async () => {
    if (!file || !role) {
      setError("Please upload file and enter role.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);
    formData.append("description", description);

    try {
      setLoading(true);
      setError("");
      const data = await uploadResumeApi(formData);
      localStorage.setItem("resumeUploaded", "true");
      localStorage.setItem("roadmapData", JSON.stringify({
        role: data.role || role,
        matchedSkills: data.matchedSkills || [],
        missingSkills: data.missingSkills || [],
      }));
      
      const history = JSON.parse(localStorage.getItem("resumeScoreHistory") || "[]");
      setScoreHistory(history);
      
      const currentScore = data.roleReadinessPercentage ?? data.score ?? 0;
      const newHistoryEntry = { score: currentScore, date: new Date().toISOString() };
      localStorage.setItem("resumeScoreHistory", JSON.stringify([...history, newHistoryEntry].slice(-10)));
      
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getDecision = (res) => {
    const score = res.roleReadinessPercentage ?? res.score ?? 0;
    const isShortlisted = score >= 75;
    
    let rejectionReasons = [];
    if (res.missingSkills?.length > 0) {
      rejectionReasons.push(`Missing high-demand skills: ${res.missingSkills.slice(0, 3).join(", ")}`);
    }
    if ((res.impactScore || 0) < 60) {
      rejectionReasons.push("Lack of quantified results and weak impact evidence.");
    } else if (score < 80) {
      rejectionReasons.push("Weak project descriptions; lacking business context.");
    }
    if (score < 75) {
      rejectionReasons.push(`Low ATS readability and overall match score (${score}%).`);
    }
    if (res.ethicalAts?.stuffingDetected) {
      rejectionReasons.push("Unnatural keyword stuffing detected (flags ATS filters).");
    }
    
    if (rejectionReasons.length === 0) {
       rejectionReasons.push("Generic formatting issues and lack of targeted role alignment.");
    }

    return {
      status: isShortlisted ? "SHORTLISTED" : "REJECTED",
      reasons: rejectionReasons.slice(0, 4) // max 4 reasons
    };
  };

  const getActionPlan = (res) => {
    let plan = [];
    if (res.missingSkills?.length > 0) {
      plan.push(`Add specific skills to your experience: ${res.missingSkills.slice(0, 3).join(", ")}`);
    }
    if ((res.impactScore || 0) < 60) {
      plan.push("Improve bullet points by quantifying achievements (e.g., 'Increased revenue by X%').");
    }
    if (res.attentionData?.ignoredSections?.length > 0) {
      plan.push(`Reorder sections to highlight your strongest qualifications early. Move ${res.attentionData.ignoredSections[0]} down.`);
    } else {
      plan.push("Reorder sections to ensure your primary skills are in the top third of the page.");
    }
    plan.push("Tailor your vocabulary to mirror the target job description exactly.");
    return plan.slice(0, 3);
  };

  const getSkillMeters = (res) => {
    if (res.skillValidation?.length > 0) {
      return res.skillValidation.map(sk => ({
        name: sk.skill,
        confidence: sk.confidence,
        level: sk.confidence >= 80 ? "Strong" : sk.confidence >= 50 ? "Moderate" : "Weak"
      }));
    }
    if (res.matchedSkills?.length > 0) {
       return res.matchedSkills.map((sk, idx) => {
          const conf = 90 - (idx * 5 + (Math.random() * 10)); // simulated confidence if fallback
          return {
             name: sk,
             confidence: Math.max(10, Math.floor(conf)),
             level: conf >= 80 ? "Strong" : conf >= 50 ? "Moderate" : "Weak"
          }
       });
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            AI Recruiter Simulator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            See exactly how recruiters and ATS systems view your resume. Discover why you might be rejected and how to fix it instantly.
          </p>
          <div className="mt-3">
            <ProfileSyncBadge status={profileSyncStatus} />
          </div>
        </div>

        <Card title="Start Simulation" subtitle="Upload your resume and target role to simulate a recruiter's review.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-1 dark:text-gray-300">Resume PDF</p>
              <input
                type="file"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 dark:text-white transition-all shadow-sm focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1 dark:text-gray-300">Target Role</p>
              <input
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 bg-white dark:bg-gray-800 dark:text-white transition-all shadow-sm focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Senior Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold mb-1 dark:text-gray-300">Job Context (Optional)</p>
            <textarea
              className="w-full border border-gray-200 dark:border-gray-700 p-3 rounded-lg bg-white dark:bg-gray-800 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Paste Job Description to tailor the simulation"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <div className="mt-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {error}</div>}

          <div className="mt-5">
            <Button onClick={handleUpload} disabled={loading} className="w-full sm:w-auto px-8 py-3 rounded-full font-bold shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all transform active:scale-95">
              {loading ? (
                <><Activity className="w-5 h-5 animate-spin"/> Simulating Recruiter...</>
              ) : (
                <><UploadCloud className="w-5 h-5"/> Run Simulation</>
              )}
            </Button>
          </div>
        </Card>

        {result && (() => {
          const decisionLine = getDecision(result);
          const isShortlist = decisionLine.status === "SHORTLISTED";
          const actions = getActionPlan(result);
          const skillMeters = getSkillMeters(result);
          
          const currentScore = result.roleReadinessPercentage ?? result.score ?? 0;
          const previousScore = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1].score : null;
          const improvement = previousScore !== null ? currentScore - previousScore : 0;

          return (
            <div className="space-y-6 animate-fade-in-up">
              
              {/* 1. RECRUITER DECISION SECTION */}
              <div className={`p-6 rounded-2xl border-2 shadow-xl ${isShortlist ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20' : 'bg-rose-50 border-rose-500 dark:bg-rose-900/20'}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    {isShortlist ? (
                      <div className="bg-emerald-500 p-4 rounded-full text-white shadow-lg"><CheckCircle className="w-10 h-10" /></div>
                    ) : (
                      <div className="bg-rose-500 p-4 rounded-full text-white shadow-lg"><XCircle className="w-10 h-10" /></div>
                    )}
                    <div>
                      <p className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-1">Recruiter Decision</p>
                      <h2 className={`text-3xl font-black ${isShortlist ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {decisionLine.status}
                      </h2>
                    </div>
                  </div>
                  
                  {/* IMPROVEMENT TRACKING */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 min-w-[200px] text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-1">Match Score</p>
                    <div className="text-3xl font-bold text-gray-800 dark:text-white">{currentScore}%</div>
                    {previousScore !== null && (
                      <div className={`text-sm font-medium mt-1 flex items-center justify-center gap-1 ${improvement >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {improvement >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingUp className="w-3 h-3 transform rotate-180"/>}
                        {improvement >= 0 ? "+" : ""}{improvement}% since last upload
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. WHY REJECTED & ACTION PLAN ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* WHY REJECTED */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <AlertCircle className="w-32 h-32 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                    Why you may get rejected
                  </h3>
                  <ul className="space-y-4">
                    {decisionLine.reasons.map((reason, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-sm">{idx + 1}</span>
                        <p className="text-gray-700 dark:text-gray-300 leading-snug">{reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ACTION PLAN */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Target className="w-32 h-32 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6 text-blue-500" />
                    How to fix your resume
                  </h3>
                  <ul className="space-y-4">
                    {actions.map((action, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                          <CheckCircle className="w-4 h-4"/>
                        </span>
                        <p className="text-gray-700 dark:text-gray-300 leading-snug">{action}</p>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* 3. SKILL STRENGTH METERS */}
              {skillMeters.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    Skill Strength Meters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skillMeters.map((skill, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">{skill.name}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            skill.level === 'Strong' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            skill.level === 'Moderate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                          }`}>
                            {skill.level} ({skill.confidence}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className={`h-2.5 rounded-full ${
                              skill.level === 'Strong' ? 'bg-emerald-500' :
                              skill.level === 'Moderate' ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`} 
                            style={{ width: `${skill.confidence}%`, transition: 'width 1s ease-in-out' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. ACTIONS FOR NEXT STEPS */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button variant="secondary" onClick={() => { window.location.href = "/resume-builder"; }} className="flex border border-gray-300 shadow-sm gap-2">
                  <FileText className="w-4 h-4"/> Go to Resume Builder
                </Button>
                <Button variant="primary" onClick={() => {
                    localStorage.setItem("roadmapData", JSON.stringify({ role: result.role || role, missingSkills: result.missingSkills || [] }));
                    window.location.href = "/roadmap";
                }} className="flex gap-2">
                  <Compass className="w-4 h-4"/> Create Learning Roadmap
                </Button>
              </div>

            </div>
          );
        })()}
      </div>
    </div>
  );
}

export default Upload;
