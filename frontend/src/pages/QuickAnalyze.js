import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileText,
  Lock,
  Map,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Zap,
} from "lucide-react";
import { quickAnalyzeResume } from "../services/api";
import ProgressBar from "../components/ProgressBar";

const lockedInsights = [
  {
    title: "Detailed ATS Breakdown",
    description: "Keyword heatmap, section-level scoring, and exact fixes.",
    icon: ShieldCheck,
  },
  {
    title: "Skill Roadmap",
    description: "A role-specific plan with resources, projects, and priority order.",
    icon: Map,
  },
  {
    title: "Recruiter + Final Boss",
    description: "Simulated recruiter decisions and multi-stage interview practice.",
    icon: Users,
  },
];

function QuickAnalyze() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [result, setResult] = useState(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFile(null);
    setRole("");
    setResult(null);
    setHasAnalyzed(false);
    setLoading(false);
    setError("");
  }, []);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume PDF to preview your score.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role || "software developer");

    try {
      setLoading(true);
      setError("");
      const data = await quickAnalyzeResume(formData);
      const preview = {
        ...data,
        role: data.role || role || "software developer",
        createdAt: new Date().toISOString(),
        fileName: file.name,
      };

      localStorage.setItem("quickAnalysis", JSON.stringify(preview));
      localStorage.setItem("resumeUploaded", "true");
      localStorage.setItem("atsScore", String(preview.atsScore || preview.score || 0));
      localStorage.setItem("missingSkills", JSON.stringify(preview.missingSkills || []));
      localStorage.setItem(
        "roadmapData",
        JSON.stringify({
          role: preview.role,
          matchedSkills: preview.matchedSkills || [],
          missingSkills: preview.missingSkills || [],
        })
      );
      setResult(preview);
      setHasAnalyzed(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Quick analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    localStorage.setItem("postAuthRedirect", "/dashboard");
    navigate("/register");
  };

  const score = result?.atsScore || result?.score || 0;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 px-4 md:px-8 py-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-blue-700 dark:text-blue-200 text-xs font-black uppercase tracking-widest mb-4 mt-2">
              <Sparkles className="w-4 h-4" />
              Free Resume Preview
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-950 dark:text-white max-w-4xl">
              See your resume score before creating an account.
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl font-medium">
              Get a quick ATS score, top missing skills, and a basic improvement summary. Unlock the full career system when you are ready.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-5 rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-950 dark:text-white">Quick Analyze</h2>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No login required</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">
                  Resume PDF
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white file:font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">
                  Target Role
                </label>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Developer"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-4 py-3 font-semibold text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {error && (
                <div className="flex gap-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-rose-700 dark:text-rose-300 font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white font-black shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-60"
              >
                {loading ? "Analyzing..." : "Analyze Resume Free"}
                <Zap className="w-5 h-5" />
              </button>
            </div>
          </section>

          <section className="lg:col-span-7 rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] p-6 md:p-8 shadow-xl">
            {result ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Preview Result
                    </p>
                    <h2 className="text-3xl font-black text-gray-950 dark:text-white mt-1">{result.role}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{result.fileName}</p>
                  </div>
                  <div className="rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 px-6 py-4 text-center">
                    <p className="text-4xl font-black text-blue-700 dark:text-blue-200">{score}%</p>
                    <p className="text-xs font-black uppercase tracking-widest text-blue-700/70 dark:text-blue-200/70">ATS Score</p>
                  </div>
                </div>

                <ProgressBar value={score} label="Free ATS preview" color="bg-gradient-to-r from-blue-500 to-indigo-600" />

                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                    Missing Skills Preview
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(result.missingSkills || []).length > 0 ? (
                      result.missingSkills.map((skill) => (
                        <span key={skill} className="rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-300/20 px-3 py-1 text-xs font-black text-amber-800 dark:text-amber-100">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-300/20 px-3 py-1 text-xs font-black text-emerald-800 dark:text-emerald-100">
                        No major gaps in preview
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-700 p-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                    Basic Summary
                  </h3>
                  <ul className="space-y-3">
                    {(result.summary || []).map((item) => (
                      <li key={item} className="flex gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-300 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/40">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-2xl font-black text-gray-700 dark:text-gray-200">
                  {hasAnalyzed ? "No results available" : "Your preview appears here"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md font-medium">
                  {hasAnalyzed
                    ? "Try another PDF resume to generate a fresh preview."
                    : "Upload a PDF resume to see results."}
                </p>
              </div>
            )}
          </section>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {lockedInsights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#111827] p-6 shadow-lg">
                <div className="blur-[2px] opacity-50 pointer-events-none select-none">
                  <Icon className="w-9 h-9 text-indigo-500 mb-5" />
                  <h3 className="text-xl font-black text-gray-950 dark:text-white">{item.title}</h3>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
                  <div className="mt-5 space-y-2">
                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800 w-full" />
                    <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-800 w-2/3" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-950/45 backdrop-blur-[1px]">
                  <div className="rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 px-4 py-2 text-sm font-black shadow-xl flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Unlock full insights
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-purple-800 p-8 md:p-10 text-white shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-white/70 mb-2">Ready for the full analysis?</p>
            <h2 className="text-3xl md:text-4xl font-black">Create a free account to unlock the complete career dashboard.</h2>
            <p className="text-white/75 mt-3 font-medium max-w-2xl">
              We will keep this preview and use it to guide your next step after signup.
            </p>
          </div>
          <button
            onClick={handleUnlock}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-950 px-7 py-4 font-black shadow-xl hover:bg-gray-100 transition-all shrink-0"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </button>
        </section>
      </div>
    </div>
  );
}

export default QuickAnalyze;
