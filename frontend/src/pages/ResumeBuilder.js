import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import Button from "../components/Button";
import Card from "../components/Card";
import ProfileSyncBadge from "../components/ProfileSyncBadge";
import ProgressBar from "../components/ProgressBar";
import Section from "../components/Section";
import { generateResumeBuilder, saveLatestProfile } from "../services/api";

const textToList = (text) =>
  String(text || "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

function ResumeBuilder() {
  const [form, setForm] = useState({
    name: "",
    role: "Frontend Developer",
    skills: "",
    education: "",
    experience: "",
    projects: "",
    achievements: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [profileSyncStatus, setProfileSyncStatus] = useState("local-only");

  const resumePreview = useMemo(() => {
    if (!result?.resume) return null;
    return result.resume;
  }, [result]);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        role: form.role.trim() || "Frontend Developer",
        skills: textToList(form.skills),
        education: textToList(form.education),
        experience: textToList(form.experience),
        projects: textToList(form.projects),
        achievements: textToList(form.achievements),
      };

      const data = await generateResumeBuilder(payload);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    if (!resumePreview?.formattedText) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 40;
    const maxWidth = 515;
    const lines = doc.splitTextToSize(resumePreview.formattedText, maxWidth);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SkillSync Resume", margin, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(lines, margin, 65);
    doc.save(`${(resumePreview.name || "resume").replace(/\s+/g, "_")}_SkillSync.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-6 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Resume Builder</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Build a structured resume, export PDF, and automatically run ATS analysis.
          </p>
          <div className="mt-2">
            <ProfileSyncBadge status={profileSyncStatus} />
          </div>
        </div>

        <Card title="Resume Form" subtitle="Use newline-separated entries for section lists">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
              />
              <input
                className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition"
                placeholder="Target role"
                value={form.role}
                onChange={(e) => onChange("role", e.target.value)}
              />
            </div>

            <textarea className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition" rows="3" placeholder="Skills" value={form.skills} onChange={(e) => onChange("skills", e.target.value)} />
            <textarea className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition" rows="3" placeholder="Education" value={form.education} onChange={(e) => onChange("education", e.target.value)} />
            <textarea className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition" rows="4" placeholder="Experience" value={form.experience} onChange={(e) => onChange("experience", e.target.value)} />
            <textarea className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition" rows="3" placeholder="Projects" value={form.projects} onChange={(e) => onChange("projects", e.target.value)} />
            <textarea className="border border-gray-200 dark:border-gray-700 p-2 rounded-lg w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur dark:text-white dark:placeholder-gray-400 transition" rows="3" placeholder="Achievements" value={form.achievements} onChange={(e) => onChange("achievements", e.target.value)} />

            {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 bg-white/80 rounded-full animate-ping"></div>
                  <span>Analyzing your resume...</span>
                </>
              ) : "Create Resume"}
            </Button>
          </form>
        </Card>

        {result?.analysis && (
          <Card title={`Auto Analysis ${result.analysis.version || ""}`} subtitle={`Role: ${result.analysis.role}`}>
            <div className="space-y-4">
              <ProgressBar value={result.analysis.score || 0} label="ATS score" color="bg-blue-500" />
              <ProgressBar
                value={result.analysis.roleReadinessPercentage || 0}
                label="Role readiness"
                color="bg-emerald-500"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Section title="Matched Skills" items={result.analysis.matchedSkills || []} accent="text-green-700" />
                <Section title="Missing Skills" items={result.analysis.missingSkills || []} accent="text-red-700" />
              </div>
            </div>
          </Card>
        )}

        {resumePreview && (
          <Card title="Formatted Resume Output" subtitle="Preview generated from your input">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Section title="Skills" items={resumePreview.skills || []} />
              <Section title="Education" items={resumePreview.education || []} />
              <Section title="Experience" items={resumePreview.experience || []} />
              <Section title="Projects" items={resumePreview.projects || []} />
              <Section title="Achievements" items={resumePreview.achievements || []} />
            </div>
            <div className="mt-5">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Plain Text Resume</h4>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm whitespace-pre-wrap dark:text-gray-300">{resumePreview.formattedText}</pre>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={downloadPdf}>Download PDF</Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  const profilePayload = {
                    name: resumePreview.name,
                    role: resumePreview.role,
                    skills: resumePreview.skills || [],
                    education: resumePreview.education || [],
                    experience: resumePreview.experience || [],
                    projects: resumePreview.projects || [],
                    achievements: resumePreview.achievements || [],
                  };
                  localStorage.setItem("latestProfile", JSON.stringify(profilePayload));
                  try {
                    setProfileSyncStatus("syncing");
                    await saveLatestProfile(profilePayload);
                    setProfileSyncStatus("synced");
                    alert("Saved as latest profile for autofill.");
                  } catch (e) {
                    console.error("SAVE PROFILE ERROR:", e);
                    setProfileSyncStatus("local-only");
                    alert("Saved locally. Cloud sync failed.");
                  }
                }}
              >
                Use this resume as latest profile
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  localStorage.setItem(
                    "roadmapData",
                    JSON.stringify({
                      role: result?.analysis?.role || resumePreview.role,
                      missingSkills: result?.analysis?.missingSkills || [],
                    })
                  );
                  window.location.href = "/roadmap";
                }}
              >
                Generate Roadmap
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ResumeBuilder;
