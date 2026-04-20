import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle,
  FileText,
  Flag,
  Layers,
  Mic,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import { fetchHistory } from "../services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FLOW_STEPS = [
  { id: "upload", label: "Upload Resume", route: "/upload", icon: FileText },
  { id: "ats", label: "Improve ATS", route: "/resume-builder", icon: TrendingUp },
  { id: "skills", label: "Learn Skills", route: "/roadmap", icon: BookOpen },
  { id: "projects", label: "Build Projects", route: "/resume-builder", icon: Layers },
  { id: "interview", label: "Interview Prep", route: "/interview-prep", icon: Mic },
  { id: "apply", label: "Apply Jobs", route: "/job-matcher", icon: Briefcase },
];

export function getNextAction(userData) {
  if (!userData.resumeUploaded) {
    return {
      key: "upload",
      title: "Upload your resume to start the system",
      description: "SkillSync needs your latest resume before it can score, guide, and coach you.",
      cta: "Upload Resume",
      route: "/upload",
      icon: FileText,
      tone: "blue",
    };
  }

  if (userData.atsScore < 75) {
    return {
      key: "improve",
      title: "Improve your ATS score to increase hiring chances",
      description: "Your current score is below the shortlist threshold. Tighten keywords, impact bullets, and structure.",
      cta: "Fix Resume",
      route: "/resume-builder",
      icon: TrendingUp,
      tone: "amber",
    };
  }

  if (userData.missingSkills.length > 0) {
    return {
      key: "skills",
      title: "Close your most important skill gaps",
      description: "You are close. Follow a focused roadmap and add proof through portfolio projects.",
      cta: "Open Roadmap",
      route: "/roadmap",
      icon: BookOpen,
      tone: "indigo",
    };
  }

  if (!userData.interviewReady) {
    return {
      key: "interview",
      title: "Practice interviews before applying",
      description: "Your resume is ready enough. Now prepare answers for likely recruiter and technical questions.",
      cta: "Practice Interview",
      route: "/interview-prep",
      icon: Mic,
      tone: "emerald",
    };
  }

  return {
    key: "apply",
    title: "Start matching your profile to real jobs",
    description: "You are job-ready. Compare descriptions, find gaps, and generate targeted application material.",
    cta: "Analyze Jobs",
    route: "/job-matcher",
    icon: Briefcase,
    tone: "rose",
  };
}

const getLocalJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getStepState = ({ resumeUploaded, atsScore, missingSkills, interviewReady }) => ({
  upload: resumeUploaded,
  ats: resumeUploaded && atsScore >= 75,
  skills: resumeUploaded && missingSkills.length === 0,
  projects: resumeUploaded && atsScore >= 75 && missingSkills.length <= 2,
  interview: interviewReady,
  apply: interviewReady && atsScore >= 75,
});

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load analysis history. Showing local progress where available.");
    } finally {
      setLoading(false);
    }
  };

  const latest = history[history.length - 1];

  const userData = useMemo(() => {
    const latestProfile = getLocalJson("latestProfile", null);
    const roadmapData = getLocalJson("roadmapData", {});
    const resumeData = getLocalJson("resumeData", {});
    const scoreHistory = getLocalJson("resumeScoreHistory", []);
    const savedInterview = getLocalJson("interviewProgress", null);
    const localResumeUploaded = localStorage.getItem("resumeUploaded") === "true";

    const fallbackScore = scoreHistory.length > 0 ? scoreHistory[scoreHistory.length - 1]?.score : 0;
    const atsScore = Number(latest?.score ?? latest?.roleReadinessPercentage ?? fallbackScore ?? 0);
    const missingSkills = latest?.missingSkills || roadmapData.missingSkills || [];
    const matchedSkills = latest?.matchedSkills || roadmapData.matchedSkills || latestProfile?.skills || [];
    const targetRole = latest?.role || roadmapData.role || latestProfile?.role || resumeData.role || "Set your target role";
    const resumeUploaded = Boolean(localResumeUploaded || latest || scoreHistory.length > 0 || resumeData.name || latestProfile?.name);
    const completedSteps = getStepState({
      resumeUploaded,
      atsScore,
      missingSkills,
      interviewReady: Boolean(savedInterview?.completed || localStorage.getItem("interviewReady") === "true"),
    });

    return {
      targetRole,
      atsScore,
      matchedSkills,
      missingSkills,
      resumeUploaded,
      interviewReady: completedSteps.interview,
      completedSteps,
      resumeStrength:
        atsScore >= 85
          ? "Strong role alignment with clear shortlist potential."
          : atsScore >= 75
          ? "Solid foundation. Add sharper proof around skills and outcomes."
          : resumeUploaded
          ? "Needs stronger ATS alignment, quantified impact, and role keywords."
          : "Upload a resume to unlock your first strength summary.",
    };
  }, [latest]);

  useEffect(() => {
    localStorage.setItem("atsScore", String(userData.atsScore));
    localStorage.setItem("missingSkills", JSON.stringify(userData.missingSkills));
    localStorage.setItem("completedSteps", JSON.stringify(userData.completedSteps));
    localStorage.setItem("resumeUploaded", String(userData.resumeUploaded));
    localStorage.setItem("interviewReady", String(userData.interviewReady));
  }, [userData]);

  const nextAction = getNextAction(userData);
  const ActionIcon = nextAction.icon;
  const completedCount = Object.values(userData.completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / FLOW_STEPS.length) * 100);
  const topMissingSkills = userData.missingSkills.slice(0, 8);

  const chartData = {
    labels: history.map((item) => item.versionLabel || `v${item.versionNumber || 0}`),
    datasets: [
      {
        label: "ATS Score",
        data: history.map((item) => item.score || 0),
        borderColor: "#60a5fa",
        backgroundColor: "rgba(96, 165, 250, 0.18)",
        tension: 0.35,
      },
      {
        label: "Role Readiness",
        data: history.map((item) => item.roleReadinessPercentage || 0),
        borderColor: "#34d399",
        backgroundColor: "rgba(52, 211, 153, 0.16)",
        tension: 0.35,
      },
    ],
  };

  const toneClass = {
    blue: "from-blue-600 to-indigo-600 shadow-blue-900/20",
    amber: "from-amber-500 to-orange-600 shadow-amber-900/20",
    indigo: "from-indigo-600 to-violet-600 shadow-indigo-900/20",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-900/20",
    rose: "from-rose-500 to-pink-600 shadow-rose-900/20",
  }[nextAction.tone];

  return (
    <div className="dark min-h-screen bg-gray-950 text-gray-100 px-4 md:px-8 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-xs font-black uppercase tracking-widest mb-4">
              <Sparkles className="w-4 h-4" />
              Guided Career System
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Career Dashboard</h1>
            <p className="text-gray-400 mt-3 text-lg max-w-2xl">
              Your step-by-step path from resume upload to job-ready applications.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 min-w-[260px]">
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Target Role</p>
            <p className="text-2xl font-black text-white mt-1">{userData.targetRole}</p>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 px-5 py-4 font-semibold">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <div className={`h-full rounded-3xl bg-gradient-to-br ${toneClass} p-1 shadow-2xl`}>
              <div className="h-full rounded-[22px] bg-gray-950/70 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                    <ActionIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-white/60 mb-2">Recommended Next Action</p>
                    <h2 className="text-2xl md:text-3xl font-black text-white">{nextAction.title}</h2>
                    <p className="text-white/70 mt-3 max-w-2xl font-medium leading-relaxed">{nextAction.description}</p>
                  </div>
                </div>
                <Link
                  to={nextAction.route}
                  className="inline-flex items-center justify-center gap-2 bg-white text-gray-950 font-black px-6 py-3 rounded-xl hover:bg-gray-100 transition-all shadow-xl shrink-0"
                >
                  {nextAction.cta}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          <Card className="xl:col-span-4 bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Career Progress</p>
                <h3 className="text-2xl font-black text-white mt-1">{completedCount}/{FLOW_STEPS.length} steps</h3>
              </div>
              <Rocket className="w-9 h-9 text-blue-300" />
            </div>
            <ProgressBar value={progressPercent} label="System completion" color="bg-gradient-to-r from-blue-400 to-emerald-400" />
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <p className="text-4xl font-black text-white">{userData.atsScore}%</p>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">ATS Score</p>
              </div>
            </div>
            <div className="mt-6">
              <ProgressBar value={userData.atsScore} label="Shortlist readiness" />
            </div>
          </Card>

          <Card className="bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <p className="text-4xl font-black text-white">{userData.missingSkills.length}</p>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Missing Skills</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {topMissingSkills.length > 0 ? (
                topMissingSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-amber-400/10 border border-amber-300/20 text-amber-100 px-3 py-1 text-xs font-bold">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm font-semibold text-emerald-300">No major missing skills detected.</p>
              )}
            </div>
          </Card>

          <Card className="bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                <Target className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <p className="text-xl font-black text-white">Resume Strength</p>
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Latest Summary</p>
              </div>
            </div>
            <p className="text-gray-300 font-medium leading-relaxed">{userData.resumeStrength}</p>
          </Card>
        </section>

        <Card title="Progress Tracker" subtitle="Complete each stage to move from resume to job-ready" className="bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
            {FLOW_STEPS.map((step, index) => {
              const done = Boolean(userData.completedSteps[step.id]);
              const StepIcon = step.icon;
              return (
                <Link
                  key={step.id}
                  to={step.route}
                  className={`group rounded-2xl border p-4 transition-all ${
                    done
                      ? "border-emerald-400/30 bg-emerald-400/10"
                      : "border-white/10 bg-gray-950/40 hover:border-blue-400/40 hover:bg-blue-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${done ? "bg-emerald-400/20 text-emerald-200" : "bg-white/10 text-gray-300"}`}>
                      <StepIcon className="w-5 h-5" />
                    </div>
                    {done ? <CheckCircle className="w-5 h-5 text-emerald-300" /> : <span className="text-xs font-black text-gray-600">0{index + 1}</span>}
                  </div>
                  <p className="font-black text-white">{step.label}</p>
                  <p className={`text-xs font-bold mt-1 ${done ? "text-emerald-300" : "text-gray-500"}`}>{done ? "Completed" : "Pending"}</p>
                </Link>
              );
            })}
          </div>
        </Card>

        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <Card title="Score Trend" subtitle="ATS and role readiness over resume versions" className="xl:col-span-8 bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
            {loading ? (
              <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
            ) : history.length > 0 ? (
              <Line data={chartData} />
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/10 bg-gray-950/40">
                <Flag className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 font-semibold">No resume versions yet. Upload a resume to start tracking growth.</p>
              </div>
            )}
          </Card>

          <Card title="Skill Signal" subtitle="What your profile currently proves" className="xl:col-span-4 bg-white/[0.06] dark:bg-white/[0.06] border-white/10 hover:translate-y-0">
            <div className="space-y-4">
              {userData.matchedSkills.slice(0, 7).length > 0 ? (
                userData.matchedSkills.slice(0, 7).map((skill) => (
                  <div key={skill} className="flex items-center justify-between rounded-xl bg-gray-950/50 border border-white/10 px-4 py-3">
                    <span className="font-bold text-gray-200 capitalize">{skill}</span>
                    <CheckCircle className="w-5 h-5 text-emerald-300" />
                  </div>
                ))
              ) : (
                <p className="text-gray-400 font-medium">Matched skills will appear after your first resume analysis.</p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
